// src/screens/DetailsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { saavnApi } from '../api/saavn';
import { audioService } from '../services/audioService';
import { useQueueStore } from '../store/queueStore';
import { getImageUrl } from '../utils/imageHelper';
import { decodeHtmlEntities } from '../utils/htmlDecode';

export const DetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { type, id, data, title } = route.params; // type: 'artist' | 'album' | 'playlist'
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { setQueue } = useQueueStore();

  const [items, setItems] = useState<any[]>([]);
  const [headerInfo, setHeaderInfo] = useState<any>(data || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [id, type]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      if (type === 'artist') {
        // Fetch Artist Songs
        const songs = await saavnApi.getArtistSongs(id);
        setItems(songs);
        if (!headerInfo) {
          const artistDetails = await saavnApi.getArtistById(id);
          setHeaderInfo(artistDetails);
        }
      } else if (type === 'album') {
        // Albums usually come with songs in the initial search or need a specific call
        // For this demo, we might need a specific getAlbumDetails API, 
        // fallback to song search if not available
        const songs = await saavnApi.searchSongs(headerInfo?.name || title); 
        setItems(songs);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePlay = (song: any) => {
    setQueue(items);
    audioService.loadAndPlay(song);
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity 
      style={styles.songRow} 
      onPress={() => handlePlay(item)}
    >
      <Text style={[styles.index, { color: theme.textSecondary }]}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.songTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {decodeHtmlEntities(item.name)}
        </Text>
        <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>
          {decodeHtmlEntities(item.primaryArtists || item.artist || '')}
        </Text>
      </View>
      <TouchableOpacity style={{ padding: 8 }}>
        <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {decodeHtmlEntities(title || headerInfo?.name || 'Details')}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Image 
              source={{ uri: getImageUrl(headerInfo?.image, 'high') }} 
              style={styles.heroImage} 
            />
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              {decodeHtmlEntities(headerInfo?.name || title)}
            </Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              {type.toUpperCase()} • {items.length} Songs
            </Text>
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: theme.primary }]}
              onPress={() => items.length > 0 && handlePlay(items[0])}
            >
              <Ionicons name="play" size={24} color="#FFF" />
              <Text style={styles.playBtnText}>Play All</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  hero: { alignItems: 'center', padding: 24 },
  heroImage: { width: 180, height: 180, borderRadius: 12, marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  heroSub: { fontSize: 14, marginBottom: 24 },
  playBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  playBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  songRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  index: { width: 30, fontSize: 14 },
  songTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  artistName: { fontSize: 14 },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }
});