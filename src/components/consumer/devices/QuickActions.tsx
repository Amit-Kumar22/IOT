'use client';

import { useState } from 'react';
import { DeviceAction } from '@/types/consumer-devices';
import { 
  SunIcon, 
  MoonIcon, 
  HomeIcon, 
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  actions: DeviceAction[];
}

interface QuickActionsProps {
  onExecuteAction: (actions: DeviceAction[]) => Promise<void>;
  loading?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'good-morning',
    name: 'Good Morning',
    description: 'Turn on lights, adjust temperature, open blinds',
    icon: SunIcon,
    color: 'bg-yellow-500',
    actions: [
      { type: 'setState', payload: { isOn: true, brightness: 80 } },
      { type: 'setTemperature', payload: { temperature: 22 } },
      { type: 'set', payload: { blinds: 'open' } }
    ]
  },
  {
    id: 'bedtime',
    name: 'Bedtime',
    description: 'Turn off lights, lock doors, set night temperature',
    icon: MoonIcon,
    color: 'bg-indigo-500',
    actions: [
      { type: 'setState', payload: { isOn: false } },
      { type: 'set', payload: { doors: 'locked' } },
      { type: 'setTemperature', payload: { temperature: 18 } }
    ]
  },
  {
    id: 'away-mode',
    name: 'Away Mode',
    description: 'Activate security, turn off non-essential devices',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
    actions: [
      { type: 'set', payload: { securitySystem: 'armed' } },
      { type: 'setState', payload: { isOn: false } },
      { type: 'setTemperature', payload: { temperature: 20 } }
    ]
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    description: 'Dim lights, close blinds, turn off notifications',
    icon: HomeIcon,
    color: 'bg-purple-500',
    actions: [
      { type: 'setBrightness', payload: { brightness: 20 } },
      { type: 'set', payload: { blinds: 'closed' } },
      { type: 'set', payload: { notifications: 'silent' } }
    ]
  },
  {
    id: 'energy-saver',
    name: 'Energy Saver',
    description: 'Optimize all devices for energy efficiency',
    icon: LightBulbIcon,
    color: 'bg-green-500',
    actions: [
      { type: 'setBrightness', payload: { brightness: 50 } },
      { type: 'setTemperature', payload: { temperature: 19 } },
      { type: 'set', payload: { standbyMode: 'enabled' } }
    ]
  },
  {
    id: 'party-mode',
    name: 'Party Mode',
    description: 'Bright lights, music system, colorful ambiance',
    icon: SunIcon,
    color: 'bg-pink-500',
    actions: [
      { type: 'setBrightness', payload: { brightness: 100 } },
      { type: 'setColor', payload: { color: '#ff00ff' } },
      { type: 'set', payload: { music: 'party playlist' } }
    ]
  }
];

export default function QuickActions({ onExecuteAction, loading = false }: QuickActionsProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const handleExecuteAction = async (action: QuickAction) => {
    if (loading || executingAction) return;

    setExecutingAction(action.id);
    try {
      await onExecuteAction(action.actions);
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <button className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Customize
        </button>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
            onExecute={() => handleExecuteAction(action)}
            isExecuting={executingAction === action.id}
            disabled={loading || executingAction !== null}
          />
        ))}
      </div>

      {/* Custom Action Builder */}
      <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Create Custom Action
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Build your own quick action with multiple device controls
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <span>Create</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  action: QuickAction;
  onExecute: () => void;
  isExecuting: boolean;
  disabled: boolean;
}

function QuickActionCard({ action, onExecute, isExecuting, disabled }: QuickActionCardProps) {
  const IconComponent = action.icon;

  return (
    <button
      onClick={onExecute}
      disabled={disabled}
      className={`
        relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
        transition-all duration-200 text-left group
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        ${isExecuting ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3
        ${action.color} text-white group-hover:scale-105 transition-transform
      `}>
        <IconComponent className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {action.name}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {action.description}
        </p>
      </div>

      {/* Execution Indicator */}
      {isExecuting && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Executing...</span>
          </div>
        </div>
      )}

      {/* Action Count Badge */}
      <div className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
        {action.actions.length} actions
      </div>
    </button>
  );
}

// Hook for using Quick Actions
export function useQuickActions() {
  const executeActions = async (actions: DeviceAction[]) => {
    // This would integrate with your device control system
    console.log('Executing actions:', actions);
    
    // Simulate API calls
    for (const action of actions) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Executed action: ${action.type}`, action.payload);
    }
  };

  return { executeActions };
}
