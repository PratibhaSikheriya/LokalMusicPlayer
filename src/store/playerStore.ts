import { create } from 'zustand';
import { Song } from '../types';

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setProgress: (position: number, duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (position, duration) => set({ position, duration }),
}));