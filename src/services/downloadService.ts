import * as FileSystem from 'expo-file-system';
import { Song } from '../types';
import { Alert } from 'react-native';

export const downloadService = {
  async downloadSong(song: Song) {
    try {
      // 1. Get the highest quality URL
      // (Using .at(-1) as suggested by linter)
      const downloadUrlObj = Array.isArray(song.downloadUrl) 
        ? song.downloadUrl.at(-1) 
        : null;
        
      const url = downloadUrlObj?.link || downloadUrlObj?.url;
      
      if (!url) {
        Alert.alert('Error', 'No download link available for this song.');
        return;
      }

      // 2. Define the path
      // @ts-ignore: Suppressing 'documentDirectory' type error (it exists at runtime)
      const docDir = FileSystem.documentDirectory;
      
      if (!docDir) {
        Alert.alert('Error', 'Storage not available.');
        return;
      }

      // Use regex global replace (safest for compatibility)
      const safeName = song.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}_${song.id}.mp4`;
      const fileUri = `${docDir}${fileName}`;

      console.log('Downloading to:', fileUri);

      // 3. Download
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {}
      );

      const result = await downloadResumable.downloadAsync();

      // 4. Success Handling (Optional chaining fixed)
      if (result?.status === 200) {
        Alert.alert('Downloaded!', `Song saved for offline listening.`);
        return result.uri;
      }
    } catch (e) {
      console.error('Download error:', e);
      Alert.alert('Error', 'Download failed.');
    }
  },
};