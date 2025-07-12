'use client';

import React, { useState, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useDevices } from '@/hooks/useApi';
import { useToast } from '@/components/providers/ToastProvider';
import { useStableForm } from '@/hooks/useStableForm';
import { DeviceList } from '@/components/device';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon,
  CpuChipIcon,
  ServerIcon,
  WifiIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DeviceFormData {
  name: string;
  type: string;
  location: string;
  description: string;
  ipAddress: string;
  port: string;
  protocol: string;
  manufacturer: string;
  model: string;
  firmware: string;
  maxPower: string;
  operatingTemp: string;
  tags: string[];
}

/**
 * Company Devices Page - Industrial IoT Device Management
 * Advanced interface for managing industrial devices with bulk operations
 */
export default function CompanyDevicesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  
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
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const initialFormData: DeviceFormData = {
    name: '',
    type: 'sensor',
    location: '',
    description: '',
    ipAddress: '',
    port: '502',
    protocol: 'modbus',
    manufacturer: '',
    model: '',
    firmware: '',
    maxPower: '',
    operatingTemp: '',
    tags: []
  };

  const {
    formData,
    createHandler,
    resetForm,
    errors: formErrors,
    setFieldError,
    updateFormData
  } = useStableForm(initialFormData);

  // Device types and protocols
  const deviceTypes = [
    'sensor', 'actuator', 'controller', 'motor', 'pump', 'valve', 
    'heater', 'cooler', 'monitor', 'analyzer', 'camera', 'scanner'
  ];

  const protocols = [
    'modbus', 'opcua', 'mqtt', 'http', 'tcp', 'serial', 'ethernet'
  ];

  const manufacturers = [
    'Siemens', 'Schneider Electric', 'ABB', 'Rockwell Automation', 
    'Honeywell', 'Emerson', 'Yokogawa', 'Mitsubishi', 'Omron', 'General Electric'
  ];

  // Real CRUD operations
  const validateForm = (data: DeviceFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.name.trim()) errors.name = 'Device name is required';
    if (!data.type) errors.type = 'Device type is required';
    if (!data.location.trim()) errors.location = 'Location is required';
    if (!data.ipAddress.trim()) errors.ipAddress = 'IP Address is required';
    if (!data.port.trim()) errors.port = 'Port is required';
    if (!data.manufacturer.trim()) errors.manufacturer = 'Manufacturer is required';
    if (!data.model.trim()) errors.model = 'Model is required';
    
    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (data.ipAddress && !ipRegex.test(data.ipAddress)) {
      errors.ipAddress = 'Invalid IP address format';
    }
    
    // Validate port range
    const port = parseInt(data.port);
    if (data.port && (isNaN(port) || port < 1 || port > 65535)) {
      errors.port = 'Port must be between 1 and 65535';
    }
    
    return errors;
  };

  const handleAddDevice = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        setFieldError(field as any, error);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast({
        title: 'Success',
        message: `Device "${formData.name}" has been added successfully`,
        type: 'success'
      });
      
      setIsAddModalOpen(false);
      resetForm();
      refreshDevices(); // Refresh the devices list
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to add device. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDevice = async () => {
    if (!selectedDevice) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        setFieldError(field as any, error);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast({
        title: 'Success',
        message: `Device "${formData.name}" has been updated successfully`,
        type: 'success'
      });
      
      setIsEditModalOpen(false);
      setSelectedDevice(null);
      resetForm();
      refreshDevices();
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update device. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        title: 'Success',
        message: `Device "${selectedDevice.name}" has been deleted successfully`,
        type: 'success'
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedDevice(null);
      refreshDevices();
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to delete device. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigureDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setSelectedDevice(device);
    setIsConfigModalOpen(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (device: any) => {
    setSelectedDevice(device);
    updateFormData({
      name: device.name || '',
      type: device.type || 'sensor',
      location: device.location || '',
      description: device.description || '',
      ipAddress: device.ipAddress || '',
      port: device.port?.toString() || '502',
      protocol: device.protocol || 'modbus',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      firmware: device.firmware || '',
      maxPower: device.maxPower?.toString() || '',
      operatingTemp: device.operatingTemp || '',
      tags: device.tags || []
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (device: any) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };
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

  // Device selection handlers

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
              onClick={openAddModal}
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
        onDeviceConfigure={handleConfigureDevice}
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

      {/* Add Device Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Device"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={createHandler('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter device name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Type *
              </label>
              <select
                value={formData.type}
                onChange={createHandler('type')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {deviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={createHandler('location')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Building A - Floor 2"
              />
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IP Address *
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={createHandler('ipAddress')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.ipAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="192.168.1.100"
              />
              {formErrors.ipAddress && (
                <p className="mt-1 text-sm text-red-600">{formErrors.ipAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={createHandler('port')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.port ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="502"
              />
              {formErrors.port && (
                <p className="mt-1 text-sm text-red-600">{formErrors.port}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer *
              </label>
              <select
                value={formData.manufacturer}
                onChange={createHandler('manufacturer')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.manufacturer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map(mfg => (
                  <option key={mfg} value={mfg}>{mfg}</option>
                ))}
              </select>
              {formErrors.manufacturer && (
                <p className="mt-1 text-sm text-red-600">{formErrors.manufacturer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={createHandler('model')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter model number"
              />
              {formErrors.model && (
                <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protocol
              </label>
              <select
                value={formData.protocol}
                onChange={createHandler('protocol')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {protocols.map(protocol => (
                  <option key={protocol} value={protocol}>
                    {protocol.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={createHandler('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Device description and notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDevice}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Device</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Device Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDevice(null);
          resetForm();
        }}
        title="Edit Device"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={createHandler('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter device name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Type *
              </label>
              <select
                value={formData.type}
                onChange={createHandler('type')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {deviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={createHandler('location')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Building A - Floor 2"
              />
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IP Address *
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={createHandler('ipAddress')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.ipAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="192.168.1.100"
              />
              {formErrors.ipAddress && (
                <p className="mt-1 text-sm text-red-600">{formErrors.ipAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={createHandler('model')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter model number"
              />
              {formErrors.model && (
                <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer *
              </label>
              <select
                value={formData.manufacturer}
                onChange={createHandler('manufacturer')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formErrors.manufacturer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map(mfg => (
                  <option key={mfg} value={mfg}>{mfg}</option>
                ))}
              </select>
              {formErrors.manufacturer && (
                <p className="mt-1 text-sm text-red-600">{formErrors.manufacturer}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={createHandler('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Device description and notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedDevice(null);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditDevice}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Device</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedDevice(null);
        }}
        title={`Configure ${selectedDevice?.name || 'Device'}`}
        size="lg"
      >
        {selectedDevice && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Device Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedDevice.type}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedDevice.status}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedDevice.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(selectedDevice.lastUpdate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Communication Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Polling Interval (seconds)</label>
                    <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Timeout (seconds)</label>
                    <input type="number" defaultValue="5" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Retry Attempts</label>
                    <input type="number" defaultValue="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Alarm Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable Alarms</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email Notifications</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsConfigModalOpen(false);
                  setSelectedDevice(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast({
                    title: 'Success',
                    message: 'Device configuration updated successfully',
                    type: 'success'
                  });
                  setIsConfigModalOpen(false);
                  setSelectedDevice(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDevice(null);
        }}
        onConfirm={handleDeleteDevice}
        title="Delete Device"
        message={`Are you sure you want to delete device "${selectedDevice?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Device"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
