import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { useMusicStore } from '../store/musicStore';
import { audioService } from '../services/audioService';
import { Ionicons } from '@expo/vector-icons';

export const FavoritesScreen = () => {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const { favorites, toggleFavorite } = useMusicStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Favorites</Text>
      
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-dislike-outline" size={60} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.item} 
              onPress={() => audioService.loadAndPlay(item)}
            >
              <Image source={{ uri: item.image[1]?.link }} style={[styles.img, { backgroundColor: theme.card }]} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: theme.textSecondary }}>{item.primaryArtists}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <Ionicons name="heart" size={24} color={theme.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 32, fontWeight: 'bold', margin: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  img: { width: 56, height: 56, borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '600' },
});