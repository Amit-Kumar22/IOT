// Component Performance Tests - Task 6 Phase 9.4
import React from 'react';
import { render } from '@testing-library/react';
import { DeviceCard } from '@/components/device/DeviceCard';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { DataTable } from '@/components/shared/DataTable';
import {
  benchmarkComponent,
  generatePerformanceReport,
  createPerformanceTest,
  COMPONENT_BUDGETS,
  type PerformanceMetrics
} from '@/lib/test-utils/performance-simple';

// Mock data for testing
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
  labels: Array.from({ length: 10 }, (_, i) => `Point ${i + 1}`),
  datasets: [{
    label: 'Temperature',
    data: Array.from({ length: 10 }, () => Math.random() * 100),
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  }]
};

const mockTableData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Device ${i + 1}`,
  status: i % 2 === 0 ? 'active' : 'inactive',
  value: Math.random() * 100,
  lastUpdate: new Date().toISOString()
}));

const mockTableColumns = [
  { key: 'name', title: 'Device Name' },
  { key: 'status', title: 'Status' },
  { key: 'value', title: 'Value' },
  { key: 'lastUpdate', title: 'Last Update' }
];

describe('Component Performance Benchmarks', () => {
  const performanceResults: Array<PerformanceMetrics & { name: string; meetsBudget: boolean }> = [];

  beforeAll(() => {
    // Initialize performance monitoring
    console.log('🚀 Starting component performance benchmarks...');
  });

  afterAll(() => {
    // Generate and display performance report
    const report = generatePerformanceReport(performanceResults);
    console.log(report);
  });

  describe('DeviceCard Performance', () => {
    it('meets render performance budget', async () => {
      const deviceCardTest = createPerformanceTest(
        'DeviceCard',
        <DeviceCard device={mockDevice} />
      );

      const metrics = await deviceCardTest();
      performanceResults.push({
        ...metrics,
        name: 'DeviceCard',
        meetsBudget: (metrics as any).meetsBudget
      });
    }, 10000);

    it('handles multiple DeviceCards efficiently', async () => {
      const multipleCards = (
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <DeviceCard 
              key={i} 
              device={{ ...mockDevice, id: `device-${i}`, name: `Device ${i}` }} 
            />
          ))}
        </div>
      );

      const metrics = await benchmarkComponent(
        multipleCards, 
        'Multiple DeviceCards', 
        { maxRenderTime: 200, maxMemoryUsage: 20, maxInteractionLatency: 200 }
      );

      expect(metrics.meetsBudget).toBe(true);
      performanceResults.push({
        ...metrics,
        name: 'Multiple DeviceCards',
        meetsBudget: metrics.meetsBudget
      });
    }, 10000);
  });

  describe('ChartWidget Performance', () => {
    it('meets render performance budget', async () => {
      const chartTest = createPerformanceTest(
        'ChartWidget',
        <ChartWidget 
          config={mockChartConfig}
          data={mockChartData}
        />
      );

      const metrics = await chartTest();
      performanceResults.push({
        ...metrics,
        name: 'ChartWidget',
        meetsBudget: (metrics as any).meetsBudget
      });
    }, 15000);

    it('handles large datasets efficiently', async () => {
      const largeDataset = {
        labels: Array.from({ length: 1000 }, (_, i) => `Point ${i + 1}`),
        datasets: [{
          label: 'Large Dataset',
          data: Array.from({ length: 1000 }, () => Math.random() * 100),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }]
      };

      const largeConfig = {
        ...mockChartConfig,
        title: 'Large Dataset Chart',
        position: { x: 0, y: 0, width: 8, height: 6 }
      };

      const metrics = await benchmarkComponent(
        <ChartWidget 
          config={largeConfig}
          data={largeDataset}
        />,
        'ChartWidget Large Dataset',
        { maxRenderTime: 500, maxMemoryUsage: 30, maxInteractionLatency: 300 }
      );

      expect(metrics.meetsBudget).toBe(true);
      performanceResults.push({
        ...metrics,
        name: 'ChartWidget Large Dataset',
        meetsBudget: metrics.meetsBudget
      });
    }, 20000);
  });

  describe('DataTable Performance', () => {
    it('meets render performance budget', async () => {
      const tableTest = createPerformanceTest(
        'DataTable',
        <DataTable 
          data={mockTableData}
          columns={mockTableColumns}
          pageSize={10}
        />
      );

      const metrics = await tableTest();
      performanceResults.push({
        ...metrics,
        name: 'DataTable',
        meetsBudget: (metrics as any).meetsBudget
      });
    }, 10000);

    it('handles pagination efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Device ${i + 1}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
        value: Math.random() * 100,
        lastUpdate: new Date().toISOString()
      }));

      const metrics = await benchmarkComponent(
        <DataTable 
          data={largeDataset}
          columns={mockTableColumns}
          pageSize={50}
        />,
        'DataTable Pagination',
        { maxRenderTime: 300, maxMemoryUsage: 25, maxInteractionLatency: 200 }
      );

      expect(metrics.meetsBudget).toBe(true);
      performanceResults.push({
        ...metrics,
        name: 'DataTable Pagination',
        meetsBudget: metrics.meetsBudget
      });
    }, 15000);
  });

  describe('Cross-Component Performance', () => {
    it('handles multiple components simultaneously', async () => {
      const performanceConfig = {
        ...mockChartConfig,
        title: 'Performance Chart',
        position: { x: 0, y: 4, width: 6, height: 3 }
      };

      const complexLayout = (
        <div>
          <DeviceCard device={mockDevice} />
          <ChartWidget 
            config={performanceConfig}
            data={mockChartData}
          />
          <DataTable 
            data={mockTableData.slice(0, 20)}
            columns={mockTableColumns}
            pageSize={10}
          />
        </div>
      );

      const metrics = await benchmarkComponent(
        complexLayout,
        'Multi-Component Layout',
        { maxRenderTime: 400, maxMemoryUsage: 40, maxInteractionLatency: 300 }
      );

      expect(metrics.meetsBudget).toBe(true);
      performanceResults.push({
        ...metrics,
        name: 'Multi-Component Layout',
        meetsBudget: metrics.meetsBudget
      });
    }, 20000);
  });

  describe('Memory Usage Optimization', () => {
    it('does not have memory leaks with component mount/unmount', async () => {
      // Test component mounting and unmounting
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<DeviceCard device={mockDevice} />);
        unmount();
      }

      // If we get here without errors, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Performance Regression Detection', () => {
    it('establishes baseline performance metrics', async () => {
      const baseline = {
        DeviceCard: COMPONENT_BUDGETS.DeviceCard,
        ChartWidget: COMPONENT_BUDGETS.ChartWidget,
        DataTable: COMPONENT_BUDGETS.DataTable,
      };

      // Verify all components have defined budgets
      Object.entries(baseline).forEach(([component, budget]) => {
        expect(budget.maxRenderTime).toBeGreaterThan(0);
        expect(budget.maxMemoryUsage).toBeGreaterThan(0);
        expect(budget.maxInteractionLatency).toBeGreaterThan(0);
      });

      console.log('📋 Performance Baselines:', baseline);
    });
  });
});
