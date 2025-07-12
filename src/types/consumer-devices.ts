/**
 * Device types and interfaces for consumer smart home devices
 * Following the task specifications for home automation
 */

export type DeviceType = 'light' | 'thermostat' | 'security' | 'appliance' | 'sensor';

export type DeviceCapabilityType = 'toggle' | 'dimmer' | 'color' | 'temperature' | 'schedule';

export interface DeviceCapability {
  type: DeviceCapabilityType;
  currentValue: any;
  range?: { min: number; max: number };
  options?: string[];
}

export interface Schedule {
  id: string;
  name: string;
  deviceId: string;
  days: string[];
  timeSlots: TimeSlot[];
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  action: DeviceAction;
}

export interface HomeDevice {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  isOnline: boolean;
  batteryLevel?: number;
  currentState: any;
  capabilities: DeviceCapability[];
  schedules: Schedule[];
  lastSeen?: Date;
  firmwareVersion?: string;
  energyUsage?: number; // kWh
  metadata?: any; // Additional device metadata
}

export interface Room {
  id: string;
  name: string;
  devices: HomeDevice[];
  temperature?: number;
  humidity?: number;
  occupancy?: boolean;
}

export interface DeviceControlState {
  deviceId: string;
  isLoading: boolean;
  error?: string;
  lastUpdate: Date;
}

export interface DeviceAction {
  type: 'toggle' | 'set' | 'schedule' | 'setState' | 'setBrightness' | 'setTemperature' | 'setColor';
  deviceId?: string;
  payload?: any;
  value?: any;
  scheduleId?: string;
}

// Device-specific interfaces
export interface LightDevice extends HomeDevice {
  type: 'light';
  currentState: {
    isOn: boolean;
    brightness?: number; // 0-100
    color?: string; // hex color
    colorTemperature?: number; // Kelvin
  };
}

export interface ThermostatDevice extends HomeDevice {
  type: 'thermostat';
  currentState: {
    currentTemperature: number;
    targetTemperature: number;
    mode: 'heat' | 'cool' | 'auto' | 'off';
    fanMode: 'auto' | 'on' | 'circulate';
    humidity: number;
  };
}

export interface SecurityDevice extends HomeDevice {
  type: 'security';
  currentState: {
    isArmed: boolean;
    status: 'disarmed' | 'home' | 'away' | 'night';
    lastTriggered?: Date;
    sensors: {
      motion: boolean;
      door: boolean;
      window: boolean;
    };
  };
}

export interface ApplianceDevice extends HomeDevice {
  type: 'appliance';
  currentState: {
    isOn: boolean;
    mode?: string;
    remainingTime?: number; // minutes
    status?: string;
  };
}

export interface SensorDevice extends HomeDevice {
  type: 'sensor';
  currentState: {
    value: number;
    unit: string;
    threshold?: number;
    isTriggered: boolean;
  };
}

// Union type for all device types
export type AnyDevice = LightDevice | ThermostatDevice | SecurityDevice | ApplianceDevice | SensorDevice;

// Device control props
export interface DeviceControlProps {
  device: HomeDevice;
  onDeviceUpdate: (deviceId: string, action: DeviceAction) => void;
  isLoading?: boolean;
  showAdvanced?: boolean;
}

// Room grid props
export interface RoomGridProps {
  rooms: Room[];
  onDeviceUpdate: (deviceId: string, action: DeviceAction) => void;
  selectedRoom?: string;
  onRoomSelect?: (roomId: string) => void;
}

// Schedule builder props
export interface ScheduleBuilderProps {
  device: HomeDevice;
  onScheduleCreate: (schedule: Omit<Schedule, 'id'>) => void;
  onScheduleUpdate: (scheduleId: string, schedule: Partial<Schedule>) => void;
  onScheduleDelete: (scheduleId: string) => void;
}

// Quick actions props
export interface QuickActionsProps {
  devices: HomeDevice[];
  onQuickAction: (actionType: string, deviceIds: string[]) => void;
  predefinedActions: {
    id: string;
    name: string;
    icon: string;
    devices: string[];
    actions: DeviceAction[];
  }[];
}

// Device status
export interface DeviceStatus {
  online: number;
  offline: number;
  lowBattery: number;
  total: number;
  energyUsage: number;
  lastUpdated: Date;
}

// Mock data interfaces
export interface MockDeviceData {
  devices: HomeDevice[];
  rooms: Room[];
  quickActions: QuickActionsProps['predefinedActions'];
  schedules: Schedule[];
}
