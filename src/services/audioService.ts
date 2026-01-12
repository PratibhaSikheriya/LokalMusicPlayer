// src/services/audioService.ts

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';

class AudioService {
  private sound: Audio.Sound | null = null;
  private statusUpdateCallback: ((status: AVPlaybackStatus) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadAndPlay(song: Song) {
    try {
      const playerStore = usePlayerStore.getState();
      playerStore.setIsLoading(true);

      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Get highest quality download URL
      const downloadUrl = this.getHighestQualityUrl(song);
      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: downloadUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      playerStore.setSound(sound);
      playerStore.setCurrentSong(song);
      playerStore.setIsPlaying(true);
      playerStore.setIsLoading(false);
    } catch (error) {
      console.error('Error loading song:', error);
      const playerStore = usePlayerStore.getState();
      playerStore.setIsLoading(false);
      playerStore.setIsPlaying(false);
    }
  }

  private getHighestQualityUrl(song: Song): string | null {
    const qualities = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
    
    for (const quality of qualities) {
      const url = song.downloadUrl.find(
        (dl) => dl.quality === quality
      );
      if (url) {
        return url.link || url.url || null;
      }
    }
    
    return null;
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
      }
      return;
    }

    const playerStore = usePlayerStore.getState();
    const queueStore = useQueueStore.getState();

    playerStore.setPosition(status.positionMillis);
    playerStore.setDuration(status.durationMillis || 0);
    playerStore.setIsPlaying(status.isPlaying);

    // Handle song end
    if (status.didJustFinish && !status.isLooping) {
      this.handleSongEnd();
    }

    if (this.statusUpdateCallback) {
      this.statusUpdateCallback(status);
    }
  };

  private async handleSongEnd() {
    const playerStore = usePlayerStore.getState();
    const queueStore = useQueueStore.getState();

    if (playerStore.repeatMode === 'one') {
      // Replay current song
      await this.sound?.setPositionAsync(0);
      await this.sound?.playAsync();
    } else if (playerStore.repeatMode === 'all' || queueStore.currentIndex < queueStore.queue.length - 1) {
      // Play next song
      this.playNext();
    } else {
      // Stop playback
      playerStore.setIsPlaying(false);
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        const playerStore = usePlayerStore.getState();
        playerStore.setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing:', error);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        const playerStore = usePlayerStore.getState();
        playerStore.setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  async togglePlayPause() {
    const playerStore = usePlayerStore.getState();
    if (playerStore.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async seek(position: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  async playNext() {
    const queueStore = useQueueStore.getState();
    const nextIndex = queueStore.nextSong();
    const nextSong = queueStore.queue[nextIndex];
    
    if (nextSong) {
      await this.loadAndPlay(nextSong);
    }
  }

  async playPrevious() {
    const playerStore = usePlayerStore.getState();
    
    // If more than 3 seconds have passed, restart current song
    if (playerStore.position > 3000) {
      await this.seek(0);
    } else {
      const queueStore = useQueueStore.getState();
      const prevIndex = queueStore.previousSong();
      const prevSong = queueStore.queue[prevIndex];
      
      if (prevSong) {
        await this.loadAndPlay(prevSong);
      }
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      const playerStore = usePlayerStore.getState();
      playerStore.reset();
    } catch (error) {
      console.error('Error stopping:', error);
    }
  }

  setStatusUpdateCallback(callback: (status: AVPlaybackStatus) => void) {
    this.statusUpdateCallback = callback;
  }

  getSound() {
    return this.sound;
  }
}

export const audioService = new AudioService();