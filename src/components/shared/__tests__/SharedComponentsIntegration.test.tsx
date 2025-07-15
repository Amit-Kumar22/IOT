import { render, screen } from '@testing-library/react';
import { DeviceCard } from '../DeviceCard';
import { ChartWidget } from '../../charts/ChartWidget';
import { DataTable } from '../DataTable';
import NotificationPanel from '../NotificationPanel';
import { ChartConfig, ChartData } from '../../../types/analytics';

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Shared Components Integration', () => {
  const mockDevice = {
    id: '1',
    name: 'Test Device',
    type: 'thermostat' as const,
    status: 'online' as const,
    location: 'Test Location',
    batteryLevel: 85,
    lastSeen: new Date(),
    temperature: 72,
    humidity: 45,
    energyUsage: 1.2,
    isConnected: true,
    signalStrength: 85,
    isControllable: true,
    firmware: '1.0.0',
    serialNumber: 'TEST001',
    model: 'Test Model',
    manufacturer: 'Test Manufacturer',
    capabilities: ['temperature_control'],
    metadata: {
      installDate: '2024-01-01',
      warrantyExpiry: '2026-01-01',
      maintenanceSchedule: 'Monthly'
    }
  };

  const mockChartConfig: ChartConfig = {
    id: 'test-chart',
    type: 'line',
    title: 'Test Chart',
    dataSource: 'test-data',
    timeRange: '24h',
    aggregation: 'average',
    refreshRate: 30,
    position: { x: 0, y: 0, width: 6, height: 4 },
    isVisible: true
  };

  const mockChartData: ChartData = {
    labels: ['Jan', 'Feb'],
    datasets: [
      {
        label: 'Series 1',
        data: [100, 200],
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Series 2',
        data: [150, 250],
        borderColor: '#10B981',
        backgroundColor: '#10B981'
      }
    ]
  };

  const mockTableData = [
    { id: '1', name: 'Test', status: 'online' }
  ];

  const mockTableColumns = [
    { key: 'name', title: 'Name' },
    { key: 'status', title: 'Status' }
  ];

  const mockNotifications = [
    {
      id: '1',
      title: 'Test Notification',
      message: 'Test message',
      type: 'info' as const,
      timestamp: new Date(),
      read: false,
      priority: 'medium' as const,
      source: 'system',
      category: 'test'
    }
  ];

  describe('Component Rendering', () => {
    it('renders DeviceCard component successfully', () => {
      render(<DeviceCard device={mockDevice} />);
      expect(screen.getAllByText('Test Device')[0]).toBeInTheDocument();
    });

    it('renders ChartWidget component successfully', () => {
      render(
        <ChartWidget
          config={mockChartConfig}
          data={mockChartData}
        />
      );
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('renders DataTable component successfully', () => {
      render(
        <DataTable
          data={mockTableData}
          columns={mockTableColumns}
        />
      );
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders NotificationPanel component successfully', () => {
      render(
        <NotificationPanel
          notifications={mockNotifications}
          showSearch
          showUnreadCount
        />
      );
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  describe('Component Accessibility', () => {
    it('DeviceCard has proper accessibility attributes', () => {
      render(<DeviceCard device={mockDevice} />);
      
      // Check for proper ARIA attributes
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toBeInTheDocument();
      expect(deviceCard).toHaveAttribute('aria-label');
    });

    it('ChartWidget has proper accessibility attributes', () => {
      render(
        <ChartWidget
          config={mockChartConfig}
          data={mockChartData}
        />
      );
      
      // Check for proper chart accessibility
      const chartContainer = screen.getByLabelText('Chart: Test Chart');
      expect(chartContainer).toBeInTheDocument();
    });

    it('DataTable has proper accessibility attributes', () => {
      render(
        <DataTable
          data={mockTableData}
          columns={mockTableColumns}
        />
      );
      
      // Check for proper table accessibility
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('aria-label');
    });

    it('NotificationPanel has proper accessibility attributes', () => {
      render(
        <NotificationPanel
          notifications={mockNotifications}
          showSearch
          showUnreadCount
        />
      );
      
      // Check for proper notification panel accessibility
      const notificationPanel = screen.getByRole('region');
      expect(notificationPanel).toBeInTheDocument();
      expect(notificationPanel).toHaveAttribute('aria-label');
    });
  });

  describe('Component Error Handling', () => {
    it('handles empty data gracefully', () => {
      // Test with empty data
      render(<DataTable data={[]} columns={mockTableColumns} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles invalid chart data gracefully', () => {
      const emptyConfig: ChartConfig = {
        ...mockChartConfig,
        title: 'Empty Chart'
      };
      
      const emptyData: ChartData = {
        labels: [],
        datasets: []
      };
      
      render(
        <ChartWidget
          config={emptyConfig}
          data={emptyData}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles empty notifications gracefully', () => {
      render(
        <NotificationPanel
          notifications={[]}
          showSearch
          showUnreadCount
        />
      );
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('Component Performance', () => {
    it('renders large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Item ${i}`,
        status: 'online'
      }));

      const startTime = performance.now();
      render(
        <DataTable
          data={largeDataset}
          columns={mockTableColumns}
        />
      );
      const endTime = performance.now();

      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles large chart datasets efficiently', () => {
      const largeChartData: ChartData = {
        labels: Array.from({ length: 1000 }, (_, i) => `Point ${i}`),
        datasets: [{
          label: 'Large Dataset',
          data: Array.from({ length: 1000 }, () => Math.random() * 100),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6'
        }]
      };

      const startTime = performance.now();
      render(
        <ChartWidget
          config={{
            ...mockChartConfig,
            title: 'Large Dataset Chart'
          }}
          data={largeChartData}
        />
      );
      const endTime = performance.now();

      // Should render in less than 200ms
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Component TypeScript Integration', () => {
    it('enforces proper TypeScript types', () => {
      // This test ensures TypeScript compilation works correctly
      expect(() => {
        // Valid props should not throw
        render(<DeviceCard device={mockDevice} />);
      }).not.toThrow();
    });

    it('validates component prop interfaces', () => {
      // Test interface validation
      expect(() => {
        render(
          <ChartWidget
            config={mockChartConfig}
            data={mockChartData}
          />
        );
      }).not.toThrow();
    });
  });
});

describe('Component Integration Summary', () => {
  it('verifies core components are properly exported', () => {
    // Verify all components can be imported
    expect(DeviceCard).toBeDefined();
    expect(ChartWidget).toBeDefined();
    expect(DataTable).toBeDefined();
    expect(NotificationPanel).toBeDefined();
  });

  it('confirms component library completeness', () => {
    const expectedComponents = [
      DeviceCard,
      ChartWidget, 
      DataTable,
      NotificationPanel
    ];

    expectedComponents.forEach(component => {
      expect(component).toBeDefined();
    });
  });
});
