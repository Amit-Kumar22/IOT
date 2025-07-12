'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import {
  BoltIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { EfficiencyMetrics, EfficiencyTrend, EfficiencyComparison } from '@/types/energy';
import { classNames } from '@/lib/utils';

interface EfficiencyScoreProps {
  metrics: EfficiencyMetrics;
  trend?: EfficiencyTrend;
  comparison?: EfficiencyComparison;
  historicalData?: { date: string; score: number }[];
  showDetails?: boolean;
  compact?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * EfficiencyScore component displays comprehensive energy efficiency metrics
 * Features: A-E rating system, peer comparison, improvement recommendations
 */
export function EfficiencyScore({
  metrics,
  trend = { direction: 'stable', percentageChange: 0, period: 'week' },
  comparison = { betterThan: 50, totalPeers: 100, averageScore: 75 },
  historicalData = [],
  showDetails = true,
  compact = false,
  isLoading = false,
  className = ''
}: EfficiencyScoreProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate efficiency grade and color
  const efficiencyGrade = useMemo(() => {
    const score = metrics.overallScore;
    if (score >= 90) return { grade: 'A', color: '#22C55E', bgColor: 'bg-green-500' };
    if (score >= 80) return { grade: 'B', color: '#84CC16', bgColor: 'bg-lime-500' };
    if (score >= 70) return { grade: 'C', color: '#F59E0B', bgColor: 'bg-amber-500' };
    if (score >= 60) return { grade: 'D', color: '#F97316', bgColor: 'bg-orange-500' };
    return { grade: 'E', color: '#EF4444', bgColor: 'bg-red-500' };
  }, [metrics.overallScore]);

  // Prepare data for radial chart
  const radialData = useMemo(() => [
    {
      name: 'Efficiency',
      value: metrics.overallScore,
      fill: efficiencyGrade.color
    }
  ], [metrics.overallScore, efficiencyGrade.color]);

  // Prepare breakdown data
  const breakdownData = useMemo(() => [
    { name: 'Consumption', value: metrics.consumptionEfficiency, color: '#3B82F6' },
    { name: 'Peak Usage', value: metrics.peakUsageOptimization, color: '#8B5CF6' },
    { name: 'Device Health', value: metrics.deviceEfficiency, color: '#10B981' },
    { name: 'Cost Efficiency', value: metrics.costEfficiency, color: '#F59E0B' }
  ], [metrics]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (metrics.consumptionEfficiency < 70) {
      recs.push({
        type: 'consumption',
        title: 'Optimize Energy Consumption',
        description: 'Your overall consumption is above average. Consider energy-efficient appliances.',
        impact: 'High',
        savings: '$25-50/month',
        priority: 'high'
      });
    }

    if (metrics.peakUsageOptimization < 60) {
      recs.push({
        type: 'peak',
        title: 'Shift Peak Usage',
        description: 'Using energy during peak hours is costly. Schedule high-usage devices for off-peak.',
        impact: 'Medium',
        savings: '$15-30/month',
        priority: 'medium'
      });
    }

    if (metrics.deviceEfficiency < 75) {
      recs.push({
        type: 'devices',
        title: 'Update Inefficient Devices',
        description: 'Some devices are operating below optimal efficiency. Consider maintenance or replacement.',
        impact: 'Medium',
        savings: '$10-25/month',
        priority: 'medium'
      });
    }

    if (metrics.costEfficiency < 65) {
      recs.push({
        type: 'cost',
        title: 'Review Rate Plan',
        description: 'Your current rate plan may not be optimal for your usage patterns.',
        impact: 'High',
        savings: '$20-40/month',
        priority: 'high'
      });
    }

    return recs;
  }, [metrics]);

  // Calculate peer comparison
  const peerComparison = useMemo(() => {
    const better = comparison.betterThan;
    const total = comparison.totalPeers;
    const percentage = (better / total) * 100;
    
    return {
      percentage,
      rank: better + 1,
      total,
      message: percentage >= 75 ? 'Excellent performance!' :
               percentage >= 50 ? 'Above average performance' :
               percentage >= 25 ? 'Room for improvement' :
               'Consider efficiency upgrades'
    };
  }, [comparison]);

  if (isLoading) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-4', className)}>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className={classNames(
              'w-16 h-16 rounded-full flex items-center justify-center',
              efficiencyGrade.bgColor
            )}>
              <span className="text-2xl font-bold text-white">{efficiencyGrade.grade}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.overallScore}% Efficient
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Better than {peerComparison.percentage.toFixed(0)}% of similar homes
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {trend.direction === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : trend.direction === 'down' ? (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
              ) : null}
              <span className="text-xs text-gray-500">
                {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange.toFixed(1)}% this week
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BoltIcon className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Efficiency Score
            </h3>
          </div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          >
            {showBreakdown ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radial Chart */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={90}
                  endAngle={450}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={efficiencyGrade.color}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {efficiencyGrade.grade}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {metrics.overallScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Peer Comparison */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Peer Comparison
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                #{peerComparison.rank}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                out of {peerComparison.total} similar homes
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {peerComparison.message}
              </div>
            </div>

            {/* Trend */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {trend.direction === 'up' ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                ) : trend.direction === 'down' ? (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Weekly Trend
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                vs. last week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Details */}
      {showBreakdown && (
        <div className="px-6 pb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Efficiency Breakdown
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakdown Chart */}
            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Stats */}
            <div className="space-y-3">
              {breakdownData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showDetails && recommendations.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Improvement Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={classNames(
                  'p-4 rounded-lg border-l-4',
                  rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {rec.priority === 'high' ? (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                      ) : rec.priority === 'medium' ? (
                        <InformationCircleIcon className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                      )}
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </h5>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {rec.savings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.impact} Impact
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Star Rating */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Energy Star Rating:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.ceil(metrics.overallScore / 20) ? (
                  <StarIconSolid key={star} className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarIcon key={star} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                )
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Grade: {efficiencyGrade.grade}
          </div>
        </div>
      </div>
    </div>
  );
}
