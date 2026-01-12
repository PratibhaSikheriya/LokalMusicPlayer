import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, StatusBar, Modal, ActivityIndicator, Dimensions
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
const { width } = Dimensions.get('window');

// Mock data to match screenshots for Artists/Albums if API data is missing
const MOCK_ARTISTS = [
  { id: '1', name: 'Ariana Grande', albums: 1, songs: 20, image: 'https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952' },
  { id: '2', name: 'The Weeknd', albums: 1, songs: 16, image: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
  { id: '3', name: 'Acidrap', albums: 2, songs: 28, image: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Chance_the_Rapper_-_Acid_Rap.jpg' },
];

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortOption, setSortOption] = useState('Ascending');

  // Theme
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  const { currentSong } = usePlayerStore();
  const { setQueue } = useQueueStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch trending songs using the API from PDF [cite: 683, 693]
      const data = await saavnApi.getTrendingSongs();
      setSongs(data);
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

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.itemRow} onPress={() => handlePlay(item)}>
      <Image source={{ uri: item.image[1]?.link }} style={styles.songImg} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.title, { color: currentSong?.id === item.id ? theme.primary : theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>{item.primaryArtists}</Text>
      </View>
      <TouchableOpacity onPress={() => handlePlay(item)} style={[styles.playMini, { borderColor: theme.border }]}>
         <Ionicons name="play" size={14} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 8 }} onPress={() => openMenu(item)}>
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.artistImg} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>{item.albums} Album  |  {item.songs} Songs</Text>
      </View>
      <TouchableOpacity><Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} /></TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.itemRow}>
      <Image source={{ uri: item.image[2]?.link }} style={styles.albumImg} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>{item.primaryArtists}  |  {item.year || '2023'}</Text>
        <Text style={[styles.subTiny, { color: theme.textSecondary }]}>16 Songs</Text>
      </View>
      <TouchableOpacity><Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} /></TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeCategory === 'Artists') {
      return <FlatList data={MOCK_ARTISTS} renderItem={renderArtistItem} keyExtractor={i => i.id} contentContainerStyle={{paddingBottom:100}} />;
    }
    if (activeCategory === 'Albums') {
      return <FlatList data={songs} renderItem={renderAlbumItem} keyExtractor={i => i.id} contentContainerStyle={{paddingBottom:100}} />;
    }
    return <FlatList data={songs} renderItem={renderSongItem} keyExtractor={i => i.id} contentContainerStyle={{paddingBottom:100}} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Ionicons name="musical-notes" size={28} color={theme.primary} />
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}> Mume</Text>
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
      <View style={styles.sortRow}>
        <Text style={[styles.countText, { color: theme.textPrimary }]}>{activeCategory === 'Artists' ? '85 artists' : `${songs.length} songs`}</Text>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => setSortVisible(true)}>
          <Text style={{color: theme.primary, fontWeight:'600'}}>Date Added </Text>
          <Ionicons name="swap-vertical" size={16} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{marginTop:50}} /> : renderContent()}

      {/* Sort Modal */}
      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSortVisible(false)}>
          <View style={[styles.sortSheet, { backgroundColor: theme.card }]}>
            {['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added'].map((opt) => (
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

      {/* Action Sheet (3-Dots) */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: theme.card }]}>
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
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            {[
              {l: 'Play Next', i: 'arrow-forward-circle-outline'},
              {l: 'Add to Playing Queue', i: 'list-circle-outline'},
              {l: 'Add to Playlist', i: 'add-circle-outline'},
              {l: 'Go to Album', i: 'disc-outline'},
              {l: 'Go to Artist', i: 'person-outline'},
              {l: 'Share', i: 'share-social-outline'},
              {l: 'Delete from Device', i: 'trash-outline'},
            ].map((a, idx) => (
              <TouchableOpacity key={idx} style={styles.actionItem} onPress={() => setMenuVisible(false)}>
                <Ionicons name={a.i as any} size={24} color={theme.textPrimary} />
                <Text style={[styles.actionText, { color: theme.textPrimary }]}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15, alignItems: 'center' },
  appTitle: { fontSize: 24, fontWeight: '700' },
  tabsContainer: { paddingBottom: 5 },
  tab: { marginRight: 30, alignItems: 'center', paddingVertical: 5 },
  tabText: { fontSize: 16 },
  activeLine: { width: 25, height: 3, borderRadius: 2, marginTop: 4 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center' },
  countText: { fontSize: 16, fontWeight: '700' },
  
  // List Styles
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  songImg: { width: 50, height: 50, borderRadius: 10, backgroundColor:'#eee' },
  artistImg: { width: 56, height: 56, borderRadius: 28, backgroundColor:'#eee' }, // Circular
  albumImg: { width: 56, height: 56, borderRadius: 8, backgroundColor:'#eee' }, // Square
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sub: { fontSize: 13 },
  subTiny: { fontSize: 11, marginTop: 2 },
  playMini: { width: 28, height: 28, borderRadius: 14, borderWidth:1, justifyContent:'center', alignItems:'center', marginRight:10 },

  // Sort Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sortSheet: { padding: 20, margin: 20, borderRadius: 16, elevation: 5 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  sortText: { fontSize: 16, fontWeight: '500' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioActive: {},
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  // Action Sheet
  actionSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1 },
  actionImg: { width: 50, height: 50, borderRadius: 8 },
  actionTitle: { fontSize: 16, fontWeight: 'bold' },
  actionSub: { fontSize: 13 },
  divider: { height: 1, marginBottom: 15 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
});