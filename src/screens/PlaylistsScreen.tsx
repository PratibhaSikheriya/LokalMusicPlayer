import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export const PlaylistsScreen = () => {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Playlists</Text>
      <View style={styles.empty}>
        <Ionicons name="musical-notes-outline" size={60} color={theme.textSecondary} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No playlists created</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 32, fontWeight: 'bold', margin: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});