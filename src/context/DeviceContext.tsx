import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  setDevices,
  setGroups,
  selectDevice as setSelectedDevice,
  setLoading,
  setError,
  clearError,
  addDevice,
  updateDevice,
  removeDevice,
  selectDevices,
  selectDeviceGroups,
  selectSelectedDevice,
  selectDeviceLoading,
  selectDeviceError,
  Device,
  DeviceGroup
} from '@/store/slices/deviceSlice';
import { ApiClient } from '@/lib/api';

// Device form types
interface DeviceFormData {
  name: string;
  type: string;
  location?: string;
  description?: string;
  metadata?: Record<string, any>;
  groupIds?: string[];
}

interface DeviceGroupFormData {
  name: string;
  description?: string;
  color?: string;
  devices?: string[];
}

interface DeviceControlCommand {
  command: string;
  parameters?: Record<string, any>;
}

interface DeviceFilters {
  status?: 'online' | 'offline' | 'error';
  type?: string;
  location?: string;
  groupId?: string;
  search?: string;
}

// Context types
interface DeviceContextType {
  // State
  devices: Device[];
  deviceGroups: DeviceGroup[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadDevices: (filters?: DeviceFilters) => Promise<void>;
  loadDeviceGroups: () => Promise<void>;
  selectDevice: (device: Device | null) => void;
  
  // Device management
  createDevice: (data: DeviceFormData) => Promise<boolean>;
  updateDevice: (id: string, data: Partial<DeviceFormData>) => Promise<boolean>;
  deleteDevice: (id: string) => Promise<boolean>;
  
  // Device control
  controlDevice: (id: string, command: DeviceControlCommand) => Promise<boolean>;
  getDeviceStatus: (id: string) => Promise<any>;
  getDeviceHistory: (id: string, startDate?: string, endDate?: string) => Promise<any[]>;
  
  // Device groups
  createDeviceGroup: (data: DeviceGroupFormData) => Promise<boolean>;
  updateDeviceGroup: (id: string, data: Partial<DeviceGroupFormData>) => Promise<boolean>;
  deleteDeviceGroup: (id: string) => Promise<boolean>;
  addDeviceToGroup: (deviceId: string, groupId: string) => Promise<boolean>;
  removeDeviceFromGroup: (deviceId: string, groupId: string) => Promise<boolean>;
  
  // Utilities
  refreshDevice: (id: string) => Promise<void>;
  getFilteredDevices: (filters: DeviceFilters) => Device[];
  getDevicesByGroup: (groupId: string) => Device[];
  
  clearError: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);
  const deviceGroups = useSelector(selectDeviceGroups);
  const selectedDevice = useSelector(selectSelectedDevice);
  const loading = useSelector(selectDeviceLoading);
  const error = useSelector(selectDeviceError);
  
  const [apiClient] = useState(() => new ApiClient());

  // Load initial device data
  useEffect(() => {
    const initializeDevices = async () => {
      try {
        await Promise.all([
          loadDevices(),
          loadDeviceGroups()
        ]);
      } catch (error) {
        console.error('Error initializing devices:', error);
      }
    };

    initializeDevices();
  }, []);

  const loadDevices = async (filters?: DeviceFilters): Promise<void> => {
    try {
      dispatch(setLoading(true));
      
      const params = filters ? { ...filters } : {};
      const response = await apiClient.get('/devices', params);
      
      if (response.success) {
        dispatch(setDevices(response.data));
      } else {
        dispatch(setError('Failed to load devices'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to load devices'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadDeviceGroups = async (): Promise<void> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.get('/devices/groups');
      
      if (response.success) {
        dispatch(setGroups(response.data));
      } else {
        dispatch(setError('Failed to load device groups'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to load device groups'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const selectDevice = (device: Device | null) => {
    dispatch(setSelectedDevice(device));
  };

  const createDevice = async (data: DeviceFormData): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.post('/devices', data);
      
      if (response.success) {
        dispatch(addDevice(response.data));
        return true;
      } else {
        dispatch(setError('Failed to create device'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to create device'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateDeviceAction = async (id: string, data: Partial<DeviceFormData>): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.put(`/devices/${id}`, data);
      
      if (response.success) {
        dispatch(updateDevice({ id, updates: response.data }));
        return true;
      } else {
        dispatch(setError('Failed to update device'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to update device'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteDevice = async (id: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.delete(`/devices/${id}`);
      
      if (response.success) {
        dispatch(removeDevice(id));
        return true;
      } else {
        dispatch(setError('Failed to delete device'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to delete device'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const controlDevice = async (id: string, command: DeviceControlCommand): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.post(`/devices/${id}/control`, command);
      
      if (response.success) {
        // Refresh device status after control command
        await refreshDevice(id);
        return true;
      } else {
        dispatch(setError('Failed to control device'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to control device'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getDeviceStatus = async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/devices/${id}/status`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to get device status');
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to get device status'));
      throw error;
    }
  };

  const getDeviceHistory = async (id: string, startDate?: string, endDate?: string): Promise<any[]> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await apiClient.get(`/devices/${id}/history`, params);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to get device history');
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to get device history'));
      throw error;
    }
  };

  const createDeviceGroup = async (data: DeviceGroupFormData): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.post('/devices/groups', data);
      
      if (response.success) {
        await loadDeviceGroups(); // Refresh groups
        return true;
      } else {
        dispatch(setError('Failed to create device group'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to create device group'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateDeviceGroup = async (id: string, data: Partial<DeviceGroupFormData>): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.put(`/devices/groups/${id}`, data);
      
      if (response.success) {
        await loadDeviceGroups(); // Refresh groups
        return true;
      } else {
        dispatch(setError('Failed to update device group'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to update device group'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteDeviceGroup = async (id: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.delete(`/devices/groups/${id}`);
      
      if (response.success) {
        await loadDeviceGroups(); // Refresh groups
        return true;
      } else {
        dispatch(setError('Failed to delete device group'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to delete device group'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addDeviceToGroup = async (deviceId: string, groupId: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.post(`/devices/groups/${groupId}/devices/${deviceId}`);
      
      if (response.success) {
        await Promise.all([loadDevices(), loadDeviceGroups()]);
        return true;
      } else {
        dispatch(setError('Failed to add device to group'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to add device to group'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const removeDeviceFromGroup = async (deviceId: string, groupId: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const response = await apiClient.delete(`/devices/groups/${groupId}/devices/${deviceId}`);
      
      if (response.success) {
        await Promise.all([loadDevices(), loadDeviceGroups()]);
        return true;
      } else {
        dispatch(setError('Failed to remove device from group'));
        return false;
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to remove device from group'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const refreshDevice = async (id: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/devices/${id}`);
      
      if (response.success) {
        dispatch(updateDevice({ id, updates: response.data }));
      }
    } catch (error: any) {
      console.error('Failed to refresh device:', error);
    }
  };

  const getFilteredDevices = (filters: DeviceFilters): Device[] => {
    let filtered = [...devices];
    
    if (filters.status) {
      filtered = filtered.filter(device => device.status === filters.status);
    }
    
    if (filters.type) {
      filtered = filtered.filter(device => device.type === filters.type);
    }
    
    if (filters.location) {
      filtered = filtered.filter(device => device.location?.address === filters.location);
    }
    
    if (filters.groupId) {
      // Find group and check if device is in it
      const group = deviceGroups.find(g => g.id === filters.groupId);
      if (group) {
        filtered = filtered.filter(device => group.deviceIds.includes(device.id));
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(device => 
        device.name.toLowerCase().includes(searchLower) ||
        device.metadata.serialNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const getDevicesByGroup = (groupId: string): Device[] => {
    const group = deviceGroups.find(g => g.id === groupId);
    if (!group) return [];
    
    return devices.filter(device => group.deviceIds.includes(device.id));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const contextValue: DeviceContextType = {
    // State
    devices,
    deviceGroups,
    selectedDevice,
    loading,
    error,
    
    // Actions
    loadDevices,
    loadDeviceGroups,
    selectDevice,
    
    // Device management
    createDevice,
    updateDevice: updateDeviceAction,
    deleteDevice,
    
    // Device control
    controlDevice,
    getDeviceStatus,
    getDeviceHistory,
    
    // Device groups
    createDeviceGroup,
    updateDeviceGroup,
    deleteDeviceGroup,
    addDeviceToGroup,
    removeDeviceFromGroup,
    
    // Utilities
    refreshDevice,
    getFilteredDevices,
    getDevicesByGroup,
    
    clearError: handleClearError,
  };

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

// Hook for device status counts
export const useDeviceStatusCounts = () => {
  const { devices } = useDevices();
  
  return {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    warning: devices.filter(d => d.status === 'warning').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
    unknown: devices.filter(d => d.status === 'unknown').length,
  };
};

// Hook for device types
export const useDeviceTypes = () => {
  const { devices } = useDevices();
  
  const types = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return types;
};

// Hook for device locations
export const useDeviceLocations = () => {
  const { devices } = useDevices();
  
  const locations = devices.reduce((acc, device) => {
    if (device.location?.address) {
      acc[device.location.address] = (acc[device.location.address] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return locations;
};

export default DeviceContext;
