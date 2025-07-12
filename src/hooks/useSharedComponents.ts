// Custom hooks for Task 6: Components and Reusables
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Device, Notification, ChartDataPoint, ChartConfig } from '../types/shared-components';
import { debounce, throttle } from '../lib/formatters';

/**
 * Hook for managing device status updates
 */
export const useDeviceStatus = (deviceId: string) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/devices/${deviceId}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch device status: ${response.statusText}`);
      }
      
      const deviceData = await response.json();
      setDevice(deviceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  const updateDeviceStatus = useCallback(async (newStatus: Partial<Device>) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatus),
      });

      if (!response.ok) {
        throw new Error(`Failed to update device status: ${response.statusText}`);
      }

      const updatedDevice = await response.json();
      setDevice(updatedDevice);
      
      return updatedDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
      throw err;
    }
  }, [deviceId]);

  useEffect(() => {
    if (deviceId) {
      fetchDeviceStatus();
    }
  }, [deviceId, fetchDeviceStatus]);

  // Set up real-time updates via WebSocket or polling
  useEffect(() => {
    if (!deviceId) return;

    const interval = setInterval(fetchDeviceStatus, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [deviceId, fetchDeviceStatus]);

  return {
    device,
    isLoading,
    error,
    refetch: fetchDeviceStatus,
    updateStatus: updateDeviceStatus
  };
};

/**
 * Hook for managing chart data with real-time updates
 */
export const useChartData = (config: ChartConfig & { endpoint?: string; refreshInterval?: number }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!config.endpoint) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(config.endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`);
      }
      
      const chartData = await response.json();
      setData(chartData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Set up auto-refresh
  useEffect(() => {
    if (!config.refreshInterval || config.refreshInterval <= 0) return;

    const interval = setInterval(fetchChartData, config.refreshInterval);
    return () => clearInterval(interval);
  }, [config.refreshInterval, fetchChartData]);

  const addDataPoint = useCallback((newPoint: ChartDataPoint) => {
    setData(prevData => [...prevData, newPoint]);
    setLastUpdated(new Date());
  }, []);

  const updateDataPoint = useCallback((index: number, updatedPoint: Partial<ChartDataPoint>) => {
    setData(prevData => 
      prevData.map((point, i) => 
        i === index ? { ...point, ...updatedPoint } : point
      )
    );
    setLastUpdated(new Date());
  }, []);

  const removeDataPoint = useCallback((index: number) => {
    setData(prevData => prevData.filter((_, i) => i !== index));
    setLastUpdated(new Date());
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    setLastUpdated(new Date());
  }, []);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchChartData,
    addDataPoint,
    updateDataPoint,
    removeDataPoint,
    clearData
  };
};

/**
 * Hook for managing theme context and utilities
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorScheme, setColorScheme] = useState<string>('default');

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const getThemeClasses = useCallback((lightClass: string, darkClass: string) => {
    return theme === 'light' ? lightClass : darkClass;
  }, [theme]);

  const getColorValue = useCallback((colorName: string) => {
    const colors = {
      light: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827'
      },
      dark: {
        primary: '#60A5FA',
        secondary: '#9CA3AF',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB'
      }
    };
    
    return colors[theme][colorName as keyof typeof colors.light] || '#000000';
  }, [theme]);

  return {
    theme,
    colorScheme,
    setTheme,
    setColorScheme,
    toggleTheme,
    getThemeClasses,
    getColorValue,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

/**
 * Hook for managing notifications with real-time updates
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }
      
      const notificationData = await response.json();
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, []);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to dismiss notification: ${response.statusText}`);
      }

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const filtered = prev.filter(n => n.id !== notificationId);
        
        if (notification && !notification.isRead) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return filtered;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss notification');
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time updates via WebSocket or polling
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.isRead), [notifications]
  );

  const notificationsByType = useMemo(() => 
    notifications.reduce((acc, notification) => {
      acc[notification.type] = acc[notification.type] || [];
      acc[notification.type].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>), [notifications]
  );

  const notificationsByPriority = useMemo(() => 
    notifications.reduce((acc, notification) => {
      acc[notification.priority] = acc[notification.priority] || [];
      acc[notification.priority].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>), [notifications]
  );

  return {
    notifications,
    unreadNotifications,
    notificationsByType,
    notificationsByPriority,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification
  };
};

/**
 * Hook for managing component visibility and intersection observer
 */
export const useVisibility = (threshold: number = 0.1) => {
  const { ref, inView, entry } = useInView({
    threshold,
    triggerOnce: false
  });

  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (inView && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [inView, hasBeenVisible]);

  return {
    ref,
    isVisible: inView,
    hasBeenVisible,
    entry,
    intersectionRatio: entry?.intersectionRatio || 0
  };
};

/**
 * Hook for managing component performance metrics
 */
export const usePerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    memoryUsage: 0
  });

  const startTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalMountTime = unmountTime - mountTimeRef.current;
      
      console.log(`${componentName} was mounted for ${totalMountTime.toFixed(2)}ms`);
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      updateCount: prev.updateCount + 1
    }));

    // Log performance warnings
    if (renderTime > 16) {
      console.warn(`${componentName} render time (${renderTime.toFixed(2)}ms) exceeds 16ms threshold`);
    }
  }, [componentName]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize
      }));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(measureMemory, 5000); // Measure every 5 seconds
    return () => clearInterval(interval);
  }, [measureMemory]);

  return {
    metrics,
    startRender,
    endRender,
    measureMemory
  };
};

/**
 * Hook for managing debounced and throttled functions
 */
export const useDebounceThrottle = () => {
  const debouncedFunctions = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const throttledFunctions = useRef<Map<string, (...args: any[]) => void>>(new Map());

  const getDebouncedFunction = useCallback(
    <T extends (...args: any[]) => any>(
      func: T,
      delay: number,
      key: string
    ): ((...args: Parameters<T>) => void) => {
      if (!debouncedFunctions.current.has(key)) {
        debouncedFunctions.current.set(key, debounce(func, delay));
      }
      return debouncedFunctions.current.get(key)!;
    },
    []
  );

  const getThrottledFunction = useCallback(
    <T extends (...args: any[]) => any>(
      func: T,
      limit: number,
      key: string
    ): ((...args: Parameters<T>) => void) => {
      if (!throttledFunctions.current.has(key)) {
        throttledFunctions.current.set(key, throttle(func, limit));
      }
      return throttledFunctions.current.get(key)!;
    },
    []
  );

  const clearDebouncedFunction = useCallback((key: string) => {
    debouncedFunctions.current.delete(key);
  }, []);

  const clearThrottledFunction = useCallback((key: string) => {
    throttledFunctions.current.delete(key);
  }, []);

  const clearAllFunctions = useCallback(() => {
    debouncedFunctions.current.clear();
    throttledFunctions.current.clear();
  }, []);

  return {
    getDebouncedFunction,
    getThrottledFunction,
    clearDebouncedFunction,
    clearThrottledFunction,
    clearAllFunctions
  };
};

/**
 * Hook for managing local storage with type safety
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

/**
 * Hook for managing component state with undo/redo functionality
 */
export const useUndoRedo = <T>(initialState: T) => {
  const [states, setStates] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = states[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < states.length - 1;

  const setState = useCallback((newState: T) => {
    setStates(prev => {
      const newStates = [...prev.slice(0, currentIndex + 1), newState];
      // Limit history to 50 states
      return newStates.slice(-50);
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo]);

  const reset = useCallback(() => {
    setStates([initialState]);
    setCurrentIndex(0);
  }, [initialState]);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyLength: states.length
  };
};
