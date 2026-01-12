import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Song } from '../types';

let soundObject: Audio.Sound | null = null;

// SMART URL FINDER: Extracts the best audio link from messy API data
const getStreamUrl = (song: any): string | null => {
  if (!song) return null;
  const sources = song.downloadUrl || song.download_url;
  
  // 1. Handle Array (Standard API behavior: [12kbps, ..., 320kbps])
  if (Array.isArray(sources) && sources.length > 0) {
    // Try to find 320kbps, then 160kbps, otherwise take the last one (usually highest)
    const best = sources.find((s: any) => s.quality === '320kbps') || 
                 sources.find((s: any) => s.quality === '160kbps') || 
                 sources[sources.length - 1];
    return best?.link || best?.url || null;
  }
  
  // 2. Handle String
  if (typeof sources === 'string') return sources;
  
  return null;
};

export const audioService = {
  async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
    } catch (e) { console.log('Audio Setup Error', e); }
  },

  async loadAndPlay(song: Song) {
    const { setCurrentSong, setIsPlaying, setProgress } = usePlayerStore.getState();
    const uri = getStreamUrl(song);

    if (!uri) {
      alert(`Cannot play "${song.name}". No audio link found.`);
      return; 
    }

    try {
      if (soundObject) await soundObject.unloadAsync();
      await this.setupAudio();
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis, status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) this.playNext();
          }
        }
      );
      soundObject = sound;
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback Error:', error);
    }
  },

  async togglePlayPause() {
    const { isPlaying, setIsPlaying } = usePlayerStore.getState();
    if (soundObject) {
      if (isPlaying) await soundObject.pauseAsync();
      else await soundObject.playAsync();
      setIsPlaying(!isPlaying);
    }
  },

  async playNext() {
    const next = useQueueStore.getState().playNext();
    if (next) await this.loadAndPlay(next);
    else { if (soundObject) await soundObject.stopAsync(); usePlayerStore.getState().setIsPlaying(false); }
  },

  async playPrevious() {
    const prev = useQueueStore.getState().playPrevious();
    if (prev) await this.loadAndPlay(prev);
  },

  async seek(val: number) {
    if (soundObject) await soundObject.setPositionAsync(val);
  }
};