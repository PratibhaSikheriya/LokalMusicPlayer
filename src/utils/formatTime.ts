// src/utils/formatTime.ts

/**
 * Format milliseconds to MM:SS format
 */
export const formatTime = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration string to MM:SS format
 */
export const formatDuration = (duration: string | number): string => {
  const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format play count to readable format (e.g., 1.5M, 200K)
 */
export const formatPlayCount = (count: string | number): string => {
  const numCount = typeof count === 'string' ? parseInt(count) : count;
  
  if (numCount >= 1000000) {
    return `${(numCount / 1000000).toFixed(1)}M`;
  } else if (numCount >= 1000) {
    return `${(numCount / 1000).toFixed(1)}K`;
  }
  
  return numCount.toString();
};