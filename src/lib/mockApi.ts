// Mock API Service - Simulates real API calls with realistic delays
import { mockDataGenerator, MockDevice, MockAnalytics, MockAlert, MockAutomationRule } from './mockData';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeviceControlCommand {
  deviceId: string;
  command: 'start' | 'stop' | 'restart' | 'emergency_stop' | 'turn_on' | 'turn_off' | 'set_temperature' | 'configure';
  parameters?: Record<string, any>;
}

export interface BulkDeviceOperation {
  deviceIds: string[];
  operation: 'start' | 'stop' | 'maintenance' | 'restart';
}

class MockApiService {
  private static instance: MockApiService;
  private requestDelay = 300; // Simulate network delay

  private constructor() {}

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  private async delay(ms: number = this.requestDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Device Management APIs
  async getDevices(type?: 'company' | 'consumer'): Promise<ApiResponse<MockDevice[]>> {
    await this.delay();
    try {
      const devices = mockDataGenerator.getDevices(type);
      return {
        success: true,
        data: devices,
        message: `Retrieved ${devices.length} devices successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve devices'
      };
    }
  }

  async getDevice(id: string): Promise<ApiResponse<MockDevice>> {
    await this.delay();
    try {
      const device = mockDataGenerator.getDevice(id);
      if (!device) {
        return {
          success: false,
          error: `Device with ID ${id} not found`
        };
      }
      return {
        success: true,
        data: device,
        message: 'Device retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve device'
      };
    }
  }

  async controlDevice(command: DeviceControlCommand): Promise<ApiResponse<MockDevice>> {
    await this.delay(500); // Longer delay for control operations
    try {
      const device = mockDataGenerator.getDevice(command.deviceId);
      if (!device) {
        return {
          success: false,
          error: `Device with ID ${command.deviceId} not found`
        };
      }

      let updatedDevice: MockDevice | null = null;

      switch (command.command) {
        case 'start':
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            status: 'online',
            isActive: true,
            lastSeen: new Date().toISOString()
          });
          break;
        
        case 'stop':
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            status: 'offline',
            isActive: false,
            lastSeen: new Date().toISOString()
          });
          break;
        
        case 'restart':
          // First stop, then start
          mockDataGenerator.updateDevice(command.deviceId, { status: 'offline', isActive: false });
          await this.delay(1000);
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            status: 'online',
            isActive: true,
            lastSeen: new Date().toISOString()
          });
          break;
        
        case 'emergency_stop':
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            status: 'maintenance',
            isActive: false,
            lastSeen: new Date().toISOString()
          });
          break;
        
        case 'turn_on':
        case 'turn_off':
          const isOn = command.command === 'turn_on';
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            status: isOn ? 'online' : 'offline',
            isActive: isOn,
            lastSeen: new Date().toISOString(),
            ...(command.parameters || {})
          });
          break;
        
        case 'set_temperature':
          if (command.parameters?.temperature) {
            updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
              temperature: command.parameters.temperature,
              lastSeen: new Date().toISOString()
            });
          }
          break;
        
        case 'configure':
          updatedDevice = mockDataGenerator.updateDevice(command.deviceId, {
            lastSeen: new Date().toISOString(),
            ...(command.parameters || {})
          });
          break;
        
        default:
          return {
            success: false,
            error: `Unknown command: ${command.command}`
          };
      }

      if (!updatedDevice) {
        return {
          success: false,
          error: 'Failed to update device'
        };
      }

      return {
        success: true,
        data: updatedDevice,
        message: `Device ${command.command} executed successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to execute device command'
      };
    }
  }

  async bulkDeviceOperation(operation: BulkDeviceOperation): Promise<ApiResponse<MockDevice[]>> {
    await this.delay(800); // Longer delay for bulk operations
    try {
      const updatedDevices: MockDevice[] = [];
      
      for (const deviceId of operation.deviceIds) {
        let command: DeviceControlCommand['command'];
        
        switch (operation.operation) {
          case 'start':
            command = 'start';
            break;
          case 'stop':
            command = 'stop';
            break;
          case 'maintenance':
            command = 'emergency_stop';
            break;
          case 'restart':
            command = 'restart';
            break;
          default:
            continue;
        }

        const result = await this.controlDevice({ deviceId, command });
        if (result.success && result.data) {
          updatedDevices.push(result.data);
        }
      }

      return {
        success: true,
        data: updatedDevices,
        message: `Bulk ${operation.operation} completed for ${updatedDevices.length} devices`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to execute bulk operation'
      };
    }
  }

  // Analytics APIs
  async getAnalytics(deviceId?: string, metric?: string, hours: number = 24): Promise<ApiResponse<MockAnalytics[]>> {
    await this.delay();
    try {
      const analytics = mockDataGenerator.getAnalytics(deviceId, metric, hours);
      return {
        success: true,
        data: analytics,
        message: `Retrieved ${analytics.length} analytics data points`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve analytics'
      };
    }
  }

  // Alert Management APIs
  async getAlerts(type?: 'company' | 'consumer'): Promise<ApiResponse<MockAlert[]>> {
    await this.delay();
    try {
      const alerts = mockDataGenerator.getAlerts(type);
      return {
        success: true,
        data: alerts,
        message: `Retrieved ${alerts.length} alerts`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve alerts'
      };
    }
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<boolean>> {
    await this.delay();
    try {
      const success = mockDataGenerator.acknowledgeAlert(alertId);
      if (!success) {
        return {
          success: false,
          error: `Alert with ID ${alertId} not found`
        };
      }
      return {
        success: true,
        data: true,
        message: 'Alert acknowledged successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to acknowledge alert'
      };
    }
  }

  // Automation APIs
  async getAutomationRules(type?: 'company' | 'consumer'): Promise<ApiResponse<MockAutomationRule[]>> {
    await this.delay();
    try {
      const rules = mockDataGenerator.getAutomationRules(type);
      return {
        success: true,
        data: rules,
        message: `Retrieved ${rules.length} automation rules`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve automation rules'
      };
    }
  }

  async toggleAutomationRule(ruleId: string): Promise<ApiResponse<MockAutomationRule>> {
    await this.delay();
    try {
      const rule = mockDataGenerator.toggleAutomationRule(ruleId);
      if (!rule) {
        return {
          success: false,
          error: `Automation rule with ID ${ruleId} not found`
        };
      }
      return {
        success: true,
        data: rule,
        message: `Automation rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to toggle automation rule'
      };
    }
  }

  async createAutomationRule(rule: Omit<MockAutomationRule, 'id' | 'triggerCount'>): Promise<ApiResponse<MockAutomationRule>> {
    await this.delay(600);
    try {
      const newRule = mockDataGenerator.createAutomationRule(rule);
      return {
        success: true,
        data: newRule,
        message: 'Automation rule created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create automation rule'
      };
    }
  }

  async deleteAutomationRule(ruleId: string): Promise<ApiResponse<boolean>> {
    await this.delay();
    try {
      const success = mockDataGenerator.deleteAutomationRule(ruleId);
      if (!success) {
        return {
          success: false,
          error: `Automation rule with ID ${ruleId} not found`
        };
      }
      return {
        success: true,
        data: true,
        message: 'Automation rule deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete automation rule'
      };
    }
  }

  // System APIs
  async getSystemHealth(): Promise<ApiResponse<any>> {
    await this.delay();
    try {
      const devices = mockDataGenerator.getDevices();
      const onlineDevices = devices.filter(d => d.status === 'online').length;
      const totalDevices = devices.length;
      const alerts = mockDataGenerator.getAlerts();
      const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

      const systemHealth = {
        uptime: 99.8,
        devicesOnline: onlineDevices,
        totalDevices: totalDevices,
        criticalAlerts: criticalAlerts,
        lastUpdate: new Date().toISOString(),
        status: criticalAlerts > 0 ? 'warning' : onlineDevices / totalDevices > 0.9 ? 'healthy' : 'degraded'
      };

      return {
        success: true,
        data: systemHealth,
        message: 'System health retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve system health'
      };
    }
  }

  // Settings APIs
  async updateSettings(settings: Record<string, any>): Promise<ApiResponse<boolean>> {
    await this.delay(400);
    try {
      // Simulate saving settings
      console.log('Settings updated:', settings);
      return {
        success: true,
        data: true,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update settings'
      };
    }
  }

  // Billing APIs
  async getBillingData(): Promise<ApiResponse<any>> {
    await this.delay();
    try {
      const billingData = {
        currentBill: {
          amount: 12450.00,
          dueDate: '2024-12-25',
          period: 'December 2024',
          status: 'unpaid'
        },
        usage: {
          devices: mockDataGenerator.getDevices('company').length,
          dataStorage: 2.8,
          apiCalls: 2450000
        }
      };

      return {
        success: true,
        data: billingData,
        message: 'Billing data retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve billing data'
      };
    }
  }

  async processPayment(paymentData: any): Promise<ApiResponse<boolean>> {
    await this.delay(1200); // Longer delay for payment processing
    try {
      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate
      
      if (!success) {
        return {
          success: false,
          error: 'Payment processing failed. Please try again.'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing error'
      };
    }
  }
}

export const mockApiService = MockApiService.getInstance();
export default mockApiService;
