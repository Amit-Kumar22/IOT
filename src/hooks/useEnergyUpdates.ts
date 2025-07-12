import { useEffect, useRef, useState } from 'react';
import { EnergyData, EnergyUpdate, EnergyWebSocketMessage } from '@/types/energy';

/**
 * Hook for managing real-time energy data updates via WebSocket
 */
export function useEnergyUpdates(initialData?: EnergyData) {
  const [energyData, setEnergyData] = useState<EnergyData | null>(initialData || null);
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
      // In development, use a mock WebSocket server
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:8080/ws/energy'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/energy`;
      
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
              setEnergyData(prevData => {
                if (!prevData) return null;
                
                return {
                  ...prevData,
                  currentConsumption: update.consumption,
                  currentCost: update.cost,
                  timestamp: new Date(update.timestamp),
                  // Update device breakdown if device-specific update
                  deviceBreakdown: update.deviceId 
                    ? prevData.deviceBreakdown.map(item => 
                        item.deviceId === update.deviceId
                          ? { ...item, consumption: update.consumption, cost: update.cost }
                          : item
                      )
                    : prevData.deviceBreakdown
                };
              });
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
        console.error('Energy WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

      websocketRef.current.onclose = (event) => {
        console.log('Energy WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not closed intentionally
        if (event.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          setConnectionError(`Connection lost. Attempting to reconnect... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_DELAY * reconnectAttempts.current);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionError('Connection failed after multiple attempts. Please refresh the page.');
        }
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionError('Failed to establish WebSocket connection');
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
  const [energyData, setEnergyData] = useState<EnergyData | null>(initialData || null);
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMockUpdates = () => {
    setIsConnected(true);
    
    intervalRef.current = setInterval(() => {
      setEnergyData(prevData => {
        if (!prevData) return null;
        
        // Simulate realistic energy consumption variations
        const baseConsumption = 3.2;
        const variation = (Math.random() - 0.5) * 0.8; // ±0.4 kWh variation
        const newConsumption = Math.max(0.5, baseConsumption + variation);
        const newCost = newConsumption * 0.12; // $0.12/kWh
        
        return {
          ...prevData,
          currentConsumption: newConsumption,
          currentCost: newCost,
          timestamp: new Date(),
          // Simulate device-level updates
          deviceBreakdown: prevData.deviceBreakdown.map((item, index) => ({
            ...item,
            consumption: item.consumption + (Math.random() - 0.5) * 0.1,
            cost: (item.consumption + (Math.random() - 0.5) * 0.1) * 0.12
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
