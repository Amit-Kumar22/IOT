import type { Meta, StoryObj } from '@storybook/react';
import EnergyGauge from './EnergyGauge';

const meta: Meta<typeof EnergyGauge> = {
  title: 'Shared/EnergyGauge',
  component: EnergyGauge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A circular gauge component for displaying energy consumption and other percentage-based metrics.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current value to display',
    },
    maxValue: {
      control: { type: 'number' },
      description: 'Maximum value for the gauge',
    },
    unit: {
      control: { type: 'text' },
      description: 'Unit of measurement',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the gauge',
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Enable smooth animations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentValue: 65,
    maxValue: 100,
    unit: '%',
    label: 'Energy Usage',
  },
};

export const Small: Story = {
  args: {
    currentValue: 45,
    maxValue: 100,
    unit: '%',
    label: 'Small Gauge',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    currentValue: 75,
    maxValue: 100,
    unit: '%',
    label: 'Medium Gauge',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    currentValue: 85,
    maxValue: 100,
    unit: '%',
    label: 'Large Gauge',
    size: 'large',
  },
};

export const WithThresholds: Story = {
  args: {
    currentValue: 85,
    maxValue: 100,
    unit: '%',
    label: 'Power Consumption',
    thresholds: {
      low: 30,
      medium: 70,
      high: 90,
    },
  },
};

export const LowValue: Story = {
  args: {
    currentValue: 15,
    maxValue: 100,
    unit: '%',
    label: 'Low Usage',
    thresholds: {
      low: 30,
      medium: 70,
      high: 90,
    },
  },
};

export const HighValue: Story = {
  args: {
    currentValue: 95,
    maxValue: 100,
    unit: '%',
    label: 'Critical Usage',
    thresholds: {
      low: 30,
      medium: 70,
      high: 90,
    },
  },
};

export const CustomUnit: Story = {
  args: {
    currentValue: 750,
    maxValue: 1000,
    unit: 'W',
    label: 'Power Draw',
  },
};

export const Temperature: Story = {
  args: {
    currentValue: 23.5,
    maxValue: 40,
    unit: '°C',
    label: 'Temperature',
    thresholds: {
      low: 18,
      medium: 25,
      high: 35,
    },
  },
};

export const Animated: Story = {
  args: {
    currentValue: 72,
    maxValue: 100,
    unit: '%',
    label: 'Animated Gauge',
    animated: true,
  },
};

export const NonAnimated: Story = {
  args: {
    currentValue: 58,
    maxValue: 100,
    unit: '%',
    label: 'Static Gauge',
    animated: false,
  },
};

export const ZeroValue: Story = {
  args: {
    currentValue: 0,
    maxValue: 100,
    unit: '%',
    label: 'No Usage',
  },
};

export const MaxValue: Story = {
  args: {
    currentValue: 100,
    maxValue: 100,
    unit: '%',
    label: 'Maximum Usage',
  },
};
