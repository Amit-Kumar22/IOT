/**
 * Device management types for IoT platform
 */

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: string;
  groupId?: string;
  userId: string;
  companyId?: string;
  
  // Hardware info
  serialNumber: string;
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  hardwareVersion: string;
  
  // Connectivity
  connectionType: ConnectionType;
  ipAddress?: string;
  macAddress?: string;
  signalStrength?: number;
  batteryLevel?: number;
  
  // Capabilities
  capabilities: DeviceCapability[];
  sensors: Sensor[];
  actuators: Actuator[];
  
  // State
  lastSeen?: string;
  uptime?: number;
  configuration: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastConfigUpdate?: string;
}

export type DeviceType = 
  | 'temperature_sensor'
  | 'humidity_sensor'
  | 'pressure_sensor'
  | 'motion_sensor'
  | 'door_sensor'
  | 'smart_plug'
  | 'smart_light'
  | 'thermostat'
  | 'camera'
  | 'gateway'
  | 'custom';

export type DeviceStatus = 
  | 'online'
  | 'offline'
  | 'error'
  | 'warning'
  | 'maintenance'
  | 'updating';

export type ConnectionType = 
  | 'wifi'
  | 'ethernet'
  | 'bluetooth'
  | 'zigbee'
  | 'zwave'
  | 'lorawan'
  | 'cellular'
  | 'serial';

export interface DeviceCapability {
  id: string;
  type: CapabilityType;
  name: string;
  description?: string;
  writable: boolean;
  readable: boolean;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  enumValues?: string[];
}

export type CapabilityType = 
  | 'switch'
  | 'dimmer'
  | 'color'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'motion'
  | 'contact'
  | 'energy'
  | 'power';

export interface Sensor {
  id: string;
  type: string;
  name: string;
  unit: string;
  value: number | string | boolean;
  timestamp: string;
  accuracy?: number;
  calibration?: Record<string, unknown>;
}

export interface Actuator {
  id: string;
  type: string;
  name: string;
  state: unknown;
  commands: string[];
  lastCommand?: string;
  lastCommandTime?: string;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  deviceIds: string[];
  userId: string;
  companyId?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters?: Record<string, unknown>;
  status: CommandStatus;
  createdAt: string;
  executedAt?: string;
  result?: unknown;
  error?: string;
}

export type CommandStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'timeout';

export interface DeviceLog {
  id: string;
  deviceId: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AlertType = 
  | 'offline'
  | 'battery_low'
  | 'sensor_fault'
  | 'communication_error'
  | 'threshold_breach'
  | 'security_breach'
  | 'maintenance_due';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DeviceSchedule {
  id: string;
  deviceId: string;
  name: string;
  description?: string;
  enabled: boolean;
  schedule: Schedule;
  action: ScheduleAction;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  nextExecution?: string;
}

export interface Schedule {
  type: ScheduleType;
  cron?: string;
  interval?: number;
  specificTimes?: string[];
  days?: number[];
  startDate?: string;
  endDate?: string;
}

export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'cron' | 'interval';

export interface ScheduleAction {
  command: string;
  parameters?: Record<string, unknown>;
  condition?: ActionCondition;
}

export interface ActionCondition {
  sensor: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
  value: unknown;
  value2?: unknown; // For 'between' operator
}

export interface DeviceStatistics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  devicesByType: Record<DeviceType, number>;
  devicesByStatus: Record<DeviceStatus, number>;
  averageUptime: number;
  totalDataPoints: number;
  lastUpdated: string;
}

export interface DeviceConfiguration {
  deviceId: string;
  configuration: Record<string, unknown>;
  version: number;
  appliedAt?: string;
  status: 'pending' | 'applied' | 'failed';
  error?: string;
}

export interface FirmwareUpdate {
  id: string;
  deviceId: string;
  fromVersion: string;
  toVersion: string;
  status: UpdateStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  rollbackAvailable: boolean;
}

export type UpdateStatus = 
  | 'pending'
  | 'downloading'
  | 'installing'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'rolled_back';
