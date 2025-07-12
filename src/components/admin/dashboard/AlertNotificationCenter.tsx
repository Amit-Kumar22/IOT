/**
 * Alert Notification Center Component
 * Displays system alerts and notifications for admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SystemAlert } from '@/types/admin';
import { formatDistance } from 'date-fns';

interface AlertNotificationCenterProps {
  maxAlerts?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const getAlertIcon = (type: string): React.ComponentType<any> => {
  switch (type) {
    case 'error':
      return XCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'info':
      return InformationCircleIcon;
    case 'success':
      return CheckCircleIcon;
    default:
      return BellIcon;
  }
};

const getAlertColor = (type: string, severity: string): string => {
  if (severity === 'critical') {
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  }
  
  switch (type) {
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
  }
};

const getCategoryIcon = (category: string): React.ComponentType<any> => {
  switch (category) {
    case 'system':
      return CogIcon;
    case 'billing':
      return ChartBarIcon;
    case 'security':
      return ShieldExclamationIcon;
    case 'performance':
      return ChartBarIcon;
    default:
      return BellIcon;
  }
};

const getSeverityBadge = (severity: string): string => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  switch (severity) {
    case 'critical':
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
    case 'high':
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400`;
    case 'medium':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
    case 'low':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`;
  }
};

export const AlertNotificationCenter: React.FC<AlertNotificationCenterProps> = ({
  maxAlerts = 10,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');
  const [showResolved, setShowResolved] = useState(false);

  // Mock data - In real app, this would come from API
  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      title: 'High API Error Rate',
      message: 'API error rate has exceeded 5% threshold in the last 10 minutes',
      type: 'error',
      severity: 'high',
      category: 'performance',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      isResolved: false,
      tags: ['api', 'performance'],
      metadata: { errorRate: '7.2%', endpoint: '/api/devices' }
    },
    {
      id: '2',
      title: 'Database Connection Pool Full',
      message: 'Database connection pool has reached maximum capacity',
      type: 'warning',
      severity: 'medium',
      category: 'system',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      isResolved: false,
      tags: ['database', 'connections'],
      metadata: { poolSize: '100', activeConnections: '98' }
    },
    {
      id: '3',
      title: 'Multiple Failed Login Attempts',
      message: 'User account locked due to 5 consecutive failed login attempts',
      type: 'warning',
      severity: 'medium',
      category: 'security',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      isResolved: false,
      assignedTo: 'security-team',
      tags: ['security', 'authentication'],
      metadata: { userId: 'user-123', ipAddress: '192.168.1.100' }
    },
    {
      id: '4',
      title: 'Payment Processing Delay',
      message: 'Payment gateway response time exceeding 10 seconds',
      type: 'error',
      severity: 'high',
      category: 'billing',
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      isResolved: false,
      tags: ['billing', 'payment'],
      metadata: { gateway: 'stripe', averageResponseTime: '12.5s' }
    },
    {
      id: '5',
      title: 'Disk Space Warning',
      message: 'Server disk usage has exceeded 85% capacity',
      type: 'warning',
      severity: 'medium',
      category: 'system',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      isResolved: false,
      tags: ['storage', 'capacity'],
      metadata: { server: 'web-server-01', diskUsage: '87%' }
    },
    {
      id: '6',
      title: 'System Backup Completed',
      message: 'Daily system backup completed successfully',
      type: 'success',
      severity: 'low',
      category: 'system',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isResolved: true,
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tags: ['backup', 'maintenance'],
      metadata: { backupSize: '2.3GB', duration: '8 minutes' }
    },
    {
      id: '7',
      title: 'Scheduled Maintenance Complete',
      message: 'Database maintenance window completed without issues',
      type: 'info',
      severity: 'low',
      category: 'system',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isResolved: true,
      resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      tags: ['maintenance', 'database'],
      metadata: { maintenanceType: 'database-optimization' }
    }
  ];

  const fetchAlerts = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return showResolved || !alert.isResolved;
    if (filter === 'unresolved') return !alert.isResolved;
    if (filter === 'critical') return alert.severity === 'critical' && !alert.isResolved;
    return true;
  }).slice(0, maxAlerts);

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isResolved: true, resolvedAt: new Date() }
        : alert
    ));
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAlerts();
  };

  const unresolvedCount = alerts.filter(alert => !alert.isResolved).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.isResolved).length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Center
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Center
          </h3>
          <div className="flex items-center space-x-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {criticalCount} Critical
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {unresolvedCount} Unresolved
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showResolved ? "Hide Resolved" : "Show Resolved"}
          >
            {showResolved ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4">
        {[
          { key: 'unresolved', label: 'Unresolved', count: unresolvedCount },
          { key: 'critical', label: 'Critical', count: criticalCount },
          { key: 'all', label: 'All', count: alerts.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unresolved' ? 'No unresolved alerts' : 'No alerts found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            const CategoryIcon = getCategoryIcon(alert.category);
            
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type, alert.severity)} ${
                  alert.isResolved ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-semibold">
                          {alert.title}
                        </p>
                        <span className={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </span>
                        <CategoryIcon className="h-4 w-4 opacity-60" />
                      </div>
                      <p className="text-sm opacity-90 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatDistance(alert.createdAt, new Date(), { addSuffix: true })}</span>
                        </span>
                        {alert.assignedTo && (
                          <span className="flex items-center space-x-1">
                            <UserIcon className="h-3 w-3" />
                            <span>{alert.assignedTo}</span>
                          </span>
                        )}
                      </div>
                      {alert.tags && alert.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alert.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/60 dark:bg-gray-800/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!alert.isResolved && (
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                      title="Dismiss Alert"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertNotificationCenter;
