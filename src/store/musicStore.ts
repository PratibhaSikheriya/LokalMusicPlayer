// src/store/musicStore.ts

import { create } from 'zustand';
import { Song } from '../types';

type SortOption = 'Ascending' | 'Descending' | 'Artist' | 'Album' | 'Year' | 'Date Added';

interface MusicStore {
  favorites: Song[];
  sortOption: SortOption;
  toggleFavorite: (song: Song) => void;
  isFavorite: (id: string) => boolean;
  setSortOption: (option: SortOption) => void;
  sortSongs: (songs: Song[]) => Song[];
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  favorites: [],
  sortOption: 'Ascending',
  
  toggleFavorite: (song) => {
    const { favorites } = get();
    const exists = favorites.find((s) => s.id === song.id);
    if (exists) {
      set({ favorites: favorites.filter((s) => s.id !== song.id) });
    } else {
      set({ favorites: [...favorites, song] });
    }
  },
  
  isFavorite: (id) => !!get().favorites.find((s) => s.id === id),
  
  setSortOption: (option) => set({ sortOption: option }),
  
  sortSongs: (songs) => {
    const { sortOption } = get();
    const sorted = [...songs];
    
    switch (sortOption) {
      case 'Ascending':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'Descending':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'Artist':
        return sorted.sort((a, b) => a.primaryArtists.localeCompare(b.primaryArtists));
      case 'Album':
        return sorted.sort((a, b) => {
          const albumA = a.album?.name || '';
          const albumB = b.album?.name || '';
          return albumA.localeCompare(albumB);
        });
      case 'Year':
        return sorted.sort((a, b) => {
          const yearA = parseInt(a.year || '0');
          const yearB = parseInt(b.year || '0');
          return yearB - yearA;
        });
      case 'Date Added':
        return sorted;
      default:
        return sorted;
    }
  },
}));