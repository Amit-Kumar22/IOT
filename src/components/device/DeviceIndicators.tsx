import React from 'react';
import {
  WifiIcon,
  SignalIcon,
  Battery0Icon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export interface DeviceMetrics {
  uptime: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  dataPoints: number;
  lastUpdate: string;
}

export interface DeviceStatusIndicatorProps {
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export interface DeviceMetricsDisplayProps {
  metrics: DeviceMetrics;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export interface ConnectivityIndicatorProps {
  signal?: number;
  battery?: number;
  wifi?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DeviceStatusIndicator: React.FC<DeviceStatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          label: 'Online',
          pulseColor: 'animate-pulse bg-green-400'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400',
          label: 'Offline',
          pulseColor: ''
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          label: 'Error',
          pulseColor: 'animate-pulse bg-red-400'
        };
      case 'maintenance':
        return {
          icon: ClockIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          label: 'Maintenance',
          pulseColor: 'animate-pulse bg-yellow-400'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500',
          label: 'Warning',
          pulseColor: 'animate-pulse bg-orange-400'
        };
      default:
        return {
          icon: XCircleIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400',
          label: 'Unknown',
          pulseColor: ''
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (showLabel) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative">
          <IconComponent className={`${sizeClasses[size]} ${config.color}`} />
          {animated && config.pulseColor && (
            <div className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-75`}></div>
          )}
        </div>
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.bgColor}`}></div>
      {animated && config.pulseColor && (
        <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.pulseColor} opacity-75`}></div>
      )}
    </div>
  );
};

export const DeviceMetricsDisplay: React.FC<DeviceMetricsDisplayProps> = ({
  metrics,
  variant = 'detailed',
  className = ''
}) => {
  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return '99.9%+';
    return `${uptime.toFixed(1)}%`;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600 dark:text-green-400';
    if (uptime >= 95) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 100) return 'text-green-600 dark:text-green-400';
    if (responseTime <= 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 text-sm ${className}`}>
        <div className="flex items-center space-x-1">
          <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
          <span className={`font-medium ${getUptimeColor(metrics.uptime)}`}>
            {formatUptime(metrics.uptime)}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-500 dark:text-gray-400">Response:</span>
          <span className={`font-medium ${getResponseTimeColor(metrics.responseTime)}`}>
            {metrics.responseTime}ms
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <div className="text-center">
        <div className={`text-lg font-bold ${getUptimeColor(metrics.uptime)}`}>
          {formatUptime(metrics.uptime)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-bold ${getResponseTimeColor(metrics.responseTime)}`}>
          {metrics.responseTime}ms
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Response</div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-bold ${
          metrics.errorRate <= 1 
            ? 'text-green-600 dark:text-green-400' 
            : metrics.errorRate <= 5 
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {metrics.errorRate.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Error Rate</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {metrics.dataPoints.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Data Points</div>
      </div>
    </div>
  );
};

export const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({
  signal,
  battery,
  wifi,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return 'text-green-500';
    if (signal >= 60) return 'text-yellow-500';
    if (signal >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 50) return 'text-green-500';
    if (battery >= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {wifi !== undefined && (
        <div className="flex items-center space-x-1">
          <WifiIcon className={`${sizeClasses[size]} ${wifi ? 'text-green-500' : 'text-gray-400'}`} />
          {size !== 'sm' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {wifi ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </div>
      )}
      
      {signal !== undefined && (
        <div className="flex items-center space-x-1">
          <SignalIcon className={`${sizeClasses[size]} ${getSignalColor(signal)}`} />
          {size !== 'sm' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {signal}%
            </span>
          )}
        </div>
      )}
      
      {battery !== undefined && (
        <div className="flex items-center space-x-1">
          <Battery0Icon className={`${sizeClasses[size]} ${getBatteryColor(battery)}`} />
          {size !== 'sm' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {battery}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  DeviceStatusIndicator,
  DeviceMetricsDisplay,
  ConnectivityIndicator
};
