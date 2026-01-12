import { create } from 'zustand';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'dark', // Default to dark as per design
  setMode: (mode) => set({ mode }),
}));