// src/api/saavn.ts

const BASE_URL = 'https://saavn.sumit.co/api';

export const saavnApi = {
  // Search songs - returns array of songs
  searchSongs: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/songs?query=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      
      if (json.status === 'SUCCESS' && json.data?.results) {
        return json.data.results;
      }
      return [];
    } catch (error) {
      console.error('Search songs error:', error);
      return [];
    }
  },

  // Get song by ID - returns single song details
  getSongById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${id}`);
      const json = await response.json();
      
      if (json.success && json.data?.[0]) {
        return json.data[0];
      }
      return null;
    } catch (error) {
      console.error('Get song error:', error);
      return null;
    }
  },

  // Get song suggestions - for queue/autoplay
  getSongSuggestions: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${id}/suggestions`);
      const json = await response.json();
      
      if (json.success && json.data) {
        return json.data;
      }
      return [];
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  },

  // Search albums
  searchAlbums: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/albums?query=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      return json.status === 'SUCCESS' && json.data?.results 
        ? json.data.results 
        : [];
    } catch (error) {
      console.error('Search albums error:', error);
      return [];
    }
  },

  // Search artists
  searchArtists: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      return json.status === 'SUCCESS' && json.data?.results 
        ? json.data.results 
        : [];
    } catch (error) {
      console.error('Search artists error:', error);
      return [];
    }
  },

  // Get artist details
  getArtistById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/artists/${id}`);
      const json = await response.json();
      return json.success && json.data ? json.data : null;
    } catch (error) {
      console.error('Get artist error:', error);
      return null;
    }
  },

  // Get artist songs
  getArtistSongs: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/artists/${id}/songs`);
      const json = await response.json();
      return json.success && json.data ? json.data : [];
    } catch (error) {
      console.error('Get artist songs error:', error);
      return [];
    }
  },

  // Get trending songs (for home screen)
  getTrending: async () => {
    return saavnApi.searchSongs('trending');
  },

  // Get popular songs by language
  getSongsByLanguage: async (language: string) => {
    return saavnApi.searchSongs(`${language} songs`);
  }
};