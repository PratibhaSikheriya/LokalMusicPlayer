// src/screens/PlayerScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';

const { width } = Dimensions.get('window');

export const PlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    repeatMode,
    isShuffled,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();
  
  const { queue } = useQueueStore();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  useEffect(() => {
    if (!isSeeking) {
      setSeekPosition(position);
    }
  }, [position, isSeeking]);

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSongText}>No song playing</Text>
      </View>
    );
  }

  const imageUrl = currentSong.image.find((img) => img.quality === '500x500')?.link ||
                   currentSong.image.find((img) => img.quality === '500x500')?.url ||
                   currentSong.image[currentSong.image.length - 1]?.link ||
                   currentSong.image[currentSong.image.length - 1]?.url;

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSeekComplete = async (value: number) => {
    setIsSeeking(false);
    await audioService.seek(value);
  };

  const handlePlayPause = async () => {
    await audioService.togglePlayPause();
  };

  const handleNext = async () => {
    await audioService.playNext();
  };

  const handlePrevious = async () => {
    await audioService.playPrevious();
  };

  const handleShuffle = () => {
    const queueStore = useQueueStore.getState();
    toggleShuffle();
    if (!isShuffled) {
      queueStore.shuffleQueue();
    } else {
      queueStore.unshuffleQueue();
    }
  };

  const getRepeatIcon = (): 'repeat' | 'repeat-outline' => {
    return repeatMode === 'off' ? 'repeat-outline' : 'repeat';
  };

  const getRepeatColor = () => {
    return repeatMode !== 'off' ? '#8A2BE2' : '#666';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Queue' as never)}
              style={styles.queueButton}
            >
              <Ionicons name="list" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Album Art */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.artwork}
              resizeMode="cover"
            />
          </View>

          {/* Song Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.songTitle} numberOfLines={2}>
              {currentSong.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentSong.primaryArtists}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              value={isSeeking ? seekPosition : position}
              minimumValue={0}
              maximumValue={duration || 1}
              minimumTrackTintColor="#8A2BE2"
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor="#fff"
              onSlidingStart={handleSeekStart}
              onValueChange={handleSeekChange}
              onSlidingComplete={handleSeekComplete}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(isSeeking ? seekPosition : position)}
              </Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              <TouchableOpacity
                onPress={handleShuffle}
                style={styles.secondaryButton}
              >
                <Ionicons
                  name="shuffle"
                  size={24}
                  color={isShuffled ? '#8A2BE2' : '#666'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleRepeat}
                style={styles.secondaryButton}
              >
                <Ionicons
                  name={getRepeatIcon()}
                  size={24}
                  color={getRepeatColor()}
                />
                {repeatMode === 'one' && (
                  <View style={styles.repeatOneIndicator}>
                    <Text style={styles.repeatOneText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Main Controls */}
            <View style={styles.mainControls}>
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.controlButton}
              >
                <Ionicons name="play-skip-back" size={36} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
              >
                <LinearGradient
                  colors={['#8A2BE2', '#DA70D6']}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={40}
                    color="#fff"
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                style={styles.controlButton}
              >
                <Ionicons name="play-skip-forward" size={36} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  queueButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  artwork: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  controlsContainer: {
    paddingHorizontal: 24,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  secondaryButton: {
    position: 'relative',
  },
  repeatOneIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSongText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#999',
  },
});