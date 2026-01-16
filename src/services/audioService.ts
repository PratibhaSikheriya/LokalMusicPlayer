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
    // FIXED: Use .at(-1) per linter suggestion
    const best = sources.find((s: any) => s.quality === '320kbps') || 
                 sources.find((s: any) => s.quality === '160kbps') || 
                 sources.at(-1);
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
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
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
    if (song.type === 'artist' || song.type === 'album') return;

    const { setCurrentSong, setIsPlaying } = usePlayerStore.getState();
    const { recordPlay } = useMusicStore.getState();

    try {
      let fullSong = song;
      if (!song.downloadUrl || !getStreamUrl(song)) {
        const details = await saavnApi.getSongById(song.id);
        if (!details) return;
        fullSong = details;
      }
      
      const uri = getStreamUrl(fullSong);
      if (!uri) return;

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
      recordPlay(fullSong);
      
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
    if (next) await this.loadAndPlay(next);
    else this.stop();
  },

  async playPrevious(): Promise<void> {
    const prev = useQueueStore.getState().playPrevious();
    if (prev) await this.loadAndPlay(prev);
  },

  async seek(position: number): Promise<void> {
    if (!soundObject) return;
    await soundObject.setPositionAsync(position);
  },

  async skipForward() {
    if (!soundObject) return;
    const status = await soundObject.getStatusAsync();
    if (status.isLoaded) {
      await soundObject.setPositionAsync(status.positionMillis + 10000);
    }
  },

  async skipBackward() {
    if (!soundObject) return;
    const status = await soundObject.getStatusAsync();
    if (status.isLoaded) {
      await soundObject.setPositionAsync(Math.max(0, status.positionMillis - 10000));
    }
  },

  async stop(): Promise<void> {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        soundObject = null;
      } catch (e) {
        // FIXED: Log error to satisfy linter
        console.error('Stop error:', e);
      }
    }
    usePlayerStore.getState().setCurrentSong(null);
    usePlayerStore.getState().setIsPlaying(false);
  }
};