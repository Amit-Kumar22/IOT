import React from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { DeviceCard, DeviceStatus } from './DeviceCard';

export interface DeviceListProps {
  devices: DeviceStatus[];
  variant?: 'compact' | 'detailed' | 'industrial';
  showSearch?: boolean;
  showFilters?: boolean;
  showBulkActions?: boolean;
  onDeviceToggle?: (deviceId: string) => void;
  onDeviceConfigure?: (deviceId: string) => void;
  onBulkAction?: (action: string, deviceIds: string[]) => void;
  className?: string;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  variant = 'detailed',
  showSearch = true,
  showFilters = true,
  showBulkActions = false,
  onDeviceToggle,
  onDeviceConfigure,
  onBulkAction,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'name' | 'status' | 'type' | 'lastSeen'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [selectedDevices, setSelectedDevices] = React.useState<string[]>([]);

  // Filter and sort devices
  const filteredDevices = React.useMemo(() => {
    const filtered = devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort devices
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'lastSeen':
          comparison = (a.lastSeen || '').localeCompare(b.lastSeen || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [devices, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const selectAllDevices = () => {
    setSelectedDevices(
      selectedDevices.length === filteredDevices.length 
        ? [] 
        : filteredDevices.map(d => d.id)
    );
  };

  const deviceTypes = React.useMemo(() => 
    [...new Set(devices.map(d => d.type))], [devices]
  );

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(device => {
      counts[device.status] = (counts[device.status] || 0) + 1;
    });
    return counts;
  }, [devices]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          {showSearch && (
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
          
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status ({devices.length})</option>
                <option value="online">Online ({statusCounts.online || 0})</option>
                <option value="offline">Offline ({statusCounts.offline || 0})</option>
                <option value="error">Error ({statusCounts.error || 0})</option>
                <option value="maintenance">Maintenance ({statusCounts.maintenance || 0})</option>
                <option value="warning">Warning ({statusCounts.warning || 0})</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                <span>Name</span>
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedDevices.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedDevices.length} device(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onBulkAction?.('start', selectedDevices)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Start All
              </button>
              <button
                onClick={() => onBulkAction?.('stop', selectedDevices)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Stop All
              </button>
              <button
                onClick={() => onBulkAction?.('maintenance', selectedDevices)}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Grid/List */}
      <div className={`grid gap-4 ${
        variant === 'compact' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : variant === 'industrial'
          ? 'grid-cols-1 lg:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {filteredDevices.map(device => (
          <div key={device.id} className="relative">
            {showBulkActions && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device.id)}
                  onChange={() => toggleDeviceSelection(device.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            )}
            <DeviceCard
              device={device}
              variant={variant}
              onToggle={onDeviceToggle}
              onConfigure={onDeviceConfigure}
              className={showBulkActions ? 'pt-8' : ''}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No devices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Results Summary */}
      {showSearch && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredDevices.length} of {devices.length} devices
        </div>
      )}
    </div>
  );
};

export default DeviceList;
