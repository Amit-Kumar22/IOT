import type { Meta, StoryObj } from '@storybook/react';
import NotificationPanel from './NotificationPanel';
import type { Notification, NotificationFilters, NotificationSorting } from './NotificationPanel';

const meta: Meta<typeof NotificationPanel> = {
  title: 'Shared/NotificationPanel',
  component: NotificationPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive notification panel with filtering, sorting, and management capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showSearch: {
      control: { type: 'boolean' },
      description: 'Show search functionality',
    },
    showFilters: {
      control: { type: 'boolean' },
      description: 'Show filter options',
    },
    showBulkActions: {
      control: { type: 'boolean' },
      description: 'Show bulk action options',
    },
    maxHeight: {
      control: { type: 'number' },
      description: 'Maximum height of the panel in pixels',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Motion Detected',
    message: 'Motion detected at front door camera',
    type: 'info',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    source: 'Security System',
    priority: 'medium',
    actionRequired: true,
    deviceId: 'camera-001',
    category: 'security',
  },
  {
    id: '2',
    title: 'Temperature Alert',
    message: 'Living room temperature has exceeded 25°C',
    type: 'warning',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    source: 'Climate Control',
    priority: 'high',
    actionRequired: false,
    deviceId: 'thermostat-001',
    category: 'climate',
  },
  {
    id: '3',
    title: 'Device Offline',
    message: 'Kitchen smart plug has gone offline',
    type: 'error',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    source: 'Device Manager',
    priority: 'urgent',
    actionRequired: true,
    deviceId: 'plug-003',
    category: 'device',
  },
  {
    id: '4',
    title: 'Energy Report',
    message: 'Weekly energy consumption report is ready',
    type: 'success',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
    source: 'Energy Monitor',
    priority: 'low',
    actionRequired: false,
    category: 'energy',
  },
  {
    id: '5',
    title: 'System Update',
    message: 'IoT platform updated to version 2.1.0',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    source: 'System',
    priority: 'low',
    actionRequired: false,
    category: 'system',
  },
];

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    showSearch: true,
    showFilters: true,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const WithoutSearch: Story = {
  args: {
    notifications: mockNotifications,
    showSearch: false,
    showFilters: true,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const WithoutFilters: Story = {
  args: {
    notifications: mockNotifications,
    showSearch: true,
    showFilters: false,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const ReadOnly: Story = {
  args: {
    notifications: mockNotifications,
    showSearch: true,
    showFilters: true,
    showBulkActions: false,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
  },
};

export const EmptyState: Story = {
  args: {
    notifications: [],
    showSearch: true,
    showFilters: true,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const OnlyUnread: Story = {
  args: {
    notifications: mockNotifications.filter(n => !n.read),
    showSearch: true,
    showFilters: true,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const HighPriority: Story = {
  args: {
    notifications: mockNotifications.filter(n => n.priority === 'high' || n.priority === 'urgent'),
    showSearch: true,
    showFilters: true,
    showBulkActions: true,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};

export const CompactHeight: Story = {
  args: {
    notifications: mockNotifications,
    showSearch: true,
    showFilters: true,
    showBulkActions: true,
    maxHeight: 300,
    onNotificationClick: (notification: Notification) => console.log('Notification clicked:', notification.id),
    onNotificationDismiss: (id: string) => console.log('Notification dismissed:', id),
    onNotificationRead: (id: string) => console.log('Marked as read:', id),
    onBulkAction: (ids: string[], action: string) => console.log('Bulk action:', action, ids),
  },
};
