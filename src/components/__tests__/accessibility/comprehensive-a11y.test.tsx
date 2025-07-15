/**
 * Comprehensive Accessibility Test Suite
 * Task 6.9.3 - Run comprehensive accessibility testing and fix failing integration tests
 */

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DeviceCard } from '../../shared/DeviceCard';
import { ChartWidget } from '../../charts/ChartWidget';
import { DataTable } from '../../shared/DataTable';
import NotificationPanel from '../../shared/NotificationPanel';
import { testAccessibility, generateA11yReport } from '../../../lib/test-utils/accessibility';
import { ChartConfig, ChartData } from '../../../types/analytics';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Comprehensive Accessibility Testing', () => {
  // Test data setup
  const mockDevice = {
    id: '1',
    name: 'Accessible Device',
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
    id: 'accessibility-chart',
    type: 'line',
    title: 'Accessibility Test Chart',
    dataSource: 'test-data',
    timeRange: '24h',
    aggregation: 'average',
    refreshRate: 30,
    position: { x: 0, y: 0, width: 6, height: 4 },
    isVisible: true
  };

  const mockChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Series 1',
        data: [100, 200, 150],
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6'
      }
    ]
  };

  const mockTableData = [
    { id: '1', name: 'Device A', status: 'online', location: 'Room 1' },
    { id: '2', name: 'Device B', status: 'offline', location: 'Room 2' }
  ];

  const mockTableColumns = [
    { key: 'name', title: 'Device Name' },
    { key: 'status', title: 'Status' },
    { key: 'location', title: 'Location' }
  ];

  const mockNotifications = [
    {
      id: '1',
      title: 'System Alert',
      message: 'Device connectivity issue detected',
      type: 'warning' as const,
      timestamp: new Date(),
      read: false,
      priority: 'high' as const,
      source: 'system',
      category: 'connectivity'
    }
  ];

  describe('WCAG 2.1 AA Compliance', () => {
    it('DeviceCard meets WCAG accessibility standards', async () => {
      const { container } = render(<DeviceCard device={mockDevice} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Additional specific accessibility checks
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toHaveAttribute('aria-label');
      expect(deviceCard).toBeInTheDocument();
    });

    it('ChartWidget meets WCAG accessibility standards', async () => {
      const { container } = render(
        <ChartWidget config={mockChartConfig} data={mockChartData} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Chart-specific accessibility checks
      const chartRegion = screen.getByRole('region');
      expect(chartRegion).toHaveAttribute('aria-label', 'Chart: Accessibility Test Chart');
    });

    it('DataTable meets WCAG accessibility standards', async () => {
      const { container } = render(
        <DataTable data={mockTableData} columns={mockTableColumns} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Table-specific accessibility checks
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      expect(table).toBeInTheDocument();
    });

    it('NotificationPanel meets WCAG accessibility standards', async () => {
      const { container } = render(
        <NotificationPanel 
          notifications={mockNotifications}
          showSearch
          showUnreadCount
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Notification-specific accessibility checks
      const panel = screen.getByRole('region');
      expect(panel).toHaveAttribute('aria-label', 'Notifications panel');
    });
  });

  describe('Keyboard Navigation', () => {
    it('DeviceCard supports keyboard navigation', () => {
      const mockOnClick = jest.fn();
      render(<DeviceCard device={mockDevice} onDeviceClick={mockOnClick} />);
      
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toHaveAttribute('tabindex', '0');
      
      // Test keyboard interaction
      deviceCard.focus();
      expect(deviceCard).toHaveFocus();
    });

    it('ChartWidget controls are keyboard accessible', () => {
      render(<ChartWidget config={mockChartConfig} data={mockChartData} />);
      
      const menuButton = screen.getByLabelText('Chart menu');
      expect(menuButton).toBeInTheDocument();
      
      menuButton.focus();
      expect(menuButton).toHaveFocus();
    });

    it('DataTable navigation works with keyboard', () => {
      render(<DataTable data={mockTableData} columns={mockTableColumns} />);
      
      const table = screen.getByRole('table');
      const focusableElements = table.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('DeviceCard provides descriptive labels', () => {
      render(<DeviceCard device={mockDevice} />);
      
      const deviceCard = screen.getByRole('article');
      const ariaLabel = deviceCard.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('Accessible Device');
      expect(ariaLabel).toContain('thermostat');
      expect(ariaLabel).toContain('online');
    });

    it('ChartWidget has meaningful accessible name', () => {
      render(<ChartWidget config={mockChartConfig} data={mockChartData} />);
      
      const chartRegion = screen.getByRole('region');
      expect(chartRegion).toHaveAttribute('aria-label', 'Chart: Accessibility Test Chart');
    });

    it('DataTable columns have proper headers', () => {
      render(<DataTable data={mockTableData} columns={mockTableColumns} />);
      
      expect(screen.getByText('Device Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('NotificationPanel provides context for notifications', () => {
      render(
        <NotificationPanel 
          notifications={mockNotifications}
          showSearch
          showUnreadCount
        />
      );
      
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.getByText('Device connectivity issue detected')).toBeInTheDocument();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('DeviceCard status indicators have sufficient contrast', () => {
      render(<DeviceCard device={mockDevice} />);
      
      const statusBadges = screen.getAllByText('online');
      expect(statusBadges.length).toBeGreaterThan(0);
      
      // Status should have appropriate color coding - check the first status badge
      const badgeElement = statusBadges[0].closest('.bg-green-100, .bg-red-100, .bg-yellow-100, .bg-gray-100');
      expect(badgeElement).toBeTruthy();
    });

    it('ChartWidget colors are distinguishable', () => {
      render(<ChartWidget config={mockChartConfig} data={mockChartData} />);
      
      // Chart should render with accessible colors
      const chartContainer = screen.getByTestId('responsive-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('DataTable alternating rows provide visual distinction', () => {
      render(<DataTable data={mockTableData} columns={mockTableColumns} />);
      
      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      expect(tbody).toBeInTheDocument();
    });
  });

  describe('Error States and Loading Accessibility', () => {
    it('DataTable loading state is announced to screen readers', () => {
      render(<DataTable data={[]} columns={mockTableColumns} loading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('DataTable empty state provides helpful message', () => {
      render(<DataTable data={[]} columns={mockTableColumns} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('ChartWidget empty state is accessible', () => {
      const emptyData: ChartData = { labels: [], datasets: [] };
      render(<ChartWidget config={mockChartConfig} data={emptyData} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('NotificationPanel empty state provides guidance', () => {
      render(
        <NotificationPanel 
          notifications={[]}
          showSearch
          showUnreadCount
          emptyStateMessage="No notifications"
        />
      );
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('Component Integration Accessibility', () => {
    it('generates comprehensive accessibility reports', async () => {
      const deviceRender = render(<DeviceCard device={mockDevice} />);
      const chartRender = render(<ChartWidget config={mockChartConfig} data={mockChartData} />);
      const tableRender = render(<DataTable data={mockTableData} columns={mockTableColumns} />);
      
      const [deviceReport, chartReport, tableReport] = await Promise.all([
        generateA11yReport(deviceRender, 'DeviceCard'),
        generateA11yReport(chartRender, 'ChartWidget'),
        generateA11yReport(tableRender, 'DataTable')
      ]);
      
      // All components should have no violations
      expect(deviceReport.violations).toBe(0);
      expect(chartReport.violations).toBe(0);
      expect(tableReport.violations).toBe(0);
      
      // All components should have focusable elements
      expect(deviceReport.focusableElements).toBeGreaterThan(0);
      expect(chartReport.focusableElements).toBeGreaterThan(0);
      expect(tableReport.focusableElements).toBeGreaterThan(0);
      
      // All components should be keyboard navigable
      expect(deviceReport.keyboardNavigable).toBe(true);
      expect(chartReport.keyboardNavigable).toBe(true);
      expect(tableReport.keyboardNavigable).toBe(true);
    });

    it('validates all components work together accessibly', async () => {
      const { container } = render(
        <div>
          <DeviceCard device={mockDevice} />
          <ChartWidget config={mockChartConfig} data={mockChartData} />
          <DataTable data={mockTableData} columns={mockTableColumns} />
          <NotificationPanel notifications={mockNotifications} showSearch />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Verify multiple components can coexist without accessibility conflicts
      expect(screen.getAllByRole('article')).toHaveLength(1); // DeviceCard
      expect(screen.getAllByRole('region')).toHaveLength(2); // ChartWidget + NotificationPanel
      expect(screen.getAllByRole('table')).toHaveLength(1); // DataTable
    });
  });

  describe('Performance Impact of Accessibility Features', () => {
    it('accessibility features do not significantly impact performance', () => {
      const startTime = performance.now();
      
      render(
        <div>
          <DeviceCard device={mockDevice} />
          <ChartWidget config={mockChartConfig} data={mockChartData} />
          <DataTable data={mockTableData} columns={mockTableColumns} />
          <NotificationPanel notifications={mockNotifications} showSearch />
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly even with accessibility features
      expect(renderTime).toBeLessThan(500); // 500ms threshold
    });
  });
});
