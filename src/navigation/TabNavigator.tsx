// src/navigation/TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MiniPlayer } from '../components/MiniPlayer';

const Tab = createBottomTabNavigator();

// Placeholder screens for tabs we haven't built yet
const Placeholder = () => <View style={{flex:1, backgroundColor: Colors.background}} />;

export const TabNavigator = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 5 },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Favorites" 
          component={Placeholder} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Playlists" 
          component={Placeholder}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={Placeholder}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-sharp" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      {/* MiniPlayer sits above the tab bar */}
      <MiniPlayer /> 
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F1629', // Darker shade for tab bar
    borderTopWidth: 0,
    height: 60,
    paddingTop: 5,
    position: 'absolute',
    bottom: 0,
    elevation: 0,
  },
});