// App.tsx

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { MiniPlayer } from './src/components/MiniPlayer';
import { audioService } from './src/services/audioService';
import { useQueueStore } from './src/store/queueStore';

export default function App() {
  const loadPersistedQueue = useQueueStore((state) => state.loadPersistedQueue);

  useEffect(() => {
    // Initialize audio service
    audioService.initialize();
    
    // Load persisted queue
    loadPersistedQueue();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />
          <AppNavigator />
          <MiniPlayer />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}