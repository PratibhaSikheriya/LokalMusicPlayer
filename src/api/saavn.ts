// src/api/saavn.ts

import { SearchResponse, SongDetailsResponse, Song } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

export const saavnApi = {
  // Search for songs
  searchSongs: async (query: string, page: number = 1): Promise<SearchResponse> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  },

  // Get song details by ID
  getSongById: async (id: string): Promise<Song> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch song details');
      }
      
      const data: SongDetailsResponse = await response.json();
      return data.data[0];
    } catch (error) {
      console.error('Error fetching song details:', error);
      throw error;
    }
  },

  // Get song suggestions
  getSuggestions: async (id: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}/suggestions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  },

  // Get trending songs (using search with popular query)
  getTrendingSongs: async (): Promise<Song[]> => {
    try {
      const response = await saavnApi.searchSongs('arijit singh', 1);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      return [];
    }
  },

  // Get artist details
  getArtist: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist:', error);
      throw error;
    }
  },

  // Get artist songs
  getArtistSongs: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}/songs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artist songs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      throw error;
    }
  }
};