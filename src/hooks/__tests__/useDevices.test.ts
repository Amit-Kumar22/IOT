/**
 * Tests for useDevices hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { jest } from '@jest/globals';
import React from 'react';
import { useDevices, Device, DeviceFilter, DeviceSort } from '../useDevices';
import { ApiClient } from '../../lib/api';
import { MQTTClient } from '../../lib/realtime';
import { ApiResponse } from '../../types/api';

// Mock the API and MQTT clients
jest.mock('../../lib/api');
jest.mock('../../lib/realtime');

const MockedApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;
const MockedMQTTClient = MQTTClient as jest.MockedClass<typeof MQTTClient>;

// Mock Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null }) => state,
    },
  });
};

// Test wrapper with Redux Provider
const createWrapper = () => {
  const store = createMockStore();
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(Provider, { store, children });
};

// Helper to create mock API response
const createMockApiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

// Sample device data
const mockDevice: Device = {
  id: 'device-1',
  name: 'Temperature Sensor 1',
  type: 'sensor',
  status: 'online',
  location: {
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Main St',
    building: 'Building A',
    floor: '2',
    room: '201',
  },
  configuration: {
    sampleRate: 60,
    threshold: 25,
  },
  metadata: {
    manufacturer: 'SensorTech',
    model: 'ST-100',
    version: '1.2.0',
    serialNumber: 'ST100001',
  },
  telemetry: {
    lastSeen: new Date(),
    batteryLevel: 85,
    signalStrength: -45,
    temperature: 22.5,
    uptime: 86400,
  },
  settings: {
    reportingInterval: 60,
    alertThresholds: { temperature: 30 },
    autoRestart: true,
    maintenanceMode: false,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  companyId: 'company-1',
};

const mockDevices: Device[] = [
  mockDevice,
  {
    ...mockDevice,
    id: 'device-2',
    name: 'Humidity Sensor 1',
    type: 'sensor',
    status: 'offline',
    telemetry: {
      ...mockDevice.telemetry,
      batteryLevel: 20,
    },
  },
  {
    ...mockDevice,
    id: 'device-3',
    name: 'Smart Actuator 1',
    type: 'actuator',
    status: 'error',
  },
];

describe('useDevices', () => {
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockMqttClient: jest.Mocked<MQTTClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API client mock
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;
    MockedApiClient.mockImplementation(() => mockApiClient);

    // Setup MQTT client mock
    mockMqttClient = {
      connect: jest.fn().mockResolvedValue(void 0),
      disconnect: jest.fn(),
      subscribe: jest.fn().mockResolvedValue(void 0),
      unsubscribe: jest.fn().mockResolvedValue(void 0),
      publish: jest.fn().mockResolvedValue(void 0),
    } as any;
    MockedMQTTClient.mockImplementation(() => mockMqttClient);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      expect(result.current.devices).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.selectedDeviceIds).toEqual([]);
      expect(result.current.realtimeEnabled).toBe(true);
    });

    it('should initialize API and MQTT clients', () => {
      renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      expect(MockedApiClient).toHaveBeenCalledTimes(1);
      expect(MockedMQTTClient).toHaveBeenCalledWith({
        broker: 'mqtt://localhost',
        port: 1883,
        keepAlive: 60,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
      });
      expect(mockMqttClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Device Fetching', () => {
    it('should fetch devices successfully', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.devices).toEqual(mockDevices);
      expect(result.current.error).toBe(null);
      expect(mockApiClient.get).toHaveBeenCalledWith('/devices', {
        params: {
          sort: 'name:asc',
          refresh: false,
        },
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.devices).toEqual([]);
    });
  });

  describe('Device Creation', () => {
    it('should create device with optimistic update', async () => {
      const newDeviceData = {
        name: 'New Sensor',
        type: 'sensor' as const,
        location: { lat: 40.7128, lng: -74.0060 },
        configuration: {},
        metadata: {},
        settings: {
          reportingInterval: 60,
          alertThresholds: {},
          autoRestart: true,
          maintenanceMode: false,
        },
      };

      const createdDevice = { ...mockDevice, ...newDeviceData, id: 'device-new' };
      mockApiClient.post.mockResolvedValue(createMockApiResponse(createdDevice));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deviceCount = result.current.devices.length;

      await act(async () => {
        await result.current.createDevice(newDeviceData);
      });

      expect(result.current.devices).toHaveLength(deviceCount + 1);
      expect(result.current.devices[0].name).toBe(newDeviceData.name);
      expect(mockApiClient.post).toHaveBeenCalledWith('/devices', newDeviceData);
    });

    it('should revert optimistic update on creation error', async () => {
      const newDeviceData = {
        name: 'New Sensor',
        type: 'sensor' as const,
        location: { lat: 40.7128, lng: -74.0060 },
        configuration: {},
        metadata: {},
        settings: {
          reportingInterval: 60,
          alertThresholds: {},
          autoRestart: true,
          maintenanceMode: false,
        },
      };

      mockApiClient.post.mockRejectedValue(new Error('Creation failed'));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDeviceCount = result.current.devices.length;

      await act(async () => {
        try {
          await result.current.createDevice(newDeviceData);
        } catch {
          // Expected error
        }
      });

      expect(result.current.devices).toHaveLength(initialDeviceCount);
    });
  });

  describe('Device Updates', () => {
    it('should update device with optimistic update', async () => {
      const updates = { name: 'Updated Sensor Name' };
      const updatedDevice = { ...mockDevice, ...updates };
      
      mockApiClient.patch.mockResolvedValue(createMockApiResponse(updatedDevice));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateDevice(mockDevice.id, updates);
      });

      const updatedDeviceInState = result.current.devices.find(d => d.id === mockDevice.id);
      expect(updatedDeviceInState?.name).toBe(updates.name);
      expect(mockApiClient.patch).toHaveBeenCalledWith(`/devices/${mockDevice.id}`, updates);
    });
  });

  describe('Device Deletion', () => {
    it('should delete device with optimistic update', async () => {
      mockApiClient.delete.mockResolvedValue(createMockApiResponse({}));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDeviceCount = result.current.devices.length;

      await act(async () => {
        await result.current.deleteDevice(mockDevice.id);
      });

      expect(result.current.devices).toHaveLength(initialDeviceCount - 1);
      expect(result.current.devices.find(d => d.id === mockDevice.id)).toBeUndefined();
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/devices/${mockDevice.id}`);
    });
  });

  describe('Device Commands', () => {
    it('should send command to device', async () => {
      const command = {
        deviceId: mockDevice.id,
        command: 'restart',
        parameters: { delay: 5 },
      };

      const commandResponse = { success: true, commandId: 'cmd-123' };
      mockApiClient.post.mockResolvedValue(createMockApiResponse(commandResponse));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const response = await result.current.sendCommand(command);
        expect(response).toEqual(commandResponse);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/devices/${command.deviceId}/commands`,
        {
          command: command.command,
          parameters: command.parameters,
          timeout: 30000,
        }
      );
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk update', async () => {
      const deviceIds = [mockDevices[0].id, mockDevices[1].id];
      const updates = { settings: { maintenanceMode: true } };
      const updatedDevices = mockDevices.map(d => 
        deviceIds.includes(d.id) ? { ...d, ...updates } : d
      );

      mockApiClient.patch.mockResolvedValue(createMockApiResponse(updatedDevices));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.bulkUpdate(deviceIds, updates);
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/devices/bulk', {
        deviceIds,
        updates,
      });
    });

    it('should perform bulk delete', async () => {
      const deviceIds = [mockDevices[0].id, mockDevices[1].id];

      mockApiClient.delete.mockResolvedValue(createMockApiResponse({}));
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDeviceCount = result.current.devices.length;

      await act(async () => {
        await result.current.bulkDelete(deviceIds);
      });

      expect(result.current.devices).toHaveLength(initialDeviceCount - deviceIds.length);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/devices/bulk', {
        data: { deviceIds },
      });
    });
  });

  describe('Device Selection', () => {
    it('should toggle device selection', () => {
      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.toggleSelection(mockDevice.id);
      });

      expect(result.current.selectedDeviceIds).toContain(mockDevice.id);
      expect(result.current.isSelected(mockDevice.id)).toBe(true);

      act(() => {
        result.current.toggleSelection(mockDevice.id);
      });

      expect(result.current.selectedDeviceIds).not.toContain(mockDevice.id);
      expect(result.current.isSelected(mockDevice.id)).toBe(false);
    });

    it('should select all devices', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedDeviceIds).toHaveLength(mockDevices.length);
      mockDevices.forEach(device => {
        expect(result.current.selectedDeviceIds).toContain(device.id);
      });
    });

    it('should deselect all devices', () => {
      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      // First select some devices
      act(() => {
        result.current.toggleSelection(mockDevice.id);
        result.current.toggleSelection('device-2');
      });

      expect(result.current.selectedDeviceIds).toHaveLength(2);

      // Then deselect all
      act(() => {
        result.current.deselectAll();
      });

      expect(result.current.selectedDeviceIds).toHaveLength(0);
    });
  });

  describe('Device Metrics', () => {
    it('should calculate device metrics correctly', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const metrics = result.current.deviceMetrics;

      expect(metrics.totalDevices).toBe(mockDevices.length);
      expect(metrics.onlineDevices).toBe(1);
      expect(metrics.offlineDevices).toBe(1);
      expect(metrics.errorDevices).toBe(1);
      expect(metrics.devicesByType.sensor).toBe(2);
      expect(metrics.devicesByType.actuator).toBe(1);
    });
  });

  describe('Real-time Updates', () => {
    it('should subscribe to MQTT topics on mount', () => {
      renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'devices/+/update',
        expect.any(Function)
      );
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'devices/+/status',
        expect.any(Function)
      );
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'devices/+/telemetry',
        expect.any(Function)
      );
    });

    it('should unsubscribe from MQTT topics on unmount', () => {
      const { unmount } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith('devices/+/update');
      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith('devices/+/status');
      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith('devices/+/telemetry');
    });
  });

  describe('Utility Functions', () => {
    it('should get device by ID', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const device = result.current.getDeviceById(mockDevice.id);
      expect(device).toEqual(mockDevice);

      const nonExistentDevice = result.current.getDeviceById('non-existent');
      expect(nonExistentDevice).toBeUndefined();
    });

    it('should refresh devices', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockDevices));

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/devices', {
        params: {
          sort: 'name:asc',
          refresh: true,
        },
      });
    });
  });
});
