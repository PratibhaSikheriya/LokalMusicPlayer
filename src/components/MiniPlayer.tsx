// src/components/MiniPlayer.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { decodeHtmlEntities } from '../utils/htmlDecode';

export const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const scheme = useColorScheme();
  const theme = mode === 'system' 
    ? (scheme === 'dark' ? Colors.dark : Colors.light) 
    : Colors[mode];

  const [isPlayerScreenOpen, setIsPlayerScreenOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      const currentRoute = state?.routes[state.index];
      
      if (currentRoute?.name === 'Player') {
        setIsPlayerScreenOpen(true);
      } else {
        setIsPlayerScreenOpen(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

  if (!currentSong || isPlayerScreenOpen) {
    return null;
  }

  const imageUrl = 
    currentSong.image?.[2]?.url || 
    currentSong.image?.[2]?.link || 
    currentSong.image?.[1]?.url || 
    currentSong.image?.[1]?.link || 
    currentSong.image?.[0]?.url || 
    currentSong.image?.[0]?.link;

  const artistName = decodeHtmlEntities(currentSong.primaryArtists || 'Unknown Artist');
  const songName = decodeHtmlEntities(currentSong.name);
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Player' as never)}
      style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}
    >
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(progress, 100)}%`, backgroundColor: theme.primary }
          ]} 
        />
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image 
            source={{ uri: imageUrl }} 
            style={[styles.albumArt, { backgroundColor: theme.border }]} 
          />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {songName}
            </Text>
            <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>
              {artistName}
            </Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            onPress={() => audioService.togglePlayPause()} 
            style={styles.playButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={26} 
              color={theme.textPrimary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => audioService.playNext()} 
            style={styles.nextButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={24} 
              color={theme.textPrimary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 0.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  progressBarBg: {
    height: 2,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 2,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '400',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    padding: 6,
  },
  nextButton: {
    padding: 6,
  },
});