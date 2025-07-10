// Mock Data Generator for IoT Platform
// Provides realistic dummy data for all dashboard components

export interface MockDevice {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'warning';
  location: string;
  lastSeen: string;
  battery?: number;
  signal?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  vibration?: number;
  power?: number;
  rpm?: number;
  flowRate?: number;
  level?: number;
  isActive: boolean;
}

export interface MockAnalytics {
  id: string;
  timestamp: string;
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
}

export interface MockAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface MockAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: 'device' | 'schedule' | 'condition';
    deviceId?: string;
    metric?: string;
    operator?: '>' | '<' | '=' | '!=';
    value?: number;
    schedule?: string;
  };
  actions: Array<{
    type: 'device_control' | 'notification' | 'webhook';
    deviceId?: string;
    command?: string;
    value?: any;
    message?: string;
    url?: string;
  }>;
  lastTriggered?: string;
  triggerCount: number;
}

class MockDataGenerator {
  private static instance: MockDataGenerator;
  private devices: MockDevice[] = [];
  private analytics: MockAnalytics[] = [];
  private alerts: MockAlert[] = [];
  private automationRules: MockAutomationRule[] = [];

  private constructor() {
    this.generateInitialData();
  }

  public static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  private generateInitialData() {
    this.generateCompanyDevices();
    this.generateConsumerDevices();
    this.generateAnalytics();
    this.generateAlerts();
    this.generateAutomationRules();
  }

  private generateCompanyDevices() {
    const companyDevices: MockDevice[] = [
      // Manufacturing Equipment
      {
        id: 'comp-001',
        name: 'Production Line A',
        type: 'Manufacturing Equipment',
        status: 'online',
        location: 'Factory Floor - Section A',
        lastSeen: new Date(Date.now() - 5000).toISOString(),
        temperature: 85.2,
        pressure: 145.8,
        vibration: 2.3,
        rpm: 1800,
        power: 24500,
        isActive: true
      },
      {
        id: 'comp-002',
        name: 'CNC Machine #3',
        type: 'CNC Machine',
        status: 'online',
        location: 'Factory Floor - Section B',
        lastSeen: new Date(Date.now() - 12000).toISOString(),
        temperature: 72.1,
        pressure: 120.5,
        vibration: 1.8,
        rpm: 3200,
        power: 18750,
        isActive: true
      },
      {
        id: 'comp-003',
        name: 'Quality Control Scanner',
        type: 'Quality Control',
        status: 'warning',
        location: 'QC Lab - Station 1',
        lastSeen: new Date(Date.now() - 45000).toISOString(),
        temperature: 23.8,
        power: 850,
        isActive: true
      },
      {
        id: 'comp-004',
        name: 'Conveyor Belt System',
        type: 'Conveyor System',
        status: 'online',
        location: 'Assembly Line',
        lastSeen: new Date(Date.now() - 8000).toISOString(),
        power: 5200,
        flowRate: 45.8,
        isActive: true
      },
      {
        id: 'comp-005',
        name: 'Industrial Boiler #1',
        type: 'Boiler',
        status: 'maintenance',
        location: 'Utility Building',
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        temperature: 95.5,
        pressure: 180.2,
        power: 45000,
        isActive: false
      },
      {
        id: 'comp-006',
        name: 'Air Compressor Unit',
        type: 'Compressor',
        status: 'error',
        location: 'Utility Building',
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        temperature: 110.8,
        pressure: 95.3,
        vibration: 8.5,
        power: 12000,
        isActive: false
      }
    ];

    this.devices.push(...companyDevices);
  }

