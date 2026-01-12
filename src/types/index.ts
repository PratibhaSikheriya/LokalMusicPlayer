// src/types/index.ts

export interface Song {
  id: string;
  name: string;
  primaryArtists: string;
  image: { link: string; quality: string }[];
  
  // The API returns an array of quality options, OR sometimes a string
  downloadUrl?: { link: string; quality: string }[] | string; 
  download_url?: { link: string; quality: string }[] | string;
  
  duration: number; // in seconds
  year?: string;
  album?: { name: string };
}

export interface ArtistData {
  id: string;
  name: string;
  image: string;
}

export interface AlbumData {
  id: string;
  name: string;
  year: string;
  image: string;
}