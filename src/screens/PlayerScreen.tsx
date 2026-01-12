import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

// FIXED: Import MaterialCommunityIcons specifically to resolve the error
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

// ... (Rest of the code remains exactly the same as you pasted)
export const PlayerScreen = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  if (!currentSong) return null;
  const imageUrl = currentSong.image[currentSong.image.length - 1]?.link;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal-circle-outline" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.artContainer}>
        <Image source={{ uri: imageUrl }} style={styles.artwork} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{currentSong.name}</Text>
        <Text style={[styles.artist, { color: theme.textSecondary }]}>{currentSong.primaryArtists}</Text>
      </View>

      {/* Slider & Time */}
      <View style={styles.progressContainer}>
        <Slider
          style={{ width: '100%', height: 20 }}
          minimumValue={0} maximumValue={duration} value={position}
          minimumTrackTintColor={theme.primary} maximumTrackTintColor={theme.border} thumbTintColor={theme.primary}
          onSlidingComplete={audioService.seek}
        />
        <View style={styles.timeRow}>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(position).toISOString().substr(14, 5)}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(duration).toISOString().substr(14, 5)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => audioService.playPrevious()}>
          <Ionicons name="play-skip-back" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => audioService.seek(Math.max(0, position - 10000))}>
          <MaterialIcons name="replay-10" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.playBtn, { backgroundColor: theme.primary }]} onPress={() => audioService.togglePlayPause()}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => audioService.seek(Math.min(duration, position + 10000))}>
          <MaterialIcons name="forward-10" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => audioService.playNext()}>
          <Ionicons name="play-skip-forward" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Icons */}
      <View style={styles.bottomRow}>
        <MaterialCommunityIcons name="speedometer" size={24} color={theme.textSecondary} />
        <MaterialCommunityIcons name="timer-outline" size={24} color={theme.textSecondary} />
        <MaterialIcons name="cast" size={24} color={theme.textSecondary} />
        <Ionicons name="ellipsis-vertical" size={24} color={theme.textSecondary} />
      </View>

      <TouchableOpacity style={styles.lyricsBtn}>
        <Ionicons name="chevron-up" size={24} color={theme.textSecondary} />
        <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Lyrics</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  artContainer: { alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: {width:0, height:10}, shadowOpacity:0.3, shadowRadius:20, elevation:10 },
  artwork: { width: width - 60, height: width - 60, borderRadius: 20 },
  infoContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  artist: { fontSize: 16, fontWeight: '500' },
  progressContainer: { marginBottom: 20 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, paddingHorizontal: 5 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 40 },
  playBtn: { width: 75, height: 75, borderRadius: 37.5, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 20 },
  lyricsBtn: { alignItems: 'center', marginTop: 'auto', marginBottom: 10 },
});