/**
 * Tests for useBilling hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { jest } from '@jest/globals';
import React from 'react';
import { useBilling, BillingCycle, BillingAlert, UsageMetrics } from '../useBilling';
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

// Sample billing data
const mockCurrentCycle: BillingCycle = {
  id: 'cycle-1',
  userId: 'user-1',
  companyId: 'company-1',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  status: 'active',
  planDetails: {
    name: 'Professional',
    tier: 'professional',
    pricing: {
      base: 99,
      perDevice: 5,
      perGB: 2,
      perMessage: 0.01,
    },
    limits: {
      devices: 100,
      dataGB: 50,
      messages: 10000,
      apiCalls: 50000,
    },
    features: ['realtime', 'analytics', 'alerts'],
  },
  usage: {
    devices: 25,
    dataGB: 12.5,
    messages: 2500,
    apiCalls: 15000,
    energyKWh: 150,
  },
  costs: {
    base: 99,
    devices: 125,
    data: 25,
    messages: 25,
    overage: 0,
    total: 274,
    breakdown: {
      base: 99,
      devices: 125,
      data: 25,
      messages: 25,
      api: 0,
      energy: 0,
    },
  },
  overage: {
    devices: 0,
    dataGB: 0,
    messages: 0,
    apiCalls: 0,
  },
  discounts: [],
  taxes: {
    rate: 0.08,
    amount: 21.92,
  },
  invoice: {
    id: 'inv-1',
    number: 'INV-2024-001',
    status: 'paid',
    dueDate: new Date('2024-02-15'),
    paidDate: new Date('2024-02-10'),
    amount: 295.92,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockUsageMetrics: UsageMetrics = {
  percentages: {
    messages: 25,
    dataGB: 25,
    devices: 25,
    apiCalls: 30,
  },
  current: {
    messages: 2500,
    dataGB: 12.5,
    devices: 25,
    apiCalls: 15000,
    energyKWh: 150,
  },
  limits: {
    messages: 10000,
    dataGB: 50,
    devices: 100,
    apiCalls: 50000,
  },
  projectedMonthly: {
    messages: 7500,
    dataGB: 37.5,
    devices: 30,
    apiCalls: 45000,
    energyKWh: 450,
  },
  trends: {
    messages: { current: 2500, previous: 2200, change: 13.6 },
    dataGB: { current: 12.5, previous: 11.8, change: 5.9 },
    devices: { current: 25, previous: 22, change: 13.6 },
    apiCalls: { current: 15000, previous: 14200, change: 5.6 },
    energyKWh: { current: 150, previous: 140, change: 7.1 },
  },
  dailyBreakdown: [
    {
      date: '2024-01-15',
      messages: 100,
      dataGB: 0.5,
      devices: 25,
      apiCalls: 600,
      energyKWh: 6,
    },
  ],
};

const mockAlert: BillingAlert = {
  id: 'alert-1',
  userId: 'user-1',
  companyId: 'company-1',
  type: 'usage_warning',
  severity: 'medium',
  title: 'Data Usage Warning',
  message: 'You have used 80% of your monthly data allowance',
  threshold: 80,
  currentValue: 40,
  limit: 50,
  category: 'data',
  isActive: true,
  acknowledgedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useBilling', () => {
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
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
    } as any;
    MockedMQTTClient.mockImplementation(() => mockMqttClient);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentCycle).toBe(null);
      expect(result.current.billingHistory).toEqual([]);
      expect(result.current.usageMetrics).toBe(null);
      expect(result.current.alerts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.realtimeEnabled).toBe(true);
    });

    it('should initialize all clients', () => {
      renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      expect(MockedApiClient).toHaveBeenCalled();
      expect(MockedMQTTClient).toHaveBeenCalled();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch current billing cycle', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse(mockCurrentCycle));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.currentCycle).toEqual(mockCurrentCycle);
      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/current');
    });

    it('should fetch billing history', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse([mockCurrentCycle]));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchBillingHistory({ limit: 10 });
      });

      expect(result.current.billingHistory).toEqual([mockCurrentCycle]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/history', { limit: 10 });
    });

    it('should fetch usage metrics', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse(mockUsageMetrics));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchUsageMetrics();
      });

      expect(result.current.usageMetrics).toEqual(mockUsageMetrics);
      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/usage/current');
    });

    it('should fetch billing alerts', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse([mockAlert]));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchAlerts();
      });

      expect(result.current.alerts).toEqual([mockAlert]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/alerts');
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      (mockApiClient.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.currentCycle).toBe(null);
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate costs correctly', async () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      const costs = result.current.calculateCosts({
        devices: 10,
        dataGB: 5,
        messages: 1000,
        apiCalls: 5000,
        energyKWh: 50,
      });

      expect(costs).toEqual({
        base: 99,
        devices: 50,
        data: 10,
        messages: 10,
        api: 0,
        energy: 0,
        total: 169,
        breakdown: {
          base: 99,
          devices: 50,
          data: 10,
          messages: 10,
          api: 0,
          energy: 0,
        },
      });
    });

    it('should calculate overage costs', async () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      const costs = result.current.calculateCosts({
        devices: 150, // Over limit of 100
        dataGB: 75,   // Over limit of 50
        messages: 15000, // Over limit of 10000
        apiCalls: 60000, // Over limit of 50000
        energyKWh: 50,
      });

      expect(costs.breakdown.devices).toBeGreaterThan(500); // Base + overage
      expect(costs.breakdown.data).toBeGreaterThan(150);    // Base + overage
      expect(costs.breakdown.messages).toBeGreaterThan(150); // Base + overage
      expect(costs.breakdown.api).toBeGreaterThan(0);       // Overage only
    });
  });

  describe('Alert Management', () => {
    it('should acknowledge alert', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue(createMockApiResponse({ ...mockAlert, acknowledgedAt: new Date() }));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.acknowledgeAlert('alert-1');
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/billing/alerts/alert-1/acknowledge');
    });

    it('should dismiss alert', async () => {
      (mockApiClient.delete as jest.Mock).mockResolvedValue(createMockApiResponse({}));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.dismissAlert('alert-1');
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith('/billing/alerts/alert-1');
    });
  });

  describe('Data Export', () => {
    it('should export billing data', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse([mockCurrentCycle]));

      // Mock DOM methods
      const mockCreateElement = jest.fn().mockReturnValue({
        href: '',
        download: '',
        click: jest.fn(),
      });
      const mockAppendChild = jest.fn();
      const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');

      Object.defineProperty(global, 'document', {
        value: {
          createElement: mockCreateElement,
          body: { appendChild: mockAppendChild },
        },
        writable: true,
      });
      Object.defineProperty(global, 'URL', {
        value: { createObjectURL: mockCreateObjectURL },
        writable: true,
      });

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.exportData('csv', { startDate: '2024-01-01', endDate: '2024-01-31' });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/export', {
        format: 'csv',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time billing updates', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse([mockCurrentCycle]));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchBillingHistory();
      });

      expect(result.current.billingHistory).toEqual([mockCurrentCycle]);
    });

    it('should handle real-time usage updates', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse(mockUsageMetrics));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchUsageMetrics();
      });

      expect(result.current.usageMetrics).toEqual(mockUsageMetrics);
    });

    it('should toggle real-time updates', async () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      expect(result.current.realtimeEnabled).toBe(true);

      act(() => {
        result.current.toggleRealtime();
      });

      expect(result.current.realtimeEnabled).toBe(false);

      act(() => {
        result.current.toggleRealtime();
      });

      expect(result.current.realtimeEnabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Server error';
      (mockApiClient.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should clear errors when fetching succeeds', async () => {
      // First, cause an error
      (mockApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.error).toBe('Network error');

      // Then succeed
      (mockApiClient.get as jest.Mock).mockResolvedValue(createMockApiResponse(mockCurrentCycle));

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.currentCycle).toEqual(mockCurrentCycle);
    });
  });
});
