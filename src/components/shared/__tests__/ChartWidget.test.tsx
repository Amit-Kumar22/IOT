// Unit tests for ChartWidget component - Task 6 Phase 3
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartWidget } from '../ChartWidget';
import { ChartDataPoint } from '../../../types/shared-components';
import { CHART_COLORS } from '../../../lib/constants';

// Mock chart data for testing
const createMockChartData = (count: number = 5): ChartDataPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    label: `Point ${i + 1}`,
    value: Math.random() * 100,
    timestamp: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000),
    category: 'test',
    metadata: { index: i }
  }));
};

const mockChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    }
  }
};

describe('ChartWidget Component', () => {
  const mockOnRefresh = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnFullscreen = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders chart widget with title', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Test Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          testId="test-chart"
        />
      );

      expect(screen.getByTestId('test-chart')).toBeInTheDocument();
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(container.querySelector('.chart-container')).toBeInTheDocument();
    });

    it('renders chart with data points info', () => {
      const data = createMockChartData(8);
      const { container } = render(
        <ChartWidget
          title="Data Chart"
          data={data}
          chartType="bar"
          config={mockChartConfig}
          testId="data-chart"
        />
      );

      expect(screen.getByTestId('data-chart')).toBeInTheDocument();
      expect(screen.getByText('8 data points')).toBeInTheDocument();
      expect(screen.getByText('Data Points: 8')).toBeInTheDocument();
    });

    it('renders without optional props', () => {
      const data = createMockChartData(3);
      const { container } = render(
        <ChartWidget
          title="Simple Chart"
          data={data}
          chartType="pie"
          config={mockChartConfig}
          testId="simple-chart"
        />
      );

      expect(screen.getByTestId('simple-chart')).toBeInTheDocument();
      expect(screen.getByText('Simple Chart')).toBeInTheDocument();
    });
  });

  describe('Chart Types', () => {
    it('renders line chart correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Line Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          testId="line-chart"
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      // Check title in header
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Line Chart');
      
      expect(screen.getByText('Type: line')).toBeInTheDocument();
    });

    it('renders bar chart correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Bar Chart"
          data={data}
          chartType="bar"
          config={mockChartConfig}
          testId="bar-chart"
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      
      // Check title in header
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Bar Chart');
      
      expect(screen.getByText('Type: bar')).toBeInTheDocument();
    });

    it('renders pie chart correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Pie Chart"
          data={data}
          chartType="pie"
          config={mockChartConfig}
          testId="pie-chart"
        />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      
      // Check title in header
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Pie Chart');
      
      expect(screen.getByText('Type: pie')).toBeInTheDocument();
    });

    it('renders area chart correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Area Chart"
          data={data}
          chartType="area"
          config={mockChartConfig}
          testId="area-chart"
        />
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      
      // Check title in header
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Area Chart');
      
      expect(screen.getByText('Type: area')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('handles refresh button click', async () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Refreshable Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          onRefresh={mockOnRefresh}
          testId="refresh-chart"
        />
      );

      const refreshButton = container.querySelector('button[aria-label="Refresh chart"]');
      expect(refreshButton).toBeInTheDocument();
      
      if (refreshButton) {
        await userEvent.click(refreshButton);
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      }
    });

    it('handles export button click', async () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Exportable Chart"
          data={data}
          chartType="bar"
          config={mockChartConfig}
          onExport={mockOnExport}
          testId="export-chart"
        />
      );

      const exportButton = container.querySelector('button[aria-label="Export chart"]');
      expect(exportButton).toBeInTheDocument();
      
      if (exportButton) {
        await userEvent.click(exportButton);
        expect(mockOnExport).toHaveBeenCalledWith('png');
      }
    });

    it('handles fullscreen button click', async () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Fullscreen Chart"
          data={data}
          chartType="area"
          config={mockChartConfig}
          onFullscreen={mockOnFullscreen}
          testId="fullscreen-chart"
        />
      );

      const fullscreenButton = container.querySelector('button[aria-label="Toggle fullscreen"]');
      expect(fullscreenButton).toBeInTheDocument();
      
      if (fullscreenButton) {
        await userEvent.click(fullscreenButton);
        expect(mockOnFullscreen).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('Loading States', () => {
    it('displays loading state correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Loading Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          loading={true}
          testId="loading-chart"
        />
      );

      expect(screen.getByTestId('loading-chart')).toBeInTheDocument();
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
      
      // Loading spinner should be present
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables buttons during loading', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Loading Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          loading={true}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onFullscreen={mockOnFullscreen}
          testId="loading-buttons-chart"
        />
      );

      const refreshButton = container.querySelector('button[aria-label="Refresh chart"]');
      const exportButton = container.querySelector('button[aria-label="Export chart"]');
      const fullscreenButton = container.querySelector('button[aria-label="Toggle fullscreen"]');

      expect(refreshButton).toBeDisabled();
      expect(exportButton).toBeDisabled();
      expect(fullscreenButton).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('displays error state correctly', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Error Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          error="Failed to load chart data"
          testId="error-chart"
        />
      );

      expect(screen.getByTestId('error-chart')).toBeInTheDocument();
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    });

    it('does not render chart when error exists', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Error Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          error="Network error"
          testId="error-no-chart"
        />
      );

      expect(screen.getByTestId('error-no-chart')).toBeInTheDocument();
      expect(container.querySelector('.chart-container')).not.toBeInTheDocument();
    });
  });

  describe('Empty Data States', () => {
    it('displays no data state when data is empty', () => {
      const { container } = render(
        <ChartWidget
          title="Empty Chart"
          data={[]}
          chartType="line"
          config={mockChartConfig}
          testId="empty-chart"
        />
      );

      expect(screen.getByTestId('empty-chart')).toBeInTheDocument();
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText('Chart will appear when data is loaded')).toBeInTheDocument();
    });

    it('displays no data state when data is undefined', () => {
      const { container } = render(
        <ChartWidget
          title="No Data Chart"
          data={undefined as any}
          chartType="line"
          config={mockChartConfig}
          testId="no-data-chart"
        />
      );

      expect(screen.getByTestId('no-data-chart')).toBeInTheDocument();
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });

  describe('Legend and Customization', () => {
    it('displays legend when showLegend is true', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Legend Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          showLegend={true}
          testId="legend-chart"
        />
      );

      expect(screen.getByTestId('legend-chart')).toBeInTheDocument();
      expect(screen.getByText('Series 1')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="No Legend Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          showLegend={false}
          testId="no-legend-chart"
        />
      );

      expect(screen.getByTestId('no-legend-chart')).toBeInTheDocument();
      expect(screen.queryByText('Series 1')).not.toBeInTheDocument();
    });

    it('uses custom colors when provided', () => {
      const data = createMockChartData(5);
      const customColors = ['#FF0000', '#00FF00', '#0000FF'];
      const { container } = render(
        <ChartWidget
          title="Custom Colors Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          colors={customColors}
          showLegend={true}
          testId="custom-colors-chart"
        />
      );

      expect(screen.getByTestId('custom-colors-chart')).toBeInTheDocument();
      
      // Check if custom colors are applied to legend
      const legendItems = container.querySelectorAll('.w-3.h-3.rounded-full');
      expect(legendItems.length).toBeGreaterThan(0);
    });
  });

  describe('Axis Labels', () => {
    it('displays axis labels when provided', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Labeled Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          xAxisLabel="Time"
          yAxisLabel="Value"
          testId="labeled-chart"
        />
      );

      expect(screen.getByTestId('labeled-chart')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('does not display axis labels when not provided', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Unlabeled Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          testId="unlabeled-chart"
        />
      );

      expect(screen.getByTestId('unlabeled-chart')).toBeInTheDocument();
      expect(screen.queryByText('Time')).not.toBeInTheDocument();
      expect(screen.queryByText('Value')).not.toBeInTheDocument();
    });
  });

  describe('Height and Sizing', () => {
    it('applies custom height when provided', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Custom Height Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          height={400}
          testId="custom-height-chart"
        />
      );

      expect(screen.getByTestId('custom-height-chart')).toBeInTheDocument();
      
      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveStyle('height: 400px');
    });

    it('uses default height when not provided', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Default Height Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          testId="default-height-chart"
        />
      );

      expect(screen.getByTestId('default-height-chart')).toBeInTheDocument();
      
      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveStyle('height: 300px');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on buttons', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Accessible Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onFullscreen={mockOnFullscreen}
          testId="accessible-chart"
        />
      );

      expect(screen.getByTestId('accessible-chart')).toBeInTheDocument();
      
      const refreshButton = container.querySelector('button[aria-label="Refresh chart"]');
      const exportButton = container.querySelector('button[aria-label="Export chart"]');
      const fullscreenButton = container.querySelector('button[aria-label="Toggle fullscreen"]');

      expect(refreshButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
      expect(fullscreenButton).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Structured Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          testId="structured-chart"
        />
      );

      expect(screen.getByTestId('structured-chart')).toBeInTheDocument();
      
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Structured Chart');
    });
  });

  describe('Animation Support', () => {
    it('applies animation styles when animate is true', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Animated Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          animate={true}
          testId="animated-chart"
        />
      );

      expect(screen.getByTestId('animated-chart')).toBeInTheDocument();
      
      // Check that chart bars have animation style
      const chartBars = container.querySelectorAll('.bg-blue-500');
      expect(chartBars.length).toBeGreaterThan(0);
      
      // Check that first bar has animation
      const firstBar = chartBars[0];
      expect(firstBar).toHaveStyle('animation: chart-bar-0 1s ease-out');
    });

    it('does not apply animation when animate is false', () => {
      const data = createMockChartData(5);
      const { container } = render(
        <ChartWidget
          title="Static Chart"
          data={data}
          chartType="line"
          config={mockChartConfig}
          animate={false}
          testId="static-chart"
        />
      );

      expect(screen.getByTestId('static-chart')).toBeInTheDocument();
      
      // Check that chart bars don't have animation
      const chartBars = container.querySelectorAll('.bg-blue-500');
      expect(chartBars.length).toBeGreaterThan(0);
      
      // Check that first bar has no animation
      const firstBar = chartBars[0];
      expect(firstBar).toHaveStyle('animation: none');
    });
  });
});
