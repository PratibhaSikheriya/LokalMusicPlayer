// src/services/audioService.ts

import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useMusicStore } from '../store/musicStore'; 
import { Song } from '../types';
import { saavnApi } from '../api/saavn';

let soundObject: Audio.Sound | null = null;

const getStreamUrl = (song: Song): string | null => {
  if (!song) return null;
  const sources = song.downloadUrl;
  if (Array.isArray(sources) && sources.length > 0) {
    const best = sources.find((s: any) => s.quality === '320kbps') || 
                 sources.find((s: any) => s.quality === '160kbps') || 
                 sources[sources.length - 1];
    return best?.url || best?.link || null;
  }
  if (typeof sources === 'string') return sources;
  return null;
};

export const audioService = {
  async setupAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
    } catch (error) {
      console.error('Audio Setup Error:', error);
    }
  },

  onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    const { setProgress, setIsPlaying } = usePlayerStore.getState();
    if (status.isLoaded) {
      setProgress(status.positionMillis, status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        audioService.playNext();
      }
    } else if (status.error) {
      console.error('Playback Error:', status.error);
    }
  },

  async loadAndPlay(song: Song): Promise<void> {
    // SAFETY CHECK: Prevent playing Artists or Albums
    if (song.type === 'artist' || song.type === 'album') {
      console.warn('⚠️ Cannot play an Artist or Album directly. Use navigation.');
      return; 
    }

    const { setCurrentSong, setIsPlaying } = usePlayerStore.getState();
    const { recordPlay } = useMusicStore.getState();

    try {
      let fullSong = song;
      
      // If no downloadUrl, fetch details
      if (!song.downloadUrl || !getStreamUrl(song)) {
        console.log('Fetching details for:', song.name);
        const details = await saavnApi.getSongById(song.id);
        if (!details) {
          // Silent fail to avoid crashing UI
          console.warn('Could not fetch song details.');
          return;
        }
        fullSong = details;
      }
      
      const uri = getStreamUrl(fullSong);
      if (!uri) {
        console.warn('No audio link found for:', song.name);
        return; 
      }

      if (soundObject) {
        await soundObject.unloadAsync();
        soundObject = null;
      }

      await this.setupAudio();
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
        this.onPlaybackStatusUpdate
      );

      soundObject = sound;
      setCurrentSong(fullSong);
      setIsPlaying(true);
      recordPlay(fullSong); // Add to history/most played
      
    } catch (error) {
      console.error('Playback Error:', error);
      setIsPlaying(false);
    }
  },

  async togglePlayPause(): Promise<void> {
    const { isPlaying, setIsPlaying } = usePlayerStore.getState();
    if (!soundObject) return;

    try {
      if (isPlaying) {
        await soundObject.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundObject.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Toggle Error:', error);
    }
  },

  async playNext(): Promise<void> {
    const next = useQueueStore.getState().playNext();
    if (next) {
      await this.loadAndPlay(next);
    } else {
      this.stop();
    }
  },

  async playPrevious(): Promise<void> {
    const prev = useQueueStore.getState().playPrevious();
    if (prev) {
      await this.loadAndPlay(prev);
    }
  },

  async seek(position: number): Promise<void> {
    if (!soundObject) return;
    try {
      await soundObject.setPositionAsync(position);
    } catch (error) {
      console.error('Seek Error:', error);
    }
  },

  async skipForward() {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status.isLoaded) {
        const newPos = status.positionMillis + 10000; 
        await soundObject.setPositionAsync(Math.min(newPos, status.durationMillis || newPos));
      }
    } catch (e) {}
  },

  async skipBackward() {
    if (!soundObject) return;
    try {
      const status = await soundObject.getStatusAsync();
      if (status.isLoaded) {
        const newPos = Math.max(0, status.positionMillis - 10000);
        await soundObject.setPositionAsync(newPos);
      }
    } catch (e) {}
  },

  async stop(): Promise<void> {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        soundObject = null;
      } catch (e) {}
    }
    usePlayerStore.getState().setCurrentSong(null);
    usePlayerStore.getState().setIsPlaying(false);
  },
};