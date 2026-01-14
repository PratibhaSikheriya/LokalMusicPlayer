// src/services/audioService.ts

import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
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
    const { setCurrentSong, setIsPlaying } = usePlayerStore.getState();
    
    try {
      console.log('Attempting to play:', song.name);
      
      let fullSong = song;
      
      if (!song.downloadUrl || !getStreamUrl(song)) {
        console.log('Fetching full song details for:', song.id);
        const details = await saavnApi.getSongById(song.id);
        
        if (!details) {
          console.error('Could not fetch details for:', song.name);
          alert(`Cannot play "${song.name}". Failed to fetch song details.`);
          return;
        }
        
        fullSong = details;
        console.log('Full song details fetched');
      }
      
      const uri = getStreamUrl(fullSong);

      if (!uri) {
        console.error('Cannot play:', song.name, '- No audio link found');
        alert(`Cannot play "${song.name}". No audio link available.`);
        return; 
      }

      console.log('Stream URL found');

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
      
      console.log('Now playing:', song.name);
    } catch (error) {
      console.error('Playback Error:', error);
      alert(`Failed to play "${song.name}". Please try again.`);
      setIsPlaying(false);
    }
  },

  async togglePlayPause(): Promise<void> {
    const { isPlaying, setIsPlaying } = usePlayerStore.getState();
    
    if (!soundObject) {
      console.warn('No sound object available');
      return;
    }

    try {
      if (isPlaying) {
        await soundObject.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundObject.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Toggle Play/Pause Error:', error);
    }
  },

  async playNext(): Promise<void> {
    const next = useQueueStore.getState().playNext();
    
    if (next) {
      await this.loadAndPlay(next);
    } else {
      if (soundObject) {
        try {
          await soundObject.stopAsync();
        } catch (error) {
          console.error('Stop Error:', error);
        }
      }
      usePlayerStore.getState().setIsPlaying(false);
      console.log('Queue finished');
    }
  },

  async playPrevious(): Promise<void> {
    const prev = useQueueStore.getState().playPrevious();
    
    if (prev) {
      await this.loadAndPlay(prev);
    } else {
      console.log('No previous song available');
    }
  },

  async seek(position: number): Promise<void> {
    if (!soundObject) {
      console.warn('No sound object available');
      return;
    }

    try {
      await soundObject.setPositionAsync(position);
    } catch (error) {
      console.error('Seek Error:', error);
    }
  },

  async stop(): Promise<void> {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        soundObject = null;
      } catch (error) {
        console.error('Stop Error:', error);
      }
    }
    
    const { setIsPlaying } = usePlayerStore.getState();
    setIsPlaying(false);
  },

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!soundObject) return null;
    
    try {
      return await soundObject.getStatusAsync();
    } catch (error) {
      console.error('Get Status Error:', error);
      return null;
    }
  },

  async setVolume(volume: number): Promise<void> {
    if (!soundObject) return;
    
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await soundObject.setVolumeAsync(clampedVolume);
    } catch (error) {
      console.error('Set Volume Error:', error);
    }
  },

  async setRate(rate: number): Promise<void> {
    if (!soundObject) return;
    
    try {
      const clampedRate = Math.max(0.5, Math.min(2, rate));
      await soundObject.setRateAsync(clampedRate, true);
    } catch (error) {
      console.error('Set Rate Error:', error);
    }
  },
};