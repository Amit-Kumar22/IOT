'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  PowerIcon,
  StopIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  CogIcon,
  EyeIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SCADAPanel } from '@/components/company/control/SCADAPanel';
import { ProcessDiagram, DeviceStatus, Alarm, ControlWidget } from '@/types/control';

/**
 * Company Control Page
 * SCADA-style industrial control interface
 */
export default function CompanyControlPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDiagram, setCurrentDiagram] = useState<ProcessDiagram | null>(null);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [systemStatus, setSystemStatus] = useState<'running' | 'stopped' | 'emergency' | 'maintenance'>('running');

  // Mock data initialization
  useEffect(() => {
    const initializeControlData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock process diagram
      const mockDiagram: ProcessDiagram = {
        id: 'main_process',
        name: 'Production Line Control',
        description: 'Main production line SCADA interface',
        layout: {
          width: 1200,
          height: 800,
          backgroundImage: undefined
        },
        widgets: [
          // Conveyor Belt Control
          {
            id: 'conveyor_01_power',
            type: 'button',
            deviceId: 'conveyor_01',
            parameter: 'power',
            label: 'Conveyor 1',
            position: { x: 100, y: 100, width: 80, height: 80 },
            config: {
              style: 'default',
              size: 'medium',
              confirmAction: true,
              color: '#10B981'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Motor Speed Control
          {
            id: 'motor_01_speed',
            type: 'slider',
            deviceId: 'motor_01',
            parameter: 'speed',
            label: 'Motor Speed',
            position: { x: 220, y: 100, width: 100, height: 120 },
            config: {
              minValue: 0,
              maxValue: 100,
              unit: '%',
              step: 5,
              color: '#3B82F6'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Temperature Gauge
          {
            id: 'furnace_temp',
            type: 'gauge',
            deviceId: 'furnace_01',
            parameter: 'temperature',
            label: 'Furnace Temp',
            position: { x: 350, y: 100, width: 100, height: 100 },
            config: {
              minValue: 0,
              maxValue: 1000,
              unit: '°C',
              color: '#EF4444'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Pressure Indicator
          {
            id: 'pressure_indicator',
            type: 'indicator',
            deviceId: 'compressor_01',
            parameter: 'pressure_ok',
            label: 'Pressure OK',
            position: { x: 480, y: 100, width: 80, height: 80 },
            config: {
              color: '#10B981',
              size: 'medium'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Emergency Stop
          {
            id: 'emergency_stop',
            type: 'button',
            deviceId: 'system',
            parameter: 'emergency_stop',
            label: 'E-STOP',
            position: { x: 600, y: 50, width: 100, height: 100 },
            config: {
              style: 'emergency',
              size: 'large',
              confirmAction: false,
              color: '#EF4444'
            },
            permissions: ['operator', 'supervisor', 'maintenance'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Production Counter
          {
            id: 'production_counter',
            type: 'text',
            deviceId: 'counter_01',
            parameter: 'count',
            label: 'Production Count',
            position: { x: 100, y: 250, width: 120, height: 80 },
            config: {
              format: '${currentValue} units',
              color: '#8B5CF6'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          },
          // Alarm Indicator
          {
            id: 'system_alarm',
            type: 'alarm',
            deviceId: 'system',
            parameter: 'alarm_status',
            label: 'System Alarm',
            position: { x: 250, y: 250, width: 80, height: 80 },
            config: {
              color: '#EF4444',
              size: 'medium'
            },
            permissions: ['operator', 'supervisor'],
            isVisible: true,
            isEnabled: true,
            lastUpdated: new Date()
          }
        ],
        connections: [
          {
            id: 'connection_01',
            fromWidgetId: 'conveyor_01_power',
            toWidgetId: 'motor_01_speed',
            type: 'electrical',
            style: {
              color: '#10B981',
              width: 3,
              pattern: 'solid'
            },
            points: [
              { x: 180, y: 140 },
              { x: 220, y: 140 }
            ],
            isAnimated: true,
            direction: 'forward'
          },
          {
            id: 'connection_02',
            fromWidgetId: 'motor_01_speed',
            toWidgetId: 'furnace_temp',
            type: 'pipe',
            style: {
              color: '#3B82F6',
              width: 4,
              pattern: 'solid'
            },
            points: [
              { x: 320, y: 160 },
              { x: 350, y: 160 }
            ],
            isAnimated: true,
            direction: 'forward'
          }
        ],
        zones: [
          {
            id: 'production_zone',
            name: 'Production Zone',
            type: 'production',
            bounds: { x: 80, y: 80, width: 400, height: 200 },
            color: '#10B981',
            opacity: 0.1,
            isVisible: true
          },
          {
            id: 'safety_zone',
            name: 'Safety Systems',
            type: 'safety',
            bounds: { x: 580, y: 30, width: 140, height: 140 },
            color: '#EF4444',
            opacity: 0.15,
            isVisible: true
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock device statuses
      const mockDeviceStatuses: Record<string, DeviceStatus> = {
        conveyor_01: {
          deviceId: 'conveyor_01',
          timestamp: new Date(),
          parameters: {
            power: { value: true, unit: '', quality: 'good', timestamp: new Date() },
            speed: { value: 75, unit: '%', quality: 'good', timestamp: new Date() },
            current: { value: 12.5, unit: 'A', quality: 'good', timestamp: new Date() }
          },
          alarms: [],
          warnings: [],
          status: 'running',
          mode: 'auto'
        },
        motor_01: {
          deviceId: 'motor_01',
          timestamp: new Date(),
          parameters: {
            speed: { value: 75, unit: '%', quality: 'good', timestamp: new Date() },
            torque: { value: 85, unit: 'Nm', quality: 'good', timestamp: new Date() },
            temperature: { value: 65, unit: '°C', quality: 'good', timestamp: new Date() }
          },
          alarms: [],
          warnings: [],
          status: 'running',
          mode: 'auto'
        },
        furnace_01: {
          deviceId: 'furnace_01',
          timestamp: new Date(),
          parameters: {
            temperature: { value: 750, unit: '°C', quality: 'good', timestamp: new Date() },
            setpoint: { value: 800, unit: '°C', quality: 'good', timestamp: new Date() },
            heating: { value: true, unit: '', quality: 'good', timestamp: new Date() }
          },
          alarms: ['alarm_01'],
          warnings: [],
          status: 'running',
          mode: 'auto'
        },
        compressor_01: {
          deviceId: 'compressor_01',
          timestamp: new Date(),
          parameters: {
            pressure_ok: { value: true, unit: '', quality: 'good', timestamp: new Date() },
            pressure: { value: 8.5, unit: 'bar', quality: 'good', timestamp: new Date() },
            flow: { value: 120, unit: 'L/min', quality: 'good', timestamp: new Date() }
          },
          alarms: [],
          warnings: [],
          status: 'running',
          mode: 'auto'
        },
        counter_01: {
          deviceId: 'counter_01',
          timestamp: new Date(),
          parameters: {
            count: { value: 1247, unit: 'units', quality: 'good', timestamp: new Date() },
            rate: { value: 45, unit: 'units/min', quality: 'good', timestamp: new Date() }
          },
          alarms: [],
          warnings: [],
          status: 'running',
          mode: 'auto'
        },
        system: {
          deviceId: 'system',
          timestamp: new Date(),
          parameters: {
            emergency_stop: { value: false, unit: '', quality: 'good', timestamp: new Date() },
            alarm_status: { value: true, unit: '', quality: 'good', timestamp: new Date() }
          },
          alarms: ['alarm_01'],
          warnings: [],
          status: 'running',
          mode: 'auto'
        }
      };

      // Mock alarms
      const mockAlarms: Alarm[] = [
        {
          id: 'alarm_01',
          deviceId: 'furnace_01',
          parameter: 'temperature',
          message: 'Furnace temperature approaching setpoint limit',
          severity: 'high',
          priority: 2,
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          status: 'active',
          category: 'process',
          location: 'Production Zone - Furnace 01',
          actions: []
        },
        {
          id: 'alarm_02',
          deviceId: 'motor_01',
          parameter: 'vibration',
          message: 'Motor vibration levels elevated',
          severity: 'medium',
          priority: 3,
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          status: 'active',
          category: 'equipment',
          location: 'Production Zone - Motor 01',
          actions: []
        }
      ];

      setCurrentDiagram(mockDiagram);
      setDeviceStatuses(mockDeviceStatuses);
      setAlarms(mockAlarms);
      setIsLoading(false);
    };

    initializeControlData();
  }, []);

  // Handle control commands
  const handleControlCommand = useCallback(async (deviceId: string, parameter: string, value: any) => {
    try {
      console.log(`Control command: ${deviceId}.${parameter} = ${value}`);
      
      // Update device status locally (simulate API response)
      setDeviceStatuses(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          parameters: {
            ...prev[deviceId]?.parameters,
            [parameter]: {
              value,
              unit: prev[deviceId]?.parameters[parameter]?.unit || '',
              quality: 'good',
              timestamp: new Date()
            }
          }
        }
      }));

      // Special handling for emergency stop
      if (parameter === 'emergency_stop' && value === true) {
        setSystemStatus('emergency');
        showToast({
          title: 'Emergency Stop Activated',
          message: 'All systems have been safely shut down',
          type: 'warning'
        });
        
        // Reset emergency stop after 10 seconds (simulation)
        setTimeout(() => {
          setSystemStatus('running');
          setDeviceStatuses(prev => ({
            ...prev,
            system: {
              ...prev.system,
              parameters: {
                ...prev.system.parameters,
                emergency_stop: {
                  value: false,
                  unit: '',
                  quality: 'good',
                  timestamp: new Date()
                }
              }
            }
          }));
        }, 10000);
      }

      showToast({
        title: 'Command Executed',
        message: `${deviceId}.${parameter} set to ${value}`,
        type: 'success'
      });

    } catch (error) {
      showToast({
        title: 'Command Failed',
        message: `Failed to execute command on ${deviceId}`,
        type: 'error'
      });
    }
  }, [showToast]);

  // Handle alarm acknowledgment
  const handleAlarmAcknowledge = useCallback((alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { 
            ...alarm, 
            status: 'acknowledged' as const,
            acknowledgedAt: new Date(),
            acknowledgedBy: user?.email || 'operator'
          }
        : alarm
    ));

    showToast({
      title: 'Alarm Acknowledged',
      message: 'Alarm has been acknowledged by operator',
      type: 'success'
    });
  }, [user?.email, showToast]);

  // Handle emergency stop
  const handleEmergencyStop = useCallback(() => {
    handleControlCommand('system', 'emergency_stop', true);
  }, [handleControlCommand]);

  // Handle diagram updates (for edit mode)
  const handleDiagramUpdate = useCallback((updatedDiagram: ProcessDiagram) => {
    setCurrentDiagram(updatedDiagram);
    showToast({
      title: 'Diagram Updated',
      message: 'Process diagram has been saved',
      type: 'success'
    });
  }, [showToast]);

  // Auto-refresh device data
  useEffect(() => {
    if (systemStatus === 'emergency') return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setDeviceStatuses(prev => {
        const updated = { ...prev };
        
        // Update some random values to simulate live data
        Object.keys(updated).forEach(deviceId => {
          const device = updated[deviceId];
          if (device.status === 'running') {
            // Add small random variations to simulate real sensors
            Object.keys(device.parameters).forEach(param => {
              const current = device.parameters[param];
              if (typeof current.value === 'number' && param !== 'count') {
                const variation = (Math.random() - 0.5) * 2; // ±1% variation
                const newValue = current.value + (current.value * variation * 0.01);
                device.parameters[param] = {
                  ...current,
                  value: Math.max(0, newValue),
                  timestamp: new Date()
                };
              }
            });
          }
        });

        return updated;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [systemStatus]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg text-white p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-64"></div>
          </div>
        </div>

        {/* Control Panel Skeleton */}
        <div className="bg-gray-900 rounded-lg p-6 h-96 animate-pulse">
          <div className="grid grid-cols-4 gap-4 h-full">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Process Control</h1>
            <p className="text-red-100 mt-1">
              SCADA interface for industrial process monitoring and control
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus === 'running' ? 'bg-green-400 animate-pulse' :
                systemStatus === 'emergency' ? 'bg-red-400 animate-pulse' :
                'bg-yellow-400 animate-pulse'
              }`} />
              <span className="font-medium">
                {systemStatus.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <CogIcon className="h-4 w-4" />
              <span>{isEditMode ? 'Exit Edit' : 'Edit Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Running Devices</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Object.values(deviceStatuses).filter(d => d.status === 'running').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Alarms</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {alarms.filter(a => a.status === 'active').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">98.5%</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <PowerIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Energy Usage</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">247 kW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main SCADA Panel */}
      {currentDiagram && (
        <SCADAPanel
          diagram={currentDiagram}
          deviceStatuses={deviceStatuses}
          alarms={alarms}
          isEditing={isEditMode}
          onDiagramUpdate={handleDiagramUpdate}
          onCommand={handleControlCommand}
          onAlarmAcknowledge={handleAlarmAcknowledge}
          onEmergencyStop={handleEmergencyStop}
          userPermissions={['operator', 'supervisor']}
          userName={user?.email?.split('@')[0] || 'Operator'}
        />
      )}

      {/* System Information Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Production Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Rate:</span>
                  <span className="font-medium">45 units/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Today:</span>
                  <span className="font-medium">1,247 units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Health</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CPU Usage:</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Network:</span>
                  <span className="font-medium text-green-600">Good</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Actions</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  Motor speed adjusted to 75%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Temperature alarm acknowledged
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  System status check completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
