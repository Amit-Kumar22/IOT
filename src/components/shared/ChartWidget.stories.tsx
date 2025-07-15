import type { Meta, StoryObj } from '@storybook/react';
import { ChartWidget } from './ChartWidget';
import { ChartDataPoint } from '@/types/shared-components';

// Mock data generators
const generateLineData = (points: number): ChartDataPoint[] => {
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i) * 3600000),
    label: `Point ${i + 1}`,
    value: Math.random() * 100 + 20,
    category: 'energy',
  }));
};

const generateBarData = (): ChartDataPoint[] => {
  return [
    { label: 'Jan', value: 65, category: 'consumption' },
    { label: 'Feb', value: 78, category: 'consumption' },
    { label: 'Mar', value: 82, category: 'consumption' },
    { label: 'Apr', value: 75, category: 'consumption' },
    { label: 'May', value: 90, category: 'consumption' },
    { label: 'Jun', value: 95, category: 'consumption' },
  ];
};

const generatePieData = (): ChartDataPoint[] => {
  return [
    { label: 'Heating', value: 45, category: 'energy' },
    { label: 'Cooling', value: 30, category: 'energy' },
    { label: 'Lighting', value: 15, category: 'energy' },
    { label: 'Appliances', value: 10, category: 'energy' },
  ];
};

const meta: Meta<typeof ChartWidget> = {
  title: 'Shared/ChartWidget',
  component: ChartWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile chart widget supporting multiple chart types for data visualization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chartType: {
      control: { type: 'select' },
      options: ['line', 'bar', 'pie', 'area', 'gauge'],
      description: 'Type of chart to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LineChart: Story = {
  args: {
    title: 'Energy Consumption Over Time',
    data: generateLineData(24),
    chartType: 'line',
    config: {
      showGrid: true,
      colors: ['#3B82F6'],
    },
  },
};

export const BarChart: Story = {
  args: {
    title: 'Monthly Energy Usage',
    data: generateBarData(),
    chartType: 'bar',
    config: {
      showGrid: true,
      colors: ['#10B981'],
    },
  },
};

export const PieChart: Story = {
  args: {
    title: 'Energy Distribution by Category',
    data: generatePieData(),
    chartType: 'pie',
    config: {
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    },
  },
};

export const AreaChart: Story = {
  args: {
    title: 'Cumulative Energy Usage',
    data: generateLineData(12),
    chartType: 'area',
    config: {
      showGrid: true,
      colors: ['#8B5CF6'],
    },
  },
};

export const GaugeChart: Story = {
  args: {
    title: 'Current Power Usage',
    data: [{ label: 'Power', value: 75, category: 'current' }],
    chartType: 'gauge',
    config: {
      colors: ['#10B981'],
    },
  },
};

export const EmptyData: Story = {
  args: {
    title: 'No Data Available',
    data: [],
    chartType: 'line',
    config: {},
  },
};

export const SingleDataPoint: Story = {
  args: {
    title: 'Single Data Point',
    data: [{ timestamp: new Date(), label: 'Test Point', value: 42, category: 'test' }],
    chartType: 'line',
    config: {},
  },
};

export const CustomColors: Story = {
  args: {
    title: 'Custom Color Scheme',
    data: generateLineData(10),
    chartType: 'line',
    config: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      showGrid: false,
    },
  },
};

export const NoGrid: Story = {
  args: {
    title: 'Chart Without Grid',
    data: generateBarData(),
    chartType: 'bar',
    config: {
      showGrid: false,
      colors: ['#6B73FF'],
    },
  },
};
