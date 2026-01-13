import React, { useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Dimensions, StatusBar, Modal, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { formatTime } from '../utils/formatTime';

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No song playing
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Handle image URL safely
  const imageUrl = currentSong.image?.[2]?.link 
    || currentSong.image?.[1]?.link 
    || currentSong.image?.[0]?.link 
    || '';

  // Check if lyrics are available - fixed type comparison
  const hasLyricsAvailable = String(currentSong.hasLyrics) === 'true';

  // Format time helper
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekBack = () => {
    const newPosition = Math.max(0, position - 10000);
    audioService.seek(newPosition);
  };

  const handleSeekForward = () => {
    const newPosition = Math.min(duration, position + 10000);
    audioService.seek(newPosition);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons 
            name="ellipsis-horizontal-circle-outline" 
            size={28} 
            color={theme.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.artwork}
        />
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.title, { color: theme.textPrimary }]} 
          numberOfLines={1}
        >
          {currentSong.name}
        </Text>
        <Text 
          style={[styles.artist, { color: theme.textSecondary }]} 
          numberOfLines={1}
        >
          {currentSong.primaryArtists}
        </Text>
      </View>

      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0} 
          maximumValue={duration || 1} 
          value={position}
          minimumTrackTintColor={theme.primary} 
          maximumTrackTintColor={theme.border} 
          thumbTintColor={theme.primary}
          onSlidingComplete={audioService.seek}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(position)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => audioService.playPrevious()}>
          <Ionicons name="play-skip-back" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSeekBack}>
          <MaterialIcons name="replay-10" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playBtn, { backgroundColor: theme.primary }]} 
          onPress={() => audioService.togglePlayPause()}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={40} 
            color="#FFF" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSeekForward}>
          <MaterialIcons name="forward-10" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => audioService.playNext()}>
          <Ionicons name="play-skip-forward" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Option Icons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="speedometer" 
            size={24} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="timer-outline" 
            size={24} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="cast" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons 
            name="ellipsis-vertical" 
            size={24} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Lyrics Button */}
      <TouchableOpacity 
        style={styles.lyricsBtn} 
        onPress={() => setShowLyrics(true)}
      >
        <Ionicons name="chevron-up" size={24} color={theme.textSecondary} />
        <Text style={[styles.lyricsBtnText, { color: theme.textSecondary }]}>
          Lyrics
        </Text>
      </TouchableOpacity>

      {/* Lyrics Modal */}
      <Modal 
        visible={showLyrics} 
        animationType="slide" 
        transparent
        onRequestClose={() => setShowLyrics(false)}
      >
        <View style={[styles.lyricsModal, { backgroundColor: theme.card }]}>
          <View style={[styles.lyricsHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.lyricsHeaderText, { color: theme.textPrimary }]}>
              Lyrics
            </Text>
            <TouchableOpacity onPress={() => setShowLyrics(false)}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.lyricsContent}>
            <Text style={[styles.lyricsText, { color: theme.textSecondary }]}>
              {hasLyricsAvailable
                ? "Lyrics are available for this song.\n\n(To display full lyrics, a separate API call to the lyrics endpoint is required.)"
                : "No lyrics available for this song."}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 24 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    marginBottom: 20 
  },
  artContainer: { 
    alignItems: 'center', 
    marginBottom: 30, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20, 
    elevation: 10 
  },
  artwork: { 
    width: width - 60, 
    height: width - 60, 
    borderRadius: 20, 
    backgroundColor: '#333' 
  },
  infoContainer: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    textAlign: 'center' 
  },
  artist: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  progressContainer: { 
    marginBottom: 20 
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 5, 
    paddingHorizontal: 5 
  },
  timeText: {
    fontSize: 12,
  },
  controls: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    marginBottom: 40 
  },
  playBtn: { 
    width: 75, 
    height: 75, 
    borderRadius: 37.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 30, 
    marginBottom: 20 
  },
  lyricsBtn: { 
    alignItems: 'center', 
    marginTop: 'auto', 
    marginBottom: 10 
  },
  lyricsBtnText: {
    fontWeight: '600',
    marginTop: 4,
  },
  lyricsModal: { 
    flex: 1, 
    marginTop: 100, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30 
  },
  lyricsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1 
  },
  lyricsHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lyricsContent: {
    padding: 20,
  },
  lyricsText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
});