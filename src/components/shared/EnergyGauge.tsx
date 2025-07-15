import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EnergyGaugeProps {
  currentValue: number;
  maxValue: number;
  unit: string;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  size?: 'small' | 'medium' | 'large';
  showNeedle?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  colorScheme?: 'default' | 'energy' | 'performance';
  onValueChange?: (value: number) => void;
  className?: string;
  label?: string;
  showPercentage?: boolean;
  format?: 'number' | 'percentage';
}

const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  currentValue,
  maxValue,
  unit,
  thresholds = { low: 30, medium: 70, high: 90 },
  size = 'medium',
  showNeedle = true,
  showLabels = true,
  animated = true,
  colorScheme = 'energy',
  onValueChange,
  className,
  label,
  showPercentage = false,
  format = 'number',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  // Size configurations
  const sizeConfig = {
    small: { width: 120, height: 120, stroke: 8, fontSize: 'text-sm' },
    medium: { width: 180, height: 180, stroke: 12, fontSize: 'text-base' },
    large: { width: 240, height: 240, stroke: 16, fontSize: 'text-lg' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((currentValue / maxValue) * 100, 100);

  // Color schemes
  const colorSchemes = {
    default: {
      background: 'stroke-gray-200',
      low: 'stroke-blue-500',
      medium: 'stroke-yellow-500',
      high: 'stroke-red-500',
    },
    energy: {
      background: 'stroke-gray-200',
      low: 'stroke-green-500',
      medium: 'stroke-yellow-500',
      high: 'stroke-red-500',
    },
    performance: {
      background: 'stroke-gray-200',
      low: 'stroke-indigo-500',
      medium: 'stroke-purple-500',
      high: 'stroke-pink-500',
    },
  };

  // Get color based on value and thresholds
  const getColor = (value: number) => {
    const scheme = colorSchemes[colorScheme];
    const valuePercentage = (value / maxValue) * 100;
    if (valuePercentage <= thresholds.low) return scheme.low;
    if (valuePercentage <= thresholds.medium) return scheme.medium;
    return scheme.high;
  };

  const getColorHex = (value: number) => {
    const valuePercentage = (value / maxValue) * 100;
    if (colorScheme === 'energy') {
      if (valuePercentage <= thresholds.low) return '#10b981'; // green-500
      if (valuePercentage <= thresholds.medium) return '#eab308'; // yellow-500
      return '#ef4444'; // red-500
    }
    if (colorScheme === 'performance') {
      if (valuePercentage <= thresholds.low) return '#6366f1'; // indigo-500
      if (valuePercentage <= thresholds.medium) return '#a855f7'; // purple-500
      return '#ec4899'; // pink-500
    }
    // default
    if (valuePercentage <= thresholds.low) return '#3b82f6'; // blue-500
    if (valuePercentage <= thresholds.medium) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  // Animation effect
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = currentValue;
      const duration = 1000; // 1 second
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const value = startValue + (endValue - startValue) * easeOut;
        
        setDisplayValue(value);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setDisplayValue(currentValue);
    }
  }, [currentValue, animated]);

  // Calculate stroke dash array for progress
  const dashArray = circumference;
  const dashOffset = circumference - (percentage / 100) * circumference;

  // Needle angle calculation (180 degrees arc)
  const needleAngle = (percentage / 100) * 180 - 90;

  const formatValue = (value: number) => {
    if (format === 'percentage') {
      return `${Math.round((value / maxValue) * 100)}%`;
    }
    return Math.round(value).toLocaleString();
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {label && (
        <div className="mb-2 text-center">
          <h3 className={cn('font-medium text-gray-900', config.fontSize)}>
            {label}
          </h3>
        </div>
      )}
      
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background SVG */}
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
          viewBox={`0 0 ${config.width} ${config.width}`}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className={colorSchemes[colorScheme].background}
            strokeWidth={config.stroke}
            strokeDasharray={`${circumference * 0.5} ${circumference * 0.5}`}
            strokeDashoffset={`${circumference * 0.25}`}
          />
          
          {/* Progress arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className={getColor(displayValue)}
            strokeWidth={config.stroke}
            strokeDasharray={`${circumference * 0.5} ${circumference * 0.5}`}
            strokeDashoffset={`${circumference * 0.25 + (circumference * 0.5) * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{
              transition: animated ? 'stroke-dashoffset 0.5s ease-out' : 'none',
            }}
          />
          
          {/* Threshold markers */}
          {showLabels && (
            <>
              {/* Low threshold */}
              <line
                x1={config.width / 2 + radius * Math.cos(((thresholds.low / 100) * 180 - 90) * Math.PI / 180)}
                y1={config.width / 2 + radius * Math.sin(((thresholds.low / 100) * 180 - 90) * Math.PI / 180)}
                x2={config.width / 2 + (radius - 10) * Math.cos(((thresholds.low / 100) * 180 - 90) * Math.PI / 180)}
                y2={config.width / 2 + (radius - 10) * Math.sin(((thresholds.low / 100) * 180 - 90) * Math.PI / 180)}
                stroke="#6b7280"
                strokeWidth="2"
              />
              
              {/* Medium threshold */}
              <line
                x1={config.width / 2 + radius * Math.cos(((thresholds.medium / 100) * 180 - 90) * Math.PI / 180)}
                y1={config.width / 2 + radius * Math.sin(((thresholds.medium / 100) * 180 - 90) * Math.PI / 180)}
                x2={config.width / 2 + (radius - 10) * Math.cos(((thresholds.medium / 100) * 180 - 90) * Math.PI / 180)}
                y2={config.width / 2 + (radius - 10) * Math.sin(((thresholds.medium / 100) * 180 - 90) * Math.PI / 180)}
                stroke="#6b7280"
                strokeWidth="2"
              />
              
              {/* High threshold */}
              <line
                x1={config.width / 2 + radius * Math.cos(((thresholds.high / 100) * 180 - 90) * Math.PI / 180)}
                y1={config.width / 2 + radius * Math.sin(((thresholds.high / 100) * 180 - 90) * Math.PI / 180)}
                x2={config.width / 2 + (radius - 10) * Math.cos(((thresholds.high / 100) * 180 - 90) * Math.PI / 180)}
                y2={config.width / 2 + (radius - 10) * Math.sin(((thresholds.high / 100) * 180 - 90) * Math.PI / 180)}
                stroke="#6b7280"
                strokeWidth="2"
              />
            </>
          )}
          
          {/* Needle */}
          {showNeedle && (
            <g
              transform={`rotate(${needleAngle} ${config.width / 2} ${config.width / 2})`}
              style={{
                transition: animated ? 'transform 0.5s ease-out' : 'none',
              }}
            >
              <line
                x1={config.width / 2}
                y1={config.width / 2}
                x2={config.width / 2 + radius * 0.7}
                y2={config.width / 2}
                stroke={getColorHex(displayValue)}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx={config.width / 2}
                cy={config.width / 2}
                r="4"
                fill={getColorHex(displayValue)}
              />
            </g>
          )}
        </svg>
        
        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('font-bold text-gray-900', config.fontSize)}>
            {formatValue(displayValue)}
          </div>
          <div className="text-sm text-gray-500">{unit}</div>
          {showPercentage && (
            <div className="text-xs text-gray-400">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      </div>
      
      {/* Labels */}
      {showLabels && (
        <div className="mt-2 flex justify-between w-full max-w-xs text-xs text-gray-500">
          <span>0</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>{maxValue}</span>
        </div>
      )}
      
      {/* Legend */}
      {showLabels && (
        <div className="mt-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-full', colorSchemes[colorScheme].low.replace('stroke-', 'bg-'))} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-full', colorSchemes[colorScheme].medium.replace('stroke-', 'bg-'))} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-full', colorSchemes[colorScheme].high.replace('stroke-', 'bg-'))} />
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyGauge;
