import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '../store/musicStore';

export const PlaylistsScreen = () => {
  const navigation = useNavigation();
  const { playlists, createPlaylist } = useMusicStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createPlaylist(name);
      setName('');
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={40} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => (navigation as any).navigate('Details', { type: 'playlist', title: item.name, data: item.songs })}>
            <View style={styles.iconBox}><Ionicons name="musical-notes" size={24} color="#FFF" /></View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.songs.length} Songs</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 10 },
  iconBox: { width: 50, height: 50, backgroundColor: '#333', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  name: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  count: { color: '#AAA', fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#222', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#FF6B00', color: '#FFF', fontSize: 16, padding: 5, marginBottom: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 }
});