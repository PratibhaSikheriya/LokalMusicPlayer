// src/screens/PlayerScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { audioService } from '../services/audioService';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (value: number) => {
    setSeekPosition(value);
    setIsSeeking(true);
  };

  const handleSeekComplete = async (value: number) => {
    await audioService.seek(value);
    setIsSeeking(false);
  };

  if (!currentSong) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No song playing
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = currentSong.image?.find(img => img.quality === '500x500')?.link ||
                   currentSong.image?.[0]?.link;

  const currentPosition = isSeeking ? seekPosition : position;

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top']}
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Now Playing
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.artwork}
        />
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.songTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>
          {currentSong.primaryArtists}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentPosition}
          onValueChange={handleSeek}
          onSlidingComplete={handleSeekComplete}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.textSecondary + '40'}
          thumbTintColor={theme.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(currentPosition)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="shuffle" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => audioService.playPrevious()}
        >
          <Ionicons name="play-skip-back" size={32} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          onPress={() => audioService.togglePlayPause()}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={32} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => audioService.playNext()}
        >
          <Ionicons name="play-skip-forward" size={32} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="repeat" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 40,
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 64,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
});