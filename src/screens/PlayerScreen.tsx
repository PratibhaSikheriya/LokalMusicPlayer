// src/screens/PlayerScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, ScrollView, Alert, Modal, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// FIXED: Specific imports for icons
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { audioService } from '../services/audioService';
import { saavnApi } from '../api/saavn';
import { Colors } from '../constants/colors';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { SongOptionsModal } from '../components/SongOptionsModal';
import { downloadService } from '../services/downloadService'; // Added Import

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const [lyricsText, setLyricsText] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // New state for download

  useEffect(() => {
    if (currentSong && lyricsVisible) fetchLyrics();
  }, [currentSong, lyricsVisible]);

  const fetchLyrics = async () => {
    if (!currentSong) return;
    setLoadingLyrics(true);
    const lyrics = await saavnApi.getLyrics(currentSong.id);
    setLyricsText(lyrics || "No lyrics available.");
    setLoadingLyrics(false);
  };

  const getImageUrl = (imageArray: any[]) => {
    if (!imageArray || imageArray.length === 0) return '';
    const highQuality = imageArray.find((img: any) => img.quality === '500x500');
    return highQuality?.url || highQuality?.link || imageArray[0]?.url || imageArray[0]?.link || '';
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number) => { setSeekPosition(value); setIsSeeking(true); };
  const handleSeekComplete = async (value: number) => { await audioService.seek(value); setIsSeeking(false); };

  const handleLike = () => {
    setIsLiked(!isLiked);
    Alert.alert(isLiked ? 'Removed from Favorites' : 'Added to Favorites');
  };

  const handleRepeat = () => {
    Alert.alert('Repeat', 'Repeat mode toggled');
  };

  // New Download Handler
  const handleDownload = async () => {
    if (!currentSong) return;
    setIsDownloading(true);
    await downloadService.downloadSong(currentSong);
    setIsDownloading(false);
  };

  if (!currentSong) return null;

  const imageUrl = getImageUrl(currentSong.image);
  const currentPosition = isSeeking ? seekPosition : position;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
          <Ionicons name="chevron-down" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>NOW PLAYING</Text>
        <TouchableOpacity onPress={() => setOptionsVisible(true)} style={{ padding: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={styles.artworkContainer}>
          <Image source={{ uri: imageUrl }} style={styles.artwork} />
        </View>

        <View style={styles.infoContainer}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.songTitle, { color: theme.textPrimary }]} numberOfLines={1}>{decodeHtmlEntities(currentSong.name)}</Text>
            <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>{decodeHtmlEntities(currentSong.primaryArtists)}</Text>
          </View>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>

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
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatTime(currentPosition)}</Text>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={() => setIsShuffleOn(!isShuffleOn)}>
            <Ionicons name="shuffle" size={24} color={isShuffleOn ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => audioService.playPrevious()}>
            <Ionicons name="play-skip-back" size={32} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.playButton, { backgroundColor: theme.primary }]} onPress={() => audioService.togglePlayPause()}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" style={isPlaying ? undefined : {marginLeft: 4}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => audioService.playNext()}>
            <Ionicons name="play-skip-forward" size={32} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRepeat}>
            <Ionicons name="repeat" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.skipContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={() => audioService.skipBackward()}>
            <Ionicons name="refresh" size={24} color={theme.textPrimary} />
            <Text style={[styles.skipText, { color: theme.textPrimary }]}>10</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLyricsVisible(true)} style={styles.lyricsTrigger}>
            <Ionicons name="chevron-up" size={20} color={theme.textPrimary} />
            <Text style={[styles.lyricsTriggerText, { color: theme.textPrimary }]}>LYRICS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={() => audioService.skipForward()}>
            <Text style={[styles.skipText, { color: theme.textPrimary }]}>10</Text>
            <Ionicons name="refresh" size={24} color={theme.textPrimary} style={{transform: [{scaleX: -1}]}} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="timer-outline" size={24} color={theme.textSecondary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="moon-outline" size={24} color={theme.textSecondary} /></TouchableOpacity>
          
          {/* New Download Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleDownload} disabled={isDownloading}>
             {isDownloading ? (
                <ActivityIndicator size="small" color={theme.textSecondary} />
             ) : (
                <MaterialCommunityIcons name="download" size={24} color={theme.textSecondary} />
             )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setOptionsVisible(true)}><Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={theme.textSecondary} /></TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={lyricsVisible} animationType="slide" transparent onRequestClose={() => setLyricsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.lyricsModal, { backgroundColor: theme.card }]}>
            <View style={[styles.lyricsHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.lyricsTitle, { color: theme.textPrimary }]}>Lyrics</Text>
              <TouchableOpacity onPress={() => setLyricsVisible(false)}><Ionicons name="close" size={28} color={theme.textPrimary} /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {loadingLyrics ? <ActivityIndicator size="large" color={theme.primary} /> : <Text style={[styles.lyricsBody, { color: theme.textSecondary }]}>{decodeHtmlEntities(lyricsText)}</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SongOptionsModal visible={optionsVisible} onClose={() => setOptionsVisible(false)} song={currentSong} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 12, letterSpacing: 1, fontWeight: '700' },
  artworkContainer: { marginVertical: 30, shadowColor: '#000', shadowOffset: {width:0, height:8}, shadowOpacity:0.4, shadowRadius:12, elevation:10 },
  artwork: { width: width * 0.8, height: width * 0.8, borderRadius: 20 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '85%', marginBottom: 25, alignItems: 'center' },
  songTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  artistName: { fontSize: 16 },
  progressContainer: { width: '85%', marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
  timeText: { fontSize: 12, fontWeight: '500' },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: 30 },
  playButton: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  skipContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '70%', alignItems: 'center', marginBottom: 40 },
  skipButton: { flexDirection: 'row', alignItems: 'center' },
  skipText: { fontSize: 12, fontWeight: 'bold', marginHorizontal: 4 },
  lyricsTrigger: { alignItems: 'center' },
  lyricsTriggerText: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  bottomIcons: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  iconBtn: { padding: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  lyricsModal: { height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  lyricsHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, alignItems: 'center' },
  lyricsTitle: { fontSize: 20, fontWeight: 'bold' },
  lyricsBody: { fontSize: 18, lineHeight: 32, textAlign: 'center', paddingBottom: 50 },
});