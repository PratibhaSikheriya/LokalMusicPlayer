// src/utils/imageHelper.ts

const DEFAULT_IMAGE = 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png';

export const getImageUrl = (image: any, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!image) return DEFAULT_IMAGE;

  // Case 1: Image is already a string URL
  if (typeof image === 'string') {
    return image.length > 0 ? image : DEFAULT_IMAGE;
  }

  // Case 2: Image is an array of objects
  if (Array.isArray(image) && image.length > 0) {
    const sizeMap = {
      low: '50x50',
      medium: '150x150',
      high: '500x500'
    };
    
    const targetSize = sizeMap[quality];
    
    // 1. Try to find the exact requested size
    const exactMatch = image.find((img: any) => img.quality === targetSize);
    if (exactMatch) return exactMatch.url || exactMatch.link || DEFAULT_IMAGE;

    // 2. Fallback: If we wanted High, try the last item (usually best quality)
    if (quality === 'high') {
      const lastItem = image[image.length - 1];
      if (lastItem) return lastItem.url || lastItem.link || DEFAULT_IMAGE;
    }

    // 3. Fallback: Try the first item (usually low quality, but better than nothing)
    const firstItem = image[0];
    if (firstItem) return firstItem.url || firstItem.link || DEFAULT_IMAGE;
  }

  return DEFAULT_IMAGE;
};