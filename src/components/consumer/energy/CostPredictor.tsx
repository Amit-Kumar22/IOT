'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { CostPrediction, PredictionScenario, RatePlan, EnergyPeriod } from '@/types/energy';
import { classNames } from '@/lib/utils';

interface CostPredictorProps {
  currentUsage: number;
  ratePlan: RatePlan;
  predictions: CostPrediction[];
  historicalData?: { date: string; cost: number; usage: number }[];
  scenarios?: PredictionScenario[];
  period?: EnergyPeriod;
  targetBudget?: number;
  isLoading?: boolean;
  className?: string;
}

/**
 * CostPredictor component provides intelligent cost forecasting and budget tracking
 * Features: Multiple prediction scenarios, budget alerts, rate plan optimization
 */
export function CostPredictor({
  currentUsage,
  ratePlan,
  predictions,
  historicalData = [],
  scenarios = [],
  period = 'month',
  targetBudget,
  isLoading = false,
  className = ''
}: CostPredictorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('current');
  const [showSettings, setShowSettings] = useState(false);
  const [customBudget, setCustomBudget] = useState<number>(targetBudget || 0);

  // Calculate predictions based on scenarios
  const scenarioData = useMemo(() => {
    const baseScenario = predictions.find(p => p.scenario === 'current') || predictions[0];
    if (!baseScenario) return [];

    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const scenario = scenarios.find(s => s.name === selectedScenario);
      const adjustmentFactor = scenario?.adjustmentFactor || 1;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        predicted: baseScenario.predictedCost * adjustmentFactor * (1 + (i * 0.02)),
        historical: historicalData[i]?.cost || null,
        confidence: Math.max(0.9 - (i * 0.01), 0.6)
      };
    });

    return data;
  }, [predictions, selectedScenario, scenarios, historicalData]);

  // Calculate budget status
  const budgetStatus = useMemo(() => {
    if (!targetBudget) return null;

    const currentPrediction = predictions.find(p => p.scenario === 'current');
    if (!currentPrediction) return null;

    const projectedCost = currentPrediction.predictedCost;
    const percentageUsed = (projectedCost / targetBudget) * 100;

    return {
      projectedCost,
      targetBudget,
      percentageUsed,
      isOverBudget: projectedCost > targetBudget,
      remainingBudget: targetBudget - projectedCost,
      daysRemaining: Math.ceil((new Date(currentPrediction.periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    };
  }, [predictions, targetBudget]);

  // Get rate plan recommendations
  const rateRecommendations = useMemo(() => {
    if (!ratePlan || !currentUsage) return [];

    const recommendations = [];
    
    // Time-of-use analysis
    if (ratePlan.timeOfUse && currentUsage > ratePlan.timeOfUse.peakRate) {
      recommendations.push({
        type: 'peak_usage',
        title: 'High Peak Usage Detected',
        description: 'Consider shifting energy use to off-peak hours',
        potentialSavings: (currentUsage * 0.3 * (ratePlan.timeOfUse.peakRate - ratePlan.timeOfUse.offPeakRate)),
        priority: 'high'
      });
    }

    // Tier analysis
    if (ratePlan.tieredRates && currentUsage > ratePlan.tieredRates[0].threshold) {
      const currentTier = ratePlan.tieredRates.find(tier => currentUsage <= tier.threshold) || ratePlan.tieredRates[ratePlan.tieredRates.length - 1];
      recommendations.push({
        type: 'tier_optimization',
        title: `Currently in Tier ${ratePlan.tieredRates.indexOf(currentTier) + 1}`,
        description: 'Reduce usage to stay in lower cost tier',
        potentialSavings: currentUsage * 0.1 * (currentTier.rate - ratePlan.tieredRates[0].rate),
        priority: 'medium'
      });
    }

    return recommendations;
  }, [ratePlan, currentUsage]);

  if (isLoading) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Predictor
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Scenario Selector */}
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="current">Current Usage</option>
              {scenarios.map((scenario) => (
                <option key={scenario.name} value={scenario.name}>
                  {scenario.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mx-6 mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Budget ($)
              </label>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Enter budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rate Plan
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {ratePlan.name} - ${ratePlan.baseRate}/kWh
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Status */}
      {budgetStatus && (
        <div className="mx-6 mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {budgetStatus.isOverBudget ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Budget Status
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {budgetStatus.daysRemaining} days remaining
            </span>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Projected: ${budgetStatus.projectedCost.toFixed(2)}</span>
              <span>Budget: ${budgetStatus.targetBudget.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={classNames(
                  'h-2 rounded-full transition-all duration-300',
                  budgetStatus.isOverBudget ? 'bg-red-500' : 'bg-green-500'
                )}
                style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {budgetStatus.isOverBudget ? 'Over budget by' : 'Remaining'}: 
              ${Math.abs(budgetStatus.remainingBudget).toFixed(2)}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {budgetStatus.percentageUsed.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Prediction Chart */}
      <div className="px-6 mb-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            
            {/* Budget line */}
            {targetBudget && (
              <ReferenceLine y={targetBudget} stroke="#EF4444" strokeDasharray="5 5" />
            )}
            
            {/* Historical data */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#6B7280"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Historical"
              connectNulls={false}
            />
            
            {/* Predicted data */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Predicted"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rate Plan Recommendations */}
      {rateRecommendations.length > 0 && (
        <div className="mx-6 mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Optimization Recommendations
          </h4>
          <div className="space-y-2">
            {rateRecommendations.map((rec, index) => (
              <div
                key={index}
                className={classNames(
                  'p-3 rounded-lg border-l-4',
                  rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Save ${rec.potentialSavings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {predictions.map((prediction, index) => (
            <div key={prediction.scenario} className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                {prediction.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />
                ) : prediction.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${prediction.predictedCost.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {prediction.scenario} Scenario
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {(prediction.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
