import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Image, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { saavnApi } from '../api/saavn';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { Song } from '../types';

const TABS = ['Songs', 'Artists', 'Albums'] as const;
type TabType = typeof TABS[number];

export const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Songs');
  const [hasSearched, setHasSearched] = useState(false);
  
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { setQueue } = useQueueStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 600);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleSearch = async () => {
    if (query.trim().length > 2) {
      setLoading(true);
      setHasSearched(true);
      try {
        let res: any[] = [];
        if (activeTab === 'Artists') {
          res = await saavnApi.searchArtists(query);
          res = res.map((a: any) => ({
            id: a.id, name: a.name, primaryArtists: 'Artist', image: a.image || [],
            duration: 0, url: '', year: '', album: { id: '', name: '', url: '' }
          }));
        } else if (activeTab === 'Albums') {
          res = await saavnApi.searchAlbums(query);
          res = res.map((a: any) => ({
            id: a.id, name: a.name, primaryArtists: a.primaryArtists || 'Album',
            image: a.image || [], duration: 0, url: '', year: a.year || '',
            album: { id: a.id, name: a.name, url: a.url || '' }
          }));
        } else {
          res = await saavnApi.searchSongs(query);
        }
        setResults(res || []);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const handlePlay = (song: Song) => {
    if (activeTab === 'Songs') {
      setQueue([song]);
      audioService.loadAndPlay(song);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.input, color: theme.textPrimary }]} 
          placeholder="Search..." 
          placeholderTextColor={theme.textSecondary}
          value={query} 
          onChangeText={setQuery}
          autoFocus 
        />
      </View>

      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabChip, { 
              backgroundColor: activeTab === tab ? theme.primary : 'transparent', 
              borderColor: theme.primary 
            }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{ color: activeTab === tab ? '#FFF' : theme.primary }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handlePlay(item)}>
              <Image 
                source={{ uri: item.image?.[1]?.link || item.image?.[0]?.link || '' }} 
                style={styles.resultImg} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: theme.textSecondary }}>{item.primaryArtists}</Text>
              </View>
              {activeTab === 'Songs' && <Ionicons name="play-circle" size={28} color={theme.primary} />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={hasSearched ? (
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 50 }}>
              Not Found
            </Text>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  input: { flex: 1, marginLeft: 15, borderRadius: 12, padding: 10 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
  tabChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  resultImg: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
});