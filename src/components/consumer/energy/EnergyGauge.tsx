'use client';

import { useState, useEffect } from 'react';
import { 
  BoltIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { EnergyData, EnergyStats } from '@/types/energy';
import { classNames } from '@/lib/utils';

interface EnergyGaugeProps {
  energyData: EnergyData;
  energyStats: EnergyStats;
  maxConsumption?: number; // kWh for gauge scale
  showCost?: boolean;
  showEfficiency?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * EnergyGauge component displays real-time energy consumption with visual gauge
 * Features: Real-time updates, cost display, efficiency metrics, trend indicators
 */
export function EnergyGauge({
  energyData,
  energyStats,
  maxConsumption = 50,
  showCost = true,
  showEfficiency = true,
  isLoading = false,
  className = ''
}: EnergyGaugeProps) {
  const [animationValue, setAnimationValue] = useState(0);

  // Calculate gauge percentage (0-100) with null safety
  const currentConsumption = energyData.totalConsumption;
  const gaugePercentage = Math.min((currentConsumption / maxConsumption) * 100, 100);

  // Animate gauge on mount and updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationValue(gaugePercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [gaugePercentage]);

  // Determine gauge color based on consumption level
  const getGaugeColor = (percentage: number) => {
    if (percentage <= 30) return 'text-green-500';
    if (percentage <= 60) return 'text-yellow-500';
    if (percentage <= 80) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get trend direction and color
  const getTrendInfo = (change: number) => {
    if (change > 5) return { icon: ArrowTrendingUpIcon, color: 'text-red-500', text: 'Higher' };
    if (change < -5) return { icon: ArrowTrendingDownIcon, color: 'text-green-500', text: 'Lower' };
    return { icon: null, color: 'text-gray-500', text: 'Stable' };
  };

  const todayTrend = getTrendInfo(energyStats?.comparison?.yesterdayChange || 0);
  const TrendIcon = todayTrend.icon;

  // Format numbers for display with safe access
  const formatConsumption = (value: number | undefined) => (value || 0).toFixed(1);
  const formatCost = (value: number | undefined) => `$${(value || 0).toFixed(2)}`;
  const formatEfficiency = (rating: string, score: number) => `${rating} (${score}%)`;

  if (isLoading) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BoltIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Energy Usage
          </h3>
        </div>
        {energyData.totalConsumption > maxConsumption * 0.8 && (
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" title="High Usage Alert" />
        )}
      </div>

      {/* Energy Gauge */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Background Circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(animationValue * 314) / 100} 314`}
            className={classNames(
              'transition-all duration-1000 ease-out',
              getGaugeColor(gaugePercentage)
            )}
            style={{
              transformOrigin: '60px 60px',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatConsumption(currentConsumption)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            kWh
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            of {maxConsumption} kWh
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Today's Cost */}
        {showCost && energyStats?.today && (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCost(energyStats.today.cost)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Today&rsquo;s Cost
            </div>
          </div>
        )}

        {/* Efficiency Score */}
        {showEfficiency && energyData.efficiency && (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {energyData.efficiency.rating}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Efficiency
            </div>
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {TrendIcon && (
          <TrendIcon className={classNames('h-4 w-4', todayTrend.color)} />
        )}
        <span className={classNames('text-sm font-medium', todayTrend.color)}>
          {Math.abs(energyStats?.comparison?.yesterdayChange || 0).toFixed(1)}% {todayTrend.text}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          vs. yesterday
        </span>
      </div>

      {/* Peak Hours Warning */}
      {energyData.peakHours && energyData.peakHours.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Peak Hours Active
            </span>
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {energyData.peakHours.map((period, index) => (
              <span key={index}>
                {period.startTime} - {period.endTime}
                {index < energyData.peakHours.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <button
          className="flex-1 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          onClick={() => {/* Handle energy saving mode */}}
        >
          Energy Saver
        </button>
        <button
          className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          onClick={() => {/* Handle view details */}}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Additional gauge variant for compact display
export function CompactEnergyGauge({
  energyData,
  maxConsumption = 50,
  className = ''
}: {
  energyData: EnergyData;
  maxConsumption?: number;
  className?: string;
}) {
  const gaugePercentage = Math.min((energyData.totalConsumption / maxConsumption) * 100, 100);
  
  return (
    <div className={classNames('flex items-center space-x-3', className)}>
      {/* Mini Gauge */}
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(gaugePercentage * 100.5) / 100} 100.5`}
            className={classNames(
              'transition-all duration-500',
              gaugePercentage <= 50 ? 'text-green-500' :
              gaugePercentage <= 75 ? 'text-yellow-500' : 'text-red-500'
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <BoltIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      {/* Compact Stats */}
      <div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {(energyData?.totalConsumption || 0).toFixed(1)} kWh
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ${(energyData?.cost || 0).toFixed(2)} today
        </div>
      </div>
    </div>
  );
}
