'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  PowerIcon,
  StopIcon,
  CogIcon,
  EyeIcon,
  PlusIcon,
  ArrowsPointingOutIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { ProcessDiagram, ControlWidget as ControlWidgetType, DeviceStatus, Alarm, OperatorAction } from '@/types/control';
import ControlWidget from './ControlWidget';

interface SCADAPanelProps {
  diagram: ProcessDiagram;
  deviceStatuses: Record<string, DeviceStatus>;
  alarms: Alarm[];
  isEditing?: boolean;
  onDiagramUpdate?: (diagram: ProcessDiagram) => void;
  onCommand?: (deviceId: string, parameter: string, value: any) => void;
  onAlarmAcknowledge?: (alarmId: string) => void;
  onEmergencyStop?: () => void;
  userPermissions?: string[];
  userName?: string;
  className?: string;
}

/**
 * SCADA Panel Component
 * Industrial control interface with process visualization
 */
export const SCADAPanel: React.FC<SCADAPanelProps> = ({
  diagram,
  deviceStatuses,
  alarms,
  isEditing = false,
  onDiagramUpdate,
  onCommand,
  onAlarmAcknowledge,
  onEmergencyStop,
  userPermissions = [],
  userName = 'Operator',
  className = ''
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showAlarmPanel, setShowAlarmPanel] = useState(false);
  const [actionLog, setActionLog] = useState<OperatorAction[]>([]);
  const [emergencyStopActive, setEmergencyStopActive] = useState(false);
  const [systemMode, setSystemMode] = useState<'auto' | 'manual' | 'maintenance'>('auto');

  // Filter alarms by severity
  const criticalAlarms = alarms.filter(a => a.severity === 'critical' && a.status === 'active');
  const highAlarms = alarms.filter(a => a.severity === 'high' && a.status === 'active');
  const totalActiveAlarms = alarms.filter(a => a.status === 'active').length;

  // Log operator actions
  const logAction = useCallback((action: Omit<OperatorAction, 'id' | 'timestamp' | 'userName' | 'userId'>) => {
    const userId = userName.toLowerCase().replace(/\s+/g, '_');
    const newAction: OperatorAction = {
      ...action,
      id: `action_${Date.now()}`,
      timestamp: new Date(),
      userName,
      userId
    };
    setActionLog(prev => [newAction, ...prev.slice(0, 49)]); // Keep last 50 actions
  }, [userName]);

  // Handle control command with logging
  const handleCommand = useCallback((deviceId: string, parameter: string, value: any) => {
    if (onCommand) {
      const oldValue = deviceStatuses[deviceId]?.parameters[parameter]?.value;
      onCommand(deviceId, parameter, value);
      
      logAction({
        type: 'control',
        deviceId,
        parameter,
        oldValue,
        newValue: value,
        level: 'operator',
        comment: `Changed ${parameter} from ${oldValue} to ${value}`
      });
    }
  }, [onCommand, deviceStatuses, logAction]);

  // Handle emergency stop
  const handleEmergencyStop = useCallback(() => {
    if (onEmergencyStop) {
      setEmergencyStopActive(true);
      onEmergencyStop();
      
      logAction({
        type: 'emergency',
        level: 'operator',
        comment: 'Emergency stop activated'
      });

      // Auto-reset emergency stop after 5 seconds (simulation)
      setTimeout(() => {
        setEmergencyStopActive(false);
      }, 5000);
    }
  }, [onEmergencyStop, logAction]);

  // Handle alarm acknowledgment
  const handleAlarmAcknowledge = useCallback((alarmId: string) => {
    if (onAlarmAcknowledge) {
      onAlarmAcknowledge(alarmId);
      
      const alarm = alarms.find(a => a.id === alarmId);
      logAction({
        type: 'acknowledge',
        deviceId: alarm?.deviceId,
        level: 'operator',
        comment: `Acknowledged alarm: ${alarm?.message}`
      });
    }
  }, [onAlarmAcknowledge, alarms, logAction]);

  // Handle system mode change
  const handleModeChange = useCallback((mode: 'auto' | 'manual' | 'maintenance') => {
    const oldMode = systemMode;
    setSystemMode(mode);
    
    logAction({
      type: 'control',
      parameter: 'system_mode',
      oldValue: oldMode,
      newValue: mode,
      level: 'operator',
      comment: `System mode changed from ${oldMode} to ${mode}`
    });
  }, [systemMode, logAction]);

  // Get overall system status
  const getSystemStatus = (): { status: string; color: string } => {
    if (emergencyStopActive) return { status: 'EMERGENCY STOP', color: 'text-red-600' };
    if (criticalAlarms.length > 0) return { status: 'CRITICAL ALERT', color: 'text-red-600' };
    if (highAlarms.length > 0) return { status: 'WARNING', color: 'text-yellow-600' };
    if (totalActiveAlarms > 0) return { status: 'ALERT', color: 'text-yellow-600' };
    return { status: 'NORMAL', color: 'text-green-600' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className={`bg-gray-900 text-white rounded-lg overflow-hidden ${className}`}>
      {/* Header with system status and controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold">{diagram.name}</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.status === 'NORMAL' ? 'bg-green-500 animate-pulse' :
                systemStatus.status.includes('ALERT') || systemStatus.status === 'WARNING' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`} />
              <span className={`font-medium ${systemStatus.color}`}>
                {systemStatus.status}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* System Mode Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Mode:</span>
              <select
                value={systemMode}
                onChange={(e) => handleModeChange(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                disabled={emergencyStopActive}
              >
                <option value="auto">AUTO</option>
                <option value="manual">MANUAL</option>
                <option value="maintenance">MAINT</option>
              </select>
            </div>

            {/* Alarm Summary */}
            <button
              onClick={() => setShowAlarmPanel(!showAlarmPanel)}
              className={`flex items-center space-x-2 px-3 py-1 rounded ${
                totalActiveAlarms > 0 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-sm">{totalActiveAlarms}</span>
            </button>

            {/* Emergency Stop */}
            <button
              onClick={handleEmergencyStop}
              disabled={emergencyStopActive}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold ${
                emergencyStopActive
                  ? 'bg-red-800 text-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <StopIcon className="h-5 w-5" />
              <span>E-STOP</span>
            </button>

            {/* Settings */}
            <button
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
              onClick={() => console.log('Open settings')}
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Operator info and time */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>Operator: {userName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex h-[600px]">
        {/* Process diagram area */}
        <div className="flex-1 relative overflow-auto bg-gray-800">
          {/* Background grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Process zones */}
          {diagram.zones.map(zone => (
            zone.isVisible && (
              <div
                key={zone.id}
                className="absolute border border-dashed border-gray-400 rounded"
                style={{
                  left: zone.bounds.x,
                  top: zone.bounds.y,
                  width: zone.bounds.width,
                  height: zone.bounds.height,
                  backgroundColor: `${zone.color}${Math.round(zone.opacity * 255).toString(16).padStart(2, '0')}`
                }}
              >
                <div className="absolute top-1 left-1 text-xs text-gray-300 font-medium">
                  {zone.name}
                </div>
              </div>
            )
          ))}

          {/* Control widgets */}
          {diagram.widgets.map(widget => (
            widget.isVisible && (
              <div
                key={widget.id}
                className="absolute"
                style={{
                  left: widget.position.x,
                  top: widget.position.y,
                  width: widget.position.width,
                  height: widget.position.height
                }}
                onClick={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
              >
                <ControlWidget
                  widget={widget}
                  deviceStatus={deviceStatuses[widget.deviceId] || {
                    deviceId: widget.deviceId,
                    timestamp: new Date(),
                    parameters: {},
                    alarms: [],
                    warnings: [],
                    status: 'offline',
                    mode: 'off'
                  }}
                  isEditing={isEditing}
                  onCommand={handleCommand}
                  userPermissions={userPermissions}
                  className={selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''}
                />
              </div>
            )
          ))}

          {/* Process connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {diagram.connections.map(connection => (
              <polyline
                key={connection.id}
                points={connection.points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={connection.style.color}
                strokeWidth={connection.style.width}
                strokeDasharray={
                  connection.style.pattern === 'dashed' ? '5,5' :
                  connection.style.pattern === 'dotted' ? '2,2' : undefined
                }
                className={connection.isAnimated ? 'animate-pulse' : ''}
              />
            ))}
          </svg>

          {/* Add widget button (when editing) */}
          {isEditing && (
            <button
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
              onClick={() => console.log('Add widget')}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Alarm panel (when visible) */}
        {showAlarmPanel && (
          <div className="w-80 border-l border-gray-700 bg-gray-800 overflow-auto">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold text-lg">Active Alarms</h3>
            </div>
            <div className="p-4 space-y-2">
              {alarms.filter(a => a.status === 'active').map(alarm => (
                <div
                  key={alarm.id}
                  className={`border rounded p-3 ${
                    alarm.severity === 'critical' ? 'border-red-500 bg-red-900/20' :
                    alarm.severity === 'high' ? 'border-yellow-500 bg-yellow-900/20' :
                    'border-blue-500 bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <ExclamationTriangleIcon className={`h-4 w-4 ${
                          alarm.severity === 'critical' ? 'text-red-500' :
                          alarm.severity === 'high' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <span className="text-xs font-medium uppercase">
                          {alarm.severity}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{alarm.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alarm.location} • {alarm.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAlarmAcknowledge(alarm.id)}
                      className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-xs rounded"
                    >
                      ACK
                    </button>
                  </div>
                </div>
              ))}
              {alarms.filter(a => a.status === 'active').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No active alarms
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Devices: {Object.keys(deviceStatuses).length}</span>
            <span>Online: {Object.values(deviceStatuses).filter(d => d.status !== 'offline').length}</span>
            <span>Mode: {systemMode.toUpperCase()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Actions: {actionLog.length}</span>
            <span>Last action: {actionLog[0]?.timestamp.toLocaleTimeString() || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Emergency overlay */}
      {emergencyStopActive && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <ShieldExclamationIcon className="h-24 w-24 text-red-300 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-red-300 mb-2">EMERGENCY STOP ACTIVE</h2>
            <p className="text-red-400">System operations halted for safety</p>
            <div className="mt-4 text-sm text-red-400">
              Auto-reset in progress...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SCADAPanel;
