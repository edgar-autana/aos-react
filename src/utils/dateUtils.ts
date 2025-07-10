/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a date string to include time
 * @param dateString - The date string to format
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formats a date string to show relative time (e.g., "2 days ago")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays > 1 && diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays >= 7 && diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
};

/**
 * Checks if a date string is valid
 * @param dateString - The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}; 

/**
 * Format number with thousand separators
 * @param num - The number to format
 * @returns Formatted string with commas as thousand separators
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '—';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '—';
  
  return numValue.toLocaleString('en-US');
}; 