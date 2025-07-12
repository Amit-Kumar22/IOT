import { configureStore } from '@reduxjs/toolkit';
import deviceSlice, {
  setDevices,
  addDevice,
  updateDevice,
  removeDevice,
  selectDevice,
  selectGroup,
  setLoading,
  setError,
  clearError,
  setFilters,
  resetFilters,
  incrementErrorCount,
  updateDeviceStatus,
  updateRealTimeData
} from '../deviceSlice';
import { Device, DeviceState, DeviceGroup } from '../deviceSlice';

// Mock device data
const mockDevice: Device = {
  id: 'device-123',
  name: 'Test Device',
  type: 'sensor',
  status: 'online',
  companyId: 'company-123',
  location: {
    address: '123 Test St',
    room: 'Office 1',
    building: 'Main Building',
  },
  metadata: {
    manufacturer: 'Test Manufacturer',
    model: 'Test Model',
    version: '1.0.0',
    serialNumber: 'SN123456',
  },
  lastSeen: '2023-07-15T10:30:00.000Z',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-07-15T10:30:00.000Z',
  isActive: true,
  batteryLevel: 85,
  errorCount: 0,
  dataPoints: {
    temperature: 22.5,
    humidity: 60,
  },
};

const mockDevice2: Device = {
  id: 'device-456',
  name: 'Test Device 2',
  type: 'actuator',
  status: 'offline',
  companyId: 'company-123',
  location: {
    address: '456 Test Ave',
    room: 'Lab 2',
    building: 'Research Building',
  },
  metadata: {
    manufacturer: 'Test Manufacturer 2',
    model: 'Test Model 2',
    version: '2.0.0',
    serialNumber: 'SN789012',
  },
  lastSeen: '2023-07-14T10:30:00.000Z',
  createdAt: '2023-01-02T00:00:00.000Z',
  updatedAt: '2023-07-14T10:30:00.000Z',
  isActive: true,
  batteryLevel: 45,
  errorCount: 1,
  dataPoints: {
    temperature: 18.2,
    humidity: 55,
  },
};

// Type for the Redux store
interface RootState {
  device: DeviceState;
}

