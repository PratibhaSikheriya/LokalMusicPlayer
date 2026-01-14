// src/screens/FavoritesScreen.tsx

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { useMusicStore } from '../store/musicStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';

export const FavoritesScreen = () => {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { favorites, toggleFavorite } = useMusicStore();
  const { currentSong } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const handlePlay = (song: any, index: number) => {
    setQueue(favorites);
    audioService.loadAndPlay(song);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Favorites</Text>
        {favorites.length > 0 && (
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
          </Text>
        )}
      </View>
      
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-dislike-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add songs to your favorites by tapping the heart icon
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            const isPlaying = currentSong?.id === item.id;
            const imageUrl = item.image?.find(img => img.quality === '150x150')?.link ||
                           item.image?.[0]?.link;

            return (
              <TouchableOpacity 
                style={[
                  styles.item,
                  isPlaying && { backgroundColor: theme.lightPrimary }
                ]} 
                onPress={() => handlePlay(item, index)}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={[styles.img, { backgroundColor: theme.card }]} 
                  />
                  {isPlaying && (
                    <View style={styles.playingOverlay}>
                      <Ionicons name="play" size={16} color="#fff" />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text 
                    style={[
                      styles.title, 
                      { color: isPlaying ? theme.primary : theme.textPrimary }
                    ]} 
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.primaryArtists}
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={() => toggleFavorite(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.favoriteButton}
                >
                  <Ionicons name="heart" size={24} color={theme.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  header: { 
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
  },
  empty: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  img: { 
    width: 56, 
    height: 56, 
    borderRadius: 10,
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 111, 0, 0.7)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
  },
  favoriteButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
    marginLeft: 4,
  },
});