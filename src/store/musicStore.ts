import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface MusicState {
  favorites: Song[];
  playlists: Playlist[];
  history: Song[];
  playCounts: Record<string, number>;
  
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  
  recordPlay: (song: Song) => void; 
  getMostPlayed: () => Song[];
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      favorites: [],
      playlists: [],
      history: [],
      playCounts: {},

      toggleFavorite: (song) => {
        const { favorites } = get();
        const exists = favorites.some((s) => s.id === song.id);
        if (exists) {
          set({ favorites: favorites.filter((s) => s.id !== song.id) });
        } else {
          set({ favorites: [song, ...favorites] });
        }
      },

      isFavorite: (songId) => get().favorites.some((s) => s.id === songId),

      createPlaylist: (name) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          songs: [],
          createdAt: Date.now(),
        };
        set((state) => ({ playlists: [newPlaylist, ...state.playlists] }));
      },

      // ... imports same as before ...
      addToPlaylist: (playlistId, song) => {
        set((state) => {
          // Flattened logic to fix nesting warning
          const updatedPlaylists = state.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            
            const isDuplicate = pl.songs.some(s => s.id === song.id);
            if (isDuplicate) return pl;

            return { ...pl, songs: [...pl.songs, song] };
          });
          
          return { playlists: updatedPlaylists };
        });
      },
// ... rest of store same as before ...

      recordPlay: (song) => {
        set((state) => {
          const newHistory = [song, ...state.history.filter((s) => s.id !== song.id)].slice(0, 50);
          const newCounts = { ...state.playCounts, [song.id]: (state.playCounts[song.id] || 0) + 1 };
          return { history: newHistory, playCounts: newCounts };
        });
      },

      getMostPlayed: () => {
        const { playCounts, history } = get();
        return [...history].sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0)).slice(0, 10);
      },
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);