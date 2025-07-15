# Component Usage Guide - IoT Platform

## Quick Start Examples

This guide provides practical examples for implementing the IoT Platform component library in real-world scenarios.

## 🚀 Dashboard Layout Examples

### Basic IoT Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { 
  DeviceCard, 
  ChartWidget, 
  DataTable, 
  NotificationPanel 
} from '@iot-platform/components';

export function BasicIoTDashboard() {
  const [devices, setDevices] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">IoT Dashboard</h1>
        <p className="text-gray-600">Monitor and control your IoT devices</p>
      </header>

      {/* Device Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Device Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {devices.map(device => (
            <DeviceCard 
              key={device.id}
              device={device}
              variant="compact"
              onToggle={handleDeviceToggle}
              onConfigure={handleDeviceConfig}
            />
          ))}
        </div>
      </section>

      {/* Charts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <ChartWidget 
            config={temperatureChartConfig}
            data={chartData}
            onConfigChange={handleChartConfig}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <NotificationPanel 
            notifications={notifications}
            onNotificationRead={markNotificationAsRead}
            maxHeight={400}
          />
        </div>
      </div>

      {/* Data Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Device Data</h2>
        <DataTable 
          data={devices}
          columns={deviceTableColumns}
          searchable={true}
          sortable={true}
          paginated={true}
          pageSize={10}
        />
      </section>
    </div>
  );
}
```

### Industrial Control Dashboard

```tsx
import React from 'react';
import { DeviceCard, ChartWidget } from '@iot-platform/components';

export function IndustrialDashboard() {
  return (
    <div className="h-screen bg-gray-900 text-white p-4">
      {/* Critical Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {criticalDevices.map(device => (
          <DeviceCard 
            key={device.id}
            device={device}
            variant="industrial"
            showControls={true}
            className="bg-gray-800 border-gray-700"
          />
        ))}
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          config={pressureMonitorConfig}
          data={pressureData}
          className="bg-gray-800"
        />
        <ChartWidget 
          config={temperatureMonitorConfig}
          data={temperatureData}
          className="bg-gray-800"
        />
      </div>
    </div>
  );
}
```

## 📊 Chart Implementation Examples

### Multi-Sensor Temperature Monitoring

```tsx
import { ChartWidget } from '@iot-platform/components';

const temperatureChartConfig = {
  id: 'temperature-monitor',
  title: 'Temperature Monitoring - Building A',
  type: 'line',
  dataSource: 'temperature-sensors',
  timeRange: '24h',
  aggregation: 'average',
  refreshRate: 30,
  position: { x: 0, y: 0, width: 12, height: 6 },
  isVisible: true,
  yAxisLabel: 'Temperature (°C)',
  xAxisLabel: 'Time'
};

const temperatureData = {
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  datasets: [
    {
      label: 'Floor 1',
      data: [18, 19, 22, 26, 24, 20],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Floor 2',
      data: [20, 21, 24, 28, 26, 22],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Floor 3',
      data: [19, 20, 23, 27, 25, 21],
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)'
    }
  ]
};

function TemperatureMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfigChange = (newConfig) => {
    setIsLoading(true);
    // Update chart configuration
    updateChartConfig(newConfig).finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <ChartWidget 
        config={temperatureChartConfig}
        data={temperatureData}
        isLoading={isLoading}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}
```

### Energy Consumption Dashboard

```tsx
const energyChartConfig = {
  id: 'energy-consumption',
  title: 'Energy Consumption by Zone',
  type: 'bar',
  dataSource: 'energy-meters',
  timeRange: '7d',
  aggregation: 'sum',
  refreshRate: 300, // 5 minutes
  position: { x: 0, y: 0, width: 8, height: 6 },
  isVisible: true,
  yAxisLabel: 'Energy (kWh)',
  xAxisLabel: 'Zone'
};

const energyData = {
  labels: ['Production', 'Office', 'Warehouse', 'Lab', 'Parking'],
  datasets: [{
    label: 'Energy Consumption',
    data: [1250, 340, 580, 420, 180],
    backgroundColor: [
      '#EF4444', // Red for high consumption
      '#10B981', // Green for normal
      '#F59E0B', // Amber for medium
      '#3B82F6', // Blue for low
      '#6B7280'  // Gray for minimal
    ]
  }]
};

function EnergyDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartWidget 
        config={energyChartConfig}
        data={energyData}
      />
      <ChartWidget 
        config={{
          ...energyChartConfig,
          id: 'energy-trend',
          title: 'Energy Trend - Last 30 Days',
          type: 'line',
          timeRange: '30d'
        }}
        data={energyTrendData}
      />
    </div>
  );
}
```

## 🏠 Device Management Examples

### Smart Building Device Grid

```tsx
import { DeviceCard } from '@iot-platform/components';

function SmartBuildingDevices() {
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  const handleDeviceToggle = async (deviceId) => {
    try {
      await toggleDevice(deviceId);
      // Update device state
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: device.status === 'online' ? 'offline' : 'online' }
          : device
      ));
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  const handleBulkAction = (action) => {
    selectedDevices.forEach(deviceId => {
      if (action === 'toggle') {
        handleDeviceToggle(deviceId);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {selectedDevices.length} devices selected
        </span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => handleBulkAction('toggle')}
          disabled={selectedDevices.length === 0}
        >
          Toggle Selected
        </button>
      </div>

      {/* Device Categories */}
      <div className="space-y-8">
        {deviceCategories.map(category => (
          <section key={category.name}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {category.icon}
              {category.name}
              <span className="text-sm text-gray-500">
                ({category.devices.length} devices)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.devices.map(device => (
                <DeviceCard 
                  key={device.id}
                  device={device}
                  variant={category.name === 'Critical Systems' ? 'industrial' : 'detailed'}
                  onToggle={handleDeviceToggle}
                  onConfigure={(deviceId) => openDeviceModal(deviceId)}
                  className={selectedDevices.includes(device.id) ? 'ring-2 ring-blue-500' : ''}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

### Device Status Monitoring

```tsx
function DeviceStatusMonitor() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const filteredDevices = useMemo(() => {
    let filtered = devices;
    
    if (filter !== 'all') {
      filtered = filtered.filter(device => device.status === filter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastSeen':
          return new Date(b.lastSeen) - new Date(a.lastSeen);
        default:
          return 0;
      }
    });
  }, [devices, filter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="select select-bordered"
        >
          <option value="all">All Devices</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="select select-bordered"
        >
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
          <option value="lastSeen">Sort by Last Seen</option>
        </select>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(device => (
          <DeviceCard 
            key={device.id}
            device={device}
            variant="compact"
            showControls={device.status === 'online'}
          />
        ))}
      </div>
    </div>
  );
}
```

## 📋 Data Table Examples

### Advanced Device Data Table

```tsx
import { DataTable } from '@iot-platform/components';

const deviceTableColumns = [
  {
    key: 'name',
    title: 'Device Name',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <StatusIndicator status={row.status} />
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.type}</div>
        </div>
      </div>
    )
  },
  {
    key: 'location',
    title: 'Location',
    sortable: true
  },
  {
    key: 'temperature',
    title: 'Temperature',
    type: 'number',
    render: (value) => value ? `${value}°C` : 'N/A'
  },
  {
    key: 'battery',
    title: 'Battery',
    render: (value) => (
      <div className="flex items-center gap-2">
        <BatteryIcon level={value} />
        <span>{value}%</span>
      </div>
    )
  },
  {
    key: 'lastSeen',
    title: 'Last Seen',
    type: 'date',
    render: (value) => formatRelativeTime(value)
  },
  {
    key: 'actions',
    title: 'Actions',
    render: (_, row) => (
      <div className="flex gap-2">
        <button 
          className="btn btn-sm btn-ghost"
          onClick={() => handleDeviceConfig(row.id)}
        >
          Configure
        </button>
        <button 
          className="btn btn-sm btn-ghost"
          onClick={() => handleDeviceRestart(row.id)}
        >
          Restart
        </button>
      </div>
    )
  }
];

function DeviceDataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeviceData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const handleRowClick = (rowData) => {
    // Navigate to device detail view
    navigate(`/devices/${rowData.id}`);
  };

  const handleExport = () => {
    exportToCSV(data, 'device-data.csv');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Device Overview</h2>
        <button className="btn btn-primary" onClick={handleExport}>
          Export CSV
        </button>
      </div>
      
      <DataTable 
        data={data}
        columns={deviceTableColumns}
        loading={loading}
        error={error}
        searchable={true}
        sortable={true}
        filterable={true}
        paginated={true}
        pageSize={25}
        onRowClick={handleRowClick}
        className="bg-white rounded-lg shadow"
      />
    </div>
  );
}
```

## 🔔 Notification Management

### Real-time Notification System

```tsx
import NotificationPanel from '@iot-platform/components';

function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    type: [],
    priority: [],
    read: null
  });

  // Real-time notification subscription
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Play sound for high priority notifications
      if (newNotification.priority === 'urgent') {
        playNotificationSound();
      }
    });

    return unsubscribe;
  }, []);

  const handleNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleBulkAction = (notificationIds, action) => {
    switch (action) {
      case 'markAsRead':
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
        break;
      case 'delete':
        setNotifications(prev => 
          prev.filter(notification => 
            !notificationIds.includes(notification.id)
          )
        );
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <NotificationPanel 
        notifications={notifications}
        onNotificationClick={(notification) => {
          handleNotificationRead(notification.id);
          // Navigate to related device/issue
          if (notification.deviceId) {
            navigate(`/devices/${notification.deviceId}`);
          }
        }}
        onNotificationRead={handleNotificationRead}
        onBulkAction={handleBulkAction}
        showFilters={true}
        showBulkActions={true}
        maxHeight={500}
        realTimeUpdates={true}
        groupByDate={true}
      />
    </div>
  );
}
```

## 🎨 Theming and Customization

### Custom Theme Implementation

```tsx
// theme.ts
export const customTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f0fdf4',
      500: '#10b981',
      600: '#059669',
      900: '#064e3b'
    },
    status: {
      online: '#10b981',
      offline: '#6b7280',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem'
  }
};

// App.tsx
import { ThemeProvider } from '@iot-platform/components';

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <Dashboard />
    </ThemeProvider>
  );
}
```

### Dark Mode Support

```tsx
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="btn btn-ghost"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

## 🧪 Testing Examples

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceCard } from '@iot-platform/components';

describe('DeviceCard', () => {
  const mockDevice = {
    id: 'test-device',
    name: 'Test Sensor',
    type: 'sensor',
    status: 'online',
    battery: 85,
    signal: 92
  };

  test('renders device information correctly', () => {
    render(<DeviceCard device={mockDevice} />);
    
    expect(screen.getByText('Test Sensor')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument(); // Battery
    expect(screen.getByText('92%')).toBeInTheDocument(); // Signal
  });

  test('calls onToggle when toggle button is clicked', () => {
    const handleToggle = jest.fn();
    render(
      <DeviceCard 
        device={mockDevice} 
        onToggle={handleToggle}
      />
    );
    
    const toggleButton = screen.getByLabelText(/toggle/i);
    fireEvent.click(toggleButton);
    
    expect(handleToggle).toHaveBeenCalledWith('test-device');
  });
});
```

### Integration Testing

```tsx
import { renderDashboard } from '@iot-platform/test-utils';

test('dashboard updates when device status changes', async () => {
  const { screen, user } = renderDashboard({
    devices: [mockDevice],
    enableRealTimeUpdates: true
  });

  // Simulate device status change
  await simulateDeviceStatusChange('test-device', 'offline');

  // Verify UI updates
  await waitFor(() => {
    expect(screen.getByText('offline')).toBeInTheDocument();
  });
});
```

This comprehensive usage guide provides practical examples for implementing all major components in real IoT dashboard scenarios. Each example includes proper error handling, accessibility considerations, and performance optimizations.
