// src/utils/storage.ts

import { MMKV } from 'react-native-mmkv';
import { Song } from '../types';

export const storage = new MMKV();

const QUEUE_KEY = 'queue';
const CURRENT_INDEX_KEY = 'currentIndex';

export const storageUtils = {
  // Save queue to storage
  saveQueue: (queue: Song[]): void => {
    try {
      storage.set(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  },

  // Load queue from storage
  loadQueue: (): Song[] => {
    try {
      const queueData = storage.getString(QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error loading queue:', error);
      return [];
    }
  },

  // Save current index
  saveCurrentIndex: (index: number): void => {
    try {
      storage.set(CURRENT_INDEX_KEY, index);
    } catch (error) {
      console.error('Error saving current index:', error);
    }
  },

  // Load current index
  loadCurrentIndex: (): number => {
    try {
      const index = storage.getNumber(CURRENT_INDEX_KEY);
      return index !== undefined ? index : 0;
    } catch (error) {
      console.error('Error loading current index:', error);
      return 0;
    }
  },

  // Clear all storage
  clearAll: (): void => {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};