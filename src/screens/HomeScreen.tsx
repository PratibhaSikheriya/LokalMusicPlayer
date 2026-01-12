// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { saavnApi } from '../api/saavn';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { Song } from '../types';

const CATEGORIES = ['Suggested', 'Songs', 'Artists', 'Albums'];

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Suggested');
  const [songs, setSongs] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setQueue } = useQueueStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch trending for the horizontal list
      const trendData = await saavnApi.getTrendingSongs(); 
      setTrending(trendData.slice(0, 5)); // Top 5 for horizontal
      setSongs(trendData); // Rest for vertical
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleSongPress = async (song: Song, list: Song[]) => {
    setQueue(list);
    await audioService.loadAndPlay(song);
  };

  // Render Horizontal Card (Recently Played style)
  const renderTrendingCard = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.trendCard}
      onPress={() => handleSongPress(item, trending)}
    >
      <Image 
        source={{ uri: item.image[2]?.link || item.image[0]?.link }} 
        style={styles.trendImage} 
      />
      <Text style={styles.trendTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.trendArtist} numberOfLines={1}>{item.primaryArtists}</Text>
    </TouchableOpacity>
  );

  // Render Vertical List Item
  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songRow}
      onPress={() => handleSongPress(item, songs)}
    >
      <Image 
        source={{ uri: item.image[1]?.link || item.image[0]?.link }} 
        style={styles.songImage} 
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.primaryArtists}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Music</Text>
        <TouchableOpacity>
           <Image 
             source={{ uri: 'https://i.pravatar.cc/100' }} // Placeholder avatar
             style={styles.avatar} 
           />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput 
          placeholder="Search for songs, artists..." 
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {/* Categories / Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.chip, activeCategory === cat && styles.activeChip]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.activeChipText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Horizontal Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        
        <FlatList
          horizontal
          data={trending}
          renderItem={renderTrendingCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendList}
        />

        {/* Vertical Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Played</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          songs.map((song, index) => (
            <View key={song.id}>
              {renderSongItem({ item: song })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBackground,
    padding: 12, borderRadius: 12, marginBottom: 20
  },
  searchInput: { marginLeft: 10, color: 'white', flex: 1, fontSize: 16 },
  categories: { flexDirection: 'row', marginBottom: 20, maxHeight: 50 },
  chip: { marginRight: 15, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: 'transparent' },
  activeChip: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  activeChipText: { color: 'white' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  seeAll: { color: Colors.textSecondary },
  trendList: { paddingRight: 20 },
  trendCard: { marginRight: 15, width: 140 },
  trendImage: { width: 140, height: 140, borderRadius: 16, marginBottom: 8 },
  trendTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  trendArtist: { color: Colors.textSecondary, fontSize: 12 },
  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  songImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  songInfo: { flex: 1 },
  songTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  songArtist: { color: Colors.textSecondary, fontSize: 14 },
});