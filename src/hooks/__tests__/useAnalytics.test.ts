import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAnalytics } from '../useAnalytics';

// Mock the dependencies
jest.mock('@/lib/api-client', () => ({
  ApiClient: jest.fn(),
}));

jest.mock('@/lib/mqtt-client', () => ({
  MqttClient: jest.fn(),
}));

jest.mock('@/store/slices/analyticsSlice', () => ({
  default: (state = { data: null, loading: false, error: null }, action: any) => {
    switch (action.type) {
      case 'analytics/setAnalyticsData':
        return { ...state, data: action.payload };
      case 'analytics/setAnalyticsLoading':
        return { ...state, loading: action.payload };
      case 'analytics/setAnalyticsError':
        return { ...state, error: action.payload };
      case 'analytics/clearAnalyticsError':
        return { ...state, error: null };
      case 'analytics/updateAnalyticsMetrics':
        return { ...state, data: { ...state.data, metrics: action.payload } };
      default:
        return state;
    }
  },
}));

// Import after mocking
const { ApiClient } = require('@/lib/api-client');
const { MqttClient } = require('@/lib/mqtt-client');
const analyticsSlice = require('@/store/slices/analyticsSlice').default;

// Mock dependencies
jest.mock('@/lib/api-client');
jest.mock('@/lib/mqtt-client');

const MockedApiClient = jest.mocked(ApiClient);
const MockedMqttClient = jest.mocked(MqttClient);

