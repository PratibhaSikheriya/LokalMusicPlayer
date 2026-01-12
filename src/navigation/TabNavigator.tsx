import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/themeStore';
import { MiniPlayer } from '../components/MiniPlayer';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { mode } = useThemeStore();
  const scheme = useColorScheme();
  const theme = mode === 'system' ? (scheme === 'dark' ? Colors.dark : Colors.light) : Colors[mode];

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopWidth: 0,
            height: 65, // Taller bar for modern look
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 0, // Flat design
          },
          tabBarActiveTintColor: theme.tabIconActive,
          tabBarInactiveTintColor: theme.tabIconInactive,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 4 },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={24} color={color} />
          }} 
        />
        <Tab.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{
            tabBarLabel: 'Favorites',
            tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={24} color={color} />
          }} 
        />
        <Tab.Screen 
          name="Playlists" 
          component={PlaylistsScreen} 
          options={{
            tabBarLabel: 'Playlists',
            tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={24} color={color} />
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={24} color={color} />
          }} 
        />
      </Tab.Navigator>
      
      {/* MiniPlayer floats above the tabs */}
      <MiniPlayer />
    </>
  );
};