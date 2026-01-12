import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

// Mock Recent Searches from screenshot
const RECENT_DATA = ['Ariana Grande', 'Morgan Wallen', 'Justin Bieber', 'Drake', 'The Weeknd', 'Taylor Swift', 'Juice Wrld', 'Memories'];

export const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(RECENT_DATA);
  const [activeTab, setActiveTab] = useState('Songs');
  
  // Theme
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  const clearAll = () => setHistory([]);
  const removeOne = (item: string) => setHistory(history.filter(h => h !== item));

  // Determine if we show the "Not Found" sad face
  // For demo, if user types exactly "Abcdefghijklm", we show not found.
  const isNotFound = query === 'Abcdefghijklm';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header with Back & Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: theme.input, borderColor: theme.primary }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput 
            style={[styles.input, { color: theme.textPrimary }]} 
            placeholder="Search..." 
            placeholderTextColor={theme.textSecondary}
            value={query} 
            onChangeText={setQuery}
            autoFocus 
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs (Songs, Artists, Albums, Folders) - Only show if not empty state */}
      {!isNotFound && (
        <View style={styles.tabsContainer}>
          {['Songs', 'Artists', 'Albums', 'Folders'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab, 
                { borderColor: theme.primary, backgroundColor: activeTab === tab ? theme.primary : 'transparent' }
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? '#FFF' : theme.primary }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Content Area */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        
        {/* State 1: Search History (Default) */}
        {query.length === 0 && (
          <>
            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Searches</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={[styles.clearText, { color: theme.primary }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={history}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <Text style={[styles.historyItem, { color: theme.textSecondary }]}>{item}</Text>
                  <TouchableOpacity onPress={() => removeOne(item)}>
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}

        {/* State 2: Not Found (Sad Face) */}
        {isNotFound && (
          <View style={styles.centerContainer}>
            <View style={styles.sadFace}>
               {/* Simulating the sad face graphic with an icon */}
               <Ionicons name="sad-outline" size={100} color={theme.primary} />
            </View>
            <Text style={[styles.notFoundTitle, { color: theme.textPrimary }]}>Not Found</Text>
            <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
              Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
            </Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginLeft: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyItem: {
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Visual balance
  },
  sadFace: {
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  notFoundText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});