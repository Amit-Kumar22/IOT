'use client';

import { useEffect, useState } from 'react';
import { HomeDevice } from '@/types/consumer-devices';
import { 
  SignalIcon, 
  SignalSlashIcon, 
  Battery0Icon, 
  Battery50Icon, 
  Battery100Icon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

interface DeviceStatusProps {
  devices: HomeDevice[];
  showDetails?: boolean;
  onDeviceClick?: (device: HomeDevice) => void;
}

interface DeviceStatusSummary {
  total: number;
  online: number;
  offline: number;
  lowBattery: number;
  errors: number;
}

export default function DeviceStatus({ 
  devices, 
  showDetails = false, 
  onDeviceClick 
}: DeviceStatusProps) {
  const [summary, setSummary] = useState<DeviceStatusSummary>({
    total: 0,
    online: 0,
    offline: 0,
    lowBattery: 0,
    errors: 0
  });

  useEffect(() => {
    const newSummary = devices.reduce((acc, device) => {
      acc.total++;
      
      if (device.isOnline) {
        acc.online++;
      } else {
        acc.offline++;
      }
      
      if (device.batteryLevel !== undefined && device.batteryLevel < 20) {
        acc.lowBattery++;
      }
      
      // Check for errors (device offline for too long, etc.)
      if (device.lastSeen && new Date(device.lastSeen).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
        acc.errors++;
      }
      
      return acc;
    }, {
      total: 0,
      online: 0,
      offline: 0,
      lowBattery: 0,
      errors: 0
    });

    setSummary(newSummary);
  }, [devices]);

  const getStatusColor = (device: HomeDevice) => {
    if (!device.isOnline) return 'text-red-500';
    if (device.batteryLevel !== undefined && device.batteryLevel < 20) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBatteryIcon = (level?: number) => {
    if (level === undefined) return null;
    if (level < 20) return Battery0Icon;
    if (level < 80) return Battery50Icon;
    return Battery100Icon;
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Devices"
          value={summary.total}
          icon={CheckCircleIcon}
          color="text-blue-500"
        />
        <StatusCard
          title="Online"
          value={summary.online}
          icon={SignalIcon}
          color="text-green-500"
        />
        <StatusCard
          title="Offline"
          value={summary.offline}
          icon={SignalSlashIcon}
          color="text-red-500"
        />
        <StatusCard
          title="Low Battery"
          value={summary.lowBattery}
          icon={Battery0Icon}
          color="text-yellow-500"
        />
      </div>

      {/* Detailed Device List */}
      {showDetails && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Device Status Details
          </h3>
          <div className="space-y-2">
            {devices.map((device) => (
              <DeviceStatusRow
                key={device.id}
                device={device}
                onClick={onDeviceClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
          <WifiIcon className="w-4 h-4" />
          Reconnect All
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
          <CheckCircleIcon className="w-4 h-4" />
          Run Diagnostics
        </button>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatusCard({ title, value, icon: Icon, color }: StatusCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
}

interface DeviceStatusRowProps {
  device: HomeDevice;
  onClick?: (device: HomeDevice) => void;
}

function DeviceStatusRow({ device, onClick }: DeviceStatusRowProps) {
  const BatteryIcon = getBatteryIcon(device.batteryLevel);
  const statusColor = getStatusColor(device);

  return (
    <div
      onClick={() => onClick?.(device)}
      className={`
        flex items-center justify-between p-3 bg-white dark:bg-gray-800 
        rounded-lg border border-gray-200 dark:border-gray-700 
        ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
        transition-colors
      `}
    >
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className={`w-3 h-3 rounded-full ${
          device.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        {/* Device Info */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {device.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {device.type.charAt(0).toUpperCase() + device.type.slice(1)} • {device.room}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Battery Level */}
        {device.batteryLevel !== undefined && BatteryIcon && (
          <div className="flex items-center gap-1">
            <BatteryIcon className={`w-5 h-5 ${
              device.batteryLevel < 20 ? 'text-red-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm ${
              device.batteryLevel < 20 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {device.batteryLevel}%
            </span>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {device.isOnline ? (
            <SignalIcon className="w-5 h-5 text-green-500" />
          ) : (
            <SignalSlashIcon className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm ${statusColor}`}>
            {device.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Last Seen */}
        {!device.isOnline && device.lastSeen && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs">
              {formatLastSeen(device.lastSeen)}
            </span>
          </div>
        )}

        {/* Error Indicator */}
        {device.lastSeen && new Date(device.lastSeen).getTime() < Date.now() - 24 * 60 * 60 * 1000 && (
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
        )}
      </div>
    </div>
  );
}

// Helper functions moved outside component
function getStatusColor(device: HomeDevice) {
  if (!device.isOnline) return 'text-red-500';
  if (device.batteryLevel !== undefined && device.batteryLevel < 20) return 'text-yellow-500';
  return 'text-green-500';
}

function getBatteryIcon(level?: number) {
  if (level === undefined) return null;
  if (level < 20) return Battery0Icon;
  if (level < 80) return Battery50Icon;
  return Battery100Icon;
}

function formatLastSeen(lastSeen?: Date) {
  if (!lastSeen) return 'Never';
  const now = new Date();
  const diff = now.getTime() - new Date(lastSeen).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
}
