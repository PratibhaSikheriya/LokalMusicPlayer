import { create } from 'zustand';
import { Song } from '../types';

interface QueueStore {
  queue: Song[];
  currentIndex: number;
  setQueue: (songs: Song[]) => void;
  playNext: () => Song | null;
  playPrevious: () => Song | null;
  // FIXED: Added missing types
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
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

  // FIXED: Added missing logic
  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    let newIndex = currentIndex;
    if (index < currentIndex) newIndex = currentIndex - 1;
    set({ queue: newQueue, currentIndex: Math.max(0, newIndex) });
  },

  clearQueue: () => set({ queue: [], currentIndex: 0 }),

  setCurrentIndex: (index) => set({ currentIndex: index }),
}));