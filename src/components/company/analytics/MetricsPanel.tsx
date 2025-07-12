'use client';

import React from 'react';
import {
  CpuChipIcon,
  BoltIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { PerformanceMetrics } from '@/types/analytics';

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
  isLoading?: boolean;
  className?: string;
  timeRange?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  status?: 'good' | 'warning' | 'critical';
  subtitle?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  status = 'good',
  subtitle,
  onClick
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border ${getStatusColor()} p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="sr-only">
                    {trend.direction === 'up' ? 'Increased' : trend.direction === 'down' ? 'Decreased' : 'No change'} by
                  </span>
                  <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

/**
 * Metrics Panel Component
 * Displays key performance indicators for industrial IoT systems
 */
export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  isLoading = false,
  className = '',
  timeRange = '24h'
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getUptimeStatus = (uptime: number): MetricCardProps['status'] => {
    if (uptime >= 95) return 'good';
    if (uptime >= 85) return 'warning';
    return 'critical';
  };

  const getEfficiencyStatus = (efficiency: number): MetricCardProps['status'] => {
    if (efficiency >= 80) return 'good';
    if (efficiency >= 60) return 'warning';
    return 'critical';
  };

  const getReliabilityStatus = (reliability: number): MetricCardProps['status'] => {
    if (reliability >= 95) return 'good';
    if (reliability >= 85) return 'warning';
    return 'critical';
  };

  const getAlertStatus = (alertFreq: number): MetricCardProps['status'] => {
    if (alertFreq <= 2) return 'good';
    if (alertFreq <= 5) return 'warning';
    return 'critical';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      <MetricCard
        title="Device Uptime"
        value={metrics.deviceUptime.toFixed(1)}
        unit="%"
        icon={CpuChipIcon}
        status={getUptimeStatus(metrics.deviceUptime)}
        trend={{
          value: 2.3,
          direction: 'up'
        }}
        subtitle={`${metrics.activeDevices}/${metrics.totalDevices} online`}
      />

      <MetricCard
        title="Energy Efficiency"
        value={metrics.energyEfficiency.toFixed(1)}
        unit="%"
        icon={BoltIcon}
        status={getEfficiencyStatus(metrics.energyEfficiency)}
        trend={{
          value: 1.2,
          direction: 'up'
        }}
        subtitle="Optimized consumption"
      />

      <MetricCard
        title="Communication"
        value={metrics.communicationReliability.toFixed(1)}
        unit="% reliable"
        icon={WifiIcon}
        status={getReliabilityStatus(metrics.communicationReliability)}
        trend={{
          value: 0.5,
          direction: 'stable'
        }}
        subtitle="Network connectivity"
      />

      <MetricCard
        title="Alert Frequency"
        value={metrics.alertFrequency.toFixed(1)}
        unit="/hour"
        icon={ExclamationTriangleIcon}
        status={getAlertStatus(metrics.alertFrequency)}
        trend={{
          value: 15.2,
          direction: 'down'
        }}
        subtitle="System alerts"
      />

      <MetricCard
        title="Cost per Device"
        value={`$${metrics.costPerDevice.toFixed(2)}`}
        icon={CurrencyDollarIcon}
        status="good"
        trend={{
          value: 3.1,
          direction: 'down'
        }}
        subtitle={`${timeRange} average`}
      />

      <MetricCard
        title="Data Throughput"
        value={metrics.throughput.toFixed(0)}
        unit="pts/min"
        icon={ChartBarIcon}
        status="good"
        trend={{
          value: 8.5,
          direction: 'up'
        }}
        subtitle="Data points processed"
      />

      <MetricCard
        title="Error Rate"
        value={metrics.errorRate.toFixed(2)}
        unit="%"
        icon={ExclamationTriangleIcon}
        status={metrics.errorRate <= 1 ? 'good' : metrics.errorRate <= 3 ? 'warning' : 'critical'}
        trend={{
          value: 0.8,
          direction: 'down'
        }}
        subtitle="System errors"
      />

      <MetricCard
        title="Total Devices"
        value={metrics.totalDevices}
        icon={CpuChipIcon}
        status="good"
        trend={{
          value: 5.2,
          direction: 'up'
        }}
        subtitle="Managed devices"
      />
    </div>
  );
};

export default MetricsPanel;
