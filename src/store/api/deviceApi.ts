import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Device, DeviceGroup, DeviceStatus, DeviceType } from '../slices/deviceSlice';

export interface DeviceCreateRequest {
  name: string;
  type: DeviceType;
  companyId: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    room?: string;
    building?: string;
  };
  metadata?: {
    manufacturer?: string;
    model?: string;
    version?: string;
    serialNumber?: string;
    macAddress?: string;
  };
}

export interface DeviceUpdateRequest {
  name?: string;
  status?: DeviceStatus;
  location?: Device['location'];
  metadata?: Device['metadata'];
  isActive?: boolean;
}

export interface DeviceListQuery {
  companyId?: string;
  status?: DeviceStatus | 'all';
  type?: DeviceType | 'all';
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof Device;
  sortOrder?: 'asc' | 'desc';
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DeviceGroupCreateRequest {
  name: string;
  description?: string;
  deviceIds: string[];
  companyId: string;
}

export interface DeviceGroupUpdateRequest {
  name?: string;
  description?: string;
  deviceIds?: string[];
}

export interface DeviceCommandRequest {
  command: string;
  parameters?: Record<string, any>;
}

export interface DeviceDataResponse {
  deviceId: string;
  timestamp: string;
  data: Record<string, any>;
}

export const deviceApi = createApi({
  reducerPath: 'deviceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/devices',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Device', 'DeviceGroup', 'DeviceData'],
  endpoints: (builder) => ({
    // Device CRUD operations
    getDevices: builder.query<DeviceListResponse, DeviceListQuery>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Device'],
    }),
    
    getDevice: builder.query<Device, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Device', id }],
    }),
    
    createDevice: builder.mutation<Device, DeviceCreateRequest>({
      query: (deviceData) => ({
        url: '',
        method: 'POST',
        body: deviceData,
      }),
      invalidatesTags: ['Device'],
    }),
    
    updateDevice: builder.mutation<Device, { id: string; updates: DeviceUpdateRequest }>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Device', id }, 'Device'],
    }),
    
    deleteDevice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Device'],
    }),
    
    // Device status operations
    updateDeviceStatus: builder.mutation<Device, { id: string; status: DeviceStatus }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Device', id }, 'Device'],
    }),
    
    // Device commands
    sendDeviceCommand: builder.mutation<{ success: boolean; response?: any }, { id: string; command: DeviceCommandRequest }>({
      query: ({ id, command }) => ({
        url: `/${id}/command`,
        method: 'POST',
        body: command,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Device', id }],
    }),
    
    // Device data
    getDeviceData: builder.query<DeviceDataResponse[], { deviceId: string; from?: string; to?: string; limit?: number }>({
      query: ({ deviceId, ...params }) => ({
        url: `/${deviceId}/data`,
        params,
      }),
      providesTags: (result, error, { deviceId }) => [{ type: 'DeviceData', id: deviceId }],
    }),
    
    getLatestDeviceData: builder.query<DeviceDataResponse, string>({
      query: (deviceId) => `/${deviceId}/data/latest`,
      providesTags: (result, error, deviceId) => [{ type: 'DeviceData', id: deviceId }],
    }),
    
    // Device groups
    getDeviceGroups: builder.query<DeviceGroup[], string | undefined>({
      query: (companyId) => ({
        url: '/groups',
        params: companyId ? { companyId } : {},
      }),
      providesTags: ['DeviceGroup'],
    }),
    
    getDeviceGroup: builder.query<DeviceGroup, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'DeviceGroup', id }],
    }),
    
    createDeviceGroup: builder.mutation<DeviceGroup, DeviceGroupCreateRequest>({
      query: (groupData) => ({
        url: '/groups',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['DeviceGroup'],
    }),
    
    updateDeviceGroup: builder.mutation<DeviceGroup, { id: string; updates: DeviceGroupUpdateRequest }>({
      query: ({ id, updates }) => ({
        url: `/groups/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'DeviceGroup', id }, 'DeviceGroup'],
    }),
    
    deleteDeviceGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DeviceGroup'],
    }),
    
    // Bulk operations
    bulkUpdateDeviceStatus: builder.mutation<{ updated: number }, { deviceIds: string[]; status: DeviceStatus }>({
      query: ({ deviceIds, status }) => ({
        url: '/bulk/status',
        method: 'PATCH',
        body: { deviceIds, status },
      }),
      invalidatesTags: ['Device'],
    }),
    
    bulkDeleteDevices: builder.mutation<{ deleted: number }, string[]>({
      query: (deviceIds) => ({
        url: '/bulk',
        method: 'DELETE',
        body: { deviceIds },
      }),
      invalidatesTags: ['Device'],
    }),
    
    // Device statistics
    getDeviceStatistics: builder.query<{
      total: number;
      online: number;
      offline: number;
      warning: number;
      maintenance: number;
      byType: Record<DeviceType, number>;
      byStatus: Record<DeviceStatus, number>;
    }, string | undefined>({
      query: (companyId) => ({
        url: '/statistics',
        params: companyId ? { companyId } : {},
      }),
      providesTags: ['Device'],
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  useUpdateDeviceStatusMutation,
  useSendDeviceCommandMutation,
  useGetDeviceDataQuery,
  useGetLatestDeviceDataQuery,
  useGetDeviceGroupsQuery,
  useGetDeviceGroupQuery,
  useCreateDeviceGroupMutation,
  useUpdateDeviceGroupMutation,
  useDeleteDeviceGroupMutation,
  useBulkUpdateDeviceStatusMutation,
  useBulkDeleteDevicesMutation,
  useGetDeviceStatisticsQuery,
} = deviceApi;
