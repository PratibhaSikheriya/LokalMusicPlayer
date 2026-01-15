// src/utils/htmlDecode.ts

export const decodeHtmlEntities = (text: string | null | undefined): string => {
  // SAFETY CHECK: If text is not a string (null, undefined, or number), return empty string
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};