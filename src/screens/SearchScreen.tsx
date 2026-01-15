// src/screens/SearchScreen.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { saavnApi } from '../api/saavn';
import { audioService } from '../services/audioService';
import { useQueueStore } from '../store/queueStore';
import { getImageUrl } from '../utils/imageHelper';
import { decodeHtmlEntities } from '../utils/htmlDecode';

export const SearchScreen = () => {
  const navigation = useNavigation();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { setQueue } = useQueueStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'songs' | 'albums' | 'artists'>('songs');

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) performSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, searchType]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      let data = [];
      if (searchType === 'songs') data = await saavnApi.searchSongs(query);
      else if (searchType === 'albums') data = await saavnApi.searchAlbums(query);
      else if (searchType === 'artists') data = await saavnApi.searchArtists(query);
      
      setResults(data || []);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleItemPress = (item: any) => {
    if (searchType === 'songs') {
      // It's a song -> Play it
      setQueue([item]); // Or append to queue?
      audioService.loadAndPlay(item);
    } else {
      // It's an Album or Artist -> Navigate to Details
      (navigation as any).navigate('Details', {
        type: searchType === 'artists' ? 'artist' : 'album',
        id: item.id,
        title: item.name,
        data: item
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.image, 'low');
    const subtitle = item.primaryArtists || item.description || item.year || (searchType === 'artists' ? 'Artist' : '');

    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handleItemPress(item)}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={[
            styles.image, 
            searchType === 'artists' && { borderRadius: 25 } // Circle for artists
          ]} 
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(subtitle)}
          </Text>
        </View>
        <Ionicons 
          name={searchType === 'songs' ? "play-circle-outline" : "chevron-forward"} 
          size={24} 
          color={theme.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.card }]}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['songs', 'artists', 'albums'].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSearchType(type as any)}
            style={[
              styles.tab, 
              searchType === type && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
          >
            <Text style={[
              styles.tabText, 
              { color: searchType === type ? '#FFF' : theme.textSecondary }
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12
  },
  input: {
    flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, fontSize: 16
  },
  tabs: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10
  },
  tab: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333'
  },
  tabText: { fontSize: 14, fontWeight: '500' },
  itemContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16
  },
  image: {
    width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#333'
  },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 2 },
});