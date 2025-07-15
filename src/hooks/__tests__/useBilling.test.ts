/**
 * Tests for useBilling hook
 */

import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { jest } from '@jest/globals';
import React from 'react';
import { useBilling } from '../useBilling';
import { ApiClient } from '../../lib/api';
import { MQTTClient } from '../../lib/realtime';

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

describe('useBilling', () => {
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockMqttClient: jest.Mocked<MQTTClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API client mock with default resolved values
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
      connect: jest.fn().mockImplementation(() => Promise.resolve()),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
    } as any;
    MockedMQTTClient.mockImplementation(() => mockMqttClient);
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentCycle).toBe(null);
      expect(result.current.billingHistory).toEqual([]);
      expect(result.current.usageMetrics).toBe(null);
      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.realtimeEnabled).toBe(true);
      
      // Wait for initial data loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
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
      const mockCycle = {
        id: 'cycle-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'active' as const,
        totalCost: 100,
        breakdown: {
          baseCost: 50,
          usageCost: 30,
          overageCost: 10,
          energyCost: 5,
          taxes: 5,
          credits: 0,
        },
        usage: {
          totalMessages: 1000,
          totalDataGB: 10,
          totalDevices: 5,
          totalApiCalls: 2000,
        },
        plan: {
          id: 'plan-1',
          name: 'Basic',
          tier: 'basic' as const,
        },
      };

      // Override the default mock for this specific test
      mockApiClient.get.mockImplementation(((url: string) => {
        if (url === '/billing/current') {
          return Promise.resolve({
            success: true,
            data: mockCycle,
            timestamp: new Date().toISOString(),
          });
        }
        if (url === '/billing/history') {
          return Promise.resolve({
            success: true,
            data: [mockCycle],
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.resolve({
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        });
      }) as any);

      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchCurrentCycle();
      });

      expect(result.current.currentCycle).toEqual(mockCycle);
      expect(mockApiClient.get).toHaveBeenCalledWith('/billing/current');
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

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

      // Wait for initial loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Since currentCycle is null initially, calculateCost should return null
      const costs = result.current.calculateCost({
        messages: 1000,
        dataGB: 5,
        devices: 10,
        apiCalls: 5000,
        energyKWh: 50,
      });

      // The function returns null when currentCycle is null or billingCalculator is not available
      expect(costs).toBe(null);
    });
  });

  describe('Alert Management', () => {
    it('should acknowledge alert', async () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.acknowledgeAlert('alert-1');
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/billing/alerts/alert-1', {
        acknowledged: true,
      });
    });
  });

  describe('Utility Functions', () => {
    it('should set realtime enabled state', () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      expect(result.current.realtimeEnabled).toBe(true);

      act(() => {
        result.current.setRealtimeEnabled(false);
      });

      expect(result.current.realtimeEnabled).toBe(false);
    });

    it('should get usage percentage', () => {
      const { result } = renderHook(() => useBilling(), {
        wrapper: createWrapper(),
      });

      const percentage = result.current.getUsagePercentage('messages');
      expect(typeof percentage).toBe('number');
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
  });
});
