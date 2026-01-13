// src/navigation/AppNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SearchScreen } from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
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
    </Stack.Navigator>
  );
};