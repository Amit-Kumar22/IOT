// Comprehensive Performance Tests - Task 6 Phase 9.4
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeviceCard } from '../../shared/DeviceCard';
import { ChartWidget } from '../../shared/ChartWidget';
import { DataTable } from '../../shared/DataTable';
import { 
  benchmarkComponent,
  generatePerformanceReport,
  IOT_COMPONENT_BUDGETS,
  performanceTest,
  measureRenderPerformance,
  measureInteractionLatency,
  ComponentBenchmark
} from '../../../lib/test-utils/performance';
import { Device, ChartDataPoint, DataTableColumn } from '../../../types/shared-components';

// Mock data for performance testing
const mockDevice: Device = {
  id: 'perf-device-1',
  name: 'Performance Test Device',
  type: 'sensor',
  status: 'online',
  batteryLevel: 85,
  signalStrength: 0.9,
  lastSeen: new Date(),
  isControllable: true
};

const mockChartConfig = {
  responsive: true,
  showLegend: true,
  animations: true
};

const mockChartData: ChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
  label: `Point ${i + 1}`,
  value: Math.random() * 100,
  timestamp: new Date(Date.now() - i * 60000)
}));

const mockTableData = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i + 1}`,
  type: i % 3 === 0 ? 'sensor' : i % 3 === 1 ? 'actuator' : 'controller',
  status: i % 4 === 0 ? 'offline' : 'online',
  value: Math.random() * 100,
  lastUpdate: new Date(Date.now() - Math.random() * 86400000)
}));

const mockTableColumns: DataTableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'type', title: 'Type', sortable: true },
  { key: 'status', title: 'Status', sortable: true },
  { key: 'value', title: 'Value', sortable: true },
  { key: 'lastUpdate', title: 'Last Update', sortable: true }
];

// Mock window.performance.memory for testing environments
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

describe('Component Performance Benchmarks', () => {
  let performanceBenchmarks: ComponentBenchmark[] = [];

  beforeAll(() => {
    // Warm up the performance APIs
    performance.mark('test-start');
  });

  afterAll(() => {
    // Generate comprehensive performance report
    const report = generatePerformanceReport(performanceBenchmarks);
    
    console.log('\n📊 PERFORMANCE BENCHMARK REPORT');
    console.log('=====================================');
    console.log(`Total Components Tested: ${report.summary.totalComponents}`);
    console.log(`Average Render Time: ${report.summary.averageRenderTime.toFixed(2)}ms`);
    console.log(`Average Memory Usage: ${report.summary.averageMemoryUsage.toFixed(2)}MB`);
    console.log(`Average Interaction Latency: ${report.summary.averageInteractionLatency.toFixed(2)}ms`);
    console.log(`Budget Compliance: ${report.summary.budgetCompliance.toFixed(1)}%`);
    
    console.log('\n📋 COMPONENT DETAILS:');
    report.details.forEach((detail: any) => {
      console.log(`\n🔸 ${detail.componentName}:`);
      console.log(`  Render: ${detail.metrics.renderTime.toFixed(2)}ms`);
      console.log(`  Memory: ${detail.metrics.memoryUsage.toFixed(2)}MB`);
      console.log(`  Interaction: ${detail.metrics.interactionLatency.toFixed(2)}ms`);
      console.log(`  Budget: ${detail.budgetValidation.passed ? '✅ PASS' : '❌ FAIL'}`);
      if (!detail.budgetValidation.passed) {
        detail.budgetValidation.violations.forEach((violation: any) => {
          console.log(`    ⚠️  ${violation}`);
        });
      }
    });
  });

  describe('DeviceCard Performance', () => {
    it('meets render performance budget', performanceTest(
      'DeviceCard render performance',
      async () => {
        const benchmark = await benchmarkComponent(
          'DeviceCard',
          () => render(<DeviceCard device={mockDevice} />),
          [
            // Test click interaction
            async () => {
              const { container } = render(<DeviceCard device={mockDevice} />);
              const card = container.firstChild as HTMLElement;
              if (card) {
                fireEvent.click(card);
              }
            }
          ]
        );
        
        performanceBenchmarks.push(benchmark);
        return benchmark;
      },
      IOT_COMPONENT_BUDGETS.DeviceCard
    ));

    it('handles multiple DeviceCards efficiently', async () => {
      const devices = Array.from({ length: 50 }, (_, i) => ({
        ...mockDevice,
        id: `device-${i}`,
        name: `Device ${i + 1}`
      }));

      const { renderTime } = await measureRenderPerformance(
        () => render(
          <div>
            {devices.map(device => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ),
        'MultipleDeviceCards'
      );

      // Should render 50 device cards in reasonable time
      expect(renderTime).toBeLessThan(500); // 500ms budget for 50 cards
    });
  });

  describe('ChartWidget Performance', () => {
    it('meets render performance budget', performanceTest(
      'ChartWidget render performance',
      async () => {
        const benchmark = await benchmarkComponent(
          'ChartWidget',
          () => render(
            <ChartWidget 
              title="Performance Test Chart"
              chartType="line"
              data={mockChartData}
              config={mockChartConfig}
            />
          ),
          [
            // Test chart interaction
            async () => {
              const { container } = render(
                <ChartWidget 
                  title="Performance Test Chart"
                  chartType="line"
                  data={mockChartData}
                  config={mockChartConfig}
                />
              );
              // Simulate hover interaction
              const chart = container.querySelector('[data-testid="chart-container"]');
              if (chart) {
                fireEvent.mouseEnter(chart);
                fireEvent.mouseLeave(chart);
              }
            }
          ]
        );
        
        performanceBenchmarks.push(benchmark);
        return benchmark;
      },
      IOT_COMPONENT_BUDGETS.ChartWidget
    ));

    it('handles large datasets efficiently', async () => {
      const largeDataset: ChartDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        label: `Point ${i + 1}`,
        value: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 60000)
      }));

      const { renderTime } = await measureRenderPerformance(
        () => render(
          <ChartWidget 
            title="Large Dataset Chart"
            chartType="line"
            data={largeDataset}
            config={mockChartConfig}
          />
        ),
        'ChartWidget_LargeDataset'
      );

      // Should handle 1000 data points within budget
      expect(renderTime).toBeLessThan(1000); // 1s budget for large dataset
    });
  });

  describe('DataTable Performance', () => {
    it('meets render performance budget', performanceTest(
      'DataTable render performance', 
      async () => {
        const benchmark = await benchmarkComponent(
          'DataTable',
          () => render(<DataTable data={mockTableData} columns={mockTableColumns} />),
          [
            // Test sorting interaction
            async () => {
              const { container } = render(<DataTable data={mockTableData} columns={mockTableColumns} />);
              const sortButton = container.querySelector('[role="button"]');
              if (sortButton) {
                fireEvent.click(sortButton);
              }
            },
            // Test search interaction
            async () => {
              const { container } = render(<DataTable data={mockTableData} columns={mockTableColumns} searchable />);
              const searchInput = container.querySelector('input[type="text"]');
              if (searchInput) {
                fireEvent.change(searchInput, { target: { value: 'Item 1' } });
              }
            }
          ]
        );
        
        performanceBenchmarks.push(benchmark);
        return benchmark;
      },
      IOT_COMPONENT_BUDGETS.DataTable
    ));

    it('handles pagination efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i + 1}`,
        value: Math.random() * 100
      }));

      const { renderTime } = await measureRenderPerformance(
        () => render(<DataTable data={largeDataset} columns={mockTableColumns} pageSize={50} />),
        'DataTable_Pagination'
      );

      // Should handle 1000 items with pagination efficiently
      expect(renderTime).toBeLessThan(300); // 300ms budget for paginated large dataset
    });
  });

  describe('Cross-Component Performance', () => {
    it('handles multiple components simultaneously', async () => {
      const { renderTime } = await measureRenderPerformance(
        () => render(
          <div>
            <DeviceCard device={mockDevice} />
            <ChartWidget 
              title="Performance Chart"
              chartType="line"
              data={mockChartData}
              config={mockChartConfig}
            />
            <DataTable data={mockTableData.slice(0, 10)} columns={mockTableColumns} />
          </div>
        ),
        'MultipleComponents'
      );

      // Should render all components together within reasonable time
      expect(renderTime).toBeLessThan(1000); // 1s budget for all components
    });

    it('measures interaction latency across components', async () => {
      const renderResult = render(
        <div>
          <DeviceCard device={mockDevice} />
          <DataTable data={mockTableData.slice(0, 10)} columns={mockTableColumns} />
        </div>
      );

      const avgLatency = await measureInteractionLatency(async () => {
        // Interact with DeviceCard
        const deviceCard = renderResult.container.querySelector('[role="article"]');
        if (deviceCard) {
          fireEvent.click(deviceCard);
        }

        // Interact with DataTable
        const sortButton = renderResult.container.querySelector('[role="button"]');
        if (sortButton) {
          fireEvent.click(sortButton);
        }
      }, 5);

      // Cross-component interactions should be fast
      expect(avgLatency).toBeLessThan(200); // 200ms budget for cross-component interactions
    });
  });

  describe('Memory Usage Optimization', () => {
    it('does not have memory leaks with component mount/unmount', async () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Mount and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<DeviceCard device={mockDevice} />);
        unmount();
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024); // Convert to MB

      // Memory growth should be minimal (or skip test in environments without memory API)
      if (performance.memory) {
        expect(memoryGrowth).toBeLessThan(5); // Less than 5MB growth acceptable
      } else {
        console.warn('Memory API not available, skipping memory leak test');
      }
    });
  });

  describe('Performance Regression Detection', () => {
    it('establishes baseline performance metrics', async () => {
      // This test establishes baseline metrics for future regression testing
      const baselineTests = [
        {
          name: 'DeviceCard',
          test: () => render(<DeviceCard device={mockDevice} />)
        },
        {
          name: 'ChartWidget',
          test: () => render(
            <ChartWidget 
              title="Baseline Chart"
              chartType="line"
              data={mockChartData.slice(0, 10)}
              config={mockChartConfig}
            />
          )
        },
        {
          name: 'DataTable',
          test: () => render(<DataTable data={mockTableData.slice(0, 20)} columns={mockTableColumns} />)
        }
      ];

      const baselines = await Promise.all(
        baselineTests.map(async ({ name, test }) => {
          const { renderTime } = await measureRenderPerformance(test, name);
          return { component: name, renderTime };
        })
      );

      console.log('\n📊 BASELINE PERFORMANCE METRICS:');
      baselines.forEach(({ component, renderTime }) => {
        console.log(`${component}: ${renderTime.toFixed(2)}ms`);
      });

      // All baseline tests should complete reasonably fast
      baselines.forEach(({ component, renderTime }) => {
        expect(renderTime).toBeLessThan(500); // 500ms max for any component
      });
    });
  });
});
