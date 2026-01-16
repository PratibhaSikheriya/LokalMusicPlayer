const DEFAULT_IMAGE = 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png';

export const getImageUrl = (image: any, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!image) return DEFAULT_IMAGE;

  if (typeof image === 'string') {
    const cleanUrl = image.trim();
    return cleanUrl.length > 0 ? cleanUrl : DEFAULT_IMAGE;
  }

  if (Array.isArray(image) && image.length > 0) {
    const sizeMap = { low: '50x50', medium: '150x150', high: '500x500' };
    const target = sizeMap[quality];
    const match = image.find((i: any) => i.quality === target);

    if (match) return match.url || match.link || DEFAULT_IMAGE;

    // FIXED: Use .at(-1) instead of [length-1]
    const fallback = image.at(-1) || image[0];
    return fallback?.url || fallback?.link || DEFAULT_IMAGE;
  }

  if (typeof image === 'object') {
    return image.url || image.link || DEFAULT_IMAGE;
  }

  return DEFAULT_IMAGE;
};