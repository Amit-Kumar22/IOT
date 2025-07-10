'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useDevices } from '@/hooks/useApi';
import { DeviceList } from '@/components/device';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  StopIcon,
  PowerIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

/**
 * Company Devices Page - Industrial IoT Device Management
 * Advanced interface for managing industrial devices with bulk operations
 */
export default function CompanyDevicesPage() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Use the real API hook for devices
  const {
    devices,
    loading,
    error,
    refreshDevices,
    controlDevice,
    bulkOperation
  } = useDevices('company');

  // State management
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Handle device selection
  const handleDeviceSelection = (deviceId: string, selected: boolean) => {
    if (selected) {
      setSelectedDevices(prev => [...prev, deviceId]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(d => d.id));
    }
  };

  // Handle individual device control
  const handleDeviceControl = async (deviceId: string, command: string) => {
    setIsProcessing(true);
    const success = await controlDevice({ deviceId, command: command as any });
    
    if (success) {
      console.log(`Device ${deviceId} ${command} successful`);
    }
    setIsProcessing(false);
  };

  // Handle bulk operations
  const handleBulkOperation = async (operation: 'start' | 'stop' | 'maintenance' | 'restart') => {
    if (selectedDevices.length === 0) {
      alert('Please select devices first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${operation} ${selectedDevices.length} selected device(s)?`;
    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(true);
    setBulkAction(operation);
    
    const success = await bulkOperation({ deviceIds: selectedDevices, operation });
    
    if (success) {
      console.log(`Bulk ${operation} completed for ${selectedDevices.length} devices`);
      setSelectedDevices([]);
    }
    
    setIsProcessing(false);
    setBulkAction('');
  };

  // Handle adding new device
  const handleAddDevice = () => {
    console.log('Adding new device...');
    alert('Add Device - This would open a device registration form');
  };

  // Handle device configuration
  const handleDeviceConfigure = (deviceId: string) => {
    console.log(`Configuring device: ${deviceId}`);
    alert(`Configure Device ${deviceId} - This would open a configuration panel`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error loading devices: {error}</span>
          <button
            onClick={refreshDevices}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Device Management</h1>
            <p className="text-blue-100 mt-1">Monitor and control your industrial IoT devices</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshDevices}
              disabled={isProcessing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAddDevice}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Device</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Devices
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Online
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.filter(d => d.status === 'online').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Warnings
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.filter(d => d.status === 'warning').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PowerIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.filter(d => d.isActive).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDevices.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-800 font-medium">
                {selectedDevices.length} device(s) selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkOperation('start')}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <PlayIcon className="h-4 w-4" />
                <span>{bulkAction === 'start' ? 'Starting...' : 'Start All'}</span>
              </button>
              <button
                onClick={() => handleBulkOperation('stop')}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <StopIcon className="h-4 w-4" />
                <span>{bulkAction === 'stop' ? 'Stopping...' : 'Stop All'}</span>
              </button>
              <button
                onClick={() => handleBulkOperation('restart')}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>{bulkAction === 'restart' ? 'Restarting...' : 'Restart All'}</span>
              </button>
              <button
                onClick={() => handleBulkOperation('maintenance')}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <WrenchScrewdriverIcon className="h-4 w-4" />
                <span>{bulkAction === 'maintenance' ? 'Processing...' : 'Maintenance'}</span>
              </button>
              <button
                onClick={() => setSelectedDevices([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device List with Full Functionality */}
      <DeviceList
        devices={devices}
        variant="industrial"
        showSearch={true}
        showFilters={true}
        showBulkActions={true}
        onDeviceToggle={(deviceId) => handleDeviceControl(deviceId, 'toggle')}
        onDeviceConfigure={handleDeviceConfigure}
        onBulkAction={(action, deviceIds) => console.log('Bulk action:', action, deviceIds)}
      />

      {/* Action Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {devices.filter(d => d.isActive).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Running</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {devices.filter(d => !d.isActive).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Stopped</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {devices.reduce((total, device) => total + (device.power || 0), 0)}W
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Power</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Math.round((devices.filter(d => d.status === 'online').length / devices.length) * 100)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
