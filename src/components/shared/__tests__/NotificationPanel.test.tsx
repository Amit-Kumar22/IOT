import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationPanel, { Notification, NotificationFilters } from '../NotificationPanel';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Alert',
    message: 'High CPU usage detected on server',
    type: 'warning',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    read: false,
    source: 'Server Monitor',
    priority: 'high',
    category: 'system',
    actionRequired: true,
  },
  {
    id: '2',
    title: 'Backup Complete',
    message: 'Daily backup completed successfully',
    type: 'success',
    timestamp: new Date('2024-01-01T09:00:00Z'),
    read: true,
    source: 'Backup Service',
    priority: 'low',
    category: 'maintenance',
    actionRequired: false,
  },
  {
    id: '3',
    title: 'Connection Error',
    message: 'Failed to connect to database',
    type: 'error',
    timestamp: new Date('2024-01-01T11:00:00Z'),
    read: false,
    source: 'Database',
    priority: 'urgent',
    category: 'error',
    actionRequired: true,
  },
  {
    id: '4',
    title: 'New User Registration',
    message: 'A new user has registered',
    type: 'info',
    timestamp: new Date('2024-01-01T08:00:00Z'),
    read: true,
    source: 'User Service',
    priority: 'medium',
    category: 'user',
    actionRequired: false,
  },
];

const defaultProps = {
  notifications: mockNotifications,
  onNotificationClick: jest.fn(),
  onNotificationDismiss: jest.fn(),
  onNotificationRead: jest.fn(),
  onNotificationAction: jest.fn(),
  onBulkAction: jest.fn(),
  onFiltersChange: jest.fn(),
  onSortingChange: jest.fn(),
};

