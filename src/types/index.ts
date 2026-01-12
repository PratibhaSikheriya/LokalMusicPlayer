// src/types/index.ts

export interface ImageQuality {
  quality: string;
  link?: string;
  url?: string;
}

export interface DownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

export interface Album {
  id: string;
  name: string;
  url?: string;
}

export interface Artist {
  id: string;
  name: string;
  url?: string;
  image?: ImageQuality[];
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  album: Album;
  year?: string;
  releaseDate?: string | null;
  duration: string | number;
  label?: string;
  primaryArtists: string;
  primaryArtistsId?: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
  explicitContent?: number;
  playCount?: string;
  language: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

export interface SearchResponse {
  status: string;
  data: {
    results: Song[];
    total: number;
    start: number;
  };
}

export interface SongDetailsResponse {
  success: boolean;
  data: Song[];
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

export interface QueueState {
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[];
}