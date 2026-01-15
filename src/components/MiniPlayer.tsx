import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { getImageUrl } from '../utils/imageHelper';

export const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const [isPlayerScreenOpen, setIsPlayerScreenOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      const currentRoute = state?.routes[state.index];
      setIsPlayerScreenOpen(currentRoute?.name === 'Player');
    });
    return unsubscribe;
  }, [navigation]);

  if (!currentSong || isPlayerScreenOpen) return null;

  const imageUrl = getImageUrl(currentSong.image, 'low');
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => navigation.navigate('Player' as never)}
      style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}
    >
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%`, backgroundColor: theme.primary }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image source={{ uri: imageUrl }} style={styles.albumArt} />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {decodeHtmlEntities(currentSong.name)}
            </Text>
            <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>
              {decodeHtmlEntities(currentSong.primaryArtists)}
            </Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={() => audioService.togglePlayPause()} hitSlop={10} style={styles.btn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => audioService.playNext()} hitSlop={10} style={styles.btn}>
            <Ionicons name="play-skip-forward" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          {/* CROSS BUTTON */}
          <TouchableOpacity onPress={() => audioService.stop()} hitSlop={10} style={styles.btn}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 58, left: 0, right: 0,
    height: 68, borderTopWidth: 0.5, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  progressBarBg: { height: 2, width: '100%', position: 'absolute', top: 0, left: 0, right: 0 },
  progressBar: { height: '100%' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  leftSection: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  albumArt: { width: 44, height: 44, borderRadius: 6, marginRight: 12, backgroundColor: '#333' },
  songInfo: { flex: 1, justifyContent: 'center' },
  songTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  artistName: { fontSize: 12 },
  controlsContainer: { flexDirection: 'row', alignItems: 'center' },
  btn: { padding: 6, marginLeft: 6 },
});