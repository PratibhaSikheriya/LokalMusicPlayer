import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, StatusBar, Modal, ActivityIndicator, Dimensions, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { saavnApi } from '../api/saavn';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useMusicStore } from '../store/musicStore'; 
import { audioService } from '../services/audioService';
import { Song } from '../types';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { getImageUrl } from '../utils/imageHelper';
import { SongOptionsModal } from '../components/SongOptionsModal';

const CATEGORIES = ['Suggested', 'Songs', 'Artists', 'Albums', 'Folders'];
const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added'];
const { width } = Dimensions.get('window');

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Songs'); // Default to Songs to see buttons
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortOption, setSortOption] = useState('Ascending');

  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { currentSong } = usePlayerStore();
  const { setQueue } = useQueueStore();
  
  // Hook moved inside component
  const { getMostPlayed } = useMusicStore();
  const mostPlayedSongs = getMostPlayed();

  useEffect(() => { 
    loadAllData(); 
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setPage(1);
    try {
      const songData = await saavnApi.searchSongs('trending', 1, 20);
      setSongs(songData || []);
      setHasMore((songData || []).length > 0);

      const artistData = await saavnApi.searchArtists('arijit singh');
      setArtists(artistData || []);

      const albumData = await saavnApi.searchAlbums('bollywood');
      setAlbums(albumData || []);
    } catch (e) { 
      console.error('Error:', e); 
    }
    setIsLoading(false);
  };

  const loadMoreSongs = async () => {
    if (isFetchingMore || !hasMore || activeCategory !== 'Songs') return;
    
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const newSongs = await saavnApi.searchSongs('trending', nextPage, 20);
      
      if (newSongs && newSongs.length > 0) {
        setSongs(prev => [...prev, ...newSongs]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more:', error);
    }
    setIsFetchingMore(false);
  };

  const handlePlay = (song: Song) => {
    setQueue(songs);
    audioService.loadAndPlay(song);
  };

  // SHUFFLE LOGIC
  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      audioService.loadAndPlay(shuffled[0]);
    }
  };

  // PLAY ALL LOGIC
  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
      audioService.loadAndPlay(songs[0]);
    }
  };

  const openMenu = (song: Song) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  const handleArtistClick = (artist: any) => {
    (navigation as any).navigate('Details', {
      type: 'artist',
      id: artist.id,
      title: artist.name,
      data: artist
    });
  };

  const handleAlbumClick = (album: any) => {
    (navigation as any).navigate('Details', {
      type: 'album',
      id: album.id,
      title: album.name,
      data: album
    });
  };

  // --- RENDERERS ---

  const renderHorizontalCard = ({ item }: { item: Song }) => {
    const imageUrl = getImageUrl(item.image, 'medium');
    return (
      <TouchableOpacity 
        style={styles.horizCard} 
        onPress={() => handlePlay(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={[styles.horizImg, { backgroundColor: theme.card }]} />
        <Text style={[styles.horizTitle, { color: theme.textPrimary }]} numberOfLines={2}>{decodeHtmlEntities(item.name)}</Text>
        <Text style={[styles.horizSub, { color: theme.textSecondary }]} numberOfLines={1}>{decodeHtmlEntities(item.primaryArtists)}</Text>
      </TouchableOpacity>
    );
  };

  const renderArtistCircle = ({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.image, 'medium');
    return (
      <TouchableOpacity 
        style={styles.artistCircleContainer}
        activeOpacity={0.7}
        onPress={() => handleArtistClick(item)}
      >
        <Image source={{ uri: imageUrl }} style={[styles.artistCircle, { backgroundColor: theme.card, borderColor: theme.border }]} />
        <Text style={[styles.artistName, { color: theme.textPrimary }]} numberOfLines={1}>{decodeHtmlEntities(item.name)}</Text>
      </TouchableOpacity>
    );
  };

  const renderSongRow = ({ item }: { item: Song }) => {
    const isPlaying = currentSong?.id === item.id;
    const imageUrl = getImageUrl(item.image, 'medium');
    
    return (
      <TouchableOpacity 
        style={styles.rowItem} 
        onPress={() => handlePlay(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={[styles.rowImg, { backgroundColor: theme.card }]} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.rowTitle, { color: isPlaying ? theme.primary : theme.textPrimary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.primaryArtists)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            handlePlay(item);
          }} 
          style={[styles.playMini, { borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={12} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ padding: 8 }} 
          onPress={(e) => {
            e.stopPropagation();
            openMenu(item);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderArtistRow = ({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.image, 'medium');
    return (
      <TouchableOpacity 
        style={styles.rowItem}
        activeOpacity={0.7}
        onPress={() => handleArtistClick(item)}
      >
        <Image source={{ uri: imageUrl }} style={[styles.artistRowImg, { backgroundColor: theme.card }]} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>{decodeHtmlEntities(item.name)}</Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{item.role || 'Artist'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderAlbumGrid = ({ item }: { item: any }) => {
    const cardWidth = (width - 48 - 15) / 2;
    const imageUrl = getImageUrl(item.image, 'medium');
    return (
      <TouchableOpacity 
        style={[styles.albumCard, { width: cardWidth }]}
        activeOpacity={0.7}
        onPress={() => handleAlbumClick(item)}
      >
        <Image source={{ uri: imageUrl }} style={[styles.albumImg, { width: cardWidth, height: cardWidth, backgroundColor: theme.card }]} />
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary, fontSize: 14 }]} numberOfLines={1}>{decodeHtmlEntities(item.name)}</Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary, fontSize: 12 }]} numberOfLines={1}>{item.year || '2023'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --- CONTENT SWITCHER ---
  const renderContent = () => {
    if (activeCategory === 'Suggested') {
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
          {/* Recently Played */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recently Played</Text>
            <TouchableOpacity onPress={() => setActiveCategory('Songs')}>
              <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            data={songs.slice(0, 6)} 
            renderItem={renderHorizontalCard} 
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }} 
          />

          {/* Most Played */}
          {mostPlayedSongs.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Most Played</Text>
              </View>
              <FlatList 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                data={mostPlayedSongs} 
                renderItem={renderHorizontalCard} 
                keyExtractor={(item) => `most-${item.id}`}
                contentContainerStyle={{ paddingHorizontal: 20 }} 
              />
            </>
          )}

          {/* Artists */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Artists</Text>
            <TouchableOpacity onPress={() => setActiveCategory('Artists')}>
              <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            data={artists.slice(0, 10)} 
            renderItem={renderArtistCircle} 
            keyExtractor={(item, index) => item.id || `artist-${index}`}
            contentContainerStyle={{ paddingHorizontal: 20 }} 
          />
        </ScrollView>
      );
    }
    
    if (activeCategory === 'Albums') {
      return (
        <FlatList 
          key="AlbumsGrid"
          data={albums} 
          renderItem={renderAlbumGrid} 
          keyExtractor={(item, index) => item.id || `album-${index}`}
          numColumns={2} 
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24 }} 
          contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }} 
        />
      );
    }

    if (activeCategory === 'Artists') {
      return (
        <FlatList 
          key="ArtistsList"
          data={artists} 
          renderItem={renderArtistRow} 
          keyExtractor={(item, index) => item.id || `artist-${index}`}
          contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }} 
        />
      );
    }

    // Default: Songs
    return (
      <FlatList 
        key="SongsList"
        data={songs} 
        renderItem={renderSongRow} 
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingBottom: 160 }}
        onEndReached={loadMoreSongs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? <ActivityIndicator color={theme.primary} style={{ margin: 20 }} /> : null
        }
        ListHeaderComponent={
          <View style={styles.songHeaderContainer}>
            {/* SHUFFLE BUTTON */}
            <TouchableOpacity 
              style={[styles.bigBtn, { backgroundColor: '#FF6B00', marginRight: 10 }]}
              activeOpacity={0.8}
              onPress={handleShufflePlay}
            >
              <Ionicons name="shuffle" size={22} color="#FFF" />
              <Text style={styles.btnTextWhite}>Shuffle</Text>
            </TouchableOpacity>
            
            {/* PLAY BUTTON */}
            <TouchableOpacity 
              style={[styles.bigBtn, { backgroundColor: '#2A2A2A', marginLeft: 10 }]}
              activeOpacity={0.8}
              onPress={handlePlayAll}
            >
              <Ionicons name="play" size={22} color="#FF6B00" />
              <Text style={styles.btnTextOrange}>Play</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  const getCountText = () => {
    if (activeCategory === 'Artists') return `${artists.length} artists`;
    if (activeCategory === 'Albums') return `${albums.length} albums`;
    return `${songs.length} songs`;
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top']}
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Ionicons name="musical-notes" size={28} color={theme.primary} />
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}> Lokal Music</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* QUEUE BUTTON (ADDED HERE) */}
          <TouchableOpacity 
            onPress={() => (navigation as any).navigate('Queue')}
            activeOpacity={0.7}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="list" size={26} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Search' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={26} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{paddingHorizontal: 20}}
          renderItem={({ item }) => {
            const isActive = activeCategory === item;
            return (
              <TouchableOpacity 
                onPress={() => setActiveCategory(item)} 
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, { 
                    color: isActive ? theme.primary : theme.textSecondary, 
                    fontWeight: isActive ? '700' : '500' 
                  }]}
                >
                  {item}
                </Text>
                {isActive && <View style={[styles.activeLine, { backgroundColor: theme.primary }]} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort Row */}
      {activeCategory !== 'Suggested' && (
        <View style={styles.sortRow}>
          <Text style={[styles.countText, { color: theme.textPrimary }]}>
            {getCountText()}
          </Text>
          <TouchableOpacity 
            style={{flexDirection:'row', alignItems:'center'}} 
            onPress={() => setSortVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={{color: theme.primary, fontWeight:'600', fontSize: 12}}>
              {sortOption}{' '}
            </Text>
            <Ionicons name="swap-vertical" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{marginTop:50}} />
      ) : (
        renderContent()
      )}

      {/* Sort Modal */}
      <Modal 
        visible={sortVisible} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setSortVisible(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={[styles.sortSheet, { backgroundColor: theme.card }]}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOption === opt;
                return (
                  <TouchableOpacity 
                    key={opt} 
                    style={styles.sortOption} 
                    onPress={() => { setSortOption(opt); setSortVisible(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sortText, { color: theme.textPrimary }]}>{opt}</Text>
                    <View style={[styles.radio, { borderColor: theme.primary }, isSelected && styles.radioActive]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Song Options Modal */}
      <SongOptionsModal 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        song={selectedSong}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    paddingHorizontal: 24, paddingVertical: 15, alignItems: 'center' 
  },
  appTitle: { fontSize: 24, fontWeight: '700', marginLeft: 8 },
  tabsContainer: { paddingBottom: 10 },
  tab: { marginRight: 25, alignItems: 'center', paddingVertical: 5 },
  tabText: { fontSize: 16 },
  activeLine: { width: 25, height: 3, borderRadius: 2, marginTop: 4 },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    paddingHorizontal: 24, marginBottom: 15, marginTop: 15, alignItems: 'center' 
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  horizCard: { width: 140, marginRight: 15 },
  horizImg: { width: 140, height: 140, borderRadius: 16, marginBottom: 8 },
  horizTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  horizSub: { fontSize: 12 },
  artistCircleContainer: { alignItems: 'center', marginRight: 20 },
  artistCircle: { width: 80, height: 80, borderRadius: 40, marginBottom: 8, borderWidth: 1 },
  artistName: { fontSize: 13, fontWeight: '500' },
  
  // NEW STYLES FOR BUTTONS
  songHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15 },
  bigBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 14, borderRadius: 30 
  },
  btnTextWhite: { color: '#FFF', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  btnTextOrange: { color: '#FF6B00', fontWeight: '700', fontSize: 16, marginLeft: 8 },

  rowItem: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 24, marginBottom: 20 
  },
  rowImg: { width: 50, height: 50, borderRadius: 10 },
  artistRowImg: { width: 56, height: 56, borderRadius: 28 }, 
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowSub: { fontSize: 12 },
  playMini: { 
    width: 28, height: 28, borderRadius: 14, borderWidth:1, 
    justifyContent:'center', alignItems:'center', marginRight:10 
  },
  
  albumCard: { marginBottom: 20 },
  albumImg: { borderRadius: 16, marginBottom: 8 },
  sortRow: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center' 
  },
  countText: { fontSize: 16, fontWeight: '700' },
  
  modalBackdrop: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' 
  },
  sortSheet: { padding: 20, margin: 20, borderRadius: 16, elevation: 5 },
  sortOption: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 
  },
  sortText: { fontSize: 16, fontWeight: '500' },
  radio: { 
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center' 
  },
  radioActive: {},
  radioInner: { width: 10, height: 10, borderRadius: 5 },
});