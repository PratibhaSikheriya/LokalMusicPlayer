// src/screens/PlayerScreen.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const scheme = useColorScheme();
  const theme = mode === 'system' ? (scheme === 'dark' ? Colors.dark : Colors.light) : Colors[mode];

  if (!currentSong) return null;
  
  // Get highest quality image
  const imageUrl = currentSong.image[currentSong.image.length - 1]?.link;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal-circle-outline" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.artwork} 
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{currentSong.name}</Text>
        <Text style={[styles.artist, { color: theme.textSecondary }]}>{currentSong.primaryArtists}</Text>
      </View>

      {/* Scrubber */}
      <View style={styles.progressContainer}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
          onSlidingComplete={audioService.seek}
        />
        <View style={styles.timeRow}>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{formatTime(position)}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => audioService.playPrevious()}>
          <Ionicons name="play-skip-back" size={32} color={theme.textPrimary} />
        </TouchableOpacity>

        {/* Big Orange Play Button */}
        <TouchableOpacity 
          style={[styles.playBtn, { backgroundColor: theme.primary }]} 
          onPress={() => audioService.togglePlayPause()}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => audioService.playNext()}>
          <Ionicons name="play-skip-forward" size={32} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Lyrics Chevron */}
      <TouchableOpacity style={styles.lyricsBtn}>
        <Ionicons name="chevron-up" size={20} color={theme.textSecondary} />
        <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Lyrics</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 30 },
  artContainer: { alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: {width:0, height:10}, shadowOpacity:0.3, shadowRadius:20, elevation:10 },
  artwork: { width: width - 60, height: width - 60, borderRadius: 20 },
  infoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  artist: { fontSize: 16, fontWeight: '500' },
  progressContainer: { marginBottom: 30 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: -5 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  playBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  lyricsBtn: { alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
});