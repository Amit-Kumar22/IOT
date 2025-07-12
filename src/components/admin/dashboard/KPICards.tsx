/**
 * KPI Cards Component
 * Displays key performance indicators for admin dashboard
 */

'use client';

import React from 'react';
import { 
  UserGroupIcon, 
  DeviceTabletIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { AdminDashboardStats } from '@/types/admin';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

interface KPICardsProps {
  stats: AdminDashboardStats;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle,
  loading = false 
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className={`h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </p>
            {trend && (
              <div className={`flex items-center ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {trend.label}
            </p>
          )}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export const KPICards: React.FC<KPICardsProps> = ({ stats, loading = false }) => {
  const kpiData = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      trend: {
        value: 12.5,
        label: 'vs last month',
        isPositive: true
      },
      subtitle: `${stats.activeUsers} active`
    },
    {
      title: 'Active Devices',
      value: stats.activeDevices,
      icon: DeviceTabletIcon,
      color: 'bg-green-500',
      trend: {
        value: 8.2,
        label: 'vs last week',
        isPositive: true
      },
      subtitle: `${stats.totalDevices} total`
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      trend: {
        value: 15.7,
        label: 'vs last month',
        isPositive: true
      },
      subtitle: `$${stats.totalRevenue.toLocaleString()} total`
    },
    {
      title: 'System Health',
      value: stats.systemHealth.toUpperCase(),
      icon: stats.systemHealth === 'good' ? CheckCircleIcon : 
            stats.systemHealth === 'warning' ? ExclamationTriangleIcon : 
            ExclamationTriangleIcon,
      color: stats.systemHealth === 'good' ? 'bg-green-500' : 
             stats.systemHealth === 'warning' ? 'bg-yellow-500' : 
             'bg-red-500',
      subtitle: `${stats.systemUptime.toFixed(1)}% uptime`
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: ExclamationTriangleIcon,
      color: stats.activeAlerts > 10 ? 'bg-red-500' : 
             stats.activeAlerts > 5 ? 'bg-yellow-500' : 
             'bg-gray-500',
      subtitle: `${stats.pendingTasks} pending tasks`
    },
    {
      title: 'System Uptime',
      value: `${stats.systemUptime.toFixed(1)}%`,
      icon: ClockIcon,
      color: 'bg-purple-500',
      trend: {
        value: 0.2,
        label: 'vs last week',
        isPositive: true
      },
      subtitle: 'Last 30 days'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          trend={kpi.trend}
          subtitle={kpi.subtitle}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default KPICards;
