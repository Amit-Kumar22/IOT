/**
 * SCADA Control Interface Types
 * Type definitions for industrial control systems
 */

export interface ControlWidget {
  id: string;
  type: 'button' | 'slider' | 'gauge' | 'indicator' | 'switch' | 'chart' | 'text' | 'alarm';
  deviceId: string;
  parameter: string;
  label: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    minValue?: number;
    maxValue?: number;
    unit?: string;
    step?: number;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    style?: 'default' | 'emergency' | 'warning' | 'success';
    confirmAction?: boolean;
    readOnly?: boolean;
    format?: string; // For display formatting
  };
  permissions: string[];
  isVisible: boolean;
  isEnabled: boolean;
  lastUpdated: Date;
}

export interface ProcessDiagram {
  id: string;
  name: string;
  description?: string;
  layout: {
    width: number;
    height: number;
    backgroundImage?: string;
  };
  widgets: ControlWidget[];
  connections: ProcessConnection[];
  zones: ProcessZone[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessConnection {
  id: string;
  fromWidgetId: string;
  toWidgetId: string;
  type: 'pipe' | 'electrical' | 'data' | 'pneumatic';
  style: {
    color: string;
    width: number;
    pattern: 'solid' | 'dashed' | 'dotted';
  };
  points: Array<{ x: number; y: number }>;
  isAnimated: boolean;
  direction?: 'forward' | 'reverse' | 'bidirectional';
}

export interface ProcessZone {
  id: string;
  name: string;
  type: 'production' | 'safety' | 'utility' | 'maintenance';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  opacity: number;
  isVisible: boolean;
}

export interface Alarm {
  id: string;
  deviceId: string;
  parameter: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  timestamp: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  category: 'process' | 'equipment' | 'safety' | 'communication';
  location: string;
  actions: AlarmAction[];
}

export interface AlarmAction {
  id: string;
  type: 'acknowledge' | 'resolve' | 'escalate' | 'comment';
  userId: string;
  userName: string;
  timestamp: Date;
  comment?: string;
  escalatedTo?: string;
}

export interface SafetyInterlock {
  id: string;
  name: string;
  description: string;
  conditions: SafetyCondition[];
  actions: SafetyAction[];
  isActive: boolean;
  isTriggered: boolean;
  lastTriggered?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  bypassable: boolean;
  bypassedBy?: string;
  bypassedAt?: Date;
  bypassReason?: string;
}

export interface SafetyCondition {
  id: string;
  deviceId: string;
  parameter: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'not_between';
  value: number | string | [number, number];
  logicOperator?: 'AND' | 'OR';
}

export interface SafetyAction {
  id: string;
  type: 'emergency_stop' | 'shutdown' | 'alarm' | 'notification' | 'isolate';
  targetDeviceId?: string;
  targetParameter?: string;
  value?: number | string | boolean;
  delay?: number; // seconds
  priority: number;
}

export interface ControlCommand {
  id: string;
  deviceId: string;
  parameter: string;
  value: number | string | boolean;
  timestamp: Date;
  userId: string;
  userName: string;
  confirmationRequired: boolean;
  confirmed?: boolean;
  confirmedAt?: Date;
  confirmedBy?: string;
  executed?: boolean;
  executedAt?: Date;
  status: 'pending' | 'confirmed' | 'executing' | 'completed' | 'failed' | 'cancelled';
  reason?: string;
  comment?: string;
}

export interface OperatorAction {
  id: string;
  type: 'control' | 'acknowledge' | 'bypass' | 'emergency' | 'maintenance';
  userId: string;
  userName: string;
  timestamp: Date;
  deviceId?: string;
  parameter?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  comment?: string;
  level: 'operator' | 'supervisor' | 'engineer' | 'admin';
}

export interface HMIScreen {
  id: string;
  name: string;
  type: 'overview' | 'detail' | 'trend' | 'alarm' | 'maintenance';
  layout: ProcessDiagram;
  navigation: {
    parent?: string;
    children: string[];
    breadcrumb: string[];
  };
  refreshRate: number; // seconds
  isDefault: boolean;
  permissions: string[];
}

export interface DeviceStatus {
  deviceId: string;
  timestamp: Date;
  parameters: Record<string, {
    value: number | string | boolean;
    unit?: string;
    quality: 'good' | 'bad' | 'uncertain';
    timestamp: Date;
  }>;
  alarms: string[]; // alarm IDs
  warnings: string[];
  status: 'running' | 'stopped' | 'fault' | 'maintenance' | 'offline';
  mode: 'auto' | 'manual' | 'maintenance' | 'off';
}

export interface TrendData {
  deviceId: string;
  parameter: string;
  data: Array<{
    timestamp: Date;
    value: number;
    quality: 'good' | 'bad' | 'uncertain';
  }>;
  unit: string;
  range: {
    min: number;
    max: number;
  };
}

export interface ControlPermission {
  userId: string;
  level: 'view' | 'operate' | 'configure' | 'maintain' | 'admin';
  devices: string[]; // device IDs or 'all'
  parameters: string[]; // parameter names or 'all'
  screens: string[]; // screen IDs or 'all'
  restrictions: {
    timeWindow?: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
    requireConfirmation: boolean;
    requireSupervisor: boolean;
    maxValue?: number;
    minValue?: number;
  };
  expiresAt?: Date;
}
