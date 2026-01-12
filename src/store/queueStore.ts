// src/store/queueStore.ts

import { create } from 'zustand';
import { Song } from '../types';
import { storageUtils } from '../utils/storage';

interface QueueStore {
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[];
  
  // Actions
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  addMultipleToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  unshuffleQueue: () => void;
  nextSong: () => number;
  previousSong: () => number;
  loadPersistedQueue: () => void;
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  originalQueue: [],

  setQueue: (songs, startIndex = 0) => {
    set({ 
      queue: songs, 
      currentIndex: startIndex,
      originalQueue: songs 
    });
    storageUtils.saveQueue(songs);
    storageUtils.saveCurrentIndex(startIndex);
  },

  addToQueue: (song) => {
    const newQueue = [...get().queue, song];
    set({ queue: newQueue });
    storageUtils.saveQueue(newQueue);
  },

  addMultipleToQueue: (songs) => {
    const newQueue = [...get().queue, ...songs];
    set({ queue: newQueue });
    storageUtils.saveQueue(newQueue);
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    
    let newIndex = currentIndex;
    if (index < currentIndex) {
      newIndex = currentIndex - 1;
    } else if (index === currentIndex && currentIndex >= newQueue.length) {
      newIndex = Math.max(0, newQueue.length - 1);
    }
    
    set({ queue: newQueue, currentIndex: newIndex });
    storageUtils.saveQueue(newQueue);
    storageUtils.saveCurrentIndex(newIndex);
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0, originalQueue: [] });
    storageUtils.saveQueue([]);
    storageUtils.saveCurrentIndex(0);
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
    storageUtils.saveCurrentIndex(index);
  },

  moveQueueItem: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    
    let newIndex = currentIndex;
    if (fromIndex === currentIndex) {
      newIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newIndex = currentIndex + 1;
    }
    
    set({ queue: newQueue, currentIndex: newIndex });
    storageUtils.saveQueue(newQueue);
    storageUtils.saveCurrentIndex(newIndex);
  },

  shuffleQueue: () => {
    const { queue, currentIndex } = get();
    const currentSong = queue[currentIndex];
    const otherSongs = queue.filter((_, i) => i !== currentIndex);
    
    // Fisher-Yates shuffle
    for (let i = otherSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
    }
    
    const shuffledQueue = [currentSong, ...otherSongs];
    set({ queue: shuffledQueue, currentIndex: 0, originalQueue: queue });
    storageUtils.saveQueue(shuffledQueue);
    storageUtils.saveCurrentIndex(0);
  },

  unshuffleQueue: () => {
    const { originalQueue, queue, currentIndex } = get();
    if (originalQueue.length === 0) return;
    
    const currentSong = queue[currentIndex];
    const newIndex = originalQueue.findIndex(song => song.id === currentSong.id);
    
    set({ queue: originalQueue, currentIndex: newIndex >= 0 ? newIndex : 0 });
    storageUtils.saveQueue(originalQueue);
    storageUtils.saveCurrentIndex(newIndex >= 0 ? newIndex : 0);
  },

  nextSong: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return currentIndex;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentIndex: nextIndex });
    storageUtils.saveCurrentIndex(nextIndex);
    return nextIndex;
  },

  previousSong: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return currentIndex;
    
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    set({ currentIndex: prevIndex });
    storageUtils.saveCurrentIndex(prevIndex);
    return prevIndex;
  },

  loadPersistedQueue: () => {
    const queue = storageUtils.loadQueue();
    const currentIndex = storageUtils.loadCurrentIndex();
    
    if (queue.length > 0) {
      set({ queue, currentIndex, originalQueue: queue });
    }
  },
}));