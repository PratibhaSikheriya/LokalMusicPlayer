import { create } from 'zustand';
import { Song } from '../types';

type SortOption = 'Ascending' | 'Descending' | 'Date Added';

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
    if (sortOption === 'Ascending') return sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOption === 'Descending') return sorted.sort((a, b) => b.name.localeCompare(a.name));
    return sorted;
  },
}));