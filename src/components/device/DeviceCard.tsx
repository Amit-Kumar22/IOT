import React, { memo, useMemo, useCallback } from 'react';
import {
  SignalIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'warning';
  location?: string;
  lastSeen?: string;
  battery?: number;
  signal?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  vibration?: number;
  power?: number;
  rpm?: number;
  flowRate?: number;
  level?: number;
}

export interface DeviceCardProps {
  device: DeviceStatus;
  variant?: 'compact' | 'detailed' | 'industrial';
  showControls?: boolean;
  onToggle?: (deviceId: string) => void;
  onConfigure?: (deviceId: string) => void;
  className?: string;
}

// Optimized status icon component with memoization
const StatusIcon = memo<{ status: DeviceStatus['status'] }>(({ status }) => {
  const iconProps = "h-5 w-5";
  
  switch (status) {
    case 'online':
      return <CheckCircleIcon className={`${iconProps} text-green-500`} />;
    case 'offline':
      return <XCircleIcon className={`${iconProps} text-gray-400`} />;
    case 'error':
      return <ExclamationTriangleIcon className={`${iconProps} text-red-500`} />;
    case 'maintenance':
      return <ClockIcon className={`${iconProps} text-yellow-500`} />;
    case 'warning':
      return <ExclamationTriangleIcon className={`${iconProps} text-orange-500`} />;
    default:
      return <XCircleIcon className={`${iconProps} text-gray-400`} />;
  }
});

StatusIcon.displayName = 'StatusIcon';

// Pre-computed status colors for better performance
const STATUS_COLORS = {
  online: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
  offline: 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-700',
  error: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
  maintenance: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
  warning: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800'
} as const;

export const DeviceCard: React.FC<DeviceCardProps> = memo(({
  device,
  variant = 'detailed',
  showControls = true,
  onToggle,
  onConfigure,
  className = ''
}) => {
  // Memoize computed values
  const statusColor = useMemo(() => 
    STATUS_COLORS[device.status] || 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
  , [device.status]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleToggle = useCallback(() => {
    onToggle?.(device.id);
  }, [onToggle, device.id]);

  const handleConfigure = useCallback(() => {
    onConfigure?.(device.id);
  }, [onConfigure, device.id]);

  // Memoize status icon
  const statusIcon = useMemo(() => <StatusIcon status={device.status} />, [device.status]);

  if (variant === 'compact') {
    return (
      <div className={`p-3 border rounded-lg ${statusColor} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusIcon}
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {device.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {device.type}
              </div>
            </div>
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              {onToggle && (
                <button
                  onClick={handleToggle}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={`Toggle ${device.name}`}
                >
                  {device.status === 'online' ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
              )}
              {onConfigure && (
                <button
                  onClick={handleConfigure}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={`Configure ${device.name}`}
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'industrial') {
    return (
      <div className={`p-4 border rounded-lg ${statusColor} ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {statusIcon}
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {device.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {device.type} • {device.location || 'Unknown Location'}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {device.id}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          {device.temperature !== undefined && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Temp:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {device.temperature}°C
              </span>
            </div>
          )}
          {device.pressure !== undefined && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Pressure:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {device.pressure} PSI
              </span>
            </div>
          )}
          {device.vibration !== undefined && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Vibration:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {device.vibration} mm/s
              </span>
            </div>
          )}
          {device.rpm !== undefined && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">RPM:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {device.rpm.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {onToggle && (
                <button
                  onClick={handleToggle}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    device.status === 'online'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {device.status === 'online' ? 'Stop' : 'Start'}
                </button>
              )}
            </div>
            {onConfigure && (
              <button
                onClick={handleConfigure}
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded text-xs font-medium"
              >
                Configure
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {statusIcon}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {device.type}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {device.signal !== undefined && (
            <div className="flex items-center space-x-1">
              <SignalIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {device.signal}%
              </span>
            </div>
          )}
          {device.battery !== undefined && (
            <div className="flex items-center space-x-1">
              <BoltIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {device.battery}%
              </span>
            </div>
          )}
        </div>
      </div>

      {device.location && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          📍 {device.location}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        {device.temperature !== undefined && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.temperature}°C
            </div>
          </div>
        )}
        {device.humidity !== undefined && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Humidity:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.humidity}%
            </div>
          </div>
        )}
        {device.power !== undefined && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Power:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.power}W
            </div>
          </div>
        )}
        {device.flowRate !== undefined && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Flow Rate:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {device.flowRate} L/min
            </div>
          </div>
        )}
      </div>

      {device.lastSeen && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Last seen: {device.lastSeen}
        </div>
      )}

      {showControls && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {onToggle && (
              <button
                onClick={handleToggle}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded text-sm font-medium"
                aria-label={`${device.status === 'online' ? 'Pause' : 'Start'} ${device.name}`}
              >
                {device.status === 'online' ? (
                  <>
                    <PauseIcon className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span>Start</span>
                  </>
                )}
              </button>
            )}
          </div>
          {onConfigure && (
            <button
              onClick={handleConfigure}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium"
              aria-label={`Configure ${device.name}`}
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span>Configure</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

DeviceCard.displayName = 'DeviceCard';

export default DeviceCard;
