'use client';

import { useState } from 'react';
import { 
  HomeIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { DeviceCard } from './DeviceCard';
import { Room, DeviceAction } from '@/types/consumer-devices';
import { classNames } from '@/lib/utils';

interface RoomGridProps {
  rooms: Room[];
  onDeviceUpdate: (deviceId: string, action: DeviceAction) => void;
  selectedRoom?: string;
  onRoomSelect?: (roomId: string) => void;
  showAdvanced?: boolean;
}

/**
 * RoomGrid component for displaying devices organized by room
 * Supports filtering, room selection, and device management
 */
export function RoomGrid({ 
  rooms, 
  onDeviceUpdate, 
  selectedRoom, 
  onRoomSelect,
  showAdvanced = false
}: RoomGridProps) {
  const [deviceLoadingStates, setDeviceLoadingStates] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleDeviceUpdate = async (deviceId: string, action: DeviceAction) => {
    setDeviceLoadingStates(prev => ({ ...prev, [deviceId]: true }));
    
    try {
      await onDeviceUpdate(deviceId, action);
    } finally {
      setDeviceLoadingStates(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const getFilteredDevices = (room: Room) => {
    let devices = room.devices;

    // Filter by device type
    if (deviceTypeFilter !== 'all') {
      devices = devices.filter(device => device.type === deviceTypeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'online') {
        devices = devices.filter(device => device.isOnline);
      } else if (statusFilter === 'offline') {
        devices = devices.filter(device => !device.isOnline);
      } else if (statusFilter === 'active') {
        devices = devices.filter(device => {
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
        });
      }
    }

    return devices;
  };

  const getRoomStats = (room: Room) => {
    const devices = room.devices;
    const online = devices.filter(d => d.isOnline).length;
    const active = devices.filter(d => {
      switch (d.type) {
        case 'light':
          return d.currentState?.isOn;
        case 'thermostat':
          return d.currentState?.mode !== 'off';
        case 'security':
          return d.currentState?.isArmed;
        case 'appliance':
          return d.currentState?.isOn;
        case 'sensor':
          return d.currentState?.isTriggered;
        default:
          return false;
      }
    }).length;

    return { online, active, total: devices.length };
  };

  const filteredRooms = selectedRoom 
    ? rooms.filter(room => room.id === selectedRoom)
    : rooms;

  const deviceTypes = Array.from(new Set(
    rooms.flatMap(room => room.devices.map(device => device.type))
  ));

  return (
    <div className="space-y-6">
      {/* Header with Room Selection and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <HomeIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'All Rooms'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={classNames(
              'p-2 rounded-lg border transition-colors',
              showFilters
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
          
          {onRoomSelect && (
            <select
              value={selectedRoom || 'all'}
              onChange={(e) => onRoomSelect(e.target.value === 'all' ? '' : e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Rooms</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device Type
              </label>
              <select
                value={deviceTypeFilter}
                onChange={(e) => setDeviceTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="space-y-8">
        {filteredRooms.map((room) => {
          const stats = getRoomStats(room);
          const filteredDevices = getFilteredDevices(room);
          
          if (filteredDevices.length === 0) return null;

          return (
            <div key={room.id} className="space-y-4">
              {/* Room Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.online} of {stats.total} devices online • {stats.active} active
                    </p>
                  </div>
                </div>
                
                {/* Room Environment */}
                {(room.temperature || room.humidity) && (
                  <div className="text-right">
                    {room.temperature && (
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.temperature}°F
                      </p>
                    )}
                    {room.humidity && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {room.humidity}% humidity
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Devices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onDeviceUpdate={handleDeviceUpdate}
                    isLoading={deviceLoadingStates[device.id]}
                    showAdvanced={showAdvanced}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRooms.every(room => getFilteredDevices(room).length === 0) && (
        <div className="text-center py-12">
          <AdjustmentsHorizontalIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No devices found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or check if devices are properly connected.
          </p>
        </div>
      )}
    </div>
  );
}
