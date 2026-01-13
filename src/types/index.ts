// src/types/index.ts

export interface Song {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ 
    quality: string; 
    link?: string;  // Search API uses 'link'
    url?: string;   // Songs API uses 'url'
  }>;
  downloadUrl?: Array<{ 
    quality: string; 
    link?: string; 
    url?: string; 
  }>;
  duration: number | string; // Can be number or string from API
  year?: string;
  album?: { name: string; id?: string };
  url?: string;
  hasLyrics?: string | boolean;
  copyright?: string;
  role?: string;
  type?: string;
  playCount?: string; // Add this - it's a string from API
  language?: string;
  label?: string;
  explicitContent?: number;
  releaseDate?: string | null;
  primaryArtistsId?: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
}

export interface ArtistData {
  id: string;
  name: string;
  image: Array<{ link: string; quality: string }> | string;
  role?: string;
}

export interface AlbumData {
  id: string;
  name: string;
  year: string;
  image: Array<{ link: string; quality: string }>;
  primaryArtists?: string;
}