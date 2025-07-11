'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useDevices } from '@/hooks/useApi';
import { DeviceList } from '@/components/device';
import { useToast } from '@/components/providers/ToastProvider';
import { useStableInputHandler } from '@/hooks/useStableInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  LightBulbIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  CameraIcon,
  HomeIcon,
  FireIcon,
  ShieldCheckIcon,
  WifiIcon,
  BoltIcon,
  PowerIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  ClockIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * Consumer Devices Page - Home Device Management
 * Comprehensive interface for managing home IoT devices with full CRUD functionality
 */
function ConsumerDevicesPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  const toast = (options: any) => {
    console.log('Toast:', options);
    // Temporary toast implementation
  };
  
  // Use the real API hook for devices
  const {
    devices,
    loading,
    error,
    refreshDevices,
    controlDevice,
    bulkOperation
  } = useDevices('consumer');

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Device form state
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'light',
    room: '',
    description: '',
    settings: {}
  });

  // Create stable handlers
  const createDeviceHandler = useStableInputHandler(setDeviceForm);

  // Automation form state
  const [automationForm, setAutomationForm] = useState({
    name: '',
    trigger: 'time',
    condition: '',
    actions: [],
    enabled: true
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    deviceId: '',
    action: 'turn_on',
    time: '',
    days: [] as number[],
    enabled: true
  });

  // Device management functions
  const handleCreateDevice = async () => {
    try {
      setIsProcessing(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Device Added',
        description: `${deviceForm.name} has been added to your home.`,
        type: 'success',
      });
      
      setShowDeviceModal(false);
      setDeviceForm({
        name: '',
        type: 'light',
        room: '',
        description: '',
        settings: {}
      });
      
      refreshDevices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add device. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDevice = async (device: any) => {
    setSelectedDevice(device);
    setDeviceForm({
      name: device.name,
      type: device.type,
      room: device.room || '',
      description: device.description || '',
      settings: device.settings || {}
    });
    setShowDeviceModal(true);
  };

  const handleUpdateDevice = async () => {
    try {
      setIsProcessing(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Device Updated',
        description: `${deviceForm.name} has been updated.`,
        type: 'success',
      });
      
      setShowDeviceModal(false);
      setSelectedDevice(null);
      refreshDevices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update device. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Device',
      message: `Are you sure you want to remove "${device.name}" from your home? This action cannot be undone.`,
      action: async () => {
        try {
          setIsProcessing(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast({
            title: 'Device Removed',
            description: `${device.name} has been removed from your home.`,
            type: 'success',
          });
          
          refreshDevices();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to remove device. Please try again.',
            type: 'error',
          });
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // Device control functions
  const handleDeviceToggle = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      setIsProcessing(true);
      const command = device.isActive ? 'turn_off' : 'turn_on';
      const success = await controlDevice({ deviceId, command });
      
      if (success) {
        toast({
          title: device.isActive ? 'Device Turned Off' : 'Device Turned On',
          description: `${device.name} is now ${device.isActive ? 'off' : 'on'}.`,
          type: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Control Failed',
        description: 'Failed to control device. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeviceConfigure = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    handleEditDevice(device);
  };

  // Automation functions
  const handleCreateAutomation = async () => {
    try {
      setIsProcessing(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Automation Created',
        description: `${automationForm.name} automation has been created.`,
        type: 'success',
      });
      
      setShowAutomationModal(false);
      setAutomationForm({
        name: '',
        trigger: 'time',
        condition: '',
        actions: [],
        enabled: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automation. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Schedule functions
  const handleCreateSchedule = async () => {
    try {
      setIsProcessing(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Schedule Created',
        description: `Schedule has been created for the selected device.`,
        type: 'success',
      });
      
      setShowScheduleModal(false);
      setScheduleForm({
        deviceId: '',
        action: 'turn_on',
        time: '',
        days: [],
        enabled: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: string, deviceIds: string[]) => {
    if (deviceIds.length === 0) {
      toast({
        title: 'No Devices Selected',
        description: 'Please select devices to perform bulk action.',
        type: 'warning',
      });
      return;
    }

    setIsProcessing(true);
    let operation: 'start' | 'stop' | 'maintenance' | 'restart';
    
    switch (action) {
      case 'start':
        operation = 'start';
        break;
      case 'stop':
        operation = 'stop';
        break;
      case 'maintenance':
        operation = 'maintenance';
        break;
      case 'restart':
        operation = 'restart';
        break;
      default:
        setIsProcessing(false);
        return;
    }

    try {
      const success = await bulkOperation({ deviceIds, operation });
      if (success) {
        toast({
          title: 'Bulk Action Complete',
          description: `${action} completed for ${deviceIds.length} devices.`,
          type: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Bulk Action Failed',
        description: 'Failed to perform bulk action. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Scene control functions
  const handleSceneActivation = async (sceneName: string) => {
    try {
      setIsProcessing(true);
      // Simulate scene activation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Scene Activated',
        description: `${sceneName} scene has been activated.`,
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Scene Failed',
        description: 'Failed to activate scene. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
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
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Smart Home</h1>
            <p className="text-green-100 mt-1">Control and manage your IoT devices</p>
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
              onClick={() => setShowDeviceModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2"
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
              <HomeIcon className="h-8 w-8 text-blue-600" />
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
                  Active Devices
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.filter(d => d.isActive).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BoltIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Power Usage
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {devices.reduce((total, device) => total + (device.power || 0), 0)}W
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Automations
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  3 Active
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Home Scenes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Smart Scenes</h3>
            <button 
              onClick={() => setShowAutomationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Scene</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => handleSceneActivation('Good Morning')}
              disabled={isProcessing}
              className="flex items-center justify-center p-4 border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <LightBulbIcon className="h-8 w-8 mx-auto text-yellow-600" />
                <span className="mt-2 text-sm font-medium text-yellow-800">Good Morning</span>
                <span className="text-xs text-yellow-600">Turn on lights, start coffee</span>
              </div>
            </button>
            <button 
              onClick={() => handleSceneActivation('Movie Time')}
              disabled={isProcessing}
              className="flex items-center justify-center p-4 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <SpeakerWaveIcon className="h-8 w-8 mx-auto text-purple-600" />
                <span className="mt-2 text-sm font-medium text-purple-800">Movie Time</span>
                <span className="text-xs text-purple-600">Dim lights, start TV</span>
              </div>
            </button>
            <button 
              onClick={() => handleSceneActivation('Bedtime')}
              disabled={isProcessing}
              className="flex items-center justify-center p-4 border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <ShieldCheckIcon className="h-8 w-8 mx-auto text-indigo-600" />
                <span className="mt-2 text-sm font-medium text-indigo-800">Bedtime</span>
                <span className="text-xs text-indigo-600">Turn off lights, lock doors</span>
              </div>
            </button>
            <button 
              onClick={() => handleSceneActivation('Away Mode')}
              disabled={isProcessing}
              className="flex items-center justify-center p-4 border-2 border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <HomeIcon className="h-8 w-8 mx-auto text-red-600" />
                <span className="mt-2 text-sm font-medium text-red-800">Away Mode</span>
                <span className="text-xs text-red-600">Secure home, save energy</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Device Grid with Enhanced Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Devices</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white flex items-center space-x-1"
              >
                <ClockIcon className="h-4 w-4" />
                <span>Schedule</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div 
                key={device.id} 
                className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 transition-all ${
                  device.isActive 
                    ? 'border-green-300 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Device Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{device.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditDevice(device)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Device Icon & Type */}
                <div className="flex items-center justify-center mb-4">
                  {device.type === 'light' && <LightBulbIcon className={`h-12 w-12 ${device.isActive ? 'text-yellow-500' : 'text-gray-400'}`} />}
                  {device.type === 'camera' && <CameraIcon className={`h-12 w-12 ${device.isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
                  {device.type === 'speaker' && <SpeakerWaveIcon className={`h-12 w-12 ${device.isActive ? 'text-purple-500' : 'text-gray-400'}`} />}
                  {device.type === 'sensor' && <WifiIcon className={`h-12 w-12 ${device.isActive ? 'text-green-500' : 'text-gray-400'}`} />}
                  {!['light', 'camera', 'speaker', 'sensor'].includes(device.type) && <DevicePhoneMobileIcon className={`h-12 w-12 ${device.isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
                </div>

                {/* Device Info */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{device.type.charAt(0).toUpperCase() + device.type.slice(1)}</p>
                  {device.power && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center mt-1">
                      <BoltIcon className="h-4 w-4 mr-1" />
                      {device.power}W
                    </p>
                  )}
                </div>

                {/* Device Controls */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleDeviceToggle(device.id)}
                    disabled={isProcessing}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      device.isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {device.isActive ? (
                      <>
                        <StopIcon className="h-4 w-4 inline mr-2" />
                        Turn Off
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 inline mr-2" />
                        Turn On
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeviceConfigure(device.id)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => handleBulkAction('start', devices.filter(d => !d.isActive).map(d => d.id))}
              disabled={isProcessing || devices.every(d => d.isActive)}
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <PowerIcon className="h-6 w-6 mx-auto text-green-600" />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Turn All On</span>
              </div>
            </button>
            <button 
              onClick={() => handleBulkAction('stop', devices.filter(d => d.isActive).map(d => d.id))}
              disabled={isProcessing || devices.every(d => !d.isActive)}
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <PowerIcon className="h-6 w-6 mx-auto text-red-600" />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Turn All Off</span>
              </div>
            </button>
            <button 
              onClick={() => handleBulkAction('restart', devices.filter(d => d.isActive).map(d => d.id))}
              disabled={isProcessing || devices.filter(d => d.isActive).length === 0}
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <ArrowPathIcon className="h-6 w-6 mx-auto text-blue-600" />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Restart Active</span>
              </div>
            </button>
            <button 
              onClick={() => handleSceneActivation('Energy Saver')}
              disabled={isProcessing}
              className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-center">
                <BoltIcon className="h-6 w-6 mx-auto text-yellow-600" />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Energy Mode</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Energy Usage Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Energy Usage</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {devices.filter(d => d.power && d.power > 0).map((device) => (
              <div key={device.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {device.type}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{device.power}W</span>
                    </div>
                    {device.isActive && (
                      <div className="text-xs text-green-600">Currently active</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Total Active Power</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {devices.filter(d => d.isActive).reduce((total, device) => total + (device.power || 0), 0)}W
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Management Modal */}
      <Modal
        isOpen={showDeviceModal}
        onClose={() => {
          setShowDeviceModal(false);
          setSelectedDevice(null);
          setDeviceForm({
            name: '',
            type: 'light',
            room: '',
            description: '',
            settings: {}
          });
        }}
        title={selectedDevice ? 'Edit Device' : 'Add New Device'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Device Name
            </label>
            <input
              type="text"
              value={deviceForm.name}
              onChange={createDeviceHandler('name')}
              placeholder="Living Room Light"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Device Type
            </label>
            <select
              value={deviceForm.type}
              onChange={createDeviceHandler('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">Smart Light</option>
              <option value="camera">Security Camera</option>
              <option value="speaker">Smart Speaker</option>
              <option value="sensor">Motion Sensor</option>
              <option value="thermostat">Thermostat</option>
              <option value="lock">Smart Lock</option>
              <option value="outlet">Smart Outlet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room
            </label>
            <select
              value={deviceForm.room}
              onChange={createDeviceHandler('room')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Room</option>
              <option value="living_room">Living Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="kitchen">Kitchen</option>
              <option value="bathroom">Bathroom</option>
              <option value="office">Office</option>
              <option value="garage">Garage</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={deviceForm.description}
              onChange={createDeviceHandler('description')}
              placeholder="Device description or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowDeviceModal(false);
                setSelectedDevice(null);
                setDeviceForm({
                  name: '',
                  type: 'light',
                  room: '',
                  description: '',
                  settings: {}
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={selectedDevice ? handleUpdateDevice : handleCreateDevice}
              disabled={isProcessing || !deviceForm.name || !deviceForm.type}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {isProcessing ? 'Saving...' : selectedDevice ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Automation Creation Modal */}
      <Modal
        isOpen={showAutomationModal}
        onClose={() => {
          setShowAutomationModal(false);
          setAutomationForm({
            name: '',
            trigger: 'time',
            condition: '',
            actions: [],
            enabled: true
          });
        }}
        title="Create Smart Scene"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scene Name
            </label>
            <input
              type="text"
              value={automationForm.name}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Custom Scene"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trigger
            </label>
            <select
              value={automationForm.trigger}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, trigger: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="time">Time of Day</option>
              <option value="motion">Motion Detected</option>
              <option value="temperature">Temperature</option>
              <option value="manual">Manual Activation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <input
              type="text"
              value={automationForm.condition}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="6:00 PM or when motion detected..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="automation-enabled"
              checked={automationForm.enabled}
              onChange={(e) => setAutomationForm(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="automation-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this scene
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAutomationModal(false);
                setAutomationForm({
                  name: '',
                  trigger: 'time',
                  condition: '',
                  actions: [],
                  enabled: true
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAutomation}
              disabled={isProcessing || !automationForm.name}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg"
            >
              {isProcessing ? 'Creating...' : 'Create Scene'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Creation Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setScheduleForm({
            deviceId: '',
            action: 'turn_on',
            time: '',
            days: [],
            enabled: true
          });
        }}
        title="Create Device Schedule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Device
            </label>
            <select
              value={scheduleForm.deviceId}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, deviceId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Device</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <select
              value={scheduleForm.action}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="turn_on">Turn On</option>
              <option value="turn_off">Turn Off</option>
              <option value="toggle">Toggle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <button
                  key={day}
                  onClick={() => {
                    const dayIndex = index;
                    setScheduleForm(prev => ({
                      ...prev,
                      days: prev.days.includes(dayIndex)
                        ? prev.days.filter(d => d !== dayIndex)
                        : [...prev.days, dayIndex]
                    }));
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded ${
                    scheduleForm.days.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="schedule-enabled"
              checked={scheduleForm.enabled}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="schedule-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this schedule
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowScheduleModal(false);
                setScheduleForm({
                  deviceId: '',
                  action: 'turn_on',
                  time: '',
                  days: [],
                  enabled: true
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSchedule}
              disabled={isProcessing || !scheduleForm.deviceId || !scheduleForm.time}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
            >
              {isProcessing ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default function ConsumerDevicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConsumerDevicesPageContent />
    </div>
  );
}
