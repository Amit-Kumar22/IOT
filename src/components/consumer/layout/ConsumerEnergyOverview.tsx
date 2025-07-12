'use client';

import { useState, useEffect } from 'react';
import { 
  BoltIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

interface EnergyMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
}

/**
 * Energy status overview widget for consumer dashboard
 * Shows key energy metrics at a glance
 */
export function ConsumerEnergyOverview() {
  const [energyMetrics, setEnergyMetrics] = useState<EnergyMetric[]>([
    {
      id: 'current-usage',
      name: 'Current Usage',
      value: '2.4',
      unit: 'kW',
      icon: BoltIcon,
      trend: 'down',
      trendValue: '5%',
      color: 'green'
    },
    {
      id: 'today-cost',
      name: 'Today\'s Cost',
      value: '$12.45',
      unit: '',
      icon: CurrencyDollarIcon,
      trend: 'up',
      trendValue: '8%',
      color: 'yellow'
    },
    {
      id: 'efficiency',
      name: 'Efficiency',
      value: 'A+',
      unit: 'rating',
      icon: HomeIcon,
      trend: 'stable',
      trendValue: '0%',
      color: 'green'
    },
    {
      id: 'peak-hours',
      name: 'Peak Hours',
      value: '2',
      unit: 'hrs left',
      icon: ClockIcon,
      trend: 'down',
      trendValue: '25%',
      color: 'blue'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyMetrics(prev => prev.map(metric => {
        if (metric.id === 'current-usage') {
          const newValue = (parseFloat(metric.value) + (Math.random() - 0.5) * 0.2).toFixed(1);
          return { ...metric, value: newValue };
        }
        return metric;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'yellow':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Energy Overview
        </h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {energyMetrics.map((metric) => (
          <div
            key={metric.id}
            className={classNames(
              'p-3 rounded-lg border',
              getColorClasses(metric.color)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {getTrendIcon(metric.trend)} {metric.trendValue}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold">{metric.value}</span>
              {metric.unit && (
                <span className="text-sm font-medium ml-1 opacity-75">
                  {metric.unit}
                </span>
              )}
            </div>
            <p className="text-xs font-medium mt-1 opacity-75">
              {metric.name}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Monthly Goal: $150
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            83% Complete
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: '83%' }}
          />
        </div>
      </div>
    </div>
  );
}
