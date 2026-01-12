// src/store/playerStore.ts

import { create } from 'zustand';
import { Song, RepeatMode } from '../types';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface PlayerStore {
  // State
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  sound: Audio.Sound | null;
  
  // Actions
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setIsShuffled: (shuffled: boolean) => void;
  setSound: (sound: Audio.Sound | null) => void;
  togglePlayPause: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial state
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  isLoading: false,
  repeatMode: 'off',
  isShuffled: false,
  sound: null,

  // Actions
  setCurrentSong: (song) => set({ currentSong: song }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setPosition: (position) => set({ position }),
  
  setDuration: (duration) => set({ duration }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  
  setIsShuffled: (shuffled) => set({ isShuffled: shuffled }),
  
  setSound: (sound) => set({ sound }),
  
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
  
  toggleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentMode = get().repeatMode;
    const currentIndex = modes.indexOf(currentMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    set({ repeatMode: nextMode });
  },
  
  reset: () => set({
    currentSong: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    isLoading: false,
    sound: null,
  }),
}));