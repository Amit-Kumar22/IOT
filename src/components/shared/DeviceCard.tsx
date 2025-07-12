'use client';

import React, { forwardRef, HTMLAttributes, memo } from 'react';
import { DeviceCardProps, Device } from '../../types/shared-components';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  DEVICE_TYPES, 
  DEVICE_STATUS, 
  STATUS_COLORS, 
  DEVICE_ICONS, 
  COMPONENT_SIZES,
  COMMON_CLASSES 
} from '../../lib/constants';
import { 
  formatRelativeTime, 
  formatBatteryLevel, 
  formatSignalStrength, 
  isDeviceControllable,
  getDeviceTypeIcon 
} from '../../lib/formatters';
import { cn } from '../../lib/utils';
import { 
  WifiIcon, 
  Battery0Icon as BatteryIcon, 
  PowerIcon, 
  CogIcon as SettingsIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * DeviceCard component for displaying IoT device information
 * Supports multiple variants, visual states, and interactive controls
 */
const DeviceCard = memo(forwardRef<HTMLDivElement, DeviceCardProps & HTMLAttributes<HTMLDivElement>>(
  ({
    device,
    variant = 'detailed',
    onDeviceClick,
    onQuickAction,
    showControls = true,
    className,
    testId,
    ...props
  }, ref) => {
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case DEVICE_STATUS.ONLINE:
          return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case DEVICE_STATUS.OFFLINE:
          return <XCircleIcon className="h-5 w-5 text-gray-500" />;
        case DEVICE_STATUS.WARNING:
          return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
        case DEVICE_STATUS.ERROR:
          return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
        default:
          return null;
      }
    };

    const getStatusColors = (status: string) => {
      return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.offline;
    };

    const getBatteryIcon = (level?: number) => {
      if (!level) return null;
      const percentage = Math.round(level * 100);
      
      return (
        <div className="flex items-center gap-1">
          <BatteryIcon className={cn(
            "h-4 w-4",
            percentage > 20 ? "text-green-500" : "text-red-500"
          )} />
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
      );
    };

    const getSignalIcon = (strength: number) => {
      const signalBars = Math.round(strength * 4);
      return (
        <div className="flex items-center gap-1">
          <WifiIcon className={cn(
            "h-4 w-4",
            signalBars > 2 ? "text-green-500" : 
            signalBars > 1 ? "text-yellow-500" : "text-red-500"
          )} />
          <span className="text-xs">{formatSignalStrength(strength)}</span>
        </div>
      );
    };

    const getDeviceIcon = (type: string) => {
      const iconName = getDeviceTypeIcon(type);
      // Return a basic icon for now - in a real implementation, 
      // you'd have a proper icon mapping
      return <SettingsIcon className="h-6 w-6 text-gray-500" />;
    };

    const handleDeviceClick = () => {
      if (onDeviceClick) {
        onDeviceClick(device.id);
      }
    };

    const handleQuickAction = (action: string, event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
      }
      if (onQuickAction) {
        onQuickAction(device.id, action);
      }
    };

    const statusColors = getStatusColors(device.status);
    const isControllable = isDeviceControllable(device.type, device.status, device.isControllable);
    const batteryInfo = device.batteryLevel ? formatBatteryLevel(device.batteryLevel) : null;

    // Compact variant for grid layouts
    if (variant === 'compact') {
      return (
        <Card
          ref={ref}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-lg",
            "border-l-4",
            statusColors.border,
            className
          )}
          padding="small"
          onClick={handleDeviceClick}
          testId={testId}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon(device.type)}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {device.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {device.type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(device.status)}
              {showControls && isControllable && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleQuickAction('toggle')}
                  className="h-8 w-8 p-0"
                  aria-label="Toggle device"
                >
                  <PowerIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant={
                device.status === DEVICE_STATUS.ONLINE ? 'success' :
                device.status === DEVICE_STATUS.WARNING ? 'warning' :
                device.status === DEVICE_STATUS.ERROR ? 'danger' : 'secondary'
              }
              size="small"
            >
              {device.status}
            </Badge>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {device.batteryLevel && getBatteryIcon(device.batteryLevel)}
              {getSignalIcon(device.signalStrength)}
            </div>
          </div>
        </Card>
      );
    }

    // Control variant with prominent controls
    if (variant === 'control') {
      return (
        <Card
          ref={ref}
          className={cn(
            "transition-all duration-200",
            "border-l-4",
            statusColors.border,
            className
          )}
          padding="medium"
          testId={testId}
          {...props}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getDeviceIcon(device.type)}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {device.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {device.type} • {device.room}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(device.status)}
                  <span className={cn(
                    "text-sm font-medium",
                    statusColors.text
                  )}>
                    {device.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {device.batteryLevel && getBatteryIcon(device.batteryLevel)}
              {getSignalIcon(device.signalStrength)}
            </div>
          </div>

          {showControls && isControllable && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                size="small"
                onClick={() => handleQuickAction('toggle')}
                className="flex-1"
              >
                <PowerIcon className="h-4 w-4 mr-2" />
                Toggle
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleQuickAction('settings')}
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Last seen</span>
              <span>{formatRelativeTime(device.lastSeen)}</span>
            </div>
          </div>
        </Card>
      );
    }

    // Detailed variant (default) - comprehensive information
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-gray-800 border overflow-hidden p-4 shadow-md rounded-lg",
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          "border-l-4",
          statusColors.border,
          className
        )}
        onClick={handleDeviceClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDeviceClick();
          }
        }}
        tabIndex={onDeviceClick ? 0 : -1}
        role={onDeviceClick ? 'button' : 'article'}
        aria-label={onDeviceClick ? `View details for ${device.name}` : undefined}
        data-testid={testId}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getDeviceIcon(device.type)}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {device.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {device.type} {device.room && `• ${device.room}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(device.status)}
            {showControls && isControllable && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleQuickAction('toggle')}
                className="h-8 w-8 p-0"
                aria-label="Toggle device"
              >
                <PowerIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                device.status === DEVICE_STATUS.ONLINE ? 'success' :
                device.status === DEVICE_STATUS.WARNING ? 'warning' :
                device.status === DEVICE_STATUS.ERROR ? 'danger' : 'secondary'
              }
              size="small"
            >
              {device.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            {device.batteryLevel && getBatteryIcon(device.batteryLevel)}
            {getSignalIcon(device.signalStrength)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>Last seen</span>
            </div>
            <span>{formatRelativeTime(device.lastSeen)}</span>
          </div>
        </div>

        {device.currentState && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Current state</span>
              <span className="font-medium">
                {JSON.stringify(device.currentState)}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getDeviceIcon(device.type)}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {device.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {device.type} {device.room && `• ${device.room}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(device.status)}
            {showControls && isControllable && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleQuickAction('toggle')}
                className="h-8 w-8 p-0"
              >
                <PowerIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                device.status === DEVICE_STATUS.ONLINE ? 'success' :
                device.status === DEVICE_STATUS.WARNING ? 'warning' :
                device.status === DEVICE_STATUS.ERROR ? 'danger' : 'secondary'
              }
              size="small"
            >
              {device.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            {device.batteryLevel && getBatteryIcon(device.batteryLevel)}
            {getSignalIcon(device.signalStrength)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>Last seen</span>
            </div>
            <span>{formatRelativeTime(device.lastSeen)}</span>
          </div>
        </div>

        {device.currentState && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Current state</span>
              <span className="font-medium">
                {JSON.stringify(device.currentState)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
));

DeviceCard.displayName = 'DeviceCard';

export { DeviceCard };
