/**
 * Recent Activity Component
 * Displays real-time system activity feed for admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  BellIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { RecentActivity } from '@/types/admin';
import { formatDistance } from 'date-fns';

interface RecentActivityProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ActivityIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const iconClass = `h-5 w-5 ${color}`;
  
  switch (type) {
    case 'user_action':
      return <UserPlusIcon className={iconClass} />;
    case 'device_event':
      return <DevicePhoneMobileIcon className={iconClass} />;
    case 'billing_event':
      return <CurrencyDollarIcon className={iconClass} />;
    case 'system_event':
      return <CogIcon className={iconClass} />;
    case 'alert':
      return <ExclamationTriangleIcon className={iconClass} />;
    case 'success':
      return <CheckCircleIcon className={iconClass} />;
    case 'error':
      return <XCircleIcon className={iconClass} />;
    default:
      return <BellIcon className={iconClass} />;
  }
};

const getActivityColor = (type: string): string => {
  switch (type) {
    case 'user_action':
      return 'text-blue-500';
    case 'device_event':
      return 'text-green-500';
    case 'billing_event':
      return 'text-yellow-500';
    case 'system_event':
      return 'text-purple-500';
    case 'alert':
      return 'text-red-500';
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getBorderColor = (type: string): string => {
  switch (type) {
    case 'user_action':
      return 'border-blue-200 dark:border-blue-800';
    case 'device_event':
      return 'border-green-200 dark:border-green-800';
    case 'billing_event':
      return 'border-yellow-200 dark:border-yellow-800';
    case 'system_event':
      return 'border-purple-200 dark:border-purple-800';
    case 'alert':
      return 'border-red-200 dark:border-red-800';
    case 'success':
      return 'border-green-200 dark:border-green-800';
    case 'error':
      return 'border-red-200 dark:border-red-800';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

export const RecentActivityFeed: React.FC<RecentActivityProps> = ({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data - In real app, this would come from API
  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_action',
      title: 'New User Registration',
      description: 'john.doe@example.com registered as consumer',
      userId: '1',
      userName: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      metadata: { userType: 'consumer' }
    },
    {
      id: '2',
      type: 'device_event',
      title: 'Device Connected',
      description: 'Smart Thermostat #ST-142 came online',
      deviceId: 'ST-142',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      metadata: { deviceType: 'thermostat', location: 'Living Room' }
    },
    {
      id: '3',
      type: 'billing_event',
      title: 'Payment Processed',
      description: 'Monthly subscription payment of $29.99 processed',
      userId: '2',
      userName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      metadata: { amount: 29.99, plan: 'Professional' }
    },
    {
      id: '4',
      type: 'system_event',
      title: 'System Maintenance',
      description: 'Database optimization completed successfully',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      metadata: { duration: '15 minutes' }
    },
    {
      id: '5',
      type: 'alert',
      title: 'High API Usage',
      description: 'API rate limit approaching for user acmecorp@example.com',
      userId: '3',
      userName: 'ACME Corp',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      metadata: { usage: '85%', limit: '10000' }
    },
    {
      id: '6',
      type: 'device_event',
      title: 'Device Disconnected',
      description: 'Smart Light #SL-089 went offline',
      deviceId: 'SL-089',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metadata: { deviceType: 'light', location: 'Kitchen' }
    },
    {
      id: '7',
      type: 'user_action',
      title: 'Plan Upgrade',
      description: 'mike.wilson@email.com upgraded to Professional plan',
      userId: '4',
      userName: 'Mike Wilson',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      metadata: { fromPlan: 'Basic', toPlan: 'Professional' }
    },
    {
      id: '8',
      type: 'success',
      title: 'Backup Completed',
      description: 'Daily system backup completed successfully',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      metadata: { size: '2.3GB', duration: '8 minutes' }
    },
    {
      id: '9',
      type: 'billing_event',
      title: 'Invoice Generated',
      description: 'Monthly invoice #INV-2024-001 generated',
      userId: '5',
      userName: 'TechStartup Inc.',
      timestamp: new Date(Date.now() - 75 * 60 * 1000),
      metadata: { amount: 149.99, invoiceNumber: 'INV-2024-001' }
    },
    {
      id: '10',
      type: 'system_event',
      title: 'Security Scan',
      description: 'Weekly security scan completed with no issues',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      metadata: { vulnerabilities: 0, duration: '45 minutes' }
    }
  ];

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sort by timestamp and limit
      const sortedActivities = mockActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
      
      setActivities(sortedActivities);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {formatDistance(lastRefresh, new Date(), { addSuffix: true })}
          </p>
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
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="View All"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getBorderColor(activity.type)} bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors`}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <ActivityIcon type={activity.type} color={getActivityColor(activity.type)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  {activity.userName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {activity.userName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>
                {activity.metadata && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
