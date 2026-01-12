import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';

const RECENT_DATA = ['Ariana Grande', 'Morgan Wallen', 'Justin Bieber', 'Drake', 'The Weeknd', 'Taylor Swift', 'Juice Wrld', 'Memories'];

export const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(RECENT_DATA);
  const [isFocused, setIsFocused] = useState(false);
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  const removeHistory = (item: string) => setHistory(history.filter(i => i !== item));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.inputBox, { backgroundColor: theme.input, borderColor: isFocused ? theme.primary : theme.border }]}>
          <Ionicons name="search" size={20} color={isFocused ? theme.primary : theme.textSecondary} />
          <TextInput 
            style={[styles.input, { color: theme.textPrimary }]} 
            placeholder="Search..." 
            placeholderTextColor={theme.textSecondary}
            value={query} 
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus 
          />
          {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close" size={20} color={theme.textPrimary} /></TouchableOpacity>}
        </View>
      </View>

      {query.length === 0 ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.headTitle, { color: theme.textPrimary }]}>Recent Searches</Text>
            <TouchableOpacity onPress={() => setHistory([])}>
              <Text style={[styles.clearBtn, { color: theme.primary }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={{ color: theme.textSecondary, fontSize: 16 }}>{item}</Text>
                <TouchableOpacity onPress={() => removeHistory(item)}>
                  <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
           <Ionicons name="sad-outline" size={100} color={theme.primary} />
           <Text style={{color:theme.textPrimary, fontSize:22, fontWeight:'bold', marginTop:15}}>Not Found</Text>
           <Text style={{color:theme.textSecondary, textAlign:'center', marginTop:10, paddingHorizontal:40}}>Sorry, the keyword you entered cannot be found, please check again or search with another keyword.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  inputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 15, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, height: 45 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  historyContainer: { paddingHorizontal: 24 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  headTitle: { fontSize: 18, fontWeight: '700' },
  clearBtn: { fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
});