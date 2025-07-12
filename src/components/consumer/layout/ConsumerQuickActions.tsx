'use client';

import { useState } from 'react';
import { 
  LightBulbIcon,
  PowerIcon,
  HomeIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  LightBulbIcon as LightBulbIconSolid,
  PowerIcon as PowerIconSolid,
  HomeIcon as HomeIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid 
} from '@heroicons/react/24/solid';
import { classNames } from '@/lib/utils';

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  solidIcon: React.ElementType;
  isActive: boolean;
  action: () => void;
  description: string;
}

/**
 * Quick actions component for consumer dashboard
 * Provides immediate access to most common device controls
 */
export function ConsumerQuickActions() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    {
      id: 'living-room-lights',
      name: 'Living Room',
      icon: LightBulbIcon,
      solidIcon: LightBulbIconSolid,
      isActive: true,
      action: () => toggleAction('living-room-lights'),
      description: 'Main lights'
    },
    {
      id: 'security-system',
      name: 'Security',
      icon: ShieldCheckIcon,
      solidIcon: ShieldCheckIconSolid,
      isActive: true,
      action: () => toggleAction('security-system'),
      description: 'Armed'
    },
    {
      id: 'thermostat',
      name: 'Climate',
      icon: HomeIcon,
      solidIcon: HomeIconSolid,
      isActive: false,
      action: () => toggleAction('thermostat'),
      description: '72°F'
    },
    {
      id: 'main-power',
      name: 'All Devices',
      icon: PowerIcon,
      solidIcon: PowerIconSolid,
      isActive: true,
      action: () => toggleAction('main-power'),
      description: 'On'
    }
  ]);

  const toggleAction = (actionId: string) => {
    setQuickActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, isActive: !action.isActive }
        : action
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <BoltIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.isActive ? action.solidIcon : action.icon;
          
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={classNames(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px]',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'active:scale-95 hover:scale-105',
                action.isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              <IconComponent className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">{action.name}</span>
              <span className="text-xs opacity-75">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