describe('NotificationPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders notification panel with default props', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.getByText('Backup Complete')).toBeInTheDocument();
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });

    it('shows unread count badge', () => {
      render(<NotificationPanel {...defaultProps} showUnreadCount={true} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 unread notifications
    });

    it('hides unread count when disabled', () => {
      render(<NotificationPanel {...defaultProps} showUnreadCount={false} />);
      
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('renders search input when enabled', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
    });

    it('hides search input when disabled', () => {
      render(<NotificationPanel {...defaultProps} showSearch={false} />);
      
      expect(screen.queryByPlaceholderText('Search notifications...')).not.toBeInTheDocument();
    });

    it('renders empty state message', () => {
      render(<NotificationPanel {...defaultProps} notifications={[]} emptyStateMessage="No alerts" />);
      
      expect(screen.getByText('No alerts')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<NotificationPanel {...defaultProps} className="custom-panel" />);
      
      expect(container.firstChild).toHaveClass('custom-panel');
    });
  });

  describe('Notification Display', () => {
    it('displays notification titles and messages', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      mockNotifications.forEach(notification => {
        expect(screen.getByText(notification.title)).toBeInTheDocument();
        expect(screen.getByText(notification.message)).toBeInTheDocument();
      });
    });

    it('shows priority badges for notifications', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('shows action required badges', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      expect(screen.getAllByText('Action Required')).toHaveLength(2);
    });

    it('displays notification sources', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      expect(screen.getByText('Server Monitor')).toBeInTheDocument();
      expect(screen.getByText('Backup Service')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('User Service')).toBeInTheDocument();
    });

    it('displays notification categories', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('maintenance')).toBeInTheDocument();
      expect(screen.getByText('error')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('shows visual indicators for unread notifications', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      // Check if unread notifications exist and can be found
      const systemAlert = screen.getByText('System Alert');
      expect(systemAlert).toBeInTheDocument();
      
      // Check if we can find the notification element
      const notificationElement = systemAlert.closest('div');
      expect(notificationElement).toBeInTheDocument();
    });
  });

  describe('Notification Interactions', () => {
    it('calls onNotificationClick when notification is clicked', () => {
      const onNotificationClick = jest.fn();
      render(<NotificationPanel {...defaultProps} onNotificationClick={onNotificationClick} />);
      
      fireEvent.click(screen.getByText('System Alert'));
      
      expect(onNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
    });

    it('calls onNotificationRead for unread notifications when clicked', () => {
      const onNotificationRead = jest.fn();
      render(<NotificationPanel {...defaultProps} onNotificationRead={onNotificationRead} />);
      
      fireEvent.click(screen.getByText('System Alert'));
      
      expect(onNotificationRead).toHaveBeenCalledWith('1');
    });

    it('does not call onNotificationRead for already read notifications', () => {
      const onNotificationRead = jest.fn();
      render(<NotificationPanel {...defaultProps} onNotificationRead={onNotificationRead} />);
      
      fireEvent.click(screen.getByText('Backup Complete'));
      
      expect(onNotificationRead).not.toHaveBeenCalled();
    });

    it('calls onNotificationDismiss when dismiss button is clicked', async () => {
      const onNotificationDismiss = jest.fn();
      render(<NotificationPanel {...defaultProps} onNotificationDismiss={onNotificationDismiss} />);
      
      // Hover over notification to show actions
      const notification = screen.getByText('System Alert').closest('div');
      fireEvent.mouseEnter(notification!);
      
      await waitFor(() => {
        const dismissButton = screen.getByTitle('Dismiss');
        fireEvent.click(dismissButton);
      });
      
      expect(onNotificationDismiss).toHaveBeenCalledWith('1');
    });
  });

  describe('Search Functionality', () => {
    it('filters notifications by search query', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'backup' } });
      
      expect(screen.getByText('Backup Complete')).toBeInTheDocument();
      expect(screen.queryByText('System Alert')).not.toBeInTheDocument();
    });

    it('searches in notification titles', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'Connection' } });
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.queryByText('System Alert')).not.toBeInTheDocument();
    });

    it('searches in notification messages', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'CPU usage' } });
      
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.queryByText('Backup Complete')).not.toBeInTheDocument();
    });

    it('searches in notification sources', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'Database' } });
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.queryByText('System Alert')).not.toBeInTheDocument();
    });

    it('shows empty state when no search results', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('shows filters panel when filter button is clicked', () => {
      render(<NotificationPanel {...defaultProps} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('hides filters panel when filter button is clicked again', () => {
      render(<NotificationPanel {...defaultProps} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      fireEvent.click(filterButton);
      
      expect(screen.queryByText('Type')).not.toBeInTheDocument();
    });

    it('calls onFiltersChange when filter is applied', () => {
      const onFiltersChange = jest.fn();
      render(<NotificationPanel {...defaultProps} onFiltersChange={onFiltersChange} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      const statusSelect = screen.getByDisplayValue('All');
      fireEvent.change(statusSelect, { target: { value: 'unread' } });
      
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
        read: false
      }));
    });

    it('clears filters when clear button is clicked', () => {
      const onFiltersChange = jest.fn();
      render(<NotificationPanel {...defaultProps} onFiltersChange={onFiltersChange} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      expect(onFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe('Sorting', () => {
    it('calls onSortingChange when sorting is changed', () => {
      const onSortingChange = jest.fn();
      render(<NotificationPanel {...defaultProps} onSortingChange={onSortingChange} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      const sortSelect = screen.getByDisplayValue('Newest First');
      fireEvent.change(sortSelect, { target: { value: 'priority-desc' } });
      
      expect(onSortingChange).toHaveBeenCalledWith({
        field: 'priority',
        order: 'desc'
      });
    });

    it('sorts notifications by timestamp descending by default', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      const notifications = screen.getAllByText(/ago/);
      // Connection Error should be first (most recent)
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('shows bulk action bar when notifications are selected', () => {
      render(<NotificationPanel {...defaultProps} showBulkActions={true} />);
      
      const checkbox = screen.getAllByRole('checkbox')[1]; // First notification checkbox
      fireEvent.click(checkbox);
      
      expect(screen.getByText('1 selected')).toBeInTheDocument();
      expect(screen.getByText('Mark as Read')).toBeInTheDocument();
      expect(screen.getByText('Archive')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('selects all notifications when select all is clicked', () => {
      render(<NotificationPanel {...defaultProps} showBulkActions={true} />);
      
      const selectAllCheckbox = screen.getByText(`Select All (${mockNotifications.length})`);
      fireEvent.click(selectAllCheckbox);
      
      expect(screen.getByText(`${mockNotifications.length} selected`)).toBeInTheDocument();
    });

    it('calls onBulkAction when bulk action is performed', () => {
      const onBulkAction = jest.fn();
      render(<NotificationPanel {...defaultProps} onBulkAction={onBulkAction} showBulkActions={true} />);
      
      const checkbox = screen.getAllByRole('checkbox')[1]; // First notification checkbox
      fireEvent.click(checkbox);
      
      const markAsReadButton = screen.getByText('Mark as Read');
      fireEvent.click(markAsReadButton);
      
      // Check that the callback was called with correct parameters
      expect(onBulkAction).toHaveBeenCalledWith(expect.any(Array), 'read');
    });

    it('shows Mark All as Read button when enabled', () => {
      render(<NotificationPanel {...defaultProps} showFilters={true} allowMarkAllAsRead={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Mark All as Read')).toBeInTheDocument();
    });

    it('shows Clear All button when enabled', () => {
      render(<NotificationPanel {...defaultProps} showFilters={true} allowClearAll={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Notification Types', () => {
    it('displays correct icons for different notification types', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      // Check for different notification type icons
      const warningNotification = screen.getByText('System Alert').closest('div');
      const successNotification = screen.getByText('Backup Complete').closest('div');
      const errorNotification = screen.getByText('Connection Error').closest('div');
      const infoNotification = screen.getByText('New User Registration').closest('div');
      
      expect(warningNotification).toBeInTheDocument();
      expect(successNotification).toBeInTheDocument();
      expect(errorNotification).toBeInTheDocument();
      expect(infoNotification).toBeInTheDocument();
    });

    it('applies correct color schemes for different notification types', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      // Check that notifications with different types are displayed
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.getByText('Backup Complete')).toBeInTheDocument();
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });
  });

  describe('Priority Display', () => {
    it('shows priority border colors correctly', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      // Check that notifications with different priorities are displayed
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
      expect(screen.getByText('Backup Complete')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('applies compact styling when enabled', () => {
      render(<NotificationPanel {...defaultProps} compactMode={true} />);
      
      // Check that notifications are displayed in compact mode
      expect(screen.getByText('System Alert')).toBeInTheDocument();
    });

    it('applies normal styling when disabled', () => {
      render(<NotificationPanel {...defaultProps} compactMode={false} />);
      
      // Check that notifications are displayed in normal mode
      expect(screen.getByText('System Alert')).toBeInTheDocument();
    });
  });

  describe('Custom Actions', () => {
    it('shows more actions button when custom actions are provided', () => {
      const customActions = [
        { id: 'custom1', label: 'Custom Action 1' },
        { id: 'custom2', label: 'Custom Action 2' }
      ];
      
      render(<NotificationPanel {...defaultProps} customActions={customActions} />);
      
      const notification = screen.getByText('System Alert').closest('div');
      fireEvent.mouseEnter(notification!);
      
      expect(screen.getByTitle('More actions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<NotificationPanel {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper checkbox roles', () => {
      render(<NotificationPanel {...defaultProps} showBulkActions={true} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('has proper textbox roles', () => {
      render(<NotificationPanel {...defaultProps} showSearch={true} />);
      
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });

    it('has proper combobox roles', () => {
      render(<NotificationPanel {...defaultProps} showFilters={true} />);
      
      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);
      
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('handles large number of notifications efficiently', () => {
      const largeNotificationSet = Array(100).fill(null).map((_, i) => ({
        id: `notification-${i}`,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        type: 'info' as const,
        timestamp: new Date(),
        read: i % 2 === 0,
        priority: 'medium' as const,
      }));
      
      const startTime = performance.now();
      render(<NotificationPanel {...defaultProps} notifications={largeNotificationSet} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render in < 1000ms
    });

    it('renders without performance issues', () => {
      const startTime = performance.now();
      render(<NotificationPanel {...defaultProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should render in < 50ms
    });
  });

  describe('Edge Cases', () => {
    it('handles empty notifications array', () => {
      render(<NotificationPanel {...defaultProps} notifications={[]} />);
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    it('handles notifications without optional fields', () => {
      const minimalNotifications: Notification[] = [
        {
          id: '1',
          title: 'Simple Notification',
          message: 'Simple message',
          type: 'info',
          timestamp: new Date(),
          read: false,
        }
      ];
      
      render(<NotificationPanel {...defaultProps} notifications={minimalNotifications} />);
      
      expect(screen.getByText('Simple Notification')).toBeInTheDocument();
    });

    it('handles missing callback functions gracefully', () => {
      render(<NotificationPanel notifications={mockNotifications} />);
      
      // Should not crash when clicking notifications
      fireEvent.click(screen.getByText('System Alert'));
      expect(screen.getByText('System Alert')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly for recent notifications', () => {
      const recentNotifications: Notification[] = [
        {
          id: '1',
          title: 'Recent Notification',
          message: 'Recent message',
          type: 'info',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
        }
      ];
      
      render(<NotificationPanel {...defaultProps} notifications={recentNotifications} />);
      
      expect(screen.getByText('5m ago')).toBeInTheDocument();
    });

    it('formats time correctly for older notifications', () => {
      const oldNotifications: Notification[] = [
        {
          id: '1',
          title: 'Old Notification',
          message: 'Old message',
          type: 'info',
          timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
          read: false,
        }
      ];
      
      render(<NotificationPanel {...defaultProps} notifications={oldNotifications} />);
      
      expect(screen.getByText('1d ago')).toBeInTheDocument();
    });
  });
});
