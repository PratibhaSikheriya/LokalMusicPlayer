const BASE_URL = 'https://saavn.sumit.co/api';

export const saavnApi = {
  searchSongs: async (query: string, page = 1, limit = 50) => {
    try {
      console.log(`🔍 Searching: ${query} (Page: ${page})`);
      const response = await fetch(
        `${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      const json = await response.json();
      
      if (json.success && json.data?.results) {
        return json.data.results;
      }
      return [];
    } catch (error) {
      console.error('❌ Search songs error:', error);
      return [];
    }
  },

  getSongById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${id}`);
      const json = await response.json();
      if (json.success && json.data?.[0]) return json.data[0];
      return null;
    } catch (error) {
      console.error('Get song error:', error);
      return null;
    }
  },

  getLyrics: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${id}/lyrics`);
      const json = await response.json();
      if (json.success && json.data?.lyrics) {
        return json.data.lyrics;
      }
      return null;
    } catch (error) {
      console.error('Get lyrics error:', error);
      return null;
    }
  },

  getSongSuggestions: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${id}/suggestions`);
      const json = await response.json();
      if (json.success && json.data) return json.data;
      return [];
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  },

  searchAlbums: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/albums?query=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      return json.success && json.data?.results ? json.data.results : [];
    } catch (error) {
      console.error('❌ Search albums error:', error);
      return [];
    }
  },

  searchArtists: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      return json.success && json.data?.results ? json.data.results : [];
    } catch (error) {
      console.error('❌ Search artists error:', error);
      return [];
    }
  },

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

  // FIXED: Now properly fetches songs for the artist
  getArtistSongs: async (id: string, page = 1) => {
    try {
      // Sometimes we need to search by artist name to get song list
      const response = await fetch(`${BASE_URL}/artists/${id}/songs?page=${page}`);
      const json = await response.json();
      if(json.success && json.data?.songs) return json.data.songs;
      return [];
    } catch (error) {
      console.error('Get artist songs error:', error);
      return [];
    }
  },

  getTrending: async () => {
    return saavnApi.searchSongs('trending', 1, 50);
  },

  getSongsByLanguage: async (language: string) => {
    return saavnApi.searchSongs(`${language} songs`);
  }
};