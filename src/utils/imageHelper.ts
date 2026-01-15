// src/utils/imageHelper.ts

const DEFAULT_IMAGE = 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png';

export const getImageUrl = (image: any, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  // 1. Safety Check: If no image data, return default
  if (!image) return DEFAULT_IMAGE;

  // 2. If it's already a string (URL), just return it
  if (typeof image === 'string') {
    return image.trim() || DEFAULT_IMAGE;
  }

  // 3. If it's an array (Standard Saavn API format)
  if (Array.isArray(image) && image.length > 0) {
    const sizeMap = {
      low: '50x50',
      medium: '150x150',
      high: '500x500'
    };
    
    const targetSize = sizeMap[quality];
    
    // A. Try to find the exact size we want
    const match = image.find((img: any) => img.quality === targetSize);
    if (match) {
      return match.url || match.link || DEFAULT_IMAGE;
    }

    // B. Fallback: If we wanted High, try the last item (usually highest quality)
    if (quality === 'high') {
      const lastItem = image[image.length - 1];
      if (lastItem) return lastItem.url || lastItem.link || DEFAULT_IMAGE;
    }

    // C. Fallback: Just return the first available image
    const firstItem = image[0];
    if (firstItem) return firstItem.url || firstItem.link || DEFAULT_IMAGE;
  }

  // 4. Final Fallback
  return DEFAULT_IMAGE;
};