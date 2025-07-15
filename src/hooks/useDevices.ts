/**
 * Device Management Hook
 * 
 * Provides comprehensive device management functionality including:
 * - Device CRUD operations
 * - Real-time device status monitoring
 * - Device control and configuration
 * - Optimistic updates with error handling
 * - Caching and performance optimization
 * 
 * @version 1.0.0
 * @author IoT Platform Team
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { ApiClient } from '../lib/api';
import { MQTTClient } from '../lib/realtime';

// Device Types and Schemas
export interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller' | 'monitor';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address?: string;
    building?: string;
    floor?: string;
    room?: string;
  };
  configuration: Record<string, any>;
  metadata: {
    manufacturer?: string;
    model?: string;
    version?: string;
    serialNumber?: string;
    installDate?: string;
    lastMaintenance?: string;
  };
  telemetry: {
    lastSeen: Date;
    batteryLevel?: number;
    signalStrength?: number;
    temperature?: number;
    uptime?: number;
  };
  settings: {
    reportingInterval: number; // seconds
    alertThresholds: Record<string, number>;
    autoRestart: boolean;
    maintenanceMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  companyId: string;
}

export interface DeviceFilter {
  type?: Device['type'][];
  status?: Device['status'][];
  location?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DeviceSort {
  field: keyof Device;
  direction: 'asc' | 'desc';
}

export interface DeviceMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  averageBatteryLevel: number;
  averageSignalStrength: number;
  devicesByType: Record<Device['type'], number>;
  devicesByLocation: Record<string, number>;
}

export interface DeviceCommand {
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface DeviceUpdate {
  name?: string;
  configuration?: Record<string, any>;
  settings?: Partial<Device['settings']>;
  location?: Partial<Device['location']>;
  metadata?: Partial<Device['metadata']>;
}

// Validation Schemas
const DeviceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['sensor', 'actuator', 'gateway', 'controller', 'monitor']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
    building: z.string().optional(),
    floor: z.string().optional(),
    room: z.string().optional(),
  }),
  configuration: z.record(z.any()).default({}),
  metadata: z.object({
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    version: z.string().optional(),
    serialNumber: z.string().optional(),
  }).default({}),
  settings: z.object({
    reportingInterval: z.number().min(1).max(3600).default(60),
    alertThresholds: z.record(z.number()).default({}),
    autoRestart: z.boolean().default(true),
    maintenanceMode: z.boolean().default(false),
  }).default({}),
});

const DeviceUpdateSchema = DeviceCreateSchema.partial();

/**
 * Device Management Hook
 */
export function useDevices() {
  const dispatch = useDispatch();
  const apiClient = useRef<ApiClient | null>(null);
  const mqttClient = useRef<MQTTClient | null>(null);
  
  // State management
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DeviceFilter>({});
  const [sort, setSort] = useState<DeviceSort>({ field: 'name', direction: 'asc' });
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Initialize API and MQTT clients
  useEffect(() => {
    apiClient.current = new ApiClient();
    if (realtimeEnabled) {
      mqttClient.current = new MQTTClient({
        broker: 'mqtt://localhost',
        port: 1883,
        keepAlive: 60,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
      });
      mqttClient.current.connect().catch(console.error);
    }

    return () => {
      mqttClient.current?.disconnect();
    };
  }, [realtimeEnabled]);

  // Subscribe to real-time device updates
  useEffect(() => {
    if (!mqttClient.current || !realtimeEnabled) return;

    const handleDeviceUpdate = (topic: string, message: Buffer) => {
      try {
        const deviceId = topic.split('/')[1];
        const data = JSON.parse(message.toString()) as Partial<Device>;
        
        setDevices(prev => prev.map(device => 
          device.id === deviceId 
            ? { ...device, ...data, updatedAt: new Date() }
            : device
        ));
      } catch (error) {
        console.error('Failed to handle device update:', error);
      }
    };

    const handleDeviceStatus = (topic: string, message: Buffer) => {
      try {
        const deviceId = topic.split('/')[1];
        const status = message.toString() as Device['status'];
        
        setDevices(prev => prev.map(device => 
          device.id === deviceId 
            ? { ...device, status, telemetry: { ...device.telemetry, lastSeen: new Date() } }
            : device
        ));
      } catch (error) {
        console.error('Failed to handle device status:', error);
      }
    };

    const handleDeviceTelemetry = (topic: string, message: Buffer) => {
      try {
        const deviceId = topic.split('/')[1];
        const telemetry = JSON.parse(message.toString()) as Partial<Device['telemetry']>;
        
        setDevices(prev => prev.map(device => 
          device.id === deviceId 
            ? { ...device, telemetry: { ...device.telemetry, ...telemetry } }
            : device
        ));
      } catch (error) {
        console.error('Failed to handle device telemetry:', error);
      }
    };

    // Subscribe to device events
    mqttClient.current.subscribe('devices/+/update', handleDeviceUpdate);
    mqttClient.current.subscribe('devices/+/status', handleDeviceStatus);
    mqttClient.current.subscribe('devices/+/telemetry', handleDeviceTelemetry);

    return () => {
      mqttClient.current?.unsubscribe('devices/+/update');
      mqttClient.current?.unsubscribe('devices/+/status');
      mqttClient.current?.unsubscribe('devices/+/telemetry');
    };
  }, [realtimeEnabled]);

  // Fetch devices
  const fetchDevices = useCallback(async (refresh = false) => {
    if (!apiClient.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.current.get<Device[]>('/devices', {
        params: {
          ...filter,
          sort: `${sort.field}:${sort.direction}`,
          refresh
        }
      });

      setDevices(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  // Create device
  const createDevice = useCallback(async (deviceData: z.infer<typeof DeviceCreateSchema>) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    try {
      const validatedData = DeviceCreateSchema.parse(deviceData);
      
      // Optimistic update
      const tempDevice: Device = {
        id: `temp-${Date.now()}`,
        ...validatedData,
        status: 'offline',
        telemetry: {
          lastSeen: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user', // This would come from auth context
        companyId: 'current-company', // This would come from auth context
      };

      setDevices(prev => [tempDevice, ...prev]);

      const response = await apiClient.current.post<Device>('/devices', validatedData);
      
      // Replace temp device with real device
      setDevices(prev => prev.map(device => 
        device.id === tempDevice.id ? response.data : device
      ));

      return response.data;
    } catch (err: any) {
      // Remove optimistic update on error
      setDevices(prev => prev.filter(device => !device.id.startsWith('temp-')));
      throw new Error(err.message || 'Failed to create device');
    }
  }, []);

  // Update device
  const updateDevice = useCallback(async (deviceId: string, updates: DeviceUpdate) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    const previousDevices = devices;
    try {
      const validatedUpdates = DeviceUpdateSchema.parse(updates);
      
      // Optimistic update
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, ...validatedUpdates, updatedAt: new Date() }
          : device
      ));

      const response = await apiClient.current.patch<Device>(`/devices/${deviceId}`, validatedUpdates);
      
      // Update with server response
      setDevices(prev => prev.map(device => 
        device.id === deviceId ? response.data : device
      ));

      return response.data;
    } catch (err: any) {
      // Revert optimistic update on error
      setDevices(previousDevices);
      throw new Error(err.message || 'Failed to update device');
    }
  }, [devices]);

  // Delete device
  const deleteDevice = useCallback(async (deviceId: string) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    const previousDevices = devices;
    try {
      // Optimistic update
      setDevices(prev => prev.filter(device => device.id !== deviceId));

      await apiClient.current.delete(`/devices/${deviceId}`);
      
      // Remove from selected if it was selected
      setSelectedDeviceIds(prev => prev.filter(id => id !== deviceId));
    } catch (err: any) {
      // Revert optimistic update on error
      setDevices(previousDevices);
      throw new Error(err.message || 'Failed to delete device');
    }
  }, [devices]);

  // Send command to device
  const sendCommand = useCallback(async (command: DeviceCommand) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    try {
      const response = await apiClient.current.post(
        `/devices/${command.deviceId}/commands`,
        {
          command: command.command,
          parameters: command.parameters,
          timeout: command.timeout || 30000,
        }
      );

      // Update device status if command affects it
      if (command.command === 'restart' || command.command === 'shutdown') {
        setDevices(prev => prev.map(device => 
          device.id === command.deviceId 
            ? { ...device, status: 'maintenance' }
            : device
        ));
      }

      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send command to device');
    }
  }, []);

  // Bulk operations
  const bulkUpdate = useCallback(async (deviceIds: string[], updates: DeviceUpdate) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    const previousDevices = devices;
    try {
      const validatedUpdates = DeviceUpdateSchema.parse(updates);
      
      // Optimistic update
      setDevices(prev => prev.map(device => 
        deviceIds.includes(device.id)
          ? { ...device, ...validatedUpdates, updatedAt: new Date() }
          : device
      ));

      const response = await apiClient.current.patch('/devices/bulk', {
        deviceIds,
        updates: validatedUpdates,
      });

      // Update with server response
      setDevices(prev => prev.map(device => {
        const updatedDevice = response.data.find((d: Device) => d.id === device.id);
        return updatedDevice || device;
      }));

      return response.data;
    } catch (err: any) {
      // Revert optimistic update on error
      setDevices(previousDevices);
      throw new Error(err.message || 'Failed to bulk update devices');
    }
  }, [devices]);

  const bulkDelete = useCallback(async (deviceIds: string[]) => {
    if (!apiClient.current) throw new Error('API client not initialized');

    const previousDevices = devices;
    try {
      // Optimistic update
      setDevices(prev => prev.filter(device => !deviceIds.includes(device.id)));

      await apiClient.current.delete('/devices/bulk', {
        data: { deviceIds }
      });
      
      // Remove from selected
      setSelectedDeviceIds(prev => prev.filter(id => !deviceIds.includes(id)));
    } catch (err: any) {
      // Revert optimistic update on error
      setDevices(previousDevices);
      throw new Error(err.message || 'Failed to bulk delete devices');
    }
  }, [devices]);

  // Computed values
  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Apply filters
    if (filter.type?.length) {
      result = result.filter(device => filter.type!.includes(device.type));
    }

    if (filter.status?.length) {
      result = result.filter(device => filter.status!.includes(device.status));
    }

    if (filter.location) {
      const locationSearch = filter.location.toLowerCase();
      result = result.filter(device => 
        device.location.address?.toLowerCase().includes(locationSearch) ||
        device.location.building?.toLowerCase().includes(locationSearch) ||
        device.location.floor?.toLowerCase().includes(locationSearch) ||
        device.location.room?.toLowerCase().includes(locationSearch)
      );
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(device =>
        device.name.toLowerCase().includes(search) ||
        device.metadata.manufacturer?.toLowerCase().includes(search) ||
        device.metadata.model?.toLowerCase().includes(search) ||
        device.metadata.serialNumber?.toLowerCase().includes(search)
      );
    }

    if (filter.dateRange) {
      result = result.filter(device => {
        const deviceDate = new Date(device.createdAt);
        return deviceDate >= filter.dateRange!.start && deviceDate <= filter.dateRange!.end;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [devices, filter, sort]);

  const deviceMetrics = useMemo((): DeviceMetrics => {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = devices.filter(d => d.status === 'offline').length;
    const errorDevices = devices.filter(d => d.status === 'error').length;

    const devicesWithBattery = devices.filter(d => d.telemetry.batteryLevel !== undefined);
    const averageBatteryLevel = devicesWithBattery.length > 0
      ? devicesWithBattery.reduce((sum, d) => sum + (d.telemetry.batteryLevel || 0), 0) / devicesWithBattery.length
      : 0;

    const devicesWithSignal = devices.filter(d => d.telemetry.signalStrength !== undefined);
    const averageSignalStrength = devicesWithSignal.length > 0
      ? devicesWithSignal.reduce((sum, d) => sum + (d.telemetry.signalStrength || 0), 0) / devicesWithSignal.length
      : 0;

    const devicesByType = devices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {} as Record<Device['type'], number>);

    const devicesByLocation = devices.reduce((acc, device) => {
      const location = device.location.building || device.location.address || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      errorDevices,
      averageBatteryLevel,
      averageSignalStrength,
      devicesByType,
      devicesByLocation,
    };
  }, [devices]);

  const selectedDevices = useMemo(() => 
    devices.filter(device => selectedDeviceIds.includes(device.id)),
    [devices, selectedDeviceIds]
  );

  // Initial load
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Utility functions
  const getDeviceById = useCallback((deviceId: string) => 
    devices.find(device => device.id === deviceId),
    [devices]
  );

  const toggleSelection = useCallback((deviceId: string) => {
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDeviceIds(filteredDevices.map(device => device.id));
  }, [filteredDevices]);

  const deselectAll = useCallback(() => {
    setSelectedDeviceIds([]);
  }, []);

  const isSelected = useCallback((deviceId: string) => 
    selectedDeviceIds.includes(deviceId),
    [selectedDeviceIds]
  );

  return {
    // Data
    devices: filteredDevices,
    allDevices: devices,
    selectedDevices,
    deviceMetrics,
    
    // State
    loading,
    error,
    filter,
    sort,
    selectedDeviceIds,
    realtimeEnabled,
    
    // Actions
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    sendCommand,
    bulkUpdate,
    bulkDelete,
    
    // Selection
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    
    // Utilities
    getDeviceById,
    setFilter,
    setSort,
    setRealtimeEnabled,
    setError: (error: string | null) => setError(error),
    
    // Refresh
    refresh: () => fetchDevices(true),
  };
}
