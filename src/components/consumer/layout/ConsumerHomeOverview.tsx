'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HomeIcon,
  BoltIcon,
  CogIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

interface HomeStatus {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actionText?: string;
  actionHref?: string;
}

/**
 * Home overview widget showing system status and alerts
 * Provides quick insights into home automation system
 */
export function ConsumerHomeOverview() {
  const [homeStatus] = useState<HomeStatus[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Low Battery',
      message: 'Front door sensor battery at 15%',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      actionText: 'View Device',
      actionHref: '/consumer/devices'
    },
    {
      id: '2',
      type: 'success',
      title: 'Energy Saved',
      message: 'Smart scheduling saved $2.50 today',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      actionText: 'View Report',
      actionHref: '/consumer/energy'
    },
    {
      id: '3',
      type: 'info',
      title: 'Schedule Active',
      message: 'Evening automation will start at 6 PM',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      actionText: 'Manage',
      actionHref: '/consumer/automation'
    }
  ]);

  const [quickStats] = useState([
    { name: 'Active Devices', value: '12', icon: HomeIcon },
    { name: 'Energy Usage', value: '2.4 kW', icon: BoltIcon },
    { name: 'Active Rules', value: '5', icon: ClockIcon },
    { name: 'Notifications', value: '3', icon: BellIcon }
  ]);

  const getStatusColor = (type: HomeStatus['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getStatusIcon = (type: HomeStatus['type']) => {
    switch (type) {
      case 'error':
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return BellIcon;
      default:
        return BellIcon;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else {
      return `${diffInHours} hours ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="flex justify-center mb-2">
                <stat.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <Link 
            href="/consumer/settings"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-3">
          {homeStatus.map((status) => {
            const StatusIcon = getStatusIcon(status.type);
            
            return (
              <div key={status.id} className="flex items-start space-x-3">
                <div className={classNames(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  status.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                  status.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  status.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                  'bg-blue-100 dark:bg-blue-900/20'
                )}>
                  <StatusIcon className={classNames(
                    'h-4 w-4',
                    getStatusColor(status.type)
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(status.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {status.message}
                  </p>
                  {status.actionText && status.actionHref && (
                    <Link
                      href={status.actionHref}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 mt-1 inline-block"
                    >
                      {status.actionText} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
