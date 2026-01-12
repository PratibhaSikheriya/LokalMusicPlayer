// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const QUEUE_KEY = 'lokal_music_queue';
const CURRENT_INDEX_KEY = 'lokal_music_index';

export const storageUtils = {
  // Save queue to storage (Async)
  saveQueue: async (queue: Song[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  },

  // Load queue from storage (Async)
  loadQueue: async (): Promise<Song[]> => {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error loading queue:', error);
      return [];
    }
  },

  // Save current index (Async)
  saveCurrentIndex: async (index: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(CURRENT_INDEX_KEY, index.toString());
    } catch (error) {
      console.error('Error saving current index:', error);
    }
  },

  // Load current index (Async)
  loadCurrentIndex: async (): Promise<number> => {
    try {
      const index = await AsyncStorage.getItem(CURRENT_INDEX_KEY);
      return index ? parseInt(index, 10) : 0;
    } catch (error) {
      console.error('Error loading current index:', error);
      return 0;
    }
  },

  // Clear all storage (Async)
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([QUEUE_KEY, CURRENT_INDEX_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};