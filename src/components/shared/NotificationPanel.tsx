import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle, Filter, Search, Settings, Archive, Trash2, MoreVertical } from 'lucide-react';

// Base notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  source?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
  deviceId?: string;
  category?: string;
  metadata?: Record<string, any>;
}

// Filter and sorting options
export interface NotificationFilters {
  type?: Notification['type'][];
  priority?: Notification['priority'][];
  read?: boolean;
  source?: string[];
  category?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationSorting {
  field: 'timestamp' | 'priority' | 'type' | 'title';
  order: 'asc' | 'desc';
}

// Component props
export interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationAction?: (notificationId: string, action: string) => void;
  onBulkAction?: (notificationIds: string[], action: string) => void;
  onFiltersChange?: (filters: NotificationFilters) => void;
  onSortingChange?: (sorting: NotificationSorting) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showBulkActions?: boolean;
  showSettings?: boolean;
  maxHeight?: number;
  className?: string;
  emptyStateMessage?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  realTimeUpdates?: boolean;
  groupByDate?: boolean;
  virtualScrolling?: boolean;
  compactMode?: boolean;
  showUnreadCount?: boolean;
  allowMarkAllAsRead?: boolean;
  allowClearAll?: boolean;
  customActions?: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
  }[];
}

// Notification item component
const NotificationItem: React.FC<{
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (notification: Notification) => void;
  onDismiss: (id: string) => void;
  onAction: (id: string, action: string) => void;
  customActions?: NotificationPanelProps['customActions'];
  compactMode?: boolean;
}> = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onClick, 
  onDismiss, 
  onAction, 
  customActions = [],
  compactMode = false 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours < 1) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`
        relative border-l-4 ${getPriorityColor(notification.priority)} 
        bg-white hover:bg-gray-50 transition-colors
        ${!notification.read ? 'border-r-4 border-r-blue-500' : ''}
        ${compactMode ? 'p-3' : 'p-4'}
        border-b border-gray-200 last:border-b-0
        ${isSelected ? 'bg-blue-50' : ''}
        cursor-pointer
      `}
      onClick={() => onClick(notification)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection checkbox */}
      <div className="absolute left-2 top-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(notification.id);
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Select notification: ${notification.title}`}
        />
      </div>

      <div className="ml-6 flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Type icon */}
          <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
            {getTypeIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                {notification.title}
              </h3>
              
              {notification.priority && (
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${notification.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                  ${notification.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                  ${notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${notification.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {notification.priority}
                </span>
              )}

              {notification.actionRequired && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Action Required
                </span>
              )}
            </div>

            <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'} ${compactMode ? 'line-clamp-1' : 'line-clamp-2'}`}>
              {notification.message}
            </p>

            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>{formatTime(notification.timestamp)}</span>
              {notification.source && (
                <span className="flex items-center space-x-1">
                  <span>•</span>
                  <span>{notification.source}</span>
                </span>
              )}
              {notification.category && (
                <span className="flex items-center space-x-1">
                  <span>•</span>
                  <span>{notification.category}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-1 ml-4"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {customActions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main NotificationPanel component
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onNotificationClick,
  onNotificationDismiss,
  onNotificationRead,
  onNotificationAction,
  onBulkAction,
  onFiltersChange,
  onSortingChange,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  showSettings = true,
  maxHeight = 600,
  className = '',
  emptyStateMessage = 'No notifications',
  autoRefresh = false,
  refreshInterval = 30000,
  realTimeUpdates = false,
  groupByDate = false,
  virtualScrolling = false,
  compactMode = false,
  showUnreadCount = true,
  allowMarkAllAsRead = true,
  allowClearAll = true,
  customActions = []
}) => {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [sorting, setSorting] = useState<NotificationSorting>({
    field: 'timestamp',
    order: 'desc'
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Handle notification selection
  const handleNotificationSelect = useCallback((id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  }, [selectedNotifications.length]);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type?.length) {
      filtered = filtered.filter(n => filters.type!.includes(n.type));
    }
    if (filters.priority?.length) {
      filtered = filtered.filter(n => n.priority && filters.priority!.includes(n.priority));
    }
    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read);
    }
    if (filters.source?.length) {
      filtered = filtered.filter(n => n.source && filters.source!.includes(n.source));
    }
    if (filters.category?.length) {
      filtered = filtered.filter(n => n.category && filters.category!.includes(n.category));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sorting.field];
      let bVal: any = b[sorting.field];

      if (sorting.field === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sorting.order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [notifications, searchQuery, filters, sorting]);

  // Count unread notifications
  const unreadCount = useMemo(() => 
    filteredNotifications.filter(n => !n.read).length,
    [filteredNotifications]
  );

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    if (selectedNotifications.length > 0) {
      onBulkAction?.(selectedNotifications, action);
      setSelectedNotifications([]);
    }
  }, [selectedNotifications, onBulkAction]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    onNotificationClick?.(notification);
    if (!notification.read) {
      onNotificationRead?.(notification.id);
    }
  }, [onNotificationClick, onNotificationRead]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Trigger refresh - this would typically call a parent function
        // For now, we'll just log
        console.log('Auto-refreshing notifications');
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return (
    <div 
      className={`notification-panel bg-white rounded-lg shadow-lg border ${className}`}
      role="region"
      aria-label="Notifications panel"
      data-testid="notification-panel"
    >
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
              {showUnreadCount && unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showFiltersPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {showSettings && (
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Bulk actions */}
        {showBulkActions && selectedNotifications.length > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedNotifications.length} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('read')}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                Mark as Read
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    multiple
                    value={filters.type?.filter(t => t !== undefined) || []}
                    onChange={(e) => {
                      const value = Array.from(e.target.selectedOptions, option => option.value) as Notification['type'][];
                      setFilters(prev => ({ ...prev, type: value }));
                      onFiltersChange?.({ ...filters, type: value });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* Priority filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    multiple
                    value={filters.priority?.filter(p => p !== undefined) || []}
                    onChange={(e) => {
                      const value = Array.from(e.target.selectedOptions, option => option.value) as Notification['priority'][];
                      setFilters(prev => ({ ...prev, priority: value }));
                      onFiltersChange?.({ ...filters, priority: value });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Read status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.read === undefined ? 'all' : filters.read ? 'read' : 'unread'}
                    onChange={(e) => {
                      const value = e.target.value === 'all' ? undefined : e.target.value === 'read';
                      setFilters(prev => ({ ...prev, read: value }));
                      onFiltersChange?.({ ...filters, read: value });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={`${sorting.field}-${sorting.order}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      const newSorting = { field: field as NotificationSorting['field'], order: order as NotificationSorting['order'] };
                      setSorting(newSorting);
                      onSortingChange?.(newSorting);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="timestamp-desc">Newest First</option>
                    <option value="timestamp-asc">Oldest First</option>
                    <option value="priority-desc">Priority High to Low</option>
                    <option value="priority-asc">Priority Low to High</option>
                    <option value="type-asc">Type A-Z</option>
                    <option value="type-desc">Type Z-A</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setFilters({});
                    onFiltersChange?.({});
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>

                <div className="flex items-center space-x-2">
                  {allowMarkAllAsRead && (
                    <button
                      onClick={() => handleBulkAction('read-all')}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Mark All as Read
                    </button>
                  )}
                  {allowClearAll && (
                    <button
                      onClick={() => handleBulkAction('clear-all')}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification List */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">{emptyStateMessage}</p>
            <p className="text-sm mt-1">
              {searchQuery || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters'
                : 'You\'ll see new notifications here when they arrive'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select all checkbox */}
            {showBulkActions && (
              <div className="sticky top-0 bg-white border-b p-3 z-10">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Select all notifications"
                  />
                  <span>Select All ({filteredNotifications.length})</span>
                </label>
              </div>
            )}

            {/* Notification items */}
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedNotifications.includes(notification.id)}
                  onSelect={handleNotificationSelect}
                  onClick={handleNotificationClick}
                  onDismiss={onNotificationDismiss || (() => {})}
                  onAction={onNotificationAction || (() => {})}
                  customActions={customActions}
                  compactMode={compactMode}
                />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
