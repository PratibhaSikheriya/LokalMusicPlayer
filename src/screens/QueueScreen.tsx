import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQueueStore } from '../store/queueStore';
import { audioService } from '../services/audioService';
import { getImageUrl } from '../utils/imageHelper';
import { decodeHtmlEntities } from '../utils/htmlDecode';

export const QueueScreen = () => {
  const navigation = useNavigation();
  const { queue, currentIndex, removeFromQueue, clearQueue, setCurrentIndex } = useQueueStore();

  const handleSongPress = async (index: number) => {
    setCurrentIndex(index);
    const song = queue[index];
    if (song) await audioService.loadAndPlay(song);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isCurrent = index === currentIndex;
    const imageUrl = getImageUrl(item.image, 'low');

    return (
      <TouchableOpacity 
        style={[styles.item, isCurrent && styles.activeItem]}
        onPress={() => handleSongPress(index)}
      >
        <Text style={[styles.index, isCurrent && styles.activeText]}>{index + 1}</Text>
        <Image source={{ uri: imageUrl }} style={styles.img} />
        <View style={styles.info}>
          <Text style={[styles.title, isCurrent && styles.activeText]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {decodeHtmlEntities(item.primaryArtists)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => removeFromQueue(index)} style={{padding: 8}}>
          <Ionicons name="close-circle-outline" size={24} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playing Queue</Text>
        <View style={{flexDirection:'row', alignItems:'center'}}>
           <TouchableOpacity onPress={clearQueue} style={{marginRight: 16}}>
             <Text style={{color:'#FF6B00', fontWeight:'bold'}}>Clear</Text>
           </TouchableOpacity>
           {/* CROSS BUTTON */}
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
             <Ionicons name="close" size={28} color="#FFF" />
           </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Queue is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth:1, borderBottomColor:'#333' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 4, backgroundColor:'rgba(255,255,255,0.1)', borderRadius: 20 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  activeItem: { backgroundColor: 'rgba(255, 107, 0, 0.15)' },
  index: { color: '#666', width: 30, fontSize: 14, textAlign:'center' },
  img: { width: 50, height: 50, borderRadius: 8, marginHorizontal: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, color: '#fff', fontWeight: '500' },
  activeText: { color: '#FF6B00', fontWeight: 'bold' },
  artist: { fontSize: 13, color: '#999', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666', fontSize: 16 }
});