// src/screens/QueueScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueueStore } from '../store/queueStore';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import { Song } from '../types';

export const QueueScreen: React.FC = () => {
  const navigation = useNavigation();
  const { queue, currentIndex, removeFromQueue, clearQueue, setCurrentIndex } = useQueueStore();
  const { currentSong } = usePlayerStore();

  const handleSongPress = async (index: number) => {
    setCurrentIndex(index);
    const song = queue[index];
    if (song) {
      await audioService.loadAndPlay(song);
      navigation.goBack();
    }
  };

  const handleRemoveSong = (index: number) => {
    Alert.alert(
      'Remove Song',
      'Remove this song from queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromQueue(index),
        },
      ]
    );
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Remove all songs from queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearQueue();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderQueueItem = ({ item, index }: { item: Song; index: number }) => {
    const imageUrl = item.image.find((img) => img.quality === '150x150')?.link ||
                     item.image.find((img) => img.quality === '150x150')?.url ||
                     item.image[0]?.link ||
                     item.image[0]?.url;

    const isCurrentSong = index === currentIndex;

    return (
      <TouchableOpacity
        style={[styles.queueItem, isCurrentSong && styles.currentQueueItem]}
        onPress={() => handleSongPress(index)}
        activeOpacity={0.7}
      >
        <View style={styles.queueItemLeft}>
          <Text style={[styles.queueNumber, isCurrentSong && styles.currentText]}>
            {index + 1}
          </Text>
          <Image source={{ uri: imageUrl }} style={styles.queueImage} />
          <View style={styles.queueInfo}>
            <Text
              style={[styles.queueTitle, isCurrentSong && styles.currentText]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.queueArtist} numberOfLines={1}>
              {item.primaryArtists}
            </Text>
          </View>
        </View>

        <View style={styles.queueItemRight}>
          {isCurrentSong && (
            <Ionicons name="volume-high" size={20} color="#8A2BE2" style={styles.playingIcon} />
          )}
          <TouchableOpacity
            onPress={() => handleRemoveSong(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Queue</Text>
            {queue.length > 0 && (
              <TouchableOpacity onPress={handleClearQueue}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Queue Info */}
          {queue.length > 0 && (
            <View style={styles.queueInfo}>
              <Text style={styles.queueInfoText}>
                {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
              </Text>
            </View>
          )}

          {/* Queue List */}
          {queue.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Queue is empty</Text>
              <Text style={styles.emptySubtext}>
                Play some songs to see them here
              </Text>
            </View>
          ) : (
            <FlatList
              data={queue}
              renderItem={renderQueueItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={currentIndex}
              getItemLayout={(data, index) => ({
                length: 80,
                offset: 80 * index,
                index,
              })}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  clearButton: {
    fontSize: 14,
    color: '#8A2BE2',
    fontWeight: '600',
  },
  queueInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  queueInfoText: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 100,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 80,
  },
  currentQueueItem: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  queueNumber: {
    fontSize: 16,
    color: '#666',
    width: 30,
    fontWeight: '600',
  },
  currentText: {
    color: '#8A2BE2',
  },
  queueImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  queueInfo: {
    flex: 1,
  },
  queueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  queueArtist: {
    fontSize: 13,
    color: '#999',
  },
  queueItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playingIcon: {
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});