import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { mode, setMode } = useThemeStore();
  const scheme = useColorScheme();
  const theme = mode === 'system' ? (scheme === 'dark' ? Colors.dark : Colors.light) : Colors[mode];

  const renderOption = (label: string, value: 'dark' | 'light' | 'system') => (
    <TouchableOpacity style={styles.option} onPress={() => setMode(value)}>
      <Text style={[styles.text, { color: theme.textPrimary }]}>{label}</Text>
      {mode === value && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Settings</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {renderOption('System Default', 'system')}
        {renderOption('Light Mode', 'light')}
        {renderOption('Dark Mode', 'dark')}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  card: { borderRadius: 16, padding: 8 },
  option: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  text: { fontSize: 16 },
});