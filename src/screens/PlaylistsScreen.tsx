import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '../store/musicStore';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { getImageUrl } from '../utils/imageHelper';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { SongOptionsModal } from '../components/SongOptionsModal'; // Ensure this exists

export const PlaylistsScreen = () => {
  const navigation = useNavigation();
  const { playlists, createPlaylist, favorites, toggleFavorite } = useMusicStore();
  const { setQueue } = useQueueStore();
  
  // Tab State: 'Favorites' (Default) or 'Playlists'
  const [activeTab, setActiveTab] = useState<'Favorites' | 'Playlists'>('Favorites');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  
  // Menu State
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  const handleCreate = () => {
    if (name.trim()) {
      createPlaylist(name);
      setName('');
      setModalVisible(false);
    }
  };

  const playFavoriteSong = (song: any) => {
    // Set ALL favorites as the queue so "Next" works
    setQueue(favorites);
    audioService.loadAndPlay(song);
  };

  const openMenu = (song: any) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  const renderFavorite = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => playFavoriteSong(item)}>
      <Image source={{ uri: getImageUrl(item.image, 'low') }} style={styles.img} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name} numberOfLines={1}>{decodeHtmlEntities(item.name)}</Text>
        <Text style={styles.count} numberOfLines={1}>{decodeHtmlEntities(item.primaryArtists)}</Text>
      </View>
      
      {/* 3 Dots Menu */}
      <TouchableOpacity onPress={() => openMenu(item)} style={{ padding: 8 }}>
        <Ionicons name="ellipsis-vertical" size={24} color="#AAA" />
      </TouchableOpacity>

      {/* Heart Icon */}
      <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ padding: 8 }}>
        <Ionicons name="heart" size={24} color="#FF6B00" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => (navigation as any).navigate('Details', { type: 'playlist', title: item.name, data: item.songs })}
    >
      <View style={styles.iconBox}><Ionicons name="musical-notes" size={24} color="#FFF" /></View>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.count}>{item.songs.length} Songs</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        {activeTab === 'Playlists' && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={40} color="#FF6B00" />
          </TouchableOpacity>
        )}
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          onPress={() => setActiveTab('Favorites')} 
          style={[styles.tab, activeTab === 'Favorites' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'Favorites' && styles.activeTabText]}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Playlists')} 
          style={[styles.tab, activeTab === 'Playlists' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'Playlists' && styles.activeTabText]}>Playlists</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {activeTab === 'Favorites' ? (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderFavorite}
          ListEmptyComponent={<Text style={styles.emptyText}>No liked songs yet.</Text>}
        />
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={item => item.id}
          renderItem={renderPlaylist}
          ListEmptyComponent={<Text style={styles.emptyText}>No playlists created.</Text>}
        />
      )}

      {/* Create Playlist Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Playlist Name" 
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{color:'#AAA'}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}><Text style={{color:'#FF6B00', fontWeight:'bold'}}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  
  tabs: { flexDirection: 'row', marginBottom: 20 },
  tab: { marginRight: 20, paddingBottom: 5 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF6B00' },
  tabText: { fontSize: 18, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#FFF' },

  item: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 10 },
  iconBox: { width: 50, height: 50, backgroundColor: '#333', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  img: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  name: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  count: { color: '#AAA', fontSize: 12 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#222', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#FF6B00', color: '#FFF', fontSize: 16, padding: 5, marginBottom: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 }
});