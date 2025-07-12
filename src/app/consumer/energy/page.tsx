'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnergyGauge } from '@/components/consumer/energy/EnergyGauge';
import { UsageChart } from '@/components/consumer/energy/UsageChart';
import { CostPredictor } from '@/components/consumer/energy/CostPredictor';
import { EfficiencyScore } from '@/components/consumer/energy/EfficiencyScore';
import { SavingsTips } from '@/components/consumer/energy/SavingsTips';
import { useEnergyUpdates } from '@/hooks/useEnergyUpdates';
import { EnergyData, EnergyStats, EnergyUsageHistory, CostPrediction, EfficiencyMetrics, EnergySavingsTip, UserProfile, RatePlan } from '@/types/energy';
import { 
  ChartBarIcon, 
  BoltIcon, 
  CogIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function EnergyManagementPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [showSettings, setShowSettings] = useState(false);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Energy data from WebSocket hook
  const { 
    energyData, 
    isConnected, 
    connectionError, 
    updateCount,
    requestEnergyUpdate,
    reconnect 
  } = useEnergyUpdates();

  // Mock energy stats for demonstration
  const mockEnergyStats: EnergyStats = {
    hourly: { average: 2.5, peak: 4.2, total: 2.8 },
    daily: { average: 24.5, peak: 35.2, total: 24.7 },
    weekly: { average: 26.6, peak: 38.1, total: 186.3 },
    monthly: { average: 27.3, peak: 42.0, total: 847.2 }
  };

  // Mock usage history
  const mockUsageHistory: EnergyUsageHistory = {
    period: 'daily',
    data: [
      { timestamp: new Date('2025-01-01T00:00:00Z'), consumption: 2.1, cost: 0.25, weather: { temperature: 68, humidity: 45, condition: 'clear' } },
      { timestamp: new Date('2025-01-01T01:00:00Z'), consumption: 1.8, cost: 0.22, weather: { temperature: 67, humidity: 46, condition: 'clear' } },
      { timestamp: new Date('2025-01-01T02:00:00Z'), consumption: 1.6, cost: 0.19, weather: { temperature: 66, humidity: 47, condition: 'clear' } },
      { timestamp: new Date('2025-01-01T03:00:00Z'), consumption: 1.4, cost: 0.17, weather: { temperature: 65, humidity: 48, condition: 'clear' } },
      { timestamp: new Date('2025-01-01T04:00:00Z'), consumption: 1.2, cost: 0.14, weather: { temperature: 64, humidity: 49, condition: 'clear' } },
    ]
  };

  // Mock cost predictions
  const mockCostPredictions: CostPrediction[] = [
    { period: 'month', predicted: 105.50, factors: ['current_usage', 'weather_forecast'] },
    { period: 'week', predicted: 24.30, factors: ['current_usage'] },
    { period: 'day', predicted: 3.60, factors: ['current_usage', 'time_of_day'] }
  ];

  // Mock efficiency metrics
  const mockEfficiencyMetrics: EfficiencyMetrics = {
    score: 92,
    rating: 'A',
    suggestions: [
      { category: 'heating', description: 'Optimize thermostat schedule', impact: 'high' },
      { category: 'lighting', description: 'Switch to LED bulbs', impact: 'medium' }
    ],
    trendsDirection: 'improving'
  };

  // Mock savings tips
  const mockSavingsTips: EnergySavingsTip[] = [
    {
      id: '1',
      title: 'Lower thermostat at night',
      description: 'Set your thermostat 7-10°F lower when sleeping to save on heating costs',
      category: 'heating',
      difficulty: 'easy',
      potentialSavings: 18,
      estimatedTime: '2 minutes',
      priority: 'high',
      steps: ['Locate thermostat', 'Set schedule', 'Test settings'],
      tools: ['Programmable thermostat']
    },
    {
      id: '2',
      title: 'Unplug devices when not in use',
      description: 'Many electronics draw power even when turned off',
      category: 'appliances',
      difficulty: 'easy',
      potentialSavings: 12,
      estimatedTime: '5 minutes',
      priority: 'medium',
      steps: ['Identify phantom loads', 'Use power strips', 'Unplug when away'],
      tools: ['Power strips']
    },
    {
      id: '3',
      title: 'Upgrade to LED lighting',
      description: 'LED bulbs use 75% less energy than incandescent bulbs',
      category: 'lighting',
      difficulty: 'easy',
      potentialSavings: 25,
      estimatedTime: '30 minutes',
      priority: 'high',
      steps: ['Calculate bulb count', 'Purchase LED bulbs', 'Replace old bulbs'],
      tools: ['LED bulbs']
    }
  ];

  // Mock user profile
  const mockUserProfile: UserProfile = {
    homeType: 'house',
    householdSize: 4,
    averageUsage: 850,
    primaryHeatingSource: 'gas',
    hasSmartDevices: true,
    energyGoals: ['reduce_cost', 'environmental_impact']
  };

  // Mock rate plan
  const mockRatePlan: RatePlan = {
    id: 'standard',
    name: 'Standard Residential',
    provider: 'City Electric',
    type: 'time_of_use',
    rates: {
      base: 0.12,
      peak: 0.18,
      offPeak: 0.08,
      tiers: []
    },
    peakHours: [
      { startTime: '14:00', endTime: '20:00' }
    ],
    monthlyFee: 12.50
  };

  // Handlers
  const handleTipComplete = (tipId: string) => {
    setCompletedTips(prev => [...prev, tipId]);
  };

  const handleTipDismiss = (tipId: string) => {
    // Handle tip dismissal
    console.log('Tip dismissed:', tipId);
  };

  const handleTimeRangeChange = (range: 'day' | 'week' | 'month') => {
    setSelectedTimeRange(range);
  };

  const handleRefreshData = () => {
    requestEnergyUpdate();
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading energy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Energy Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and optimize your home&apos;s energy consumption
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${
                    range === 'day' ? 'rounded-l-lg' : range === 'month' ? 'rounded-r-lg' : ''
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshData}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Refresh data"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Settings"
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Energy Gauge - Large */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <EnergyGauge 
                energyData={energyData} 
                energyStats={mockEnergyStats}
                showCost={true}
                showEfficiency={true}
                isLoading={!energyData}
              />
            </div>
          </div>

          {/* Usage Chart - Large */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <UsageChart data={mockUsageHistory} />
            </div>
          </div>
        </div>

        {/* Secondary Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Predictor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <CostPredictor 
              currentUsage={energyData?.currentConsumption || 0}
              ratePlan={mockRatePlan}
              predictions={mockCostPredictions}
              targetBudget={100}
            />
          </div>

          {/* Efficiency Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <EfficiencyScore 
              metrics={mockEfficiencyMetrics}
            />
          </div>
        </div>

        {/* Savings Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <SavingsTips 
            tips={mockSavingsTips}
            userProfile={mockUserProfile}
            onTipComplete={handleTipComplete}
            onTipDismiss={handleTipDismiss}
          />
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Connection Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {connectionError}
                </p>
              </div>
              <button
                onClick={reconnect}
                className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
