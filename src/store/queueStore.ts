import { create } from 'zustand';
import { Song } from '../types';

interface QueueStore {
  queue: Song[];
  currentIndex: number;
  setQueue: (songs: Song[]) => void;
  playNext: () => Song | null;
  playPrevious: () => Song | null;
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

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    let newIndex = currentIndex;
    if (index < currentIndex) newIndex = currentIndex - 1;
    // Reset if empty or ensure index is valid
    if (newQueue.length === 0) newIndex = -1;
    else if (newIndex >= newQueue.length) newIndex = newQueue.length - 1;
    
    set({ queue: newQueue, currentIndex: Math.max(0, newIndex) });
  },

  clearQueue: () => set({ queue: [], currentIndex: -1 }),

  setCurrentIndex: (index) => set({ currentIndex: index }),
}));