describe('Device Slice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        device: deviceSlice,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().device;
      expect(state).toEqual({
        devices: [],
        groups: [],
        selectedDevice: null,
        selectedGroup: null,
        isLoading: false,
        error: null,
        filters: {
          status: 'all',
          type: 'all',
          companyId: 'all',
          searchQuery: '',
        },
        sort: {
          field: 'name',
          direction: 'asc',
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
        },
        realTimeData: {},
      });
    });
  });

  describe('Device List Management', () => {
    it('should set devices', () => {
      const devices = [mockDevice, mockDevice2];
      store.dispatch(setDevices(devices));
      
      const state = store.getState().device;
      expect(state.devices).toEqual(devices);
    });

    it('should add device', () => {
      store.dispatch(addDevice(mockDevice));
      
      const state = store.getState().device;
      expect(state.devices).toContain(mockDevice);
    });

    it('should update device', () => {
      store.dispatch(setDevices([mockDevice]));
      
      const updates = {
        name: 'Updated Device',
        status: 'offline' as const,
        batteryLevel: 50
      };
      
      store.dispatch(updateDevice({ id: mockDevice.id, updates }));
      const state = store.getState().device;
      
      expect(state.devices[0]).toEqual(expect.objectContaining(updates));
    });

    it('should remove device', () => {
      store.dispatch(setDevices([mockDevice, mockDevice2]));
      store.dispatch(removeDevice(mockDevice.id));
      
      const state = store.getState().device;
      expect(state.devices).not.toContain(mockDevice);
      expect(state.devices).toContain(mockDevice2);
    });
  });

  describe('Device Selection', () => {
    it('should select device', () => {
      store.dispatch(setDevices([mockDevice]));
      store.dispatch(selectDevice(mockDevice));
      const state = store.getState().device;
      
      expect(state.selectedDevice).toEqual(mockDevice);
    });

    it('should handle device selection with existing selection', () => {
      store.dispatch(setDevices([mockDevice, mockDevice2]));
      store.dispatch(selectDevice(mockDevice));
      expect(store.getState().device.selectedDevice).toEqual(mockDevice);
      
      // Select different device
      store.dispatch(selectDevice(mockDevice2));
      const state = store.getState().device;
      expect(state.selectedDevice).toEqual(mockDevice2);
    });

    it('should clear selected device', () => {
      store.dispatch(setDevices([mockDevice]));
      store.dispatch(selectDevice(mockDevice));
      expect(store.getState().device.selectedDevice).toEqual(mockDevice);
      
      // Clear selection
      store.dispatch(selectDevice(null));
      const state = store.getState().device;
      expect(state.selectedDevice).toBeNull();
    });
  });

  describe('Group Selection', () => {
    it('should select group', () => {
      const mockGroup: DeviceGroup = {
        id: 'group-1',
        name: 'Test Group',
        description: 'Test Group Description',
        deviceIds: [mockDevice.id, mockDevice2.id],
        companyId: 'company-123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      
      store.dispatch(selectGroup(mockGroup));
      let state = store.getState().device;
      expect(state.selectedGroup).toEqual(mockGroup);
      
      // Select different group
      const mockGroup2: DeviceGroup = {
        id: 'group-2',
        name: 'Another Group',
        description: 'Another Group Description',
        deviceIds: [mockDevice.id],
        companyId: 'company-123',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };
      
      store.dispatch(selectGroup(mockGroup2));
      state = store.getState().device;
      expect(state.selectedGroup).toEqual(mockGroup2);
    });

    it('should clear selected group', () => {
      const mockGroup: DeviceGroup = {
        id: 'group-1',
        name: 'Test Group',
        description: 'Test Group Description',
        deviceIds: [mockDevice.id],
        companyId: 'company-123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      
      store.dispatch(selectGroup(mockGroup));
      expect(store.getState().device.selectedGroup).toEqual(mockGroup);
      
      store.dispatch(selectGroup(null));
      const state = store.getState().device;
      expect(state.selectedGroup).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().device.isLoading).toBe(true);
      
      store.dispatch(setLoading(false));
      expect(store.getState().device.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error', () => {
      const error = 'Test error';
      store.dispatch(setError(error));
      
      const state = store.getState().device;
      expect(state.error).toBe(error);
    });

    it('should clear error', () => {
      store.dispatch(setError('Test error'));
      expect(store.getState().device.error).toBe('Test error');
      
      store.dispatch(clearError());
      const state = store.getState().device;
      expect(state.error).toBeNull();
    });

    it('should increment error count', () => {
      store.dispatch(setDevices([mockDevice]));
      store.dispatch(incrementErrorCount(mockDevice.id));
      
      const state = store.getState().device;
      expect(state.devices[0].errorCount).toBe(1);
    });
  });

  describe('Filters Management', () => {
    it('should set filters', () => {
      const filters = {
        status: 'online' as const,
        type: 'sensor' as const,
        companyId: 'company-123',
        searchQuery: 'test',
      };
      
      store.dispatch(setFilters(filters));
      const state = store.getState().device;
      expect(state.filters).toEqual(filters);
    });

    it('should reset filters', () => {
      const filters = {
        status: 'online' as const,
        type: 'sensor' as const,
        companyId: 'company-123',
        searchQuery: 'test',
      };
      
      store.dispatch(setFilters(filters));
      expect(store.getState().device.filters).toEqual(filters);
      
      store.dispatch(resetFilters());
      const state = store.getState().device;
      expect(state.filters).toEqual({
        status: 'all',
        type: 'all',
        companyId: 'all',
        searchQuery: '',
      });
    });
  });

  describe('Device Status Updates', () => {
    it('should update device status', () => {
      store.dispatch(setDevices([mockDevice]));
      store.dispatch(updateDeviceStatus({ id: mockDevice.id, status: 'offline' }));
      
      const state = store.getState().device;
      expect(state.devices[0].status).toBe('offline');
    });

    it('should update real-time data', () => {
      store.dispatch(setDevices([mockDevice]));
      const newData = {
        temperature: 25.0,
        humidity: 65,
        pressure: 1013.25,
      };
      
      store.dispatch(updateRealTimeData({ deviceId: mockDevice.id, data: newData }));
      
      const state = store.getState().device;
      expect(state.devices[0].dataPoints).toEqual(newData);
    });
  });

  describe('Complex State Transitions', () => {
    it('should handle device selection with filters', () => {
      store.dispatch(setDevices([mockDevice, mockDevice2]));
      store.dispatch(setFilters({ status: 'online', type: 'sensor', companyId: 'company-123', searchQuery: 'test' }));
      store.dispatch(selectDevice(mockDevice));
      
      const state = store.getState().device;
      expect(state.selectedDevice).toEqual(mockDevice);
      expect(state.filters.status).toEqual('online');
    });

    it('should handle error state with loading', () => {
      store.dispatch(setLoading(true));
      store.dispatch(setError('Failed to fetch devices'));
      
      const state = store.getState().device;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Failed to fetch devices');
      
      store.dispatch(setLoading(false));
      store.dispatch(clearError());
      
      const finalState = store.getState().device;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toBeNull();
    });

    it('should handle multiple device updates', () => {
      store.dispatch(setDevices([mockDevice, mockDevice2]));
      
      // Update first device
      store.dispatch(updateDevice({ 
        id: mockDevice.id, 
        updates: { batteryLevel: 90 } 
      }));
      
      // Update second device status
      store.dispatch(updateDeviceStatus({ 
        id: mockDevice2.id, 
        status: 'online' 
      }));
      
      const state = store.getState().device;
      expect(state.devices[0].batteryLevel).toBe(90);
      expect(state.devices[1].status).toBe('online');
    });
  });
});
