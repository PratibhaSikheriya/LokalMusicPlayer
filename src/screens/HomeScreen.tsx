import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, StatusBar, Modal, ActivityIndicator, Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { saavnApi } from '../api/saavn';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { Song } from '../types';

const CATEGORIES = ['Suggested', 'Songs', 'Artists', 'Albums', 'Folders'];
const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer'];
const { width } = Dimensions.get('window');

// Mock Data for Visual Matching
const MOCK_ARTISTS = [
  { id: '1', name: 'Ariana Grande', image: 'https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952', songs: 20, albums: 1 },
  { id: '2', name: 'The Weeknd', image: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', songs: 16, albums: 1 },
  { id: '3', name: 'Acidrap', image: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Chance_the_Rapper_-_Acid_Rap.jpg', songs: 28, albums: 2 },
  { id: '4', name: 'Ania Szarmarch', image: 'https://i.scdn.co/image/ab67616d0000b2735755e164993798e0c9ef7d7a', songs: 12, albums: 1 },
];

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Songs'); // Default to Songs to match screenshots
  const [songs, setSongs] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortOption, setSortOption] = useState('Ascending');

  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { currentSong } = usePlayerStore();
  const { setQueue } = useQueueStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await saavnApi.getTrendingSongs();
      setSongs(data);
      setTrending(data.slice(0, 6)); 
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handlePlay = (song: Song) => {
    setQueue(songs);
    audioService.loadAndPlay(song);
  };

  const openMenu = (song: Song) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  // --- RENDERERS ---

  // 1. Horizontal Card (Suggested)
  const renderHorizontalCard = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.horizCard} onPress={() => handlePlay(item)}>
      <Image source={{ uri: item.image[2]?.link }} style={[styles.horizImg, { backgroundColor: theme.card }]} />
      <Text style={[styles.horizTitle, { color: theme.textPrimary }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.horizSub, { color: theme.textSecondary }]} numberOfLines={1}>{item.primaryArtists}</Text>
    </TouchableOpacity>
  );

  // 2. Artist Circle (Artists)
  const renderArtistCircle = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.artistCircleContainer}>
      <Image source={{ uri: item.image }} style={[styles.artistCircle, { backgroundColor: theme.card }]} />
      <Text style={[styles.artistName, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  // 3. Song Row (Standard List)
  const renderSongRow = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.rowItem} onPress={() => handlePlay(item)}>
      <Image source={{ uri: item.image[1]?.link }} style={[styles.rowImg, { backgroundColor: theme.card }]} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.rowTitle, { color: currentSong?.id === item.id ? theme.primary : theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{item.primaryArtists}</Text>
      </View>
      <TouchableOpacity onPress={() => handlePlay(item)} style={[styles.playMini, { borderColor: theme.border }]}>
         <Ionicons name="play" size={12} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 8 }} onPress={() => openMenu(item)}>
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // 4. Artist Row (List View)
  const renderArtistRow = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.rowItem}>
      <Image source={{ uri: item.image }} style={[styles.artistRowImg, { backgroundColor: theme.card }]} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{item.albums} Album  |  {item.songs} Songs</Text>
      </View>
      <TouchableOpacity><Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} /></TouchableOpacity>
    </TouchableOpacity>
  );

  // 5. Album Grid Item (Curved Edges)
  const renderAlbumGrid = ({ item }: { item: Song }) => (
    <TouchableOpacity style={[styles.albumCard, { width: (width - 48) / 2 }]}>
      <Image source={{ uri: item.image[2]?.link }} style={[styles.albumImg, { width: (width - 48) / 2, height: (width - 48) / 2, backgroundColor: theme.card }]} />
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.rowTitle, { color: theme.textPrimary, fontSize: 14 }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.rowSub, { color: theme.textSecondary, fontSize: 12 }]}>{item.year || '2023'} • 12 Songs</Text>
      </View>
    </TouchableOpacity>
  );

  // --- CONTENT SWITCHER ---
  const renderContent = () => {
    if (activeCategory === 'Suggested') {
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recently Played</Text>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
          </View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} data={trending} renderItem={renderHorizontalCard} contentContainerStyle={{ paddingHorizontal: 20 }} />
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Artists</Text>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
          </View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} data={MOCK_ARTISTS} renderItem={renderArtistCircle} contentContainerStyle={{ paddingHorizontal: 20 }} />
        </ScrollView>
      );
    }
    
    if (activeCategory === 'Albums') {
      return <FlatList data={songs} renderItem={renderAlbumGrid} numColumns={2} columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }} />;
    }

    if (activeCategory === 'Artists') {
      return <FlatList data={MOCK_ARTISTS} renderItem={renderArtistRow} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }} />;
    }

    // Default: Songs with Big Buttons Header
    return (
      <FlatList 
        data={songs} 
        renderItem={renderSongRow} 
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={styles.songHeaderContainer}>
            <TouchableOpacity style={[styles.bigShuffleBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="shuffle" size={20} color="#FFF" />
              <Text style={styles.bigBtnTextWhite}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigPlayBtn, { backgroundColor: theme.lightPrimary }]}>
              <Ionicons name="play-circle" size={20} color={theme.primary} />
              <Text style={[styles.bigBtnTextColor, { color: theme.primary }]}>Play</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header: "Lokal Music" */}
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Ionicons name="musical-notes" size={28} color={theme.primary} />
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}> Lokal Music</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
          <Ionicons name="search-outline" size={26} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList 
          horizontal showsHorizontalScrollIndicator={false} data={CATEGORIES}
          contentContainerStyle={{paddingHorizontal: 20}}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setActiveCategory(item)} style={styles.tab}>
              <Text style={[styles.tabText, { color: activeCategory === item ? theme.primary : theme.textSecondary, fontWeight: activeCategory === item ? '700' : '500' }]}>{item}</Text>
              {activeCategory === item && <View style={[styles.activeLine, { backgroundColor: theme.primary }]} />}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort Row */}
      {activeCategory !== 'Suggested' && (
        <View style={styles.sortRow}>
          <Text style={[styles.countText, { color: theme.textPrimary }]}>
            {activeCategory === 'Artists' ? '85 artists' : activeCategory === 'Albums' ? '68 albums' : `${songs.length} songs`}
          </Text>
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => setSortVisible(true)}>
            <Text style={{color: theme.primary, fontWeight:'600', fontSize: 12}}>{sortOption} </Text>
            <Ionicons name="swap-vertical" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{marginTop:50}} /> : renderContent()}

      {/* Sort Modal */}
      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSortVisible(false)}>
          <View style={[styles.sortSheet, { backgroundColor: theme.card }]}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.sortOption} onPress={() => {setSortOption(opt); setSortVisible(false)}}>
                <Text style={[styles.sortText, { color: theme.textPrimary }]}>{opt}</Text>
                <View style={[styles.radio, { borderColor: theme.primary }, sortOption === opt && styles.radioActive]}>
                  {sortOption === opt && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Action Sheet [Image 8] */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleBar} />
            {selectedSong && (
              <View style={[styles.actionHeader, { borderBottomColor: theme.border }]}>
                <Image source={{ uri: selectedSong.image[2]?.link }} style={styles.actionImg} />
                <View style={{flex:1, marginLeft:15}}>
                  <Text style={[styles.actionTitle, { color: theme.textPrimary }]} numberOfLines={1}>{selectedSong.name}</Text>
                  <Text style={[styles.actionSub, { color: theme.textSecondary }]}>{selectedSong.primaryArtists}</Text>
                </View>
                <Ionicons name="heart-outline" size={24} color={theme.textPrimary} />
              </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                {l: 'Play Next', i: 'arrow-forward-circle-outline'},
                {l: 'Add to Playing Queue', i: 'list-circle-outline'},
                {l: 'Add to Playlist', i: 'add-circle-outline'},
                {l: 'Go to Album', i: 'disc-outline'},
                {l: 'Go to Artist', i: 'person-outline'},
                {l: 'Details', i: 'information-circle-outline'},
                {l: 'Set as Ringtone', i: 'call-outline'},
                {l: 'Add to Blacklist', i: 'close-circle-outline'},
                {l: 'Share', i: 'share-social-outline'},
                {l: 'Delete from Device', i: 'trash-outline'},
              ].map((a) => (
                <TouchableOpacity key={a.l} style={styles.actionItem} onPress={() => setMenuVisible(false)}>
                  <Ionicons name={a.i as any} size={22} color={theme.textPrimary} />
                  <Text style={[styles.actionText, { color: theme.textPrimary }]}>{a.l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15, alignItems: 'center' },
  appTitle: { fontSize: 24, fontWeight: '700', marginLeft: 8 },
  tabsContainer: { paddingBottom: 10 },
  tab: { marginRight: 25, alignItems: 'center', paddingVertical: 5 },
  tabText: { fontSize: 16 },
  activeLine: { width: 25, height: 3, borderRadius: 2, marginTop: 4 },
  
  // Section Headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 15, marginTop: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  horizCard: { width: 140, marginRight: 15 },
  horizImg: { width: 140, height: 140, borderRadius: 16, marginBottom: 8 },
  horizTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  horizSub: { fontSize: 12 },
  
  // Artist Circle
  artistCircleContainer: { alignItems: 'center', marginRight: 20 },
  artistCircle: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  artistName: { fontSize: 13, fontWeight: '500' },

  // Big Buttons Header
  songHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15 },
  bigShuffleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 30, marginRight: 10, shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  bigPlayBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 30, marginLeft: 10 },
  bigBtnTextWhite: { color: '#FFF', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  bigBtnTextColor: { fontWeight: '700', fontSize: 16, marginLeft: 8 },

  // List Rows
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  rowImg: { width: 50, height: 50, borderRadius: 10 },
  artistRowImg: { width: 56, height: 56, borderRadius: 28 }, 
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowSub: { fontSize: 12 },
  playMini: { width: 28, height: 28, borderRadius: 14, borderWidth:1, justifyContent:'center', alignItems:'center', marginRight:10 },
  
  // Album Grid
  albumCard: { marginBottom: 20 },
  albumImg: { borderRadius: 16, marginBottom: 8 },

  sortRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center' },
  countText: { fontSize: 16, fontWeight: '700' },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sortSheet: { padding: 20, margin: 20, borderRadius: 16, elevation: 5 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  sortText: { fontSize: 16, fontWeight: '500' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioActive: {},
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  
  actionSheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '75%' },
  handleBar: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1 },
  actionImg: { width: 50, height: 50, borderRadius: 8 },
  actionTitle: { fontSize: 16, fontWeight: 'bold' },
  actionSub: { fontSize: 13 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
});