  private generateConsumerDevices() {
    const consumerDevices: MockDevice[] = [
      // Smart Home Devices
      {
        id: 'cons-001',
        name: 'Living Room Thermostat',
        type: 'Smart Thermostat',
        status: 'online',
        location: 'Living Room',
        lastSeen: new Date(Date.now() - 30000).toISOString(),
        temperature: 22.5,
        humidity: 45.2,
        battery: 85,
        signal: 92,
        power: 5,
        isActive: true
      },
      {
        id: 'cons-002',
        name: 'Kitchen Smart Lights',
        type: 'Smart Lighting',
        status: 'online',
        location: 'Kitchen',
        lastSeen: new Date(Date.now() - 15000).toISOString(),
        power: 24,
        signal: 88,
        isActive: true
      },
      {
        id: 'cons-003',
        name: 'Bedroom Security Camera',
        type: 'Security Camera',
        status: 'online',
        location: 'Master Bedroom',
        lastSeen: new Date(Date.now() - 25000).toISOString(),
        power: 12,
        signal: 76,
        isActive: true
      },
      {
        id: 'cons-004',
        name: 'Front Door Smart Lock',
        type: 'Smart Lock',
        status: 'online',
        location: 'Front Door',
        lastSeen: new Date(Date.now() - 60000).toISOString(),
        battery: 72,
        signal: 94,
        isActive: true
      },
      {
        id: 'cons-005',
        name: 'Garage Door Opener',
        type: 'Garage Door',
        status: 'offline',
        location: 'Garage',
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        battery: 15,
        signal: 0,
        isActive: false
      },
      {
        id: 'cons-006',
        name: 'Smart Sprinkler System',
        type: 'Irrigation',
        status: 'online',
        location: 'Garden',
        lastSeen: new Date(Date.now() - 120000).toISOString(),
        humidity: 68.5,
        flowRate: 8.2,
        power: 180,
        signal: 85,
        isActive: false
      },
      {
        id: 'cons-007',
        name: 'Pool Temperature Sensor',
        type: 'Temperature Sensor',
        status: 'online',
        location: 'Pool Area',
        lastSeen: new Date(Date.now() - 45000).toISOString(),
        temperature: 26.8,
        battery: 91,
        signal: 82,
        isActive: true
      },
      {
        id: 'cons-008',
        name: 'Smart Smoke Detector',
        type: 'Smoke Detector',
        status: 'warning',
        location: 'Hallway',
        lastSeen: new Date(Date.now() - 180000).toISOString(),
        battery: 25,
        signal: 90,
        isActive: true
      }
    ];

    this.devices.push(...consumerDevices);
  }

  private generateAnalytics() {
    const now = new Date();
    const analytics: MockAnalytics[] = [];

    this.devices.forEach(device => {
      // Generate last 24 hours of data points (every 30 minutes)
      for (let i = 0; i < 48; i++) {
        const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
        
        if (device.temperature !== undefined) {
          analytics.push({
            id: `analytics-${device.id}-temp-${i}`,
            timestamp: timestamp.toISOString(),
            deviceId: device.id,
            metric: 'temperature',
            value: device.temperature + (Math.random() - 0.5) * 10,
            unit: '°C'
          });
        }
        
        if (device.power !== undefined) {
          analytics.push({
            id: `analytics-${device.id}-power-${i}`,
            timestamp: timestamp.toISOString(),
            deviceId: device.id,
            metric: 'power',
            value: device.power + (Math.random() - 0.5) * device.power * 0.2,
            unit: 'W'
          });
        }
        
        if (device.pressure !== undefined) {
          analytics.push({
            id: `analytics-${device.id}-pressure-${i}`,
            timestamp: timestamp.toISOString(),
            deviceId: device.id,
            metric: 'pressure',
            value: device.pressure + (Math.random() - 0.5) * 20,
            unit: 'PSI'
          });
        }
      }
    });

    this.analytics = analytics;
  }

  private generateAlerts() {
    const alerts: MockAlert[] = [
      {
        id: 'alert-001',
        deviceId: 'comp-006',
        deviceName: 'Air Compressor Unit',
        type: 'critical',
        message: 'Temperature threshold exceeded (110.8°C)',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-002',
        deviceId: 'comp-003',
        deviceName: 'Quality Control Scanner',
        type: 'warning',
        message: 'Calibration required - last calibrated 30 days ago',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: true
      },
      {
        id: 'alert-003',
        deviceId: 'cons-005',
        deviceName: 'Garage Door Opener',
        type: 'warning',
        message: 'Device offline for more than 1 hour',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-004',
        deviceId: 'cons-008',
        deviceName: 'Smart Smoke Detector',
        type: 'warning',
        message: 'Low battery (25%)',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-005',
        deviceId: 'comp-001',
        deviceName: 'Production Line A',
        type: 'info',
        message: 'Scheduled maintenance completed successfully',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        acknowledged: true,
        resolvedAt: new Date(Date.now() - 86000000).toISOString()
      }
    ];

    this.alerts = alerts;
  }

  private generateAutomationRules() {
    const rules: MockAutomationRule[] = [
      // Company Rules
      {
        id: 'rule-comp-001',
        name: 'Emergency Shutdown Protocol',
        description: 'Automatically shutdown production line when temperature exceeds 90°C',
        enabled: true,
        trigger: {
          type: 'condition',
          deviceId: 'comp-001',
          metric: 'temperature',
          operator: '>',
          value: 90
        },
        actions: [
          {
            type: 'device_control',
            deviceId: 'comp-001',
            command: 'emergency_stop'
          },
          {
            type: 'notification',
            message: 'Emergency shutdown initiated - Production Line A'
          }
        ],
        lastTriggered: new Date(Date.now() - 2592000000).toISOString(),
        triggerCount: 3
      },
      {
        id: 'rule-comp-002',
        name: 'Predictive Maintenance Alert',
        description: 'Alert when vibration levels indicate potential bearing failure',
        enabled: true,
        trigger: {
          type: 'condition',
          deviceId: 'comp-002',
          metric: 'vibration',
          operator: '>',
          value: 5.0
        },
        actions: [
          {
            type: 'notification',
            message: 'Schedule maintenance for CNC Machine #3 - High vibration detected'
          },
          {
            type: 'webhook',
            url: '/api/maintenance/schedule',
            value: { deviceId: 'comp-002', priority: 'high' }
          }
        ],
        triggerCount: 0
      },
      // Consumer Rules
      {
        id: 'rule-cons-001',
        name: 'Evening Lighting Scene',
        description: 'Turn on kitchen lights at sunset',
        enabled: true,
        trigger: {
          type: 'schedule',
          schedule: '0 18 * * *' // 6 PM daily
        },
        actions: [
          {
            type: 'device_control',
            deviceId: 'cons-002',
            command: 'turn_on',
            value: { brightness: 80 }
          }
        ],
        lastTriggered: new Date(Date.now() - 86400000).toISOString(),
        triggerCount: 45
      },
      {
        id: 'rule-cons-002',
        name: 'Energy Saving Mode',
        description: 'Turn off non-essential devices when away',
        enabled: true,
        trigger: {
          type: 'condition',
          deviceId: 'cons-004',
          metric: 'locked_status',
          operator: '=',
          value: 1 // 1 for locked, 0 for unlocked
        },
        actions: [
          {
            type: 'device_control',
            deviceId: 'cons-002',
            command: 'turn_off'
          },
          {
            type: 'device_control',
            deviceId: 'cons-001',
            command: 'set_temperature',
            value: { temperature: 18 }
          }
        ],
        lastTriggered: new Date(Date.now() - 28800000).toISOString(),
        triggerCount: 12
      }
    ];

    this.automationRules = rules;
  }

  // Public API Methods
  public getDevices(type?: 'company' | 'consumer'): MockDevice[] {
    if (type === 'company') {
      return this.devices.filter(d => d.id.startsWith('comp-'));
    }
    if (type === 'consumer') {
      return this.devices.filter(d => d.id.startsWith('cons-'));
    }
    return [...this.devices];
  }

  public getDevice(id: string): MockDevice | undefined {
    return this.devices.find(d => d.id === id);
  }

  public updateDevice(id: string, updates: Partial<MockDevice>): MockDevice | null {
    const deviceIndex = this.devices.findIndex(d => d.id === id);
    if (deviceIndex === -1) return null;
    
    this.devices[deviceIndex] = { ...this.devices[deviceIndex], ...updates };
    return this.devices[deviceIndex];
  }

  public toggleDevice(id: string): MockDevice | null {
    const device = this.getDevice(id);
    if (!device) return null;

    const newStatus = device.status === 'online' ? 'offline' : 'online';
    const newActive = !device.isActive;
    
    return this.updateDevice(id, { 
      status: newStatus, 
      isActive: newActive,
      lastSeen: new Date().toISOString()
    });
  }

  public getAnalytics(deviceId?: string, metric?: string, hours: number = 24): MockAnalytics[] {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return this.analytics.filter(a => {
      const timeMatch = new Date(a.timestamp) >= cutoff;
      const deviceMatch = !deviceId || a.deviceId === deviceId;
      const metricMatch = !metric || a.metric === metric;
      return timeMatch && deviceMatch && metricMatch;
    });
  }

  public getAlerts(type?: 'company' | 'consumer'): MockAlert[] {
    if (type === 'company') {
      return this.alerts.filter(a => a.deviceId.startsWith('comp-'));
    }
    if (type === 'consumer') {
      return this.alerts.filter(a => a.deviceId.startsWith('cons-'));
    }
    return [...this.alerts];
  }

  public acknowledgeAlert(id: string): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === id);
    if (alertIndex === -1) return false;
    
    this.alerts[alertIndex].acknowledged = true;
    return true;
  }

  public getAutomationRules(type?: 'company' | 'consumer'): MockAutomationRule[] {
    if (type === 'company') {
      return this.automationRules.filter(r => r.id.includes('comp'));
    }
    if (type === 'consumer') {
      return this.automationRules.filter(r => r.id.includes('cons'));
    }
    return [...this.automationRules];
  }

  public toggleAutomationRule(id: string): MockAutomationRule | null {
    const ruleIndex = this.automationRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return null;
    
    this.automationRules[ruleIndex].enabled = !this.automationRules[ruleIndex].enabled;
    return this.automationRules[ruleIndex];
  }

  public createAutomationRule(rule: Omit<MockAutomationRule, 'id' | 'triggerCount'>): MockAutomationRule {
    const newRule: MockAutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      triggerCount: 0
    };
    
    this.automationRules.push(newRule);
    return newRule;
  }

  public deleteAutomationRule(id: string): boolean {
    const ruleIndex = this.automationRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;
    
    this.automationRules.splice(ruleIndex, 1);
    return true;
  }
}

export const mockDataGenerator = MockDataGenerator.getInstance();
export default mockDataGenerator;
