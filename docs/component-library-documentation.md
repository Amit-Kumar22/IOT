# IoT Platform Component Library Documentation

## Overview

This comprehensive component library provides a full suite of reusable UI components specifically designed for IoT (Internet of Things) applications. The library focuses on accessibility, performance, and seamless integration within React-based IoT dashboards.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Components](#core-components)
3. [Shared Components](#shared-components)
4. [Chart Components](#chart-components)
5. [Device Components](#device-components)
6. [Form Components](#form-components)
7. [Layout Components](#layout-components)
8. [Accessibility Features](#accessibility-features)
9. [Performance Guidelines](#performance-guidelines)
10. [Testing Utilities](#testing-utilities)
11. [API Reference](#api-reference)

## Getting Started

### Installation

```bash
# Install the IoT Platform in your project
npm install @iot-platform/components
```

### Basic Setup

```tsx
import React from 'react';
import { DeviceCard, ChartWidget, DataTable } from '@iot-platform/components';

function Dashboard() {
  return (
    <div className="p-4 space-y-4">
      <DeviceCard device={deviceData} />
      <ChartWidget config={chartConfig} data={chartData} />
      <DataTable data={tableData} columns={columns} />
    </div>
  );
}
```

### Theme Configuration

```tsx
// Configure dark/light mode themes
import { ThemeProvider } from '@iot-platform/components';

function App() {
  return (
    <ThemeProvider theme="dark">
      <Dashboard />
    </ThemeProvider>
  );
}
```

## Core Components

### DeviceCard

A comprehensive card component for displaying IoT device information with real-time status updates, controls, and metrics.

#### Features
- ✅ Real-time status indicators
- ✅ Battery and signal strength displays
- ✅ Interactive controls (toggle, configure)
- ✅ Multiple variants (compact, detailed, industrial)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Performance optimized for large device lists

#### Usage

```tsx
import { DeviceCard } from '@iot-platform/components';

const device = {
  id: 'sensor-001',
  name: 'Temperature Sensor',
  type: 'sensor',
  status: 'online',
  battery: 85,
  signal: 92,
  location: 'Building A - Floor 1',
  temperature: 23.5
};

<DeviceCard 
  device={device}
  variant="detailed"
  onToggle={(deviceId) => handleDeviceToggle(deviceId)}
  onConfigure={(deviceId) => openDeviceConfig(deviceId)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `device` | `DeviceStatus` | - | Device data object |
| `variant` | `'compact' \| 'detailed' \| 'industrial'` | `'detailed'` | Card display variant |
| `showControls` | `boolean` | `true` | Show action buttons |
| `onToggle` | `(deviceId: string) => void` | - | Toggle device callback |
| `onConfigure` | `(deviceId: string) => void` | - | Configure device callback |

#### Performance Metrics
- **Render Time:** < 50ms
- **Memory Usage:** < 5MB
- **Interaction Latency:** < 100ms

### ChartWidget

Advanced charting component built with Recharts, optimized for IoT data visualization with real-time updates and interactive features.

#### Features
- ✅ Multiple chart types (line, bar, pie, area)
- ✅ Real-time data streaming
- ✅ Interactive tooltips and legends
- ✅ Responsive design
- ✅ Export capabilities (PNG, SVG, CSV)
- ✅ Custom theming support

#### Usage

```tsx
import { ChartWidget } from '@iot-platform/components';

const chartConfig = {
  id: 'temp-chart',
  title: 'Temperature Trends',
  type: 'line',
  dataSource: 'temperature-sensors',
  timeRange: '24h',
  aggregation: 'average',
  refreshRate: 30,
  position: { x: 0, y: 0, width: 6, height: 4 },
  isVisible: true
};

const chartData = {
  labels: ['00:00', '06:00', '12:00', '18:00'],
  datasets: [{
    label: 'Temperature',
    data: [20, 22, 26, 24],
    borderColor: '#3B82F6'
  }]
};

<ChartWidget 
  config={chartConfig}
  data={chartData}
  isLoading={false}
  onConfigChange={handleConfigChange}
/>
```

#### Performance Metrics
- **Render Time:** < 200ms
- **Memory Usage:** < 15MB
- **Large Dataset Support:** 10,000+ data points

### DataTable

High-performance data table component with advanced filtering, sorting, and pagination features optimized for IoT device data.

#### Features
- ✅ Virtual scrolling for large datasets
- ✅ Advanced filtering and search
- ✅ Multi-column sorting
- ✅ Customizable cell renderers
- ✅ Export functionality
- ✅ Responsive design
- ✅ Keyboard navigation

#### Usage

```tsx
import { DataTable } from '@iot-platform/components';

const columns = [
  { key: 'name', title: 'Device Name', sortable: true },
  { key: 'status', title: 'Status', type: 'badge' },
  { key: 'temperature', title: 'Temperature', type: 'number' },
  { key: 'lastUpdate', title: 'Last Update', type: 'date' }
];

const data = [
  { id: 1, name: 'Sensor 1', status: 'online', temperature: 23.5, lastUpdate: new Date() },
  // ... more data
];

<DataTable 
  data={data}
  columns={columns}
  searchable={true}
  sortable={true}
  paginated={true}
  pageSize={20}
  onRowClick={handleRowClick}
/>
```

#### Performance Metrics
- **Render Time:** < 150ms
- **Memory Usage:** < 20MB
- **Large Dataset Support:** 100,000+ rows with virtual scrolling

## Shared Components

### NotificationPanel

Comprehensive notification management component with filtering, sorting, and real-time updates.

#### Features
- ✅ Real-time notification streaming
- ✅ Priority-based categorization
- ✅ Advanced filtering and search
- ✅ Bulk actions
- ✅ Auto-dismiss functionality
- ✅ Sound notifications (optional)

#### Usage

```tsx
import NotificationPanel from '@iot-platform/components';

const notifications = [
  {
    id: '1',
    type: 'warning',
    title: 'High Temperature Alert',
    message: 'Device temperature exceeds threshold',
    timestamp: new Date(),
    read: false,
    priority: 'high'
  }
];

<NotificationPanel 
  notifications={notifications}
  onNotificationClick={handleNotificationClick}
  onNotificationRead={markAsRead}
  showFilters={true}
  maxHeight={400}
/>
```

### Modal

Flexible modal component with accessibility features and customizable layouts.

#### Usage

```tsx
import { Modal } from '@iot-platform/components';

<Modal 
  isOpen={isOpen}
  onClose={handleClose}
  title="Device Configuration"
  size="lg"
>
  <DeviceConfigForm />
</Modal>
```

### Button

Consistent button component with multiple variants and loading states.

#### Usage

```tsx
import { Button } from '@iot-platform/components';

<Button 
  variant="primary"
  size="lg"
  loading={isLoading}
  onClick={handleClick}
>
  Save Configuration
</Button>
```

## Accessibility Features

### WCAG 2.1 AA Compliance

All components are designed and tested to meet WCAG 2.1 AA accessibility standards:

- ✅ **Keyboard Navigation:** Full keyboard support with logical tab order
- ✅ **Screen Reader Support:** Proper ARIA labels and roles
- ✅ **Color Contrast:** Minimum 4.5:1 contrast ratio
- ✅ **Focus Management:** Visible focus indicators
- ✅ **Semantic HTML:** Proper heading hierarchy and landmarks

### Screen Reader Support

```tsx
// Example of screen reader friendly component usage
<DeviceCard 
  device={device}
  aria-label={`${device.name} - Status: ${device.status}`}
/>

<DataTable 
  data={data}
  columns={columns}
  aria-label="IoT devices overview table"
/>
```

### Keyboard Navigation

| Component | Key Bindings |
|-----------|-------------|
| DataTable | Arrow keys (navigation), Space (select), Enter (action) |
| Modal | Escape (close), Tab (cycle focus) |
| DeviceCard | Enter/Space (toggle), Tab (navigate controls) |

## Performance Guidelines

### Component Performance Budgets

| Component | Max Render Time | Max Memory Usage | Max Interaction Latency |
|-----------|----------------|------------------|-------------------------|
| DeviceCard | 50ms | 5MB | 100ms |
| ChartWidget | 200ms | 15MB | 200ms |
| DataTable | 150ms | 20MB | 150ms |
| NotificationPanel | 100ms | 10MB | 100ms |

### Optimization Techniques

#### 1. Virtual Scrolling
```tsx
// DataTable automatically uses virtual scrolling for large datasets
<DataTable 
  data={largeDataset} // 10,000+ items
  virtualScrolling={true} // Default for large datasets
  pageSize={50}
/>
```

#### 2. Memoization
```tsx
// Components use React.memo for performance optimization
const MemoizedDeviceCard = React.memo(DeviceCard);
```

#### 3. Code Splitting
```tsx
// Lazy load heavy components
const ChartWidget = React.lazy(() => import('./ChartWidget'));
```

### Performance Monitoring

Use the built-in performance utilities:

```tsx
import { benchmarkComponent } from '@iot-platform/test-utils';

// Benchmark component performance
const metrics = await benchmarkComponent(
  <DeviceCard device={device} />,
  'DeviceCard',
  { maxRenderTime: 50, maxMemoryUsage: 5, maxInteractionLatency: 100 }
);
```

## Testing Utilities

### Accessibility Testing

```tsx
import { renderWithA11y } from '@iot-platform/test-utils';

test('DeviceCard is accessible', async () => {
  const { container } = renderWithA11y(<DeviceCard device={mockDevice} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Performance Testing

```tsx
import { createPerformanceTest } from '@iot-platform/test-utils';

test('DeviceCard meets performance budget', async () => {
  const performanceTest = createPerformanceTest(
    'DeviceCard',
    <DeviceCard device={mockDevice} />
  );
  await performanceTest(); // Throws if budget exceeded
});
```

### Integration Testing

```tsx
import { renderDashboard } from '@iot-platform/test-utils';

test('Dashboard components work together', () => {
  const { screen } = renderDashboard({
    devices: [mockDevice],
    charts: [mockChart],
    notifications: [mockNotification]
  });
  
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

## API Reference

### Type Definitions

```tsx
// Device Types
interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'warning';
  location?: string;
  lastSeen?: string;
  battery?: number;
  signal?: number;
  temperature?: number;
  // ... other sensor readings
}

// Chart Types
interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'area';
  title: string;
  dataSource: string;
  timeRange: string;
  aggregation: 'sum' | 'average' | 'min' | 'max' | 'count';
  refreshRate: number;
  filters?: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
}

// Notification Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  deviceId?: string;
}
```

### Event Handlers

```tsx
// Common event handler types
type DeviceEventHandler = (deviceId: string) => void;
type NotificationEventHandler = (notificationId: string, action: string) => void;
type ChartEventHandler = (config: ChartConfig) => void;
type TableEventHandler = (rowData: any, rowIndex: number) => void;
```

## Best Practices

### 1. Component Composition

```tsx
// ✅ Good: Compose components logically
function DeviceDashboard({ devices }: { devices: DeviceStatus[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map(device => (
        <DeviceCard 
          key={device.id}
          device={device}
          variant="compact"
        />
      ))}
    </div>
  );
}
```

### 2. Error Handling

```tsx
// ✅ Good: Handle errors gracefully
function Dashboard() {
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    return <ErrorBoundary error={error} />;
  }
  
  return (
    <DataTable 
      data={data}
      columns={columns}
      error={error}
      onError={setError}
    />
  );
}
```

### 3. Performance Optimization

```tsx
// ✅ Good: Memoize expensive computations
const Dashboard = React.memo(({ devices }: { devices: DeviceStatus[] }) => {
  const sortedDevices = useMemo(() => 
    devices.sort((a, b) => a.name.localeCompare(b.name)),
    [devices]
  );
  
  return (
    <div>
      {sortedDevices.map(device => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
});
```

## Troubleshooting

### Common Issues

1. **Performance Issues**
   - Use virtualization for large datasets
   - Implement proper memoization
   - Monitor component render times

2. **Accessibility Issues**
   - Ensure proper ARIA labels
   - Test with screen readers
   - Verify keyboard navigation

3. **Theme Issues**
   - Check CSS custom properties
   - Verify dark mode compatibility
   - Test contrast ratios

### Support

For additional support and contributions:
- 📧 Email: support@iot-platform.com
- 📚 Documentation: https://docs.iot-platform.com
- 🐛 Issues: https://github.com/iot-platform/components/issues
- 💬 Discussions: https://github.com/iot-platform/components/discussions

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**License:** MIT
