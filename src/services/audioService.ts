import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Song } from '../types';



let soundObject: Audio.Sound | null = null;

// SMART URL FINDER: Extracts the best audio link from messy API data
const getStreamUrl = (song: Song): string | null => {
  if (!song) return null;
  
  const sources = song.downloadUrl;
  
  // 1. Handle Array (Standard API behavior: [12kbps, ..., 320kbps])
  if (Array.isArray(sources) && sources.length > 0) {
    // Try to find 320kbps, then 160kbps, otherwise take the last one (usually highest)
    const best = sources.find((s: any) => s.quality === '320kbps') || 
                 sources.find((s: any) => s.quality === '160kbps') || 
                 sources[sources.length - 1];
    return best?.link || null;
  }
  
  // 2. Handle String (fallback)
  if (typeof sources === 'string') return sources;
  
  return null;
};

export const audioService = {
  /**
   * Setup audio mode for background playback
   */
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

  /**
   * Handle playback status updates
   */
  onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    const { setProgress, setIsPlaying } = usePlayerStore.getState();
    
    if (status.isLoaded) {
      setProgress(status.positionMillis, status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Auto-play next song when current finishes
      if (status.didJustFinish) {
        audioService.playNext();
      }
    } else if (status.error) {
      console.error('Playback Error:', status.error);
    }
  },

  /**
   * Load and play a song
   */
  async loadAndPlay(song: Song): Promise<void> {
    const { setCurrentSong, setIsPlaying } = usePlayerStore.getState();
    const uri = getStreamUrl(song);

    if (!uri) {
      console.error(`Cannot play "${song.name}". No audio link found.`);
      alert(`Cannot play "${song.name}". No audio link found.`);
      return; 
    }

    try {
      // Unload previous sound
      if (soundObject) {
        await soundObject.unloadAsync();
        soundObject = null;
      }

      // Setup audio mode
      await this.setupAudio();
      
      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
        this.onPlaybackStatusUpdate
      );

      soundObject = sound;
      setCurrentSong(song);
      setIsPlaying(true);
      
      console.log(`Now playing: ${song.name}`);
    } catch (error) {
      console.error('Playback Error:', error);
      alert(`Failed to play "${song.name}". Please try again.`);
      setIsPlaying(false);
    }
  },

  /**
   * Toggle between play and pause
   */
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

  /**
   * Play next song in queue
   */
  async playNext(): Promise<void> {
    const next = useQueueStore.getState().playNext();
    
    if (next) {
      await this.loadAndPlay(next);
    } else {
      // No more songs in queue
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

  /**
   * Play previous song in queue
   */
  async playPrevious(): Promise<void> {
    const prev = useQueueStore.getState().playPrevious();
    
    if (prev) {
      await this.loadAndPlay(prev);
    } else {
      console.log('No previous song available');
    }
  },

  /**
   * Seek to a specific position in the current track (position in milliseconds)
   */
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

  /**
   * Stop playback and cleanup
   */
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

  /**
   * Get current playback status
   */
  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!soundObject) return null;
    
    try {
      return await soundObject.getStatusAsync();
    } catch (error) {
      console.error('Get Status Error:', error);
      return null;
    }
  },

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    if (!soundObject) return;
    
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await soundObject.setVolumeAsync(clampedVolume);
    } catch (error) {
      console.error('Set Volume Error:', error);
    }
  },

  /**
   * Set playback rate (0.5 to 2.0)
   */
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