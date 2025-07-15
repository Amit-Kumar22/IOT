'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  ChartBarIcon,
  EllipsisVerticalIcon,
  ArrowsPointingOutIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ChartConfig, ChartData, WidgetInteraction } from '@/types/analytics';

interface ChartWidgetProps {
  config: ChartConfig;
  data: ChartData;
  isLoading?: boolean;
  isEditing?: boolean;
  onConfigChange?: (config: ChartConfig) => void;
  onRemove?: () => void;
  onInteraction?: (interaction: WidgetInteraction) => void;
  className?: string;
}

const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
];

/**
 * Reusable chart widget component for analytics dashboard
 * Supports multiple chart types with interactive features
 */
export const ChartWidget: React.FC<ChartWidgetProps> = ({
  config,
  data,
  isLoading = false,
  isEditing = false,
  onConfigChange,
  onRemove,
  onInteraction,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleInteraction = useCallback((type: WidgetInteraction['type'], interactionData: any) => {
    if (onInteraction) {
      onInteraction({
        type,
        data: interactionData,
        timestamp: new Date(),
        widgetId: config.id
      });
    }
  }, [config.id, onInteraction]);

  const handleChartClick = useCallback((data: any) => {
    handleInteraction('click', data);
  }, [handleInteraction]);

  const exportChart = useCallback((format: 'png' | 'svg' | 'pdf') => {
    // Implementation for chart export
    console.log(`Exporting chart ${config.id} as ${format}`);
  }, [config.id]);

  const renderChart = () => {
    const commonProps = {
      data: data.datasets[0]?.data.map((value, index) => ({
        name: data.labels[index],
        value,
        ...data.datasets.reduce((acc, dataset, idx) => ({
          ...acc,
          [`series${idx}`]: dataset.data[index]
        }), {})
      })) || [],
      onClick: handleChartClick
    };

    // Show empty state if no data
    if (!data.datasets || data.datasets.length === 0 || !data.datasets[0]?.data || data.datasets[0].data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500" data-testid="empty-chart">
          <div className="text-center">
            <ChartBarIcon className="h-8 w-8 mr-2 mx-auto mb-2" />
            <span>No data available</span>
          </div>
        </div>
      );
    }

    switch (config.type) {
      case 'line':
        return (
          <div data-testid="line-chart">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" data-testid="cartesian-grid" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                label={{ value: config.xAxisLabel || '', position: 'insideBottom', offset: -5 }}
                data-testid="x-axis-name"
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                label={{ value: config.yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                data-testid="y-axis"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#F9FAFB', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px'
                }}
                data-testid="tooltip"
              />
              <Legend data-testid="legend" />
              {data.datasets.map((dataset, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`series${index}`}
                  stroke={dataset.borderColor || CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={dataset.borderWidth || 2}
                  dot={{ fill: dataset.borderColor || CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2 }}
                  name={dataset.label}
                  connectNulls={false}
                  data-testid={`line-series${index}`}
                />
              ))}
            </LineChart>
          </div>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={`series${index}`}
                stackId="1"
                stroke={dataset.borderColor || CHART_COLORS[index % CHART_COLORS.length]}
                fill={Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[0] || `${CHART_COLORS[index % CHART_COLORS.length]}20`
                  : dataset.backgroundColor || `${CHART_COLORS[index % CHART_COLORS.length]}20`}
                name={dataset.label}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Bar
                key={index}
                dataKey={`series${index}`}
                fill={Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[0] || CHART_COLORS[index % CHART_COLORS.length]
                  : dataset.backgroundColor || CHART_COLORS[index % CHART_COLORS.length]}
                name={dataset.label}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={commonProps.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleChartClick}
            >
              {commonProps.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <ChartBarIcon className="h-8 w-8 mr-2" />
            <span>Unsupported chart type: {config.type}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="p-4 h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${isEditing ? 'editing' : ''} ${className}`}
      data-testid="chart-widget"
      role="region"
      aria-label={`Chart: ${config.title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {config.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {config.dataSource} • Updates every {config.refreshRate}s
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Remove widget"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Chart menu"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4 mr-2" />
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </button>
                  <button
                    onClick={() => exportChart('png')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export as PNG
                  </button>
                  {onConfigChange && (
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Configure
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className={`p-4 ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-64'}`}>
        <div data-testid="responsive-container">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Click overlay for fullscreen exit */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChartWidget;
