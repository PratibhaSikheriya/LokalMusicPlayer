// src/navigation/AppNavigator.tsx

import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { QueueScreen } from '../screens/QueueScreen'; // Import Queue
import { DetailsScreen } from '../screens/DetailsScreen'; // Import Details
import { usePlayerStore } from '../store/playerStore';


const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isModalOpen } = usePlayerStore();
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false, 
          animation: 'slide_from_bottom' 
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="Player" 
          component={PlayerScreen} 
          options={{ presentation: 'modal' }} 
        />
        <Stack.Screen name="Search" component={SearchScreen} />
        {/* NEW SCREENS */}
        <Stack.Screen name="Queue" component={QueueScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
      
      {/* Hide MiniPlayer if modal is open */}
      {!isModalOpen && <MiniPlayer />}
    </View>
  );
};