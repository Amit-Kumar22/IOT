import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DeviceStatus = 'online' | 'offline' | 'warning' | 'maintenance' | 'unknown';
export type DeviceType = 'sensor' | 'actuator' | 'gateway' | 'controller' | 'monitor';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  companyId: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    room?: string;
    building?: string;
  };
  metadata: {
    manufacturer?: string;
    model?: string;
    version?: string;
    serialNumber?: string;
    macAddress?: string;
    ipAddress?: string;
  };
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  uptime?: number;
  errorCount: number;
  dataPoints: Record<string, any>;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  deviceIds: string[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceState {
  devices: Device[];
  groups: DeviceGroup[];
  selectedDevice: Device | null;
  selectedGroup: DeviceGroup | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: DeviceStatus | 'all';
    type: DeviceType | 'all';
    companyId: string | 'all';
    searchQuery: string;
  };
  sort: {
    field: keyof Device;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  realTimeData: Record<string, any>;
  lastSync?: string;
}

const initialState: DeviceState = {
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
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    // Device management
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.lastSync = new Date().toISOString();
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      state.devices.push(action.payload);
    },
    updateDevice: (state, action: PayloadAction<{ id: string; updates: Partial<Device> }>) => {
      const index = state.devices.findIndex(device => device.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = { ...state.devices[index], ...action.payload.updates };
      }
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(device => device.id !== action.payload);
    },
    
    // Device status updates
    updateDeviceStatus: (state, action: PayloadAction<{ id: string; status: DeviceStatus }>) => {
      const device = state.devices.find(d => d.id === action.payload.id);
      if (device) {
        device.status = action.payload.status;
        device.lastSeen = new Date().toISOString();
      }
    },
    
    // Real-time data updates
    updateRealTimeData: (state, action: PayloadAction<{ deviceId: string; data: any }>) => {
      state.realTimeData[action.payload.deviceId] = {
        ...state.realTimeData[action.payload.deviceId],
        ...action.payload.data,
        timestamp: new Date().toISOString(),
      };
      
      // Update device data points
      const device = state.devices.find(d => d.id === action.payload.deviceId);
      if (device) {
        device.dataPoints = {
          ...device.dataPoints,
          ...action.payload.data,
        };
        device.lastSeen = new Date().toISOString();
      }
    },
    
    // Device groups
    setGroups: (state, action: PayloadAction<DeviceGroup[]>) => {
      state.groups = action.payload;
    },
    addGroup: (state, action: PayloadAction<DeviceGroup>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<{ id: string; updates: Partial<DeviceGroup> }>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...action.payload.updates };
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(group => group.id !== action.payload);
    },
    
    // Selection
    selectDevice: (state, action: PayloadAction<Device | null>) => {
      state.selectedDevice = action.payload;
    },
    selectGroup: (state, action: PayloadAction<DeviceGroup | null>) => {
      state.selectedGroup = action.payload;
    },
    
    // Filters and sorting
    setFilters: (state, action: PayloadAction<Partial<DeviceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filtering
    },
    setSort: (state, action: PayloadAction<DeviceState['sort']>) => {
      state.sort = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<DeviceState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Utility actions
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    incrementErrorCount: (state, action: PayloadAction<string>) => {
      const device = state.devices.find(d => d.id === action.payload);
      if (device) {
        device.errorCount += 1;
      }
    },
  },
});

export const {
  setDevices,
  addDevice,
  updateDevice,
  removeDevice,
  updateDeviceStatus,
  updateRealTimeData,
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  selectDevice,
  selectGroup,
  setFilters,
  setSort,
  setPagination,
  setLoading,
  setError,
  clearError,
  resetFilters,
  incrementErrorCount,
} = deviceSlice.actions;

export default deviceSlice.reducer;

// Selectors
export const selectDevices = (state: { device: DeviceState }) => state.device.devices;
export const selectDeviceGroups = (state: { device: DeviceState }) => state.device.groups;
export const selectSelectedDevice = (state: { device: DeviceState }) => state.device.selectedDevice;
export const selectSelectedGroup = (state: { device: DeviceState }) => state.device.selectedGroup;
export const selectDeviceLoading = (state: { device: DeviceState }) => state.device.isLoading;
export const selectDeviceError = (state: { device: DeviceState }) => state.device.error;
export const selectDeviceFilters = (state: { device: DeviceState }) => state.device.filters;
export const selectDeviceSort = (state: { device: DeviceState }) => state.device.sort;
export const selectDevicePagination = (state: { device: DeviceState }) => state.device.pagination;
export const selectRealTimeData = (state: { device: DeviceState }) => state.device.realTimeData;

// Computed selectors
export const selectFilteredDevices = (state: { device: DeviceState }) => {
  const { devices, filters } = state.device;
  
  return devices.filter(device => {
    const statusMatch = filters.status === 'all' || device.status === filters.status;
    const typeMatch = filters.type === 'all' || device.type === filters.type;
    const companyMatch = filters.companyId === 'all' || device.companyId === filters.companyId;
    const searchMatch = !filters.searchQuery || 
      device.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      device.metadata.serialNumber?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return statusMatch && typeMatch && companyMatch && searchMatch;
  });
};

export const selectDeviceStatusCounts = (state: { device: DeviceState }) => {
  const devices = selectFilteredDevices(state);
  
  return devices.reduce((counts, device) => {
    counts[device.status] = (counts[device.status] || 0) + 1;
    return counts;
  }, {} as Record<DeviceStatus, number>);
};

export const selectOnlineDevicesCount = (state: { device: DeviceState }) => {
  return selectFilteredDevices(state).filter(device => device.status === 'online').length;
};
