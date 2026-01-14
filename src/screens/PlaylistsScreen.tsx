// src/screens/PlaylistsScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/colors';

export const PlaylistsScreen = () => {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const [playlists, setPlaylists] = useState<any[]>([]);

  const handleCreatePlaylist = () => {
    Alert.alert(
      'Create Playlist',
      'This feature is coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top']}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Playlists</Text>
        <TouchableOpacity 
          onPress={handleCreatePlaylist}
          style={[styles.createButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No playlists yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Create your first playlist to organize your music
          </Text>
          <TouchableOpacity 
            style={[styles.createPlaylistButton, { backgroundColor: theme.primary }]}
            onPress={handleCreatePlaylist}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createPlaylistText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item, index) => `playlist-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.playlistItem}>
              <View style={[styles.playlistIcon, { backgroundColor: theme.card }]}>
                <Ionicons name="musical-notes" size={32} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.playlistName, { color: theme.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.playlistCount, { color: theme.textSecondary }]}>
                  {item.count} songs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  header: { 
    fontSize: 32, 
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createPlaylistText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  playlistIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 13,
  },
});