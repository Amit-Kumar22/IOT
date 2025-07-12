'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { EnergyUsageHistory, EnergyChartData, DeviceChartData, EnergyPeriod } from '@/types/energy';
import { classNames } from '@/lib/utils';

interface UsageChartProps {
  data: EnergyUsageHistory;
  chartType?: 'line' | 'area' | 'bar';
  metric?: 'consumption' | 'cost' | 'both';
  deviceBreakdown?: DeviceChartData[];
  showDeviceChart?: boolean;
  period?: EnergyPeriod;
  height?: number;
  isLoading?: boolean;
  className?: string;
}

/**
 * UsageChart component provides comprehensive energy usage visualization
 * Features: Multiple chart types, device breakdown, time period selection, real-time updates
 */
export function UsageChart({
  data,
  chartType = 'area',
  metric = 'both',
  deviceBreakdown = [],
  showDeviceChart = false,
  period = 'day',
  height = 300,
  isLoading = false,
  className = ''
}: UsageChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<EnergyPeriod>(period);
  const [selectedMetric, setSelectedMetric] = useState<'consumption' | 'cost' | 'both'>(metric);
  const [selectedChart, setSelectedChart] = useState<'line' | 'area' | 'bar'>(chartType);

  // Process data for charts
  const chartData = useMemo(() => {
    return data.data.map((point) => ({
      timestamp: new Date(point.timestamp).toLocaleDateString('en-US', {
        hour: period === 'hour' ? '2-digit' : undefined,
        minute: period === 'hour' ? '2-digit' : undefined,
        weekday: period === 'week' ? 'short' : undefined,
        month: period === 'month' || period === 'year' ? 'short' : undefined,
        day: period === 'day' || period === 'week' ? 'numeric' : undefined
      }),
      consumption: point.consumption,
      cost: point.cost,
      weather: point.weather?.temperature || null
    }));
  }, [data, period]);

  // Chart colors
  const colors = {
    consumption: '#3B82F6', // Blue
    cost: '#10B981', // Green
    weather: '#F59E0B', // Amber
    deviceColors: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
    ]
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: {entry.name === 'cost' ? `$${(entry.value || 0).toFixed(2)}` : 
                            entry.name === 'consumption' ? `${(entry.value || 0).toFixed(1)} kWh` :
                            `${entry.value}°F`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className={`h-${height / 4} bg-gray-200 dark:bg-gray-700 rounded`} />
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            {selectedMetric === 'both' && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs text-gray-500"
                tick={{ fontSize: 12 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {(selectedMetric === 'consumption' || selectedMetric === 'both') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="consumption"
                stroke={colors.consumption}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Energy (kWh)"
              />
            )}
            
            {(selectedMetric === 'cost' || selectedMetric === 'both') && (
              <Line
                yAxisId={selectedMetric === 'both' ? 'right' : 'left'}
                type="monotone"
                dataKey="cost"
                stroke={colors.cost}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Cost ($)"
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.consumption} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.consumption} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.cost} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.cost} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            {selectedMetric === 'both' && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs text-gray-500"
                tick={{ fontSize: 12 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {(selectedMetric === 'consumption' || selectedMetric === 'both') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="consumption"
                stroke={colors.consumption}
                fillOpacity={1}
                fill="url(#colorConsumption)"
                name="Energy (kWh)"
              />
            )}
            
            {(selectedMetric === 'cost' || selectedMetric === 'both') && (
              <Area
                yAxisId={selectedMetric === 'both' ? 'right' : 'left'}
                type="monotone"
                dataKey="cost"
                stroke={colors.cost}
                fillOpacity={1}
                fill="url(#colorCost)"
                name="Cost ($)"
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            {selectedMetric === 'both' && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs text-gray-500"
                tick={{ fontSize: 12 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {(selectedMetric === 'consumption' || selectedMetric === 'both') && (
              <Bar
                yAxisId="left"
                dataKey="consumption"
                fill={colors.consumption}
                name="Energy (kWh)"
                radius={[2, 2, 0, 0]}
              />
            )}
            
            {(selectedMetric === 'cost' || selectedMetric === 'both') && (
              <Bar
                yAxisId={selectedMetric === 'both' ? 'right' : 'left'}
                dataKey="cost"
                fill={colors.cost}
                name="Cost ($)"
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Header with Controls */}
      <div className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Energy Usage Trends
            </h3>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as EnergyPeriod)}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as 'consumption' | 'cost' | 'both')}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="consumption">Energy Only</option>
              <option value="cost">Cost Only</option>
              <option value="both">Both</option>
            </select>

            {/* Chart Type Selector */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              {(['line', 'area', 'bar'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedChart(type)}
                  className={classNames(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    selectedChart === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
                    type === 'line' && 'rounded-l-md',
                    type === 'bar' && 'rounded-r-md'
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Device Breakdown Chart */}
      {showDeviceChart && deviceBreakdown.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Device Energy Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceBreakdown.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors.deviceColors[index % colors.deviceColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${(value || 0).toFixed(1)} kWh`, 'Consumption']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(chartData.reduce((sum, point) => sum + point.consumption, 0) || 0).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total kWh</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(chartData.reduce((sum, point) => sum + point.cost, 0) || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Cost</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {((chartData.reduce((sum, point) => sum + point.consumption, 0) / chartData.length) || 0).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg kWh</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {chartData.length > 1 ? 
                ((chartData[chartData.length - 1]?.consumption || 0) - (chartData[0]?.consumption || 0) > 0 ? '+' : '') +
                (((chartData[chartData.length - 1]?.consumption || 0) - (chartData[0]?.consumption || 0)) / Math.max(chartData[0]?.consumption || 1, 1) * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Change</div>
          </div>
        </div>
      </div>
    </div>
  );
}
