// src/store/musicStore.ts

import { create } from 'zustand';
import { Song } from '../types';

interface MusicStore {
  // Search state
  searchResults: Song[];
  isSearching: boolean;
  searchQuery: string;
  
  // Favorites
  favorites: Song[];
  
  // Recently played
  recentlyPlayed: Song[];
  
  // Actions
  setSearchResults: (results: Song[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchQuery: (query: string) => void;
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  addToRecentlyPlayed: (song: Song) => void;
  clearRecentlyPlayed: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // Initial state
  searchResults: [],
  isSearching: false,
  searchQuery: '',
  favorites: [],
  recentlyPlayed: [],

  // Actions
  setSearchResults: (results) => set({ searchResults: results }),
  
  setIsSearching: (isSearching) => set({ isSearching }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addToFavorites: (song) => {
    const { favorites } = get();
    if (!favorites.find((s) => s.id === song.id)) {
      set({ favorites: [...favorites, song] });
    }
  },
  
  removeFromFavorites: (songId) => {
    const { favorites } = get();
    set({ favorites: favorites.filter((s) => s.id !== songId) });
  },
  
  isFavorite: (songId) => {
    const { favorites } = get();
    return favorites.some((s) => s.id === songId);
  },
  
  addToRecentlyPlayed: (song) => {
    const { recentlyPlayed } = get();
    const filtered = recentlyPlayed.filter((s) => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, 20); // Keep last 20
    set({ recentlyPlayed: updated });
  },
  
  clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),
}));