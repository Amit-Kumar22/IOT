// Custom React Hooks for IoT Platform API Interactions
import { useState, useEffect, useCallback } from 'react';
import { mockApiService, ApiResponse, DeviceControlCommand, BulkDeviceOperation } from '@/lib/mockApi';
import { MockDevice, MockAnalytics, MockAlert, MockAutomationRule } from '@/lib/mockData';

export interface UseDevicesResult {
  devices: MockDevice[];
  loading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
  controlDevice: (command: DeviceControlCommand) => Promise<boolean>;
  bulkOperation: (operation: BulkDeviceOperation) => Promise<boolean>;
}

export interface UseAnalyticsResult {
  analytics: MockAnalytics[];
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export interface UseAlertsResult {
  alerts: MockAlert[];
  loading: boolean;
  error: string | null;
  refreshAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
}

export interface UseAutomationResult {
  rules: MockAutomationRule[];
  loading: boolean;
  error: string | null;
  refreshRules: () => Promise<void>;
  toggleRule: (ruleId: string) => Promise<boolean>;
  createRule: (rule: Omit<MockAutomationRule, 'id' | 'triggerCount'>) => Promise<boolean>;
  deleteRule: (ruleId: string) => Promise<boolean>;
}

// Device Management Hook
export function useDevices(type?: 'company' | 'consumer'): UseDevicesResult {
  const [devices, setDevices] = useState<MockDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getDevices(type);
      
      if (response.success && response.data) {
        setDevices(response.data);
      } else {
        setError(response.error || 'Failed to load devices');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const controlDevice = useCallback(async (command: DeviceControlCommand): Promise<boolean> => {
    try {
      const response = await mockApiService.controlDevice(command);
      
      if (response.success && response.data) {
        // Update the device in the local state
        setDevices(prev => prev.map(device => 
          device.id === command.deviceId ? response.data! : device
        ));
        return true;
      } else {
        setError(response.error || 'Failed to control device');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  const bulkOperation = useCallback(async (operation: BulkDeviceOperation): Promise<boolean> => {
    try {
      const response = await mockApiService.bulkDeviceOperation(operation);
      
      if (response.success && response.data) {
        // Update multiple devices in the local state
        setDevices(prev => prev.map(device => {
          const updatedDevice = response.data!.find(updated => updated.id === device.id);
          return updatedDevice || device;
        }));
        return true;
      } else {
        setError(response.error || 'Failed to execute bulk operation');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    devices,
    loading,
    error,
    refreshDevices,
    controlDevice,
    bulkOperation
  };
}

// Analytics Hook
export function useAnalytics(deviceId?: string, metric?: string, hours: number = 24): UseAnalyticsResult {
  const [analytics, setAnalytics] = useState<MockAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getAnalytics(deviceId, metric, hours);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [deviceId, metric, hours]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
}

// Alerts Hook
export function useAlerts(type?: 'company' | 'consumer'): UseAlertsResult {
  const [alerts, setAlerts] = useState<MockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getAlerts(type);
      
      if (response.success && response.data) {
        setAlerts(response.data);
      } else {
        setError(response.error || 'Failed to load alerts');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const response = await mockApiService.acknowledgeAlert(alertId);
      
      if (response.success) {
        // Update the alert in the local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
        return true;
      } else {
        setError(response.error || 'Failed to acknowledge alert');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  return {
    alerts,
    loading,
    error,
    refreshAlerts,
    acknowledgeAlert
  };
}

// Automation Rules Hook
export function useAutomation(type?: 'company' | 'consumer'): UseAutomationResult {
  const [rules, setRules] = useState<MockAutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getAutomationRules(type);
      
      if (response.success && response.data) {
        setRules(response.data);
      } else {
        setError(response.error || 'Failed to load automation rules');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const toggleRule = useCallback(async (ruleId: string): Promise<boolean> => {
    try {
      const response = await mockApiService.toggleAutomationRule(ruleId);
      
      if (response.success && response.data) {
        // Update the rule in the local state
        setRules(prev => prev.map(rule => 
          rule.id === ruleId ? response.data! : rule
        ));
        return true;
      } else {
        setError(response.error || 'Failed to toggle automation rule');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  const createRule = useCallback(async (rule: Omit<MockAutomationRule, 'id' | 'triggerCount'>): Promise<boolean> => {
    try {
      const response = await mockApiService.createAutomationRule(rule);
      
      if (response.success && response.data) {
        // Add the new rule to the local state
        setRules(prev => [...prev, response.data!]);
        return true;
      } else {
        setError(response.error || 'Failed to create automation rule');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  const deleteRule = useCallback(async (ruleId: string): Promise<boolean> => {
    try {
      const response = await mockApiService.deleteAutomationRule(ruleId);
      
      if (response.success) {
        // Remove the rule from the local state
        setRules(prev => prev.filter(rule => rule.id !== ruleId));
        return true;
      } else {
        setError(response.error || 'Failed to delete automation rule');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshRules();
  }, [refreshRules]);

  return {
    rules,
    loading,
    error,
    refreshRules,
    toggleRule,
    createRule,
    deleteRule
  };
}

// System Health Hook
export function useSystemHealth() {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSystemHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getSystemHealth();
      
      if (response.success && response.data) {
        setSystemHealth(response.data);
      } else {
        setError(response.error || 'Failed to load system health');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSystemHealth();
    
    // Refresh system health every 30 seconds
    const interval = setInterval(refreshSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [refreshSystemHealth]);

  return {
    systemHealth,
    loading,
    error,
    refreshSystemHealth
  };
}

// Settings Hook
export function useSettings() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = useCallback(async (settings: Record<string, any>): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      const response = await mockApiService.updateSettings(settings);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to update settings');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saving,
    error,
    updateSettings
  };
}

// Billing Hook
export function useBilling() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.getBillingData();
      
      if (response.success && response.data) {
        setBillingData(response.data);
      } else {
        setError(response.error || 'Failed to load billing data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (paymentData: any): Promise<boolean> => {
    try {
      setProcessing(true);
      setError(null);
      const response = await mockApiService.processPayment(paymentData);
      
      if (response.success) {
        await refreshBillingData(); // Refresh billing data after successful payment
        return true;
      } else {
        setError(response.error || 'Payment processing failed');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [refreshBillingData]);

  useEffect(() => {
    refreshBillingData();
  }, [refreshBillingData]);

  return {
    billingData,
    loading,
    processing,
    error,
    refreshBillingData,
    processPayment
  };
}
