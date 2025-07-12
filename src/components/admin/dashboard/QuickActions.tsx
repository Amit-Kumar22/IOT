/**
 * Quick Actions Component
 * Provides common administrative actions for the admin dashboard
 */

'use client';

import React, { useState } from 'react';
import { 
  PlusIcon,
  UserGroupIcon,
  CreditCardIcon,
  BellIcon,
  EnvelopeIcon,
  CloudArrowDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: QuickAction) => {
    if (action.disabled) return;
    
    setLoading(action.id);
    
    try {
      if (action.onClick) {
        await action.onClick();
      } else if (action.href) {
        router.push(action.href);
      }
      
      if (onActionClick) {
        onActionClick(action.id);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const actions: QuickAction[] = [
    {
      id: 'add-user',
      title: 'Add New User',
      description: 'Create a new user account',
      icon: UserGroupIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/admin/users?action=create'
    },
    {
      id: 'create-plan',
      title: 'Create Billing Plan',
      description: 'Set up a new pricing plan',
      icon: CreditCardIcon,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/admin/plans?action=create'
    },
    {
      id: 'send-notification',
      title: 'Send Notification',
      description: 'Broadcast message to users',
      icon: BellIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        // Open notification modal
        console.log('Opening notification modal');
      }
    },
    {
      id: 'email-campaign',
      title: 'Email Campaign',
      description: 'Send marketing emails',
      icon: EnvelopeIcon,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => {
        // Open email campaign modal
        console.log('Opening email campaign modal');
      }
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download system reports',
      icon: CloudArrowDownIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => {
        // Open export modal
        console.log('Opening export modal');
      }
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: CogIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      href: '/admin/system'
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Run security scan',
      icon: ShieldCheckIcon,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: async () => {
        // Simulate security audit
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Security audit completed');
      }
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: ChartBarIcon,
      color: 'bg-teal-500 hover:bg-teal-600',
      href: '/admin/analytics?action=generate'
    },
    {
      id: 'maintenance-mode',
      title: 'Maintenance Mode',
      description: 'Toggle system maintenance',
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => {
        // Toggle maintenance mode
        console.log('Toggling maintenance mode');
      }
    },
    {
      id: 'backup-system',
      title: 'Backup System',
      description: 'Create system backup',
      icon: ArrowPathIcon,
      color: 'bg-pink-500 hover:bg-pink-600',
      onClick: async () => {
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('System backup completed');
      }
    },
    {
      id: 'view-logs',
      title: 'View System Logs',
      description: 'Check system activity',
      icon: DocumentTextIcon,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      href: '/admin/logs'
    },
    {
      id: 'add-alert',
      title: 'Create Alert',
      description: 'Set up system alerts',
      icon: BellIcon,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => {
        // Open alert creation modal
        console.log('Opening alert creation modal');
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {actions.length} actions available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled || isLoading}
              className={`
                relative p-4 rounded-lg text-left transition-all duration-200 
                ${action.color} text-white 
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105 hover:shadow-lg'}
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {action.title}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-white/80 leading-relaxed">
                {action.description}
              </p>
              
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Categories */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Action Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'User Management', count: 1, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
            { name: 'Billing', count: 1, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
            { name: 'Communication', count: 2, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
            { name: 'System', count: 5, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
            { name: 'Analytics', count: 1, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400' },
            { name: 'Security', count: 1, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
          ].map((category) => (
            <span
              key={category.name}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}
            >
              {category.name} ({category.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
