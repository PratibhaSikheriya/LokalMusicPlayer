import { create } from 'zustand';
import { Song } from '../types';

interface QueueStore {
  queue: Song[];
  currentIndex: number;
  setQueue: (songs: Song[]) => void;
  playNext: () => Song | null;
  playPrevious: () => Song | null;
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  setQueue: (songs) => set({ queue: songs, currentIndex: 0 }),
  playNext: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1 });
      return queue[currentIndex + 1];
    }
    return null;
  },
  playPrevious: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
      return queue[currentIndex - 1];
    }
    return null;
  },
}));