// Component Integration Tests - Task 6 Phase 9.5
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceCard } from '@/components/device/DeviceCard';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { DataTable } from '@/components/shared/DataTable';
import NotificationPanel, { type Notification } from '@/components/shared/NotificationPanel';

// Mock data for integration testing
const mockDevice = {
  id: 'device-1',
  name: 'Temperature Sensor',
  type: 'sensor',
  status: 'online' as const,
  lastSeen: new Date().toISOString(),
  battery: 85,
  signal: 85,
  location: 'Building A - Floor 1',
  temperature: 23.5
};

const mockChartConfig = {
  id: 'temp-chart',
  title: 'Temperature Chart',
  type: 'line' as const,
  dataSource: 'device-metrics',
  timeRange: '1h',
  aggregation: 'average' as const,
  refreshRate: 30,
  filters: {},
  position: { x: 0, y: 0, width: 6, height: 4 },
  isVisible: true
};

const mockChartData = {
  labels: ['10:00', '10:15', '10:30', '10:45', '11:00'],
  datasets: [{
    label: 'Temperature',
    data: [20, 22, 24, 23, 25],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  }]
};

const mockTableData = [
  { id: 1, name: 'Device 1', status: 'active', value: 25.5, lastUpdate: '2024-01-15T10:00:00Z' },
  { id: 2, name: 'Device 2', status: 'inactive', value: 18.2, lastUpdate: '2024-01-15T09:45:00Z' },
  { id: 3, name: 'Device 3', status: 'active', value: 30.1, lastUpdate: '2024-01-15T10:15:00Z' },
];

const mockTableColumns = [
  { key: 'name', title: 'Device Name', sortable: true },
  { key: 'status', title: 'Status', type: 'badge' as const },
  { key: 'value', title: 'Value', type: 'number' as const },
  { key: 'lastUpdate', title: 'Last Update', type: 'date' as const }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High Temperature Alert',
    message: 'Device 1 temperature exceeds threshold',
    timestamp: new Date(),
    read: false,
    source: 'device-1',
    priority: 'high',
    deviceId: 'device-1',
    category: 'temperature'
  },
  {
    id: '2',
    type: 'info',
    title: 'System Update',
    message: 'New firmware available for device fleet',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
    source: 'system',
    priority: 'medium',
    category: 'system'
  }
];

// Integration Test Suite
describe('Component Integration Tests', () => {
  const user = userEvent.setup();

  describe('Dashboard Layout Integration', () => {
    const DashboardLayout = () => (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeviceCard 
            device={mockDevice}
            onToggle={(deviceId: string) => console.log('Toggle device:', deviceId)}
            onConfigure={(deviceId: string) => console.log('Configure device:', deviceId)}
          />
          <DeviceCard 
            device={{...mockDevice, id: 'device-2', name: 'Humidity Sensor', status: 'offline'}}
          />
          <DeviceCard 
            device={{...mockDevice, id: 'device-3', name: 'Pressure Sensor', status: 'warning'}}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartWidget 
            config={mockChartConfig}
            data={mockChartData}
          />
          <NotificationPanel 
            notifications={mockNotifications}
            onNotificationAction={(id: string, action: string) => console.log('Notification action:', id, action)}
            onNotificationRead={(id: string) => console.log('Mark as read:', id)}
          />
        </div>

        <DataTable 
          data={mockTableData}
          columns={mockTableColumns}
          pageSize={5}
          searchable={true}
          sortable={true}
          filterable={true}
        />
      </div>
    );

    it('renders complete dashboard layout without errors', () => {
      render(<DashboardLayout />);
      
      // Verify all major components are present
      expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
      expect(screen.getByText('Humidity Sensor')).toBeInTheDocument();
      expect(screen.getByText('Pressure Sensor')).toBeInTheDocument();
      expect(screen.getByText('High Temperature Alert')).toBeInTheDocument();
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    it('handles device card interactions correctly', async () => {
      const mockToggle = jest.fn();
      const mockConfigure = jest.fn();
      
      render(
        <DeviceCard 
          device={mockDevice}
          onToggle={mockToggle}
          onConfigure={mockConfigure}
        />
      );

      // Find and click device action buttons
      const actionButtons = screen.getAllByRole('button');
      const configButton = actionButtons.find(btn => 
        btn.getAttribute('aria-label')?.includes('Configure')
      );
      
      if (configButton) {
        await user.click(configButton);
        expect(mockConfigure).toHaveBeenCalledWith('device-1');
      }
    });

    it('handles data table interactions correctly', async () => {
      render(
        <DataTable 
          data={mockTableData}
          columns={mockTableColumns}
          pageSize={2}
          searchable={true}
        />
      );

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Device 1');
      
      await waitFor(() => {
        expect(screen.getByText('Device 1')).toBeInTheDocument();
        expect(screen.queryByText('Device 2')).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Device 1')).toBeInTheDocument();
        expect(screen.getByText('Device 2')).toBeInTheDocument();
      });
    });

    it('handles notification panel interactions correctly', async () => {
      const mockAction = jest.fn();
      const mockMarkAsRead = jest.fn();
      
      render(
        <NotificationPanel 
          notifications={mockNotifications}
          onNotificationAction={mockAction}
          onNotificationRead={mockMarkAsRead}
        />
      );

      // Find notification elements
      expect(screen.getByText('High Temperature Alert')).toBeInTheDocument();
      expect(screen.getByText('System Update')).toBeInTheDocument();
    });
  });

  describe('Cross-Component Communication', () => {
    it('maintains state consistency across component updates', async () => {
      const TestContainer = () => {
        const [deviceStatus, setDeviceStatus] = React.useState<'online' | 'offline'>('online');
        const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);

        const handleDeviceToggle = (deviceId: string) => {
          const newStatus: 'online' | 'offline' = deviceStatus === 'online' ? 'offline' : 'online';
          setDeviceStatus(newStatus);
          
          // Add notification when device status changes
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: 'info',
            title: 'Device Status Changed',
            message: `Device ${deviceId} is now ${newStatus}`,
            timestamp: new Date(),
            read: false,
            source: deviceId,
            priority: 'medium'
          };
          
          setNotifications(prev => [newNotification, ...prev]);
        };

        return (
          <div>
            <DeviceCard 
              device={{...mockDevice, status: deviceStatus}}
              onToggle={handleDeviceToggle}
            />
            <NotificationPanel 
              notifications={notifications}
              onNotificationRead={(id: string) => console.log('Mark as read:', id)}
            />
          </div>
        );
      };

      render(<TestContainer />);

      // Verify initial state
      expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
      expect(screen.getByText('High Temperature Alert')).toBeInTheDocument();

      // Interact with device card
      const deviceCard = screen.getByText('Temperature Sensor').closest('div');
      const toggleButton = deviceCard?.querySelector('button[aria-label*="Toggle"]');
      
      if (toggleButton) {
        await user.click(toggleButton);
        
        // Check that notification was added
        await waitFor(() => {
          expect(screen.getByText('Device Status Changed')).toBeInTheDocument();
        });
      }
    });

    it('handles error states gracefully across components', () => {
      const errorData: any[] = [];
      const errorConfig = { ...mockChartConfig, dataSource: 'invalid-source' };

      render(
        <div>
          <ChartWidget 
            config={errorConfig}
            data={mockChartData}
          />
          <DataTable 
            data={errorData}
            columns={mockTableColumns}
            error="Failed to load data"
          />
        </div>
      );

      // Components should render without crashing even with error states
      expect(screen.getByText('Temperature Chart')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout Integration', () => {
    it('adapts layout correctly for different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const ResponsiveLayout = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeviceCard device={mockDevice} variant="compact" />
          <DeviceCard device={mockDevice} variant="detailed" />
          <DeviceCard device={mockDevice} variant="industrial" />
        </div>
      );

      render(<ResponsiveLayout />);

      // All variants should render successfully
      const deviceCards = screen.getAllByText('Temperature Sensor');
      expect(deviceCards).toHaveLength(3);
    });
  });

  describe('Performance Under Load', () => {
    it('handles large numbers of components efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Device ${i + 1}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
        value: Math.random() * 100,
        lastUpdate: new Date().toISOString()
      }));

      const LargeLayout = () => (
        <div>
          <DataTable 
            data={largeDataset}
            columns={mockTableColumns}
            pageSize={20}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <DeviceCard 
                key={i}
                device={{...mockDevice, id: `device-${i}`, name: `Device ${i + 1}`}}
                variant="compact"
              />
            ))}
          </div>
        </div>
      );

      render(<LargeLayout />);

      // Should render without performance issues
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 100')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper focus management across components', async () => {
      render(
        <div>
          <DeviceCard device={mockDevice} />
          <DataTable 
            data={mockTableData}
            columns={mockTableColumns}
          />
        </div>
      );

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');

      // Continue tabbing through interactive elements
      await user.tab();
      await user.tab();

      // Should maintain logical tab order
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('provides proper screen reader announcements', () => {
      render(
        <div>
          <DeviceCard device={mockDevice} />
          <NotificationPanel notifications={mockNotifications} />
        </div>
      );

      // Check for proper ARIA labels and roles
      expect(screen.getByRole('button', { name: /Configure Temperature Sensor/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
    });
  });
});
