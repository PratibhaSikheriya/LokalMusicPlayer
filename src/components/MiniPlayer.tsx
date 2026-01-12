import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';

export const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const scheme = useColorScheme();
  const theme = mode === 'system' ? (scheme === 'dark' ? Colors.dark : Colors.light) : Colors[mode];

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.[2]?.link || currentSong.image?.[0]?.link;
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => navigation.navigate('Player' as never)}
      style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}
    >
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
              {currentSong.primaryArtists}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => audioService.togglePlayPause()} style={styles.controlButton}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => audioService.playNext()} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 58, left: 0, right: 0, height: 72,
    borderTopWidth: 1, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 10,
  },
  progressBarContainer: { height: 2, width: '100%', position: 'absolute', top: 0, zIndex: 10 },
  progressBar: { height: '100%' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  leftSection: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  textContainer: { flex: 1, paddingRight: 12 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  artist: { fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingRight: 4 },
  controlButton: { padding: 4 },
});