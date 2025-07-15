import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';

// Notification types
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  deviceAlerts: boolean;
  billingAlerts: boolean;
  systemAlerts: boolean;
  maintenanceAlerts: boolean;
}

// Context types
interface NotificationContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Utility
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enablePush: true,
    enableEmail: true,
    enableSMS: false,
    deviceAlerts: true,
    billingAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Auto-remove non-persistent notifications after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent && !notification.read) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);
      }
    });
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if enabled
    if (settings.enablePush && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/notification-icon.png',
            });
          }
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getNotificationsByType = (type: Notification['type']): Notification[] => {
    return notifications.filter(notification => notification.type === type);
  };

  const getRecentNotifications = (limit: number = 10): Notification[] => {
    return notifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: NotificationContextType = {
    // State
    notifications,
    unreadCount,
    settings,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Settings
    updateSettings,
    
    // Utility
    getNotificationsByType,
    getRecentNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Hook for creating notifications with different types
export const useNotify = () => {
  const { addNotification } = useNotifications();
  
  return {
    success: (title: string, message: string, persistent?: boolean) => {
      addNotification({ type: 'success', title, message, persistent });
    },
    error: (title: string, message: string, persistent?: boolean) => {
      addNotification({ type: 'error', title, message, persistent });
    },
    warning: (title: string, message: string, persistent?: boolean) => {
      addNotification({ type: 'warning', title, message, persistent });
    },
    info: (title: string, message: string, persistent?: boolean) => {
      addNotification({ type: 'info', title, message, persistent });
    },
  };
};

// Hook for listening to specific notification types
export const useNotificationListener = (type: Notification['type']) => {
  const { getNotificationsByType } = useNotifications();
  const [typeNotifications, setTypeNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setTypeNotifications(getNotificationsByType(type));
  }, [type, getNotificationsByType]);

  return typeNotifications;
};

export default NotificationContext;
