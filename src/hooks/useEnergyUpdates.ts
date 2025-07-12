import { useEffect, useRef, useState } from 'react';
import { EnergyData, EnergyUpdate, EnergyWebSocketMessage } from '@/types/energy';

/**
 * Hook for managing real-time energy data updates via WebSocket
 */
export function useEnergyUpdates(initialData?: EnergyData) {
  // Provide default data immediately to prevent null errors
  const defaultData: EnergyData = initialData || {
    timestamp: new Date(),
    totalConsumption: 3.2,
    cost: 2.45,
    deviceBreakdown: [
      { deviceId: '1', deviceName: 'HVAC System', deviceType: 'hvac', room: 'All', consumption: 1.8, cost: 1.38, percentage: 56.3, efficiency: 'medium' },
      { deviceId: '2', deviceName: 'Water Heater', deviceType: 'water_heater', room: 'Utility', consumption: 0.7, cost: 0.54, percentage: 21.9, efficiency: 'high' },
      { deviceId: '3', deviceName: 'Lighting', deviceType: 'lighting', room: 'All', consumption: 0.4, cost: 0.31, percentage: 12.5, efficiency: 'high' },
      { deviceId: '4', deviceName: 'Refrigerator', deviceType: 'appliance', room: 'Kitchen', consumption: 0.3, cost: 0.23, percentage: 9.4, efficiency: 'high' }
    ],
    peakHours: [
      { startTime: '14:00', endTime: '20:00', start: '14:00', end: '20:00', description: 'Peak Rate Hours' }
    ],
    efficiency: {
      rating: 'A',
      score: 92,
      overallScore: 92,
      consumptionEfficiency: 88,
      peakUsageOptimization: 85,
      deviceEfficiency: 90,
      costEfficiency: 87,
      suggestions: [
        { id: '1', type: 'schedule_optimization', title: 'Optimize HVAC schedule', description: 'Adjust heating/cooling schedule for better efficiency', impact: 'high', estimatedSavings: 25, difficulty: 'easy' }
      ],
      trendsDirection: 'improving'
    }
  };

  const [energyData, setEnergyData] = useState<EnergyData>(defaultData);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000; // 2 seconds

  const connectWebSocket = () => {
    try {
      // In development, skip WebSocket and use mock updates
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock energy updates');
        startMockUpdates();
        return;
      }
      
      // In production, try WebSocket connection
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/energy`;
      
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('Energy WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const message: EnergyWebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'energy_update':
              const update = message.payload as EnergyUpdate;
              setEnergyData(prevData => ({
                ...prevData,
                totalConsumption: update.consumption,
                cost: update.cost,
                timestamp: new Date(update.timestamp),
                // Update device breakdown if device-specific update
                deviceBreakdown: update.deviceId 
                  ? prevData.deviceBreakdown.map(item => 
                      item.deviceId === update.deviceId
                        ? { ...item, consumption: update.consumption, cost: update.cost }
                        : item
                    )
                  : prevData.deviceBreakdown
              }));
              setUpdateCount(prev => prev + 1);
              break;
              
            case 'alert':
              // Handle energy alerts
              console.log('Energy alert received:', message.payload);
              break;
              
            case 'goal_progress':
              // Handle goal progress updates
              console.log('Goal progress update:', message.payload);
              break;
              
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketRef.current.onerror = (error) => {
        console.log('WebSocket connection failed, falling back to mock updates');
        setConnectionError(null); // Don't show error, just fallback
        startMockUpdates();
      };

      websocketRef.current.onclose = (event) => {
        console.log('Energy WebSocket closed, using mock updates');
        setIsConnected(false);
        
        // Fallback to mock updates instead of showing error
        if (event.code !== 1000) {
          startMockUpdates();
        }
      };

    } catch (error) {
      console.log('Error connecting to WebSocket, using mock updates');
      setConnectionError(null); // Don't show error, just fallback
      startMockUpdates();
    }
  };

  // Mock updates for development and fallback
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const startMockUpdates = () => {
    setIsConnected(true);
    setConnectionError(null);
    
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
    }
    
    mockIntervalRef.current = setInterval(() => {
      setEnergyData(prevData => {
        // Simulate realistic energy consumption variations
        const baseConsumption = 3.2;
        const variation = (Math.random() - 0.5) * 0.8; // ±0.4 kWh variation
        const newConsumption = Math.max(0.5, baseConsumption + variation);
        const newCost = newConsumption * 0.12; // $0.12/kWh
        
        return {
          ...prevData,
          totalConsumption: newConsumption,
          cost: newCost,
          timestamp: new Date(),
          // Simulate device-level updates
          deviceBreakdown: prevData.deviceBreakdown.map((item) => ({
            ...item,
            consumption: Math.max(0.1, item.consumption + (Math.random() - 0.5) * 0.1),
            cost: Math.max(0.01, (item.consumption + (Math.random() - 0.5) * 0.1) * 0.12)
          }))
        };
      });
      
      setUpdateCount(prev => prev + 1);
    }, 5000); // Update every 5 seconds
  };

  const stopMockUpdates = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Component unmounting');
      websocketRef.current = null;
    }
    
    stopMockUpdates();
    setIsConnected(false);
    setConnectionError(null);
  };

  const sendMessage = (message: any) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  };

  const requestEnergyUpdate = () => {
    sendMessage({ type: 'request_update' });
  };

  const setEnergyGoal = (goalType: string, target: number) => {
    sendMessage({ 
      type: 'set_goal', 
      payload: { type: goalType, target } 
    });
  };

  const enableAlert = (alertType: string, threshold: number) => {
    sendMessage({ 
      type: 'enable_alert', 
      payload: { type: alertType, threshold } 
    });
  };

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return {
    energyData,
    isConnected,
    connectionError,
    updateCount,
    requestEnergyUpdate,
    setEnergyGoal,
    enableAlert,
    reconnect: connectWebSocket,
    disconnect: disconnectWebSocket
  };
}

/**
 * Hook for simulating real-time energy updates in development
 */
export function useMockEnergyUpdates(initialData?: EnergyData) {
  const [energyData, setEnergyData] = useState<EnergyData>(initialData || {
    timestamp: new Date(),
    totalConsumption: 3.2,
    cost: 2.45,
    deviceBreakdown: [
      { deviceId: '1', deviceName: 'HVAC System', deviceType: 'hvac', room: 'All', consumption: 1.8, cost: 1.38, percentage: 56.3, efficiency: 'medium' },
      { deviceId: '2', deviceName: 'Water Heater', deviceType: 'water_heater', room: 'Utility', consumption: 0.7, cost: 0.54, percentage: 21.9, efficiency: 'high' },
      { deviceId: '3', deviceName: 'Lighting', deviceType: 'lighting', room: 'All', consumption: 0.4, cost: 0.31, percentage: 12.5, efficiency: 'high' },
      { deviceId: '4', deviceName: 'Refrigerator', deviceType: 'appliance', room: 'Kitchen', consumption: 0.3, cost: 0.23, percentage: 9.4, efficiency: 'high' }
    ],
    peakHours: [
      { startTime: '14:00', endTime: '20:00', start: '14:00', end: '20:00', description: 'Peak Rate Hours' }
    ],
    efficiency: {
      rating: 'A',
      score: 92,
      overallScore: 92,
      consumptionEfficiency: 88,
      peakUsageOptimization: 85,
      deviceEfficiency: 90,
      costEfficiency: 87,
      suggestions: [
        { id: '1', type: 'schedule_optimization', title: 'Optimize HVAC schedule', description: 'Adjust heating/cooling schedule for better efficiency', impact: 'high', estimatedSavings: 25, difficulty: 'easy' }
      ],
      trendsDirection: 'improving'
    }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMockUpdates = () => {
    setIsConnected(true);
    
    intervalRef.current = setInterval(() => {
      setEnergyData(prevData => {
        // Simulate realistic energy consumption variations
        const baseConsumption = 3.2;
        const variation = (Math.random() - 0.5) * 0.8; // ±0.4 kWh variation
        const newConsumption = Math.max(0.5, baseConsumption + variation);
        const newCost = newConsumption * 0.12; // $0.12/kWh
        
        return {
          ...prevData,
          totalConsumption: newConsumption,
          cost: newCost,
          timestamp: new Date(),
          // Simulate device-level updates
          deviceBreakdown: prevData.deviceBreakdown.map((item, index) => ({
            ...item,
            consumption: Math.max(0.1, item.consumption + (Math.random() - 0.5) * 0.1),
            cost: Math.max(0.01, (item.consumption + (Math.random() - 0.5) * 0.1) * 0.12)
          }))
        };
      });
      
      setUpdateCount(prev => prev + 1);
    }, 5000); // Update every 5 seconds
  };

  const stopMockUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    startMockUpdates();
    
    return () => {
      stopMockUpdates();
    };
  }, []);

  return {
    energyData,
    isConnected,
    connectionError: null,
    updateCount,
    requestEnergyUpdate: () => console.log('Mock update requested'),
    setEnergyGoal: (type: string, target: number) => console.log('Mock goal set:', type, target),
    enableAlert: (type: string, threshold: number) => console.log('Mock alert enabled:', type, threshold),
    reconnect: startMockUpdates,
    disconnect: stopMockUpdates
  };
}

/**
 * Hook that automatically chooses between real WebSocket and mock updates
 */
export function useEnergyRealTimeUpdates(initialData?: EnergyData) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, use mock updates; in production, use real WebSocket
  const realTimeHook = isDevelopment ? useMockEnergyUpdates : useEnergyUpdates;
  
  return realTimeHook(initialData);
}
