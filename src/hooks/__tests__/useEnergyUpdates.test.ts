import { renderHook, act } from '@testing-library/react';
import { useEnergyUpdates } from '../useEnergyUpdates';

// Mock WebSocket
const mockWebSocket = {
  readyState: 1,
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onopen: null,
  onmessage: null,
  onclose: null,
  onerror: null,
};

(global as any).WebSocket = jest.fn().mockImplementation(() => mockWebSocket);

describe('useEnergyUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    expect(result.current.energyData).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionError).toBeNull();
    expect(result.current.updateCount).toBe(0);
  });

  it('initializes with provided data', () => {
    const initialData = {
      timestamp: new Date(),
      currentConsumption: 3.2,
      currentCost: 0.38,
      dailyUsage: 24.7,
      dailyCost: 2.96,
      weeklyUsage: 186.3,
      weeklyCost: 22.36,
      monthlyUsage: 847.2,
      monthlyCost: 101.66,
      totalConsumption: 1200,
      cost: 144.50,
      peakHours: [],
      efficiency: { score: 92, rating: 'A', suggestions: [], trendsDirection: 'stable' },
      comparison: { vsYesterday: -5, vsLastWeek: -8, vsLastMonth: -12 },
      breakdown: [],
      deviceBreakdown: []
    };

    const { result } = renderHook(() => useEnergyUpdates(initialData));
    
    expect(result.current.energyData).toEqual(initialData);
  });

  it('provides request energy update function', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    act(() => {
      result.current.requestEnergyUpdate();
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'request_energy_update' })
    );
  });

  it('provides set energy goal function', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    act(() => {
      result.current.setEnergyGoal('daily_usage', 25);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ 
        type: 'set_energy_goal', 
        goal: { type: 'daily_usage', target: 25 }
      })
    );
  });

  it('provides enable alert function', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    act(() => {
      result.current.enableAlert('high_consumption', 50);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ 
        type: 'enable_alert', 
        alert: { type: 'high_consumption', threshold: 50 }
      })
    );
  });

  it('provides reconnect function', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    act(() => {
      result.current.reconnect();
    });

    expect(WebSocket).toHaveBeenCalled();
  });

  it('provides disconnect function', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    act(() => {
      result.current.disconnect();
    });

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('simulates WebSocket connection in development mode', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useEnergyUpdates());
    
    // Should attempt to connect
    expect(WebSocket).toHaveBeenCalled();
    
    // Restore environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  it('handles WebSocket errors gracefully', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    // Simulate WebSocket error
    act(() => {
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }
    });

    expect(result.current.connectionError).toBeTruthy();
  });

  it('updates connection state on WebSocket events', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    // Simulate WebSocket open
    act(() => {
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionError).toBeNull();
  });

  it('updates energy data on WebSocket message', () => {
    const { result } = renderHook(() => useEnergyUpdates());
    
    const mockEnergyData = {
      timestamp: new Date(),
      currentConsumption: 3.5,
      currentCost: 0.42,
      dailyUsage: 25.2,
      dailyCost: 3.02,
      weeklyUsage: 188.1,
      weeklyCost: 22.57,
      monthlyUsage: 850.0,
      monthlyCost: 102.00,
      totalConsumption: 1205,
      cost: 145.50,
      peakHours: [],
      efficiency: { score: 94, rating: 'A', suggestions: [], trendsDirection: 'improving' },
      comparison: { vsYesterday: -3, vsLastWeek: -6, vsLastMonth: -10 },
      breakdown: [],
      deviceBreakdown: []
    };

    // Simulate WebSocket message
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'energy_update',
            data: mockEnergyData
          })
        } as MessageEvent);
      }
    });

    expect(result.current.energyData).toEqual(
      expect.objectContaining({
        currentConsumption: 3.5,
        currentCost: 0.42,
        dailyUsage: 25.2,
        dailyCost: 3.02
      })
    );
    expect(result.current.updateCount).toBe(1);
  });

  it('cleans up WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useEnergyUpdates());
    
    unmount();
    
    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});
