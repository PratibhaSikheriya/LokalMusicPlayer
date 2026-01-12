// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { saavnApi } from '../api/saavn';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { Song } from '../types';

const { width } = Dimensions.get('window');
const CATEGORIES = ['Suggested', 'Songs', 'Artists', 'Albums', 'Folders'];

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { setQueue } = useQueueStore();
  const { currentSong } = usePlayerStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const trendData = await saavnApi.getTrendingSongs();
      // Split data to simulate "Recently Played" (Horizontal) vs "Songs" (Vertical)
      setTrending(trendData.slice(0, 5)); 
      setSongs(trendData);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handlePlay = async (song: Song, list: Song[]) => {
    setQueue(list);
    await audioService.loadAndPlay(song);
  };

  // --- Render Items ---

  const renderHorizontalCard = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => handlePlay(item, trending)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image[2]?.link || item.image[0]?.link }} 
        style={styles.cardImage} 
      />
      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardArtist} numberOfLines={1}>{item.primaryArtists}</Text>
    </TouchableOpacity>
  );

  const renderVerticalItem = ({ item, index }: { item: Song; index: number }) => {
    const isPlaying = currentSong?.id === item.id;
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => handlePlay(item, songs)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.image[1]?.link || item.image[0]?.link }} 
          style={styles.listImage} 
        />
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, isPlaying && { color: Colors.primary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {item.primaryArtists} • {Math.floor(Number(item.duration) / 60)}:{(Number(item.duration) % 60).toString().padStart(2, '0')} mins
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Mume</Text>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=32' }} 
          style={styles.avatar} 
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.grey} />
        <TextInput 
          placeholder="Search for songs, artists..."
          placeholderTextColor={Colors.darkGrey}
          style={styles.searchInput}
        />
      </View>

      {/* Category Chips */}
      <View style={styles.chipScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recently Played (Horizontal) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        
        <FlatList
          horizontal
          data={trending}
          renderItem={renderHorizontalCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Songs List (Vertical) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Played</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          songs.map((song, i) => (
            <View key={song.id}>
              {renderVerticalItem({ item: song, index: i })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 10, marginBottom: 20
  },
  appTitle: { fontSize: 28, fontWeight: '700', color: Colors.white, fontFamily: 'System' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: Colors.white },
  
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.input,
    marginHorizontal: 24, paddingHorizontal: 16, height: 50, borderRadius: 25,
    marginBottom: 20
  },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.white, fontSize: 16 },
  
  chipScroll: { marginBottom: 20, paddingLeft: 24 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20,
    backgroundColor: 'transparent', marginRight: 12, borderWidth: 1, borderColor: 'transparent'
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.grey, fontSize: 15, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  
  scrollContent: { paddingBottom: 100 }, // Space for MiniPlayer
  
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 15
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  seeAll: { color: Colors.grey, fontSize: 14 },
  
  horizontalList: { paddingLeft: 24, paddingRight: 10, marginBottom: 25 },
  cardContainer: { width: 140, marginRight: 16 },
  cardImage: { width: 140, height: 140, borderRadius: 20, marginBottom: 10, backgroundColor: Colors.card },
  cardTitle: { color: Colors.white, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardArtist: { color: Colors.grey, fontSize: 12 },
  
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20
  },
  listImage: { width: 60, height: 60, borderRadius: 16, marginRight: 16, backgroundColor: Colors.card },
  listInfo: { flex: 1 },
  listTitle: { color: Colors.white, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  listSubtitle: { color: Colors.grey, fontSize: 13 },
  moreBtn: { padding: 5 },
});