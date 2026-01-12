// src/navigation/AppNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator'; // Import the new Tabs
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Queue: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      {/* The main screen is now the Tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal', // Makes it slide up like the design
        }}
      />
      <Stack.Screen name="Queue" component={QueueScreen} />
    </Stack.Navigator>
  );
};