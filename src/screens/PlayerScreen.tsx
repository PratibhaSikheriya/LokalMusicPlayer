// src/screens/PlayerScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';

const { width, height } = Dimensions.get('window');

export const PlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  
  if (!currentSong) return null;

  const imageUrl = currentSong.image[2]?.link || currentSong.image[0]?.link;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Album Art (Large & Square) */}
      <View style={styles.artContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.artwork} 
          resizeMode="cover"
        />
      </View>

      {/* Title & Artist */}
      <View style={styles.infoContainer}>
        <Text style={styles.songTitle} numberOfLines={1}>{currentSong.name}</Text>
        <Text style={styles.artistName} numberOfLines={1}>{currentSong.primaryArtists}</Text>
      </View>

      {/* Progress Bar (Orange) */}
      <View style={styles.progressContainer}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.progressBarBackground}
          thumbTintColor={Colors.primary}
          onSlidingComplete={audioService.seek}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls (Matches Page 5) */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color={Colors.grey} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => audioService.playPrevious()}>
          <Ionicons name="play-skip-back" size={30} color={Colors.white} />
        </TouchableOpacity>

        {/* Big Orange Play Button */}
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => audioService.togglePlayPause()}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color={Colors.white} 
            style={{ marginLeft: isPlaying ? 0 : 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => audioService.playNext()}>
          <Ionicons name="play-skip-forward" size={30} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color={Colors.grey} />
        </TouchableOpacity>
      </View>

      {/* Lyrics Chevron */}
      <TouchableOpacity style={styles.lyricsContainer}>
        <Ionicons name="chevron-up" size={20} color={Colors.grey} />
        <Text style={styles.lyricsText}>Lyrics</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, marginBottom: 30
  },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  
  artContainer: { alignItems: 'center', marginBottom: 40 },
  artwork: {
    width: width - 48,
    height: width - 48,
    borderRadius: 30, // Matches rounded corners in design
    backgroundColor: Colors.card,
  },
  
  infoContainer: { alignItems: 'center', marginBottom: 30 },
  songTitle: { color: Colors.white, fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  artistName: { color: Colors.grey, fontSize: 16, fontWeight: '500', textAlign: 'center' },
  
  progressContainer: { marginBottom: 30 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5, paddingHorizontal: 5 },
  timeText: { color: Colors.grey, fontSize: 12 },
  
  controlsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 40, paddingHorizontal: 10
  },
  playButton: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {width:0, height:4}
  },
  
  lyricsContainer: { alignItems: 'center', marginTop: 'auto', marginBottom: 10 },
  lyricsText: { color: Colors.grey, fontSize: 14, fontWeight: '600', marginTop: 4 }
});