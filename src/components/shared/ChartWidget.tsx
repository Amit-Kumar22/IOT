'use client';

import React, { forwardRef, HTMLAttributes, memo, useRef, useEffect, useState } from 'react';
import { ChartWidgetProps } from '../../types/shared-components';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  CHART_COLORS, 
  CHART_TYPES, 
  COMPONENT_SIZES,
  COMMON_CLASSES 
} from '../../lib/constants';
import { 
  formatCurrency, 
  formatEnergy, 
  formatPercentage,
  formatDateTime 
} from '../../lib/formatters';
import { cn } from '../../lib/utils';
import { 
  ChartBarIcon,
  ArrowPathIcon as RefreshIcon,
  EllipsisVerticalIcon as MoreIcon,
  ArrowsPointingOutIcon as FullscreenIcon,
  ArrowDownTrayIcon as DownloadIcon
} from '@heroicons/react/24/outline';

/**
 * ChartWidget component for displaying various chart types
 * Supports line, bar, pie, and area charts with real-time updates
 */
const ChartWidget = memo(forwardRef<HTMLDivElement, ChartWidgetProps & HTMLAttributes<HTMLDivElement>>(
  ({
    title,
    data,
    chartType = 'line',
    height = 300,
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    animate = true,
    colors = CHART_COLORS.PRIMARY,
    xAxisLabel,
    yAxisLabel,
    onRefresh,
    onExport,
    onFullscreen,
    loading = false,
    error,
    customConfig = {},
    className,
    testId,
    ...props
  }, ref) => {
    
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartInstance, setChartInstance] = useState<any>(null);
    
    // Mock chart rendering for now - in production, this would integrate with Chart.js or similar
    const renderChart = () => {
      if (!data || data.length === 0) return null;
      
      const chartStyle = {
        width: '100%',
        height: `${height}px`,
        background: 'linear-gradient(45deg, #f0f9ff, #e0f2fe)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
        overflow: 'hidden'
      };
      
      return (
        <div style={chartStyle} className="chart-container">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.length} data points
            </p>
          </div>
          
          {/* Mock chart elements */}
          <div className="absolute inset-0 flex items-end justify-around p-4">
            {data.slice(0, 8).map((point, index) => (
              <div
                key={index}
                className="bg-blue-500 opacity-60 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  width: '8px',
                  animation: animate ? `chart-bar-${index} 1s ease-out` : 'none'
                }}
              />
            ))}
          </div>
        </div>
      );
    };
    
    const handleRefresh = () => {
      if (onRefresh) {
        onRefresh();
      }
    };
    
    const handleExport = () => {
      if (onExport) {
        onExport('png');
      }
    };
    
    const handleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
      if (onFullscreen) {
        onFullscreen(!isFullscreen);
      }
    };
    
    const getChartTypeIcon = () => {
      switch (chartType) {
        case 'bar':
          return <ChartBarIcon className="h-5 w-5" />;
        case 'line':
          return <ChartBarIcon className="h-5 w-5" />;
        case 'pie':
          return <ChartBarIcon className="h-5 w-5" />;
        case 'area':
          return <ChartBarIcon className="h-5 w-5" />;
        default:
          return <ChartBarIcon className="h-5 w-5" />;
      }
    };
    
    const chartData = data || [];
    const hasData = chartData.length > 0;
    
    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200",
          isFullscreen && "fixed inset-0 z-50 m-0 rounded-none h-screen",
          className
        )}
        padding="medium"
        testId={testId}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getChartTypeIcon()}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleRefresh}
                disabled={loading}
                className="h-8 w-8 p-0"
                aria-label="Refresh chart"
              >
                <RefreshIcon className={cn(
                  "h-4 w-4",
                  loading && "animate-spin"
                )} />
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleExport}
                disabled={loading}
                className="h-8 w-8 p-0"
                aria-label="Export chart"
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            )}
            
            {onFullscreen && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleFullscreen}
                disabled={loading}
                className="h-8 w-8 p-0"
                aria-label="Toggle fullscreen"
              >
                <FullscreenIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Chart Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex items-center gap-2">
                <RefreshIcon className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">Loading chart...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-sm text-red-700 font-medium">Chart Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {!loading && !error && hasData && (
            <div ref={chartContainerRef} className="chart-wrapper">
              {renderChart()}
            </div>
          )}
          
          {!loading && !error && !hasData && (
            <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">No Data Available</p>
                <p className="text-xs text-gray-500 mt-1">Chart will appear when data is loaded</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {showLegend && hasData && !loading && !error && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {colors.map((color: string, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">
                  Series {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Axis Labels */}
        {(xAxisLabel || yAxisLabel) && hasData && !loading && !error && (
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            {xAxisLabel && (
              <span className="text-center flex-1">{xAxisLabel}</span>
            )}
            {yAxisLabel && (
              <span className="transform -rotate-90 origin-center absolute left-2 top-1/2">
                {yAxisLabel}
              </span>
            )}
          </div>
        )}
        
        {/* Chart Info */}
        {hasData && !loading && !error && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Data Points: {chartData.length}</span>
              <span>Type: {chartType}</span>
            </div>
          </div>
        )}
        
        {/* CSS for chart animations */}
        <style jsx>{`
          @keyframes chart-bar-0 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-1 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-2 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-3 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-4 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-5 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-6 { from { height: 0; } to { height: var(--height); } }
          @keyframes chart-bar-7 { from { height: 0; } to { height: var(--height); } }
        `}</style>
      </Card>
    );
  }));

ChartWidget.displayName = 'ChartWidget';

export { ChartWidget };
