'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  CommandLineIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  BoltIcon,
  FireIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ShieldExclamationIcon,
  EyeIcon,
  PowerIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Company Control Page - Industrial Device Control Center
 * SCADA-style interface for real-time industrial equipment control
 */
export default function CompanyControl() {
  const [selectedSystem, setSelectedSystem] = useState('production-line-a');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // Mock industrial control data
  const controlSystems = {
    'production-line-a': {
      id: 'production-line-a',
      name: 'Production Line A',
      status: 'running',
      devices: [
        {
          id: 'conveyor-1',
          name: 'Conveyor Belt #1',
          type: 'conveyor',
          status: 'running',
          speed: 75, // %
          temperature: 42, // °C
          power: 850, // W
          controlType: 'automatic',
          lastMaintenance: '2024-12-01',
          nextMaintenance: '2024-12-15',
          operatingHours: 142.5,
          alerts: []
        },
        {
          id: 'robotic-arm-2',
          name: 'Robotic Arm #2',
          type: 'robot',
          status: 'running',
          position: { x: 120, y: 85, z: 45 },
          load: 12.5, // kg
          cycles: 8642,
          controlType: 'automatic',
          lastMaintenance: '2024-11-28',
          nextMaintenance: '2024-12-12',
          operatingHours: 156.2,
          alerts: ['performance_degradation']
        },
        {
          id: 'press-machine-3',
          name: 'Hydraulic Press #3',
          type: 'press',
          status: 'stopped',
          pressure: 0, // bar
          force: 0, // kN
          cycles: 15684,
          controlType: 'manual',
          lastMaintenance: '2024-12-02',
          nextMaintenance: '2024-12-10',
          operatingHours: 98.7,
          alerts: ['maintenance_required']
        },
        {
          id: 'quality-scanner-4',
          name: 'Quality Scanner #4',
          type: 'sensor',
          status: 'running',
          scanRate: 45, // items/min
          defectRate: 2.3, // %
          accuracy: 99.7, // %
          controlType: 'automatic',
          lastMaintenance: '2024-11-25',
          nextMaintenance: '2024-12-18',
          operatingHours: 187.3,
          alerts: []
        }
      ]
    },
    'assembly-line-b': {
      id: 'assembly-line-b',
      name: 'Assembly Line B',
      status: 'paused',
      devices: [
        {
          id: 'welding-station-1',
          name: 'Welding Station #1',
          type: 'welder',
          status: 'standby',
          temperature: 28,
          current: 0, // A
          voltage: 0, // V
          controlType: 'automatic',
          lastMaintenance: '2024-11-30',
          nextMaintenance: '2024-12-14',
          operatingHours: 203.8,
          alerts: []
        },
        {
          id: 'assembly-robot-2',
          name: 'Assembly Robot #2',
          type: 'robot',
          status: 'paused',
          position: { x: 200, y: 150, z: 80 },
          load: 0,
          cycles: 12456,
          controlType: 'automatic',
          lastMaintenance: '2024-12-01',
          nextMaintenance: '2024-12-15',
          operatingHours: 178.9,
          alerts: []
        }
      ]
    },
    'packaging-line-c': {
      id: 'packaging-line-c',
      name: 'Packaging Line C',
      status: 'error',
      devices: [
        {
          id: 'packaging-machine-1',
          name: 'Packaging Machine #1',
          type: 'packaging',
          status: 'error',
          speed: 0,
          packagesPerMinute: 0,
          errorCode: 'E001',
          controlType: 'automatic',
          lastMaintenance: '2024-11-27',
          nextMaintenance: '2024-12-11',
          operatingHours: 234.1,
          alerts: ['critical_error', 'immediate_attention']
        }
      ]
    }
  };

  const systemCommands = [
    { id: 'start', name: 'Start System', icon: PlayIcon, color: 'bg-green-600', requiredAuth: false },
    { id: 'stop', name: 'Stop System', icon: StopIcon, color: 'bg-red-600', requiredAuth: true },
    { id: 'pause', name: 'Pause System', icon: PauseIcon, color: 'bg-yellow-600', requiredAuth: false },
    { id: 'reset', name: 'Reset System', icon: ArrowPathIcon, color: 'bg-blue-600', requiredAuth: true },
    { id: 'emergency', name: 'Emergency Stop', icon: ShieldExclamationIcon, color: 'bg-red-800', requiredAuth: true }
  ];

  const deviceCommands = [
    { id: 'start', name: 'Start', icon: PlayIcon, color: 'text-green-600' },
    { id: 'stop', name: 'Stop', icon: StopIcon, color: 'text-red-600' },
    { id: 'pause', name: 'Pause', icon: PauseIcon, color: 'text-yellow-600' },
    { id: 'reset', name: 'Reset', icon: ArrowPathIcon, color: 'text-blue-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'stopped': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'standby': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'conveyor': return CpuChipIcon;
      case 'robot': return WrenchScrewdriverIcon;
      case 'press': return CogIcon;
      case 'sensor': return EyeIcon;
      case 'welder': return BoltIcon;
      case 'packaging': return CommandLineIcon;
      default: return CpuChipIcon;
    }
  };

  const executeSystemCommand = (command: string) => {
    if (command === 'emergency') {
      setEmergencyMode(true);
    }
    console.log(`Executing system command: ${command} on ${selectedSystem}`);
    // In real implementation, this would call the industrial control API
  };

  const executeDeviceCommand = (deviceId: string, command: string) => {
    console.log(`Executing device command: ${command} on device ${deviceId}`);
    // In real implementation, this would call the device control API
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const SystemOverview = () => {
    const currentSystem = controlSystems[selectedSystem as keyof typeof controlSystems];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{currentSystem.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentSystem.status)}`}>
                  {currentSystem.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSystem.devices.length} devices
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {emergencyMode && (
                <div className="flex items-center text-red-600 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">EMERGENCY MODE</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {systemCommands.map((command) => {
              const IconComponent = command.icon;
              return (
                <button
                  key={command.id}
                  onClick={() => executeSystemCommand(command.id)}
                  disabled={emergencyMode && command.id !== 'reset'}
                  className={`${command.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-1 transition-all`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs font-medium">{command.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DeviceControl = ({ device }: { device: any }) => {
    const IconComponent = getDeviceIcon(device.type);
    const isSelected = selectedDevices.includes(device.id);
    
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border-2 transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{device.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {device.controlType}
                  </span>
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleDeviceSelection(device.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {/* Device-specific parameters */}
          <div className="space-y-3 mb-4">
            {device.type === 'conveyor' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Speed</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.speed}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Power</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.power}W</span>
                </div>
              </>
            )}
            
            {device.type === 'robot' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Position</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    X:{device.position.x} Y:{device.position.y} Z:{device.position.z}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Load</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.load}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cycles</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.cycles.toLocaleString()}</span>
                </div>
              </>
            )}

            {device.type === 'press' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pressure</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.pressure} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Force</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.force} kN</span>
                </div>
              </>
            )}

            {device.type === 'sensor' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Scan Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.scanRate}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.accuracy}%</span>
                </div>
              </>
            )}

            {device.type === 'welder' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.current}A</span>
                </div>
              </>
            )}

            {device.type === 'packaging' && device.errorCode && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Error Code</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">{device.errorCode}</span>
              </div>
            )}
          </div>

          {/* Device alerts */}
          {device.alerts && device.alerts.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Active Alerts</div>
              <div className="space-y-1">
                {device.alerts.map((alert: string, index: number) => (
                  <div key={index} className="flex items-center text-xs text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    <span>{alert.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device controls */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {deviceCommands.map((command) => {
                const IconComponent = command.icon;
                return (
                  <button
                    key={command.id}
                    onClick={() => executeDeviceCommand(device.id, command.id)}
                    disabled={emergencyMode && command.id !== 'stop'}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${command.color}`}
                    title={command.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {device.operatingHours}h
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Control Center</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Industrial equipment control and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                {Object.values(controlSystems).map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
              {emergencyMode && (
                <button
                  onClick={() => setEmergencyMode(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Reset Emergency
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="text-sm">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Safety Notice: All control operations are logged and require proper authorization.
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Emergency stop procedures will immediately halt all selected equipment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview and Controls */}
      <SystemOverview />

      {/* Bulk Device Controls */}
      {selectedDevices.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Bulk Control ({selectedDevices.length} devices selected)
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Apply commands to all selected devices simultaneously
              </p>
            </div>
            <div className="flex space-x-2">
              {deviceCommands.map((command) => {
                const IconComponent = command.icon;
                return (
                  <button
                    key={command.id}
                    onClick={() => selectedDevices.forEach(deviceId => executeDeviceCommand(deviceId, command.id))}
                    className={`p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${command.color}`}
                    title={`${command.name} All Selected`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {controlSystems[selectedSystem as keyof typeof controlSystems].devices.map((device) => (
          <DeviceControl key={device.id} device={device} />
        ))}
      </div>

      {/* Emergency Protocols */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <ShieldExclamationIcon className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-100">Emergency Protocols</h3>
            <div className="mt-2 text-sm text-red-800 dark:text-red-200">
              <ul className="list-disc list-inside space-y-1">
                <li>Emergency stop will immediately halt all equipment and trigger safety protocols</li>
                <li>All emergency actions are logged with timestamp and operator identification</li>
                <li>System reset requires supervisor authorization after emergency stop</li>
                <li>Contact emergency response team: +1-800-EMERGENCY</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
