// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongCard } from '../components/SongCard';
import { saavnApi } from '../api/saavn';
import { Song } from '../types';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';

export const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { setQueue } = useQueueStore();
  const { currentSong } = usePlayerStore();

  useEffect(() => {
    loadTrendingSongs();
  }, []);

  const loadTrendingSongs = async () => {
    try {
      setIsLoading(true);
      const data = await saavnApi.getTrendingSongs();
      setSongs(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading trending songs:', error);
      setIsLoading(false);
    }
  };

  const searchSongs = async (query: string, pageNum: number = 1) => {
    if (!query.trim()) {
      loadTrendingSongs();
      return;
    }

    try {
      setIsLoading(true);
      const response = await saavnApi.searchSongs(query, pageNum);
      
      if (pageNum === 1) {
        setSongs(response.data.results);
      } else {
        setSongs(prev => [...prev, ...response.data.results]);
      }
      
      setHasMore(response.data.results.length === 20);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching songs:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    setHasMore(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchSongs(text, 1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore && searchQuery) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchSongs(searchQuery, nextPage);
    }
  };

  const handleSongPress = async (song: Song, index: number) => {
    setQueue(songs, index);
    await audioService.loadAndPlay(song);
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <SongCard
      song={item}
      onPress={() => handleSongPress(item, index)}
      isPlaying={currentSong?.id === item.id}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Lokal</Text>
      <Text style={styles.headerSubtitle}>
        {searchQuery ? 'Search Results' : 'Trending Now'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8A2BE2" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {renderHeader()}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for songs, artists..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  loadTrendingSongs();
                }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Songs List */}
          {isLoading && songs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8A2BE2" />
              <Text style={styles.loadingText}>Loading songs...</Text>
            </View>
          ) : (
            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});