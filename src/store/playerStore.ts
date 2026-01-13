import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  // FIXED: Added missing setters
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  setProgress: (pos: number, dur: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  // FIXED: Implemented missing setters
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setProgress: (position, duration) => set({ position, duration }),
}));