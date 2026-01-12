// src/components/MiniPlayer.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.find?.((img: any) => img.quality === '150x150')?.link ||
                   currentSong.image?.find?.((img: any) => img.quality === '150x150')?.url ||
                   currentSong.image?.[0]?.link ||
                   currentSong.image?.[0]?.url ||
                   '';

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = async () => {
    try {
      await audioService.togglePlayPause();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleNext = async () => {
    try {
      await audioService.playNext();
    } catch (error) {
      console.error('Error playing next:', error);
    }
  };

  const handlePress = () => {
    navigation.navigate('Player' as never);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <View style={styles.content}>
          <View style={styles.leftSection}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: '#333' }]} />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {currentSong.name || 'Unknown Song'}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentSong.primaryArtists || 'Unknown Artist'}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.controlButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.controlButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    flex: 1,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8A2BE2',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artist: {
    fontSize: 13,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 4,
  },
});