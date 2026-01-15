import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '../store/musicStore';
import { useQueueStore } from '../store/queueStore';
import { getImageUrl } from '../utils/imageHelper';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { Song } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  song: Song | null;
}

export const SongOptionsModal: React.FC<Props> = ({ visible, onClose, song }) => {
  const navigation = useNavigation();
  const { toggleFavorite, isFavorite, playlists, addToPlaylist } = useMusicStore();
  const { addNext, addToQueue } = useQueueStore();
  const [showPlaylists, setShowPlaylists] = useState(false);

  if (!song) return null;

  const isLiked = isFavorite(song.id);
  const imageUrl = getImageUrl(song.image, 'medium');

  const handlePlaylistSelect = (playlistId: string) => {
    addToPlaylist(playlistId, song);
    Alert.alert('Success', 'Added to playlist');
    setShowPlaylists(false);
    onClose();
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'Play Next': addNext(song); onClose(); break;
      case 'Add to Playing Queue': addToQueue(song); onClose(); break;
      case 'Add to Playlist': setShowPlaylists(true); break; // Toggle View
      case 'Go to Artist':
        onClose();
        // Extract artist ID if possible, otherwise use name
        const artistId = song.primaryArtistsId?.split(',')[0] || song.primaryArtists;
        (navigation as any).navigate('Details', { type: 'artist', id: artistId, title: song.primaryArtists });
        break;
      case 'Go to Album':
        onClose();
        if(song.album) (navigation as any).navigate('Details', { type: 'album', id: song.album.id || song.album.name, title: song.album.name });
        else Alert.alert('Unavailable', 'Album details not found');
        break;
      case 'Set as Ringtone':
        onClose();
        Alert.alert('Info', 'Ringtone feature coming soon');
        break;
      default: onClose();
    }
  };

  const renderContent = () => {
    if (showPlaylists) {
      return (
        <View>
          <View style={styles.playlistHeader}>
            <TouchableOpacity onPress={() => setShowPlaylists(false)}><Ionicons name="arrow-back" size={24} color="#FFF"/></TouchableOpacity>
            <Text style={styles.sectionTitle}>Select Playlist</Text>
          </View>
          <ScrollView style={{maxHeight: 300}}>
            {playlists.length === 0 ? <Text style={styles.emptyText}>No Playlists Created. Go to Playlists tab to create one.</Text> : 
              playlists.map(pl => (
                <TouchableOpacity key={pl.id} style={styles.playlistRow} onPress={() => handlePlaylistSelect(pl.id)}>
                  <Ionicons name="musical-notes" size={24} color="#FFF" />
                  <Text style={styles.optionText}>{pl.name}</Text>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>
      );
    }

    return (
      <ScrollView>
        {[
          { label: 'Play Next', icon: 'arrow-forward-circle-outline' },
          { label: 'Add to Playing Queue', icon: 'list-circle-outline' },
          { label: 'Add to Playlist', icon: 'add-circle-outline' },
          { label: 'Go to Album', icon: 'disc-outline' },
          { label: 'Go to Artist', icon: 'person-outline' },
          { label: 'Set as Ringtone', icon: 'call-outline' },
          { label: 'Share', icon: 'share-social-outline' },
          { label: 'Delete from Device', icon: 'trash-outline' },
        ].map((opt) => (
          <TouchableOpacity key={opt.label} style={styles.optionRow} onPress={() => handleAction(opt.label)}>
            <Ionicons name={opt.icon as any} size={24} color="#FFF" />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          {!showPlaylists && (
            <View style={styles.header}>
              <Image source={{ uri: imageUrl }} style={styles.img} />
              <View style={{flex:1, marginHorizontal:12}}>
                <Text style={styles.title} numberOfLines={1}>{decodeHtmlEntities(song.name)}</Text>
                <Text style={styles.artist} numberOfLines={1}>{decodeHtmlEntities(song.primaryArtists)}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(song)}>
                <Ionicons name={isFavorite(song.id) ? "heart" : "heart-outline"} size={28} color="#FF6B00" />
              </TouchableOpacity>
            </View>
          )}
          {renderContent()}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  img: { width: 56, height: 56, borderRadius: 8 },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  artist: { color: '#AAA', fontSize: 14 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionText: { color: '#FFF', fontSize: 16, marginLeft: 15 },
  playlistHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  emptyText: { color: '#AAA', padding: 20, textAlign: 'center' }
});