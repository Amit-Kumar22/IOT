import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  dataProcessed: number;
  apiCallsToday: number;
  systemUptime: number;
  errorRate: number;
  averageResponseTime: number;
  storageUsed: number;
  storageTotal: number;
  bandwidthUsed: number;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseConnections: number;
  cacheHitRate: number;
}

interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DeviceMetrics {
  connectedDevices: number;
  devicesByType: { type: string; count: number }[];
  devicesByStatus: { status: string; count: number }[];
  devicesByRegion: { region: string; count: number }[];
}

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  topEndpoints: { endpoint: string; requests: number; avgTime: number }[];
  requestsByHour: { hour: number; requests: number }[];
}

const SystemAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SystemMetrics = {
        totalUsers: 5247,
        activeUsers: 1876,
        totalDevices: 8934,
        activeDevices: 7821,
        dataProcessed: 245.6, // GB
        apiCallsToday: 456789,
        systemUptime: 99.8,
        errorRate: 0.05,
        averageResponseTime: 145, // ms
        storageUsed: 1.2, // TB
        storageTotal: 5.0, // TB
        bandwidthUsed: 78.9, // GB
      };

      const mockPerformance: PerformanceMetrics = {
        cpuUsage: 35.2,
        memoryUsage: 62.8,
        diskUsage: 45.3,
        networkLatency: 23.4,
        databaseConnections: 127,
        cacheHitRate: 94.7,
      };

      const mockEvents: SystemEvent[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage has exceeded 80% on server cluster A',
          timestamp: '2024-01-15T10:30:00Z',
          source: 'System Monitor',
          severity: 'medium',
        },
        {
          id: '2',
          type: 'info',
          title: 'Database Backup Complete',
          message: 'Scheduled backup completed successfully',
          timestamp: '2024-01-15T09:00:00Z',
          source: 'Database Manager',
          severity: 'low',
        },
        {
          id: '3',
          type: 'error',
          title: 'API Endpoint Timeout',
          message: 'Device status endpoint experiencing timeouts',
          timestamp: '2024-01-15T08:45:00Z',
          source: 'API Gateway',
          severity: 'high',
        },
        {
          id: '4',
          type: 'success',
          title: 'Security Update Applied',
          message: 'Latest security patches applied to all servers',
          timestamp: '2024-01-15T07:00:00Z',
          source: 'Security Manager',
          severity: 'low',
        },
      ];

      const mockDeviceMetrics: DeviceMetrics = {
        connectedDevices: 7821,
        devicesByType: [
          { type: 'Smart Thermostats', count: 2340 },
          { type: 'Security Cameras', count: 1876 },
          { type: 'Lighting Systems', count: 1234 },
          { type: 'Sensors', count: 1789 },
          { type: 'Other', count: 582 },
        ],
        devicesByStatus: [
          { status: 'Online', count: 7821 },
          { status: 'Offline', count: 856 },
          { status: 'Maintenance', count: 187 },
          { status: 'Error', count: 70 },
        ],
        devicesByRegion: [
          { region: 'North America', count: 4234 },
          { region: 'Europe', count: 2456 },
          { region: 'Asia Pacific', count: 1789 },
          { region: 'Other', count: 455 },
        ],
      };

      const mockApiMetrics: ApiMetrics = {
        totalRequests: 456789,
        successfulRequests: 454321,
        failedRequests: 2468,
        averageResponseTime: 145,
        topEndpoints: [
          { endpoint: '/api/devices/status', requests: 123456, avgTime: 120 },
          { endpoint: '/api/auth/login', requests: 98765, avgTime: 89 },
          { endpoint: '/api/data/telemetry', requests: 87654, avgTime: 234 },
          { endpoint: '/api/users/profile', requests: 76543, avgTime: 156 },
          { endpoint: '/api/billing/status', requests: 65432, avgTime: 178 },
        ],
        requestsByHour: [
          { hour: 0, requests: 15234 },
          { hour: 1, requests: 12456 },
          { hour: 2, requests: 11234 },
          { hour: 3, requests: 10987 },
          { hour: 4, requests: 12345 },
          { hour: 5, requests: 14567 },
          { hour: 6, requests: 18765 },
          { hour: 7, requests: 23456 },
          { hour: 8, requests: 28765 },
          { hour: 9, requests: 32456 },
          { hour: 10, requests: 35678 },
          { hour: 11, requests: 38765 },
          { hour: 12, requests: 42345 },
          { hour: 13, requests: 45678 },
          { hour: 14, requests: 48765 },
          { hour: 15, requests: 52345 },
          { hour: 16, requests: 55678 },
          { hour: 17, requests: 58765 },
          { hour: 18, requests: 52345 },
          { hour: 19, requests: 48765 },
          { hour: 20, requests: 42345 },
          { hour: 21, requests: 35678 },
          { hour: 22, requests: 28765 },
          { hour: 23, requests: 23456 },
        ],
      };

      setMetrics(mockMetrics);
      setPerformance(mockPerformance);
      setEvents(mockEvents);
      setDeviceMetrics(mockDeviceMetrics);
      setApiMetrics(mockApiMetrics);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const getEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getEventColor = (type: SystemEvent['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics || !performance || !deviceMetrics || !apiMetrics) return null;

  const deviceTypeChartData = {
    labels: deviceMetrics.devicesByType.map(d => d.type),
    datasets: [
      {
        data: deviceMetrics.devicesByType.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const apiRequestsChartData = {
    labels: apiMetrics.requestsByHour.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'API Requests',
        data: apiMetrics.requestsByHour.map(h => h.requests),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const deviceStatusChartData = {
    labels: deviceMetrics.devicesByStatus.map(s => s.status),
    datasets: [
      {
        data: deviceMetrics.devicesByStatus.map(s => s.count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time system monitoring and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">of {metrics.totalUsers.toLocaleString()} total</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected Devices</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeDevices.toLocaleString()}</p>
              <p className="text-xs text-gray-500">of {metrics.totalDevices.toLocaleString()} total</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.systemUptime}%</p>
              <p className="text-xs text-green-600">Excellent</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Calls Today</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.apiCallsToday.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Avg: {metrics.averageResponseTime}ms</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{performance.cpuUsage}%</div>
            <div className="text-sm text-gray-600">CPU Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${performance.cpuUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{performance.memoryUsage}%</div>
            <div className="text-sm text-gray-600">Memory Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${performance.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{performance.diskUsage}%</div>
            <div className="text-sm text-gray-600">Disk Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${performance.diskUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{performance.networkLatency}ms</div>
            <div className="text-sm text-gray-600">Network Latency</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${Math.min(performance.networkLatency, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{performance.databaseConnections}</div>
            <div className="text-sm text-gray-600">DB Connections</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${Math.min(performance.databaseConnections / 200 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{performance.cacheHitRate}%</div>
            <div className="text-sm text-gray-600">Cache Hit Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-pink-600 h-2 rounded-full" 
                style={{ width: `${performance.cacheHitRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Requests Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Requests (24h)</h3>
          <div className="h-64">
            <Line
              data={apiRequestsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString();
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <div className="h-64">
            <Doughnut
              data={deviceTypeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Device Status & API Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h3>
          <div className="h-64">
            <Bar
              data={deviceStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top API Endpoints */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top API Endpoints</h3>
          <div className="space-y-4">
            {apiMetrics.topEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{endpoint.endpoint}</p>
                  <p className="text-xs text-gray-500">{endpoint.requests.toLocaleString()} requests</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{endpoint.avgTime}ms</p>
                  <p className="text-xs text-gray-500">avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Events</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div key={event.id} className={`p-4 ${getEventColor(event.type)}`}>
              <div className="flex items-start space-x-3">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">Source: {event.source}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage & Bandwidth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {metrics.storageUsed} TB
            </div>
            <div className="text-sm text-gray-600">of {metrics.storageTotal} TB total</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
              <div 
                className="bg-blue-600 h-4 rounded-full" 
                style={{ width: `${(metrics.storageUsed / metrics.storageTotal) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {((metrics.storageUsed / metrics.storageTotal) * 100).toFixed(1)}% used
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bandwidth Usage (Today)</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {metrics.bandwidthUsed} GB
            </div>
            <div className="text-sm text-gray-600">data transferred</div>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <WifiIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Optimal performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsDashboard;
