/**
 * Formats a URL by adding the https:// protocol if it's missing
 * @param url - The URL to format
 * @returns The formatted URL with protocol
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

/**
 * Validates if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(formatUrl(url));
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts the domain from a URL
 * @param url - The URL to extract domain from
 * @returns The domain name
 */
export const extractDomain = (url: string): string => {
  try {
    const formattedUrl = formatUrl(url);
    const urlObj = new URL(formattedUrl);
    return urlObj.hostname;
  } catch {
    return url;
  }
}; 