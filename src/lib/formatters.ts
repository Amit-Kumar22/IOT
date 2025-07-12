// Shared utility functions for Task 6: Components and Reusables
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format currency values with proper locale and currency symbol
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback for invalid currency codes
    return `${currency} ${value.toFixed(2)}`;
  }
};

/**
 * Format date and time with various formats
 */
export const formatDateTime = (
  date: Date, 
  formatString: string = 'MMM dd, yyyy HH:mm'
): string => {
  try {
    return format(date, formatString);
  } catch (error) {
    return date.toISOString();
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date): string => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format numbers with thousand separators
 */
export const formatNumber = (
  value: number, 
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    return value.toString();
  }
};

/**
 * Format energy values with appropriate units
 */
export const formatEnergy = (value: number, unit: string = 'kWh'): string => {
  if (value < 1) {
    return `${(value * 1000).toFixed(0)} W${unit.charAt(0) === 'k' ? 'h' : ''}`;
  } else if (value < 1000) {
    return `${value.toFixed(1)} ${unit}`;
  } else {
    return `${(value / 1000).toFixed(1)} M${unit}`;
  }
};

/**
 * Format device status for display
 */
export const formatDeviceStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'online':
      return 'Online';
    case 'offline':
      return 'Offline';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Format signal strength percentage
 */
export const formatSignalStrength = (strength: number): string => {
  const percentage = Math.round(strength * 100);
  if (percentage >= 75) return 'Excellent';
  if (percentage >= 50) return 'Good';
  if (percentage >= 25) return 'Fair';
  return 'Poor';
};

/**
 * Format battery level with appropriate warnings
 */
export const formatBatteryLevel = (level: number): { text: string; warning: boolean } => {
  const percentage = Math.round(level * 100);
  return {
    text: `${percentage}%`,
    warning: percentage < 20
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate random ID for components
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Calculate color based on value and thresholds
 */
export const getThresholdColor = (
  value: number,
  thresholds: { low: number; medium: number; high: number }
): string => {
  if (value >= thresholds.high) return 'red';
  if (value >= thresholds.medium) return 'yellow';
  if (value >= thresholds.low) return 'green';
  return 'gray';
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Check if color is light or dark for contrast
 */
export const isLightColor = (color: string): boolean => {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 125;
};

/**
 * Safely parse JSON with fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return fallback;
  }
};

/**
 * Deep merge objects
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {} as T[Extract<keyof T, string>], source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
};

/**
 * Check if device is controllable based on type and status
 */
export const isDeviceControllable = (
  type: string,
  status: string,
  isControllable: boolean
): boolean => {
  if (!isControllable) return false;
  if (status === 'offline' || status === 'error') return false;
  
  const controllableTypes = ['light', 'thermostat', 'appliance'];
  return controllableTypes.includes(type);
};

/**
 * Get device type icon name
 */
export const getDeviceTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    light: 'lightbulb',
    thermostat: 'thermometer',
    security: 'shield',
    sensor: 'activity',
    appliance: 'zap',
    industrial: 'settings'
  };
  
  return iconMap[type] || 'device';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll element into view smoothly
 */
export const scrollIntoView = (element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void => {
  element.scrollIntoView({ behavior, block: 'center' });
};
