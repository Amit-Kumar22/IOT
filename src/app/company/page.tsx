'use client';

import React from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  ChartBarIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

/**
 * Company Dashboard - Industrial IoT Management Overview
 * Provides comprehensive view of devices, analytics, alerts, and system status
 */
export default function CompanyDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  // Mock data for dashboard - replace with real API calls
  const dashboardData = {
    devices: {
      total: 247,
      online: 231,
      offline: 12,
      warning: 4,
      critical: 0
    },
    analytics: {
      dataPointsToday: 1.2e6,
      energyConsumption: 2847.5,
      costToday: 341.70,
      efficiency: 94.2
    },
    alerts: [
      {
        id: 1,
        device: 'Temperature Sensor #23',
        message: 'Temperature threshold exceeded',
        severity: 'warning',
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        device: 'Pressure Valve #7',
        message: 'Maintenance required',
        severity: 'info',
        timestamp: '15 minutes ago'
      },
      {
        id: 3,
        device: 'Motor Controller #12',
        message: 'Optimal performance achieved',
        severity: 'success',
        timestamp: '1 hour ago'
      }
    ],
    recentActivity: [
      {
        id: 1,
        action: 'Device configuration updated',
        device: 'Production Line A',
        user: 'John Smith',
        timestamp: '5 minutes ago'
      },
      {
        id: 2,
        action: 'Automation rule executed',
        device: 'Cooling System',
        user: 'System',
        timestamp: '12 minutes ago'
      },
      {
        id: 3,
        action: 'OTA update completed',
        device: 'Gateway #3',
        user: 'System',
        timestamp: '1 hour ago'
      }
    ]
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
    trend?: { value: string; direction: 'up' | 'down'; positive: boolean };
  }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
                  </div>
                )}
              </dd>
              <dd className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertItem = ({ alert }: { alert: any }) => {
    const severityColors = {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400'
    };

    const SeverityIcon = {
      success: CheckCircleIcon,
      warning: ExclamationTriangleIcon,
      error: ExclamationTriangleIcon,
      info: CheckCircleIcon
    };

    const Icon = SeverityIcon[alert.severity as keyof typeof SeverityIcon];

    return (
      <div className="flex items-start space-x-3 py-3">
        <Icon className={`h-5 w-5 mt-0.5 ${severityColors[alert.severity as keyof typeof severityColors]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {alert.device}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {alert.message}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {alert.timestamp}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'Manager'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Industrial IoT Management Dashboard - {user?.companyId || 'ACME Corp'}
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            System Status: <span className="text-green-600 font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Devices"
          value={dashboardData.devices.online}
          subtitle={`${dashboardData.devices.total} total devices`}
          icon={CpuChipIcon}
          color="text-blue-500"
          trend={{ value: '+5.2%', direction: 'up', positive: true }}
        />
        <StatCard
          title="Data Points Today"
          value={`${(dashboardData.analytics.dataPointsToday / 1e6).toFixed(1)}M`}
          subtitle="Real-time telemetry"
          icon={ChartBarIcon}
          color="text-green-500"
          trend={{ value: '+12.3%', direction: 'up', positive: true }}
        />
        <StatCard
          title="Energy Usage"
          value={`${dashboardData.analytics.energyConsumption.toFixed(1)} kWh`}
          subtitle="Today's consumption"
          icon={BoltIcon}
          color="text-yellow-500"
          trend={{ value: '-3.1%', direction: 'down', positive: true }}
        />
        <StatCard
          title="Operating Cost"
          value={`$${dashboardData.analytics.costToday.toFixed(2)}`}
          subtitle="Today's expenses"
          icon={CurrencyDollarIcon}
          color="text-purple-500"
          trend={{ value: '-1.8%', direction: 'down', positive: true }}
        />
      </div>

      {/* Device Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Device Status Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {dashboardData.devices.online}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Online</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">
                  {dashboardData.devices.offline}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Offline</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {dashboardData.devices.warning}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {dashboardData.devices.critical}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Critical</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(dashboardData.devices.online / dashboardData.devices.total) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {((dashboardData.devices.online / dashboardData.devices.total) * 100).toFixed(1)}% operational
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Alerts
            </h3>
          </div>
          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Device: {activity.device} • User: {activity.user}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <CpuChipIcon className="h-5 w-5 mr-2" />
              Add Device
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <UsersIcon className="h-5 w-5 mr-2" />
              Manage Users
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              View Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
