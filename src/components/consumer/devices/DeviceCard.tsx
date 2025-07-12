'use client';

import { useState } from 'react';
import { 
  LightBulbIcon,
  FireIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  Battery0Icon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  LightBulbIcon as LightBulbIconSolid,
  FireIcon as FireIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  CogIcon as CogIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';
import { HomeDevice, DeviceAction, DeviceType } from '@/types/consumer-devices';
import { classNames } from '@/lib/utils';

interface DeviceCardProps {
  device: HomeDevice;
  onDeviceUpdate: (deviceId: string, action: DeviceAction) => void;
  isLoading?: boolean;
  showAdvanced?: boolean;
}

/**
 * DeviceCard component for displaying and controlling individual IoT devices
 * Supports touch-friendly controls and real-time status updates
 */
export function DeviceCard({ 
  device, 
  onDeviceUpdate, 
  isLoading = false,
  showAdvanced = false 
}: DeviceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDeviceIcon = (type: DeviceType, isActive: boolean) => {
    const iconMap = {
      light: { outline: LightBulbIcon, solid: LightBulbIconSolid },
      thermostat: { outline: FireIcon, solid: FireIconSolid },
      security: { outline: ShieldCheckIcon, solid: ShieldCheckIconSolid },
      appliance: { outline: CogIcon, solid: CogIconSolid },
      sensor: { outline: ChartBarIcon, solid: ChartBarIconSolid }
    };

    return isActive ? iconMap[type].solid : iconMap[type].outline;
  };

  const getDeviceStatus = (device: HomeDevice) => {
    switch (device.type) {
      case 'light':
        return device.currentState?.isOn ? 'On' : 'Off';
      case 'thermostat':
        return `${device.currentState?.targetTemperature}°F`;
      case 'security':
        return device.currentState?.isArmed ? 'Armed' : 'Disarmed';
      case 'appliance':
        return device.currentState?.isOn ? 'Running' : 'Off';
      case 'sensor':
        return `${device.currentState?.value} ${device.currentState?.unit}`;
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (device: HomeDevice) => {
    if (!device.isOnline) return 'text-red-500';
    
    switch (device.type) {
      case 'light':
        return device.currentState?.isOn ? 'text-yellow-500' : 'text-gray-400';
      case 'thermostat':
        return 'text-orange-500';
      case 'security':
        return device.currentState?.isArmed ? 'text-green-500' : 'text-gray-400';
      case 'appliance':
        return device.currentState?.isOn ? 'text-blue-500' : 'text-gray-400';
      case 'sensor':
        return device.currentState?.isTriggered ? 'text-red-500' : 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const handleToggle = () => {
    if (isLoading) return;
    
    const action: DeviceAction = {
      type: 'toggle',
      deviceId: device.id
    };
    
    onDeviceUpdate(device.id, action);
  };

  const handleSetValue = (value: any) => {
    if (isLoading) return;
    
    const action: DeviceAction = {
      type: 'set',
      deviceId: device.id,
      value
    };
    
    onDeviceUpdate(device.id, action);
  };

  const isDeviceActive = () => {
    switch (device.type) {
      case 'light':
        return device.currentState?.isOn;
      case 'thermostat':
        return device.currentState?.mode !== 'off';
      case 'security':
        return device.currentState?.isArmed;
      case 'appliance':
        return device.currentState?.isOn;
      case 'sensor':
        return device.currentState?.isTriggered;
      default:
        return false;
    }
  };

  const DeviceIcon = getDeviceIcon(device.type, isDeviceActive());

  return (
    <div 
      className={classNames(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-200',
        'hover:shadow-md hover:scale-105 active:scale-95',
        device.isOnline 
          ? 'border-gray-200 dark:border-gray-700' 
          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      )}
    >
      {/* Main Device Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={classNames(
              'p-2 rounded-lg',
              isDeviceActive() 
                ? 'bg-indigo-100 dark:bg-indigo-900/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            )}>
              <DeviceIcon 
                className={classNames(
                  'h-6 w-6',
                  getStatusColor(device)
                )} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {device.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.room}
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            {!device.isOnline && (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="Offline" />
            )}
            {device.batteryLevel && device.batteryLevel < 20 && (
              <Battery0Icon className="h-4 w-4 text-yellow-500" title="Low Battery" />
            )}
            <WifiIcon 
              className={classNames(
                'h-4 w-4',
                device.isOnline ? 'text-green-500' : 'text-red-500'
              )} 
            />
          </div>
        </div>

        {/* Device Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Status
          </span>
          <span className={classNames(
            'text-sm font-semibold',
            getStatusColor(device)
          )}>
            {getDeviceStatus(device)}
          </span>
        </div>

        {/* Main Control */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleToggle}
            disabled={isLoading || !device.isOnline}
            className={classNames(
              'flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors mr-2',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isDeviceActive()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            )}
          >
            {isLoading ? 'Loading...' : (isDeviceActive() ? 'Turn Off' : 'Turn On')}
          </button>
          
          {showAdvanced && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <CogIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            {/* Device-specific controls */}
            {device.type === 'light' && device.capabilities.some(c => c.type === 'dimmer') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brightness
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={device.currentState?.brightness || 0}
                  onChange={(e) => handleSetValue({ brightness: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
            
            {device.type === 'thermostat' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Temperature
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSetValue({ 
                      targetTemperature: (device.currentState?.targetTemperature || 70) - 1 
                    })}
                    className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold min-w-[3rem] text-center">
                    {device.currentState?.targetTemperature || 70}°F
                  </span>
                  <button
                    onClick={() => handleSetValue({ 
                      targetTemperature: (device.currentState?.targetTemperature || 70) + 1 
                    })}
                    className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Battery Level */}
            {device.batteryLevel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battery Level
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={classNames(
                        'h-2 rounded-full transition-all duration-300',
                        device.batteryLevel > 50 ? 'bg-green-500' :
                        device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${device.batteryLevel}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {device.batteryLevel}%
                  </span>
                </div>
              </div>
            )}

            {/* Energy Usage */}
            {device.energyUsage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Energy Usage
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {device.energyUsage} kWh today
                </p>
              </div>
            )}

            {/* Schedules */}
            {device.schedules.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Active Schedules
                </label>
                <div className="space-y-1">
                  {device.schedules.filter(s => s.isActive).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {schedule.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-500">
                        {schedule.timeSlots.length > 0 ? `${schedule.timeSlots[0].startTime} - ${schedule.timeSlots[0].endTime}` : 'No time set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