describe('useAnalytics', () => {
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockMqttClient: jest.Mocked<MqttClient>;
  let store: any;

  const mockDataset = {
    id: 'dataset-1',
    name: 'Device Usage',
    description: 'Device usage analytics',
    dataPoints: [
      {
        timestamp: new Date('2023-01-01T00:00:00Z'),
        value: 100,
        deviceId: 'device-1',
        metricType: 'usage' as const,
      },
    ],
    config: {
      type: 'line' as const,
      aggregation: 'avg' as const,
      timeInterval: 'hour' as const,
    },
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockReport = {
    id: 'report-1',
    title: 'Monthly Usage Report',
    description: 'Monthly device usage report',
    datasets: [mockDataset],
    filters: {
      timeRange: {
        start: new Date('2023-01-01T00:00:00Z'),
        end: new Date('2023-01-31T23:59:59Z'),
      },
    },
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockDashboard = {
    id: 'dashboard-1',
    name: 'Main Dashboard',
    description: 'Main analytics dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'chart' as const,
        title: 'Device Usage',
        datasetId: 'dataset-1',
        position: { x: 0, y: 0, width: 6, height: 4 },
      },
    ],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockAlertRule = {
    id: 'alert-1',
    name: 'High CPU Usage',
    description: 'Alert for high CPU usage',
    metricType: 'performance' as const,
    condition: {
      operator: 'gt' as const,
      value: 80,
      aggregation: 'avg' as const,
      timeWindow: 5,
    },
    actions: [
      {
        type: 'email' as const,
        config: { recipients: ['admin@example.com'] },
      },
    ],
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  const mockRealTimeMetrics = {
    deviceCount: 100,
    activeDevices: 85,
    totalApiCalls: 10000,
    averageResponseTime: 150,
    errorRate: 0.5,
    dataVolume: 1024000,
    timestamp: new Date('2023-01-01T00:00:00Z'),
  };

  const createWrapper = () => {
    const store = configureStore({
      reducer: {
        analytics: analyticsSlice,
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API client mock
    mockApiClient = {
      get: jest.fn().mockImplementation(() => Promise.resolve({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      })),
      post: jest.fn().mockImplementation(() => Promise.resolve({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      })),
      patch: jest.fn().mockImplementation(() => Promise.resolve({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      })),
      delete: jest.fn().mockImplementation(() => Promise.resolve({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      })),
    } as any;
    MockedApiClient.mockImplementation(() => mockApiClient);

    // Setup MQTT client mock
    mockMqttClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
    } as any;
    MockedMqttClient.mockImplementation(() => mockMqttClient);

    store = configureStore({
      reducer: {
        analytics: analyticsSlice,
      },
    });
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      expect(result.current.datasets).toEqual([]);
      expect(result.current.reports).toEqual([]);
      expect(result.current.dashboards).toEqual([]);
      expect(result.current.alertRules).toEqual([]);
      expect(result.current.realTimeMetrics).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.realtimeEnabled).toBe(false);
    });

    it('should initialize all clients', async () => {
      renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      expect(MockedApiClient).toHaveBeenCalledTimes(1);
      expect(MockedMqttClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Fetching', () => {
    it('should fetch datasets', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/analytics/datasets') {
          return Promise.resolve({
            success: true,
            data: [mockDataset],
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchDatasets();
      });

      expect(result.current.datasets).toHaveLength(1);
      expect(result.current.datasets[0]).toEqual(mockDataset);
    });

    it('should fetch reports', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/analytics/reports') {
          return Promise.resolve({
            success: true,
            data: [mockReport],
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchReports();
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.reports[0]).toEqual(mockReport);
    });

    it('should fetch dashboards', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/analytics/dashboards') {
          return Promise.resolve({
            success: true,
            data: [mockDashboard],
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchDashboards();
      });

      expect(result.current.dashboards).toHaveLength(1);
      expect(result.current.dashboards[0]).toEqual(mockDashboard);
    });

    it('should fetch alert rules', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/analytics/alerts') {
          return Promise.resolve({
            success: true,
            data: [mockAlertRule],
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchAlertRules();
      });

      expect(result.current.alertRules).toHaveLength(1);
      expect(result.current.alertRules[0]).toEqual(mockAlertRule);
    });

    it('should fetch real-time metrics', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/analytics/metrics/realtime') {
          return Promise.resolve({
            success: true,
            data: mockRealTimeMetrics,
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchRealTimeMetrics();
      });

      expect(result.current.realTimeMetrics).toEqual(mockRealTimeMetrics);
    });

    it('should handle fetch errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchDatasets();
      });

      expect(result.current.error).toBe('API Error');
    });
  });

  describe('CRUD Operations', () => {
    it('should create dataset', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockDataset,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const dataset = await result.current.createDataset(
          'Test Dataset',
          { type: 'line', aggregation: 'avg' },
          'Test description'
        );
        expect(dataset).toEqual(mockDataset);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/datasets', {
        name: 'Test Dataset',
        config: { type: 'line', aggregation: 'avg' },
        description: 'Test description',
      });
    });

    it('should update dataset', async () => {
      const updatedDataset = { ...mockDataset, name: 'Updated Dataset' };
      mockApiClient.patch.mockResolvedValue({
        success: true,
        data: updatedDataset,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      // First add a dataset
      act(() => {
        result.current.datasets.push(mockDataset);
      });

      await act(async () => {
        const dataset = await result.current.updateDataset('dataset-1', {
          name: 'Updated Dataset',
        });
        expect(dataset).toEqual(updatedDataset);
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/analytics/datasets/dataset-1', {
        name: 'Updated Dataset',
      });
    });

    it('should delete dataset', async () => {
      mockApiClient.delete.mockResolvedValue({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const success = await result.current.deleteDataset('dataset-1');
        expect(success).toBe(true);
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith('/analytics/datasets/dataset-1');
    });

    it('should create report', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockReport,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const report = await result.current.createReport(
          'Test Report',
          ['dataset-1'],
          { timeRange: { start: new Date(), end: new Date() } },
          'Test description'
        );
        expect(report).toEqual(mockReport);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/reports', {
        title: 'Test Report',
        datasetIds: ['dataset-1'],
        filters: { timeRange: { start: expect.any(Date), end: expect.any(Date) } },
        description: 'Test description',
      });
    });

    it('should create dashboard', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockDashboard,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const dashboard = await result.current.createDashboard(
          'Test Dashboard',
          mockDashboard.widgets,
          'Test description'
        );
        expect(dashboard).toEqual(mockDashboard);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/dashboards', {
        name: 'Test Dashboard',
        widgets: mockDashboard.widgets,
        description: 'Test description',
      });
    });

    it('should create alert rule', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockAlertRule,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const alertRule = await result.current.createAlertRule(
          'Test Alert',
          'performance',
          mockAlertRule.condition,
          mockAlertRule.actions,
          'Test description'
        );
        expect(alertRule).toEqual(mockAlertRule);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/alerts', {
        name: 'Test Alert',
        metricType: 'performance',
        condition: mockAlertRule.condition,
        actions: mockAlertRule.actions,
        description: 'Test description',
        isActive: true,
      });
    });

    it('should toggle alert rule', async () => {
      const toggledRule = { ...mockAlertRule, isActive: false };
      mockApiClient.patch.mockResolvedValue({
        success: true,
        data: toggledRule,
        timestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const rule = await result.current.toggleAlertRule('alert-1', false);
        expect(rule).toEqual(toggledRule);
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/analytics/alerts/alert-1', {
        isActive: false,
      });
    });
  });

  describe('Filtering and Aggregation', () => {
    it('should filter datasets by time range', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      // Add datasets with different timestamps
      const datasets = [
        { ...mockDataset, id: 'dataset-1', updatedAt: new Date('2023-01-01') },
        { ...mockDataset, id: 'dataset-2', updatedAt: new Date('2023-01-15') },
        { ...mockDataset, id: 'dataset-3', updatedAt: new Date('2023-02-01') },
      ];

      act(() => {
        result.current.datasets.splice(0, result.current.datasets.length, ...datasets);
      });

      // Apply time range filter
      act(() => {
        result.current.applyFilters({
          timeRange: {
            start: new Date('2023-01-01'),
            end: new Date('2023-01-31'),
          },
        });
      });

      expect(result.current.filteredDatasets).toHaveLength(2);
      expect(result.current.filteredDatasets.map(d => d.id)).toEqual(['dataset-1', 'dataset-2']);
    });

    it('should calculate aggregated metrics', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.realTimeMetrics = mockRealTimeMetrics;
      });

      expect(result.current.aggregatedMetrics).toEqual({
        totalDevices: 100,
        activeDevices: 85,
        deviceUtilization: 85,
        totalApiCalls: 10000,
        averageResponseTime: 150,
        errorRate: 0.5,
        dataVolume: 1024000,
      });
    });

    it('should filter active alert rules', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      const alertRules = [
        { ...mockAlertRule, id: 'alert-1', isActive: true },
        { ...mockAlertRule, id: 'alert-2', isActive: false },
        { ...mockAlertRule, id: 'alert-3', isActive: true },
      ];

      act(() => {
        result.current.alertRules.splice(0, result.current.alertRules.length, ...alertRules);
      });

      expect(result.current.activeAlertRules).toHaveLength(2);
      expect(result.current.activeAlertRules.map(r => r.id)).toEqual(['alert-1', 'alert-3']);
    });
  });

  describe('Real-time Features', () => {
    it('should enable real-time updates', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.setRealtimeEnabled(true);
      });

      expect(result.current.realtimeEnabled).toBe(true);
      expect(mockMqttClient.connect).toHaveBeenCalled();
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'analytics/realtime/metrics',
        expect.any(Function)
      );
    });

    it('should handle MQTT subscription updates', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.setRealtimeEnabled(true);
      });

      // Simulate MQTT message
      const subscribeCall = mockMqttClient.subscribe.mock.calls.find(
        call => call[0] === 'analytics/realtime/metrics'
      );
      
      if (subscribeCall) {
        const callback = subscribeCall[1];
        act(() => {
          callback(mockRealTimeMetrics);
        });
      }

      expect(result.current.realTimeMetrics).toEqual(mockRealTimeMetrics);
    });
  });

  describe('Export Functionality', () => {
    it('should export data', async () => {
      // Mock blob response
      const mockBlob = new Blob(['test data'], { type: 'application/json' });
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockBlob,
        timestamp: new Date().toISOString(),
      });

      // Mock DOM methods
      const mockCreateElement = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      const mockRevokeObjectURL = jest.fn();

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      mockCreateElement.mockReturnValue(mockLink);
      
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true,
      });
      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild,
        writable: true,
      });
      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild,
        writable: true,
      });
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: mockCreateObjectURL,
        writable: true,
      });
      Object.defineProperty(window.URL, 'revokeObjectURL', {
        value: mockRevokeObjectURL,
        writable: true,
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const success = await result.current.exportData('dataset', 'dataset-1', 'json');
        expect(success).toBe(true);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/export/dataset/dataset-1', {
        params: { format: 'json' },
        responseType: 'blob',
      });
      expect(mockLink.download).toBe('dataset-dataset-1.json');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should set time range', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      act(() => {
        result.current.setTimeRange(timeRange);
      });

      expect(result.current.selectedTimeRange).toEqual(timeRange);
      expect(result.current.activeFilters.timeRange).toEqual(timeRange);
    });

    it('should refresh all data', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        const data = url.includes('datasets') ? [mockDataset] :
                     url.includes('reports') ? [mockReport] :
                     url.includes('dashboards') ? [mockDashboard] :
                     url.includes('alerts') ? [mockAlertRule] :
                     url.includes('realtime') ? mockRealTimeMetrics : [];
        
        return Promise.resolve({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        });
      });

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.datasets).toHaveLength(1);
      expect(result.current.reports).toHaveLength(1);
      expect(result.current.dashboards).toHaveLength(1);
      expect(result.current.alertRules).toHaveLength(1);
      expect(result.current.realTimeMetrics).toEqual(mockRealTimeMetrics);
    });

    it('should clear error', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      // First set an error
      mockApiClient.get.mockRejectedValue(new Error('Test error'));
      
      await act(async () => {
        await result.current.fetchDatasets();
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
