'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import {
  ChartBarIcon,
  UsersIcon,
  ServerIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ClockIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  CircleStackIcon,
  BoltIcon,
  FireIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
  description: string;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeDevices: number;
    totalSessions: number;
    avgSessionDuration: string;
    systemUptime: string;
    dataProcessed: string;
    alerts: number;
    revenue: number;
  };
  userMetrics: {
    newUsers: number;
    returningUsers: number;
    userRetention: number;
    averageSessionTime: number;
    bounceRate: number;
    conversionRate: number;
  };
  deviceMetrics: {
    connectedDevices: number;
    offlineDevices: number;
    deviceTypes: { [key: string]: number };
    averageUptime: number;
    dataTransfer: string;
    errorRate: number;
  };
  systemMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLoad: number;
    apiRequests: number;
    responseTime: number;
    errorCount: number;
    throughput: string;
  };
  realtimeData: {
    activeUsers: number;
    onlineDevices: number;
    currentLoad: number;
    latency: number;
    requestsPerSecond: number;
  };
}

/**
 * Admin Analytics Dashboard
 * Comprehensive analytics system with real-time monitoring and detailed insights
 */
export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'devices' | 'system' | 'realtime'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalUsers: 15724,
      activeDevices: 8934,
      totalSessions: 45678,
      avgSessionDuration: '12m 34s',
      systemUptime: '99.97%',
      dataProcessed: '2.34 TB',
      alerts: 23,
      revenue: 47890.50
    },
    userMetrics: {
      newUsers: 1234,
      returningUsers: 14490,
      userRetention: 85.7,
      averageSessionTime: 754,
      bounceRate: 23.4,
      conversionRate: 12.8
    },
    deviceMetrics: {
      connectedDevices: 8934,
      offlineDevices: 245,
      deviceTypes: {
        'IoT Sensors': 4567,
        'Smart Cameras': 2134,
        'Temperature Sensors': 1456,
        'Motion Detectors': 777
      },
      averageUptime: 98.5,
      dataTransfer: '1.87 TB',
      errorRate: 0.12
    },
    systemMetrics: {
      cpuUsage: 67.8,
      memoryUsage: 74.2,
      diskUsage: 45.6,
      networkLoad: 89.3,
      apiRequests: 156789,
      responseTime: 234,
      errorCount: 45,
      throughput: '1.2 GB/s'
    },
    realtimeData: {
      activeUsers: 3456,
      onlineDevices: 8723,
      currentLoad: 67.8,
      latency: 89,
      requestsPerSecond: 1247
    }
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate data updates with random variations
      setAnalyticsData(prev => ({
        ...prev,
        realtimeData: {
          ...prev.realtimeData,
          activeUsers: prev.realtimeData.activeUsers + Math.floor(Math.random() * 20 - 10),
          onlineDevices: prev.realtimeData.onlineDevices + Math.floor(Math.random() * 10 - 5),
          currentLoad: Math.max(0, Math.min(100, prev.realtimeData.currentLoad + Math.random() * 10 - 5)),
          latency: Math.max(0, prev.realtimeData.latency + Math.floor(Math.random() * 20 - 10)),
          requestsPerSecond: prev.realtimeData.requestsPerSecond + Math.floor(Math.random() * 100 - 50)
        }
      }));

      setLastUpdated(new Date());
      showToast({ title: 'Analytics data refreshed', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to refresh data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    setIsLoading(true);
    setTimeout(() => {
      showToast({ title: 'Analytics data exported successfully', type: 'success' });
      setIsLoading(false);
    }, 2000);
  };

  const metricCards: MetricCard[] = [
    {
      id: 'users',
      title: 'Total Users',
      value: analyticsData.overview.totalUsers.toLocaleString(),
      change: 8.2,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue',
      description: 'Registered platform users'
    },
    {
      id: 'devices',
      title: 'Active Devices',
      value: analyticsData.overview.activeDevices.toLocaleString(),
      change: 12.5,
      changeType: 'increase',
      icon: DevicePhoneMobileIcon,
      color: 'green',
      description: 'Currently connected devices'
    },
    {
      id: 'sessions',
      title: 'Total Sessions',
      value: analyticsData.overview.totalSessions.toLocaleString(),
      change: -2.1,
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'purple',
      description: 'User sessions in selected period'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: analyticsData.overview.systemUptime,
      change: 0.03,
      changeType: 'increase',
      icon: ServerIcon,
      color: 'emerald',
      description: 'System availability percentage'
    },
    {
      id: 'data',
      title: 'Data Processed',
      value: analyticsData.overview.dataProcessed,
      change: 15.7,
      changeType: 'increase',
      icon: CircleStackIcon,
      color: 'orange',
      description: 'Total data processed'
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: analyticsData.overview.alerts,
      change: -18.9,
      changeType: 'decrease',
      icon: ExclamationTriangleIcon,
      color: 'red',
      description: 'System alerts requiring attention'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      red: 'text-red-600 bg-red-100 dark:bg-red-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const tabConfig = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'devices', name: 'Devices', icon: DevicePhoneMobileIcon },
    { id: 'system', name: 'System', icon: ServerIcon },
    { id: 'realtime', name: 'Real-time', icon: BoltIcon }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-purple-100 mt-1">Real-time system monitoring and insights</p>
            <p className="text-purple-200 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-purple-100">Auto-refresh</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? 'bg-purple-400' : 'bg-purple-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={handleRefreshData}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => showToast({ title: 'Settings panel opened', type: 'info' })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analyticsData.systemMetrics.cpuUsage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${analyticsData.systemMetrics.cpuUsage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analyticsData.systemMetrics.memoryUsage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${analyticsData.systemMetrics.memoryUsage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analyticsData.systemMetrics.diskUsage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${analyticsData.systemMetrics.diskUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { type: 'info', message: 'System backup completed successfully', time: '2 minutes ago' },
                      { type: 'warning', message: 'High memory usage detected on server-02', time: '15 minutes ago' },
                      { type: 'success', message: '1,234 new device connections established', time: '1 hour ago' },
                      { type: 'error', message: 'API rate limit exceeded for user group', time: '2 hours ago' },
                      { type: 'info', message: 'Scheduled maintenance completed', time: '3 hours ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          activity.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Performance Trends
                </h3>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Performance chart would be rendered here
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Integration with charting library required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analyticsData.userMetrics.newUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">New Users</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analyticsData.userMetrics.returningUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Returning Users</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analyticsData.userMetrics.userRetention}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">User Retention</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analyticsData.userMetrics.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  User Engagement Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Session Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.floor(analyticsData.userMetrics.averageSessionTime / 60)}m {analyticsData.userMetrics.averageSessionTime % 60}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analyticsData.userMetrics.bounceRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${analyticsData.userMetrics.bounceRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analyticsData.deviceMetrics.connectedDevices.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Connected Devices</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analyticsData.deviceMetrics.offlineDevices}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Offline Devices</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analyticsData.deviceMetrics.averageUptime}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Uptime</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Device Types
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.deviceMetrics.deviceTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Data Transfer</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData.deviceMetrics.dataTransfer}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData.deviceMetrics.errorRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceMetrics.errorRate * 10}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analyticsData.systemMetrics.apiRequests.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">API Requests</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analyticsData.systemMetrics.responseTime}ms
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analyticsData.systemMetrics.errorCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Error Count</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analyticsData.systemMetrics.throughput}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Throughput</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Resource Utilization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'CPU Usage', value: analyticsData.systemMetrics.cpuUsage, color: 'purple' },
                    { name: 'Memory Usage', value: analyticsData.systemMetrics.memoryUsage, color: 'blue' },
                    { name: 'Disk Usage', value: analyticsData.systemMetrics.diskUsage, color: 'green' },
                    { name: 'Network Load', value: analyticsData.systemMetrics.networkLoad, color: 'orange' }
                  ].map((metric) => (
                    <div key={metric.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            metric.color === 'purple' ? 'bg-purple-600' :
                            metric.color === 'blue' ? 'bg-blue-600' :
                            metric.color === 'green' ? 'bg-green-600' :
                            'bg-orange-600'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Tab */}
          {activeTab === 'realtime' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { 
                    title: 'Active Users', 
                    value: analyticsData.realtimeData.activeUsers.toLocaleString(), 
                    icon: UsersIcon, 
                    color: 'blue' 
                  },
                  { 
                    title: 'Online Devices', 
                    value: analyticsData.realtimeData.onlineDevices.toLocaleString(), 
                    icon: WifiIcon, 
                    color: 'green' 
                  },
                  { 
                    title: 'Current Load', 
                    value: `${analyticsData.realtimeData.currentLoad.toFixed(1)}%`, 
                    icon: CpuChipIcon, 
                    color: 'purple' 
                  },
                  { 
                    title: 'Latency', 
                    value: `${analyticsData.realtimeData.latency}ms`, 
                    icon: ClockIcon, 
                    color: 'orange' 
                  },
                  { 
                    title: 'Requests/sec', 
                    value: analyticsData.realtimeData.requestsPerSecond.toLocaleString(), 
                    icon: BoltIcon, 
                    color: 'red' 
                  }
                ].map((metric) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={metric.title} className={`rounded-lg p-6 ${getColorClasses(metric.color)}`}>
                      <div className="flex items-center justify-between">
                        <IconComponent className="h-8 w-8" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className="text-sm opacity-75">{metric.title}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Live Activity Feed
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          Device {Math.floor(Math.random() * 1000)} connected
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor(Math.random() * 60)}s ago
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
