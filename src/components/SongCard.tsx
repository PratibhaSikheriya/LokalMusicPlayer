// src/components/SongCard.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onPress,
  onMorePress,
  isPlaying = false,
}) => {
  // Handle both 'link' and 'url' properties from different API endpoints
  const getImageUrl = (): string => {
    const img150 = song.image.find((img) => img.quality === '150x150');
    if (img150) {
      return img150.link || img150.url || '';
    }
    // Fallback to first image
    const firstImage = song.image[0];
    return firstImage?.link || firstImage?.url || '';
  };

  const imageUrl = getImageUrl();

  const formatDuration = (duration: string | number): string => {
    const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPlayCount = (count?: string): string => {
    if (!count) return '';
    const numCount = parseInt(count, 10);
    if (isNaN(numCount)) return '';
    
    if (numCount >= 1000000) {
      return `${(numCount / 1000000).toFixed(1)}M`;
    } else if (numCount >= 1000) {
      return `${(numCount / 1000).toFixed(1)}K`;
    }
    return numCount.toString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.playingContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {isPlaying && (
          <View style={styles.playingOverlay}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, isPlaying && styles.playingText]} numberOfLines={1}>
          {song.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.primaryArtists}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
          {song.playCount && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.playCount}>
                {formatPlayCount(song.playCount)} plays
              </Text>
            </>
          )}
        </View>
      </View>

      {onMorePress && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  playingContainer: {
    backgroundColor: 'rgba(255, 111, 0, 0.1)', // Orange tint to match your theme
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1a1a2e', // Fallback color while loading
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 111, 0, 0.6)', // Orange overlay
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playingText: {
    color: '#FF6F00', // Orange accent
  },
  artist: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  dot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  playCount: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
});