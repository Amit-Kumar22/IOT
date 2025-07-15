import type { Meta, StoryObj } from '@storybook/react';
import { DeviceCard } from './DeviceCard';
import { Device } from '@/types/device';

// Mock device data
const mockDevice: Device = {
  id: '1',
  name: 'Smart Thermostat',
  type: 'thermostat',
  status: 'online',
  batteryLevel: 85,
  signalStrength: 95,
  lastSeen: new Date(),
  location: 'Living Room',
  metadata: {
    temperature: 22,
    targetTemperature: 24,
    humidity: 45
  }
};

const meta: Meta<typeof DeviceCard> = {
  title: 'Shared/DeviceCard',
  component: DeviceCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying IoT device information with status indicators and quick actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['compact', 'detailed', 'control'],
      description: 'Visual variant of the device card',
    },
    onClick: { action: 'clicked' },
    onToggle: { action: 'toggled' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    device: mockDevice,
  },
};

export const Compact: Story = {
  args: {
    device: mockDevice,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    device: mockDevice,
    variant: 'detailed',
  },
};

export const Control: Story = {
  args: {
    device: mockDevice,
    variant: 'control',
  },
};

export const Offline: Story = {
  args: {
    device: {
      ...mockDevice,
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    },
  },
};

export const Warning: Story = {
  args: {
    device: {
      ...mockDevice,
      status: 'warning',
      batteryLevel: 15,
    },
  },
};

export const Error: Story = {
  args: {
    device: {
      ...mockDevice,
      status: 'error',
      batteryLevel: 5,
      signalStrength: 20,
    },
  },
};

export const LowBattery: Story = {
  args: {
    device: {
      ...mockDevice,
      batteryLevel: 8,
    },
  },
};

export const WithoutLocation: Story = {
  args: {
    device: {
      ...mockDevice,
      location: undefined,
    },
  },
};

export const LongName: Story = {
  args: {
    device: {
      ...mockDevice,
      name: 'Smart IoT Environmental Monitoring Sensor with Advanced Features',
    },
  },
};
