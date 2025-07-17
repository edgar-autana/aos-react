/**
 * Format number with thousand separators (e.g., 2,000, 2,000,000, 200)
 * @param num - The number to format
 * @returns Formatted string with commas as thousand separators
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '—';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '—';
  
  return numValue.toLocaleString('en-US');
};

/**
 * Format currency with thousand separators and currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'USD'): string => {
  if (amount === null || amount === undefined || amount === '') return '—';
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) return '—';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(numValue);
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param num - The number to format
 * @returns Formatted string with abbreviation
 */
export const formatLargeNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '—';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '—';
  
  if (numValue >= 1000000000) {
    return (numValue / 1000000000).toFixed(1) + 'B';
  } else if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  } else if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  
  return numValue.toString();
};

/**
 * Format percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '—';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '—';
  
  return numValue.toFixed(decimals) + '%';
}; 