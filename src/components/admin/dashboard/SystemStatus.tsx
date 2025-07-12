/**
 * System Status Component
 * Displays real-time system health and performance indicators
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  description: string;
  threshold: {
    warning: number;
    critical: number;
  };
}

interface SystemService {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  endpoint?: string;
}

interface SystemStatusProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'good':
    case 'online':
      return 'text-green-500';
    case 'warning':
    case 'maintenance':
      return 'text-yellow-500';
    case 'critical':
    case 'offline':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusIcon = (status: string): React.ComponentType<any> => {
  switch (status) {
    case 'good':
    case 'online':
      return CheckCircleIcon;
    case 'warning':
    case 'maintenance':
      return ExclamationTriangleIcon;
    case 'critical':
    case 'offline':
      return XCircleIcon;
    default:
      return ClockIcon;
  }
};

const getStatusBadge = (status: string): string => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  switch (status) {
    case 'good':
    case 'online':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
    case 'warning':
    case 'maintenance':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
    case 'critical':
    case 'offline':
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`;
  }
};

const ProgressBar: React.FC<{ value: number; max: number; status: string }> = ({ 
  value, 
  max, 
  status 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClass = status === 'good' ? 'bg-green-500' : 
                     status === 'warning' ? 'bg-yellow-500' : 
                     'bg-red-500';

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const SystemStatus: React.FC<SystemStatusProps> = ({
  autoRefresh = true,
  refreshInterval = 10000
}) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<SystemService[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSystemStatus = async () => {
    try {
      // Simulate API call - In real app, this would fetch from monitoring service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          status: 'good',
          icon: CpuChipIcon,
          description: 'System processor utilization',
          threshold: { warning: 70, critical: 90 }
        },
        {
          name: 'Memory Usage',
          value: 68,
          unit: '%',
          status: 'good',
          icon: CircleStackIcon,
          description: 'System memory consumption',
          threshold: { warning: 80, critical: 95 }
        },
        {
          name: 'Disk Usage',
          value: 82,
          unit: '%',
          status: 'warning',
          icon: CloudIcon,
          description: 'Storage space utilization',
          threshold: { warning: 80, critical: 95 }
        },
        {
          name: 'Network I/O',
          value: 35,
          unit: 'MB/s',
          status: 'good',
          icon: SignalIcon,
          description: 'Network bandwidth usage',
          threshold: { warning: 80, critical: 100 }
        },
        {
          name: 'Database Response',
          value: 120,
          unit: 'ms',
          status: 'good',
          icon: ChartBarIcon,
          description: 'Average database query time',
          threshold: { warning: 500, critical: 1000 }
        }
      ];

      const mockServices: SystemService[] = [
        {
          name: 'API Gateway',
          status: 'online',
          uptime: 99.9,
          responseTime: 45,
          lastCheck: new Date(),
          endpoint: '/api/health'
        },
        {
          name: 'Database',
          status: 'online',
          uptime: 99.8,
          responseTime: 12,
          lastCheck: new Date(),
          endpoint: '/db/health'
        },
        {
          name: 'Redis Cache',
          status: 'online',
          uptime: 100,
          responseTime: 3,
          lastCheck: new Date(),
          endpoint: '/cache/health'
        },
        {
          name: 'Message Queue',
          status: 'online',
          uptime: 99.7,
          responseTime: 8,
          lastCheck: new Date(),
          endpoint: '/queue/health'
        },
        {
          name: 'File Storage',
          status: 'maintenance',
          uptime: 95.2,
          responseTime: 0,
          lastCheck: new Date(Date.now() - 5 * 60 * 1000),
          endpoint: '/storage/health'
        }
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchSystemStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    fetchSystemStatus();
  };

  const getOverallStatus = (): 'good' | 'warning' | 'critical' => {
    const hasOfflineServices = services.some(s => s.status === 'offline');
    const hasCriticalMetrics = metrics.some(m => m.status === 'critical');
    
    if (hasOfflineServices || hasCriticalMetrics) return 'critical';
    
    const hasMaintenanceServices = services.some(s => s.status === 'maintenance');
    const hasWarningMetrics = metrics.some(m => m.status === 'warning');
    
    if (hasMaintenanceServices || hasWarningMetrics) return 'warning';
    
    return 'good';
  };

  const overallStatus = getOverallStatus();
  const OverallIcon = getStatusIcon(overallStatus);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Status
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Status
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <OverallIcon className={`h-5 w-5 ${getStatusColor(overallStatus)}`} />
            <span className={getStatusBadge(overallStatus)}>
              {overallStatus.toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            System Metrics
          </h4>
          <div className="space-y-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    metric.status === 'good' ? 'bg-green-100 dark:bg-green-900/20' :
                    metric.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <Icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {metric.name}
                      </p>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <ProgressBar 
                      value={metric.value} 
                      max={metric.threshold.critical} 
                      status={metric.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Services Status
          </h4>
          <div className="space-y-4">
            {services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.uptime}% uptime
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getStatusBadge(service.status)}>
                      {service.status}
                    </span>
                    {service.status === 'online' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {service.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
