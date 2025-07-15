import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Device } from '@/types/shared-components';

// Mock data
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Smart Thermostat',
    type: 'thermostat',
    status: 'online',
    batteryLevel: 85,
    signalStrength: 95,
    room: 'Living Room',
    lastSeen: new Date(Date.now() - 60000),
    isControllable: true,
    metadata: { temperature: 22 }
  },
  {
    id: '2',
    name: 'Motion Sensor',
    type: 'sensor',
    status: 'offline',
    batteryLevel: 45,
    signalStrength: 60,
    room: 'Bedroom',
    lastSeen: new Date(Date.now() - 3600000),
    isControllable: false,
    metadata: { motion: false }
  },
  {
    id: '3',
    name: 'Smart Light',
    type: 'light',
    status: 'warning',
    batteryLevel: 15,
    signalStrength: 80,
    room: 'Kitchen',
    lastSeen: new Date(Date.now() - 300000),
    isControllable: true,
    metadata: { brightness: 75 }
  },
  {
    id: '4',
    name: 'Security Camera',
    type: 'security',
    status: 'error',
    signalStrength: 25,
    room: 'Front Door',
    lastSeen: new Date(Date.now() - 7200000),
    isControllable: true,
    metadata: { recording: false }
  },
  {
    id: '5',
    name: 'Smart Plug',
    type: 'appliance',
    status: 'online',
    batteryLevel: 100,
    signalStrength: 90,
    room: 'Office',
    lastSeen: new Date(Date.now() - 30000),
    isControllable: true,
    metadata: { power: 150 }
  }
];

const columns = [
  { key: 'name', title: 'Device Name', sortable: true },
  { key: 'type', title: 'Type', sortable: true },
  { key: 'status', title: 'Status', sortable: true },
  { key: 'room', title: 'Room', sortable: true },
  { key: 'batteryLevel', title: 'Battery %', sortable: true, type: 'number' as const },
  { key: 'signalStrength', title: 'Signal %', sortable: true, type: 'number' as const },
];

const meta: Meta<typeof DataTable> = {
  title: 'Shared/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A powerful data table component with sorting, filtering, and pagination capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sortable: {
      control: { type: 'boolean' },
      description: 'Enable column sorting',
    },
    filterable: {
      control: { type: 'boolean' },
      description: 'Enable column filtering',
    },
    paginated: {
      control: { type: 'boolean' },
      description: 'Enable pagination',
    },
    selectable: {
      control: { type: 'boolean' },
      description: 'Enable row selection',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockDevices,
    columns,
  },
};

export const WithSorting: Story = {
  args: {
    data: mockDevices,
    columns,
    sortable: true,
  },
};

export const WithFiltering: Story = {
  args: {
    data: mockDevices,
    columns,
    filterable: true,
  },
};

export const WithPagination: Story = {
  args: {
    data: mockDevices,
    columns,
    paginated: true,
    pageSize: 3,
  },
};

export const WithSelection: Story = {
  args: {
    data: mockDevices,
    columns,
    selectable: true,
  },
};

export const FullFeatures: Story = {
  args: {
    data: mockDevices,
    columns,
    sortable: true,
    filterable: true,
    paginated: true,
    selectable: true,
    pageSize: 3,
  },
};

export const EmptyTable: Story = {
  args: {
    data: [],
    columns,
  },
};

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      id: `device-${i + 1}`,
      name: `Device ${i + 1}`,
      type: ['light', 'thermostat', 'sensor'][i % 3] as Device['type'],
      status: ['online', 'offline', 'warning', 'error'][i % 4] as Device['status'],
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100),
      room: `Room ${Math.floor(i / 10) + 1}`,
      lastSeen: new Date(Date.now() - Math.random() * 86400000),
      isControllable: i % 2 === 0,
      metadata: {}
    })),
    columns,
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 10,
  },
};
