// src/screens/SettingsScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/colors';

export const SettingsScreen = () => {
  const { mode, setMode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;
  const isDarkMode = mode === 'dark';

  const toggleTheme = () => {
    setMode(isDarkMode ? 'light' : 'dark');
  };

  const handleOption = (title: string) => {
    Alert.alert(title, 'This feature is coming soon!', [{ text: 'OK' }]);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent,
  }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top']}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="APPEARANCE" />
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle={isDarkMode ? 'Enabled' : 'Disabled'}
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#fff"
            />
          }
        />

        <SectionHeader title="PLAYBACK" />
        <SettingItem
          icon="musical-notes"
          title="Audio Quality"
          subtitle="High (320kbps)"
          onPress={() => handleOption('Audio Quality')}
        />
        <SettingItem
          icon="download"
          title="Download Quality"
          subtitle="High"
          onPress={() => handleOption('Download Quality')}
        />
        <SettingItem
          icon="headset"
          title="Equalizer"
          subtitle="Customize your sound"
          onPress={() => handleOption('Equalizer')}
        />

        <SectionHeader title="STORAGE" />
        <SettingItem
          icon="folder"
          title="Downloads"
          subtitle="Manage offline songs"
          onPress={() => handleOption('Downloads')}
        />
        <SettingItem
          icon="trash"
          title="Clear Cache"
          subtitle="Free up space"
          onPress={() => handleOption('Clear Cache')}
        />

        <SectionHeader title="ABOUT" />
        <SettingItem
          icon="information-circle"
          title="App Version"
          subtitle="1.0.0"
          showArrow={false}
        />
        <SettingItem
          icon="star"
          title="Rate Us"
          onPress={() => handleOption('Rate Us')}
        />
        <SettingItem
          icon="mail"
          title="Contact Support"
          onPress={() => handleOption('Contact Support')}
        />
        <SettingItem
          icon="document-text"
          title="Terms & Privacy"
          onPress={() => handleOption('Terms & Privacy')}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: { 
    fontSize: 32, 
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
});