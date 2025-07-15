/**
 * MQTT Client for IoT Platform
 * Provides real-time IoT device communication with connection management and auto-reconnection
 */

import mqtt, { MqttClient, IClientOptions, IClientSubscribeOptions, IClientPublishOptions } from 'mqtt';
import { isDevelopment } from './config';
import { MqttConfig, MqttMessage, DeviceDataPoint, DeviceStatusUpdate } from '@/types/api';

// MQTT Client Configuration
export interface MQTTClientConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive: number;
  clean: boolean;
  reconnectPeriod: number;
  connectTimeout: number;
  maxReconnectAttempts?: number;
  protocolVersion?: 3 | 4 | 5;
  will?: {
    topic: string;
    payload: string | Buffer;
    qos?: 0 | 1 | 2;
    retain?: boolean;
  };
}

// Default MQTT configuration
const DEFAULT_MQTT_CONFIG: Partial<MQTTClientConfig> = {
  port: 1883,
  keepAlive: 60,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30000,
  maxReconnectAttempts: 10,
  protocolVersion: 4,
};

// Connection status enumeration
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// Message handlers
export type MessageHandler = (topic: string, message: Buffer, packet: mqtt.IPublishPacket) => void;
export type StatusHandler = (status: ConnectionStatus, error?: Error) => void;
export type DeviceDataHandler = (data: DeviceDataPoint) => void;
export type DeviceStatusHandler = (status: DeviceStatusUpdate) => void;

/**
 * MQTT Client for IoT Platform
 */
export class MQTTClient {
  private client: MqttClient | null = null;
  private config: MQTTClientConfig;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private subscriptions = new Map<string, Set<MessageHandler>>();
  private statusHandlers = new Set<StatusHandler>();
  private deviceDataHandlers = new Set<DeviceDataHandler>();
  private deviceStatusHandlers = new Set<DeviceStatusHandler>();
  private reconnectAttempts = 0;
  private lastError: Error | null = null;

  constructor(config: MQTTClientConfig) {
    this.config = { ...DEFAULT_MQTT_CONFIG, ...config };
    
    // Generate unique client ID if not provided
    if (!this.config.clientId) {
      this.config.clientId = `iot-platform-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Connect to MQTT broker
   */
  public async connect(): Promise<void> {
    if (this.client?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.setStatus(ConnectionStatus.CONNECTING);
        
        const options: IClientOptions = {
          clientId: this.config.clientId,
          username: this.config.username,
          password: this.config.password,
          keepalive: this.config.keepAlive,
          clean: this.config.clean,
          reconnectPeriod: this.config.reconnectPeriod,
          connectTimeout: this.config.connectTimeout,
          protocolVersion: this.config.protocolVersion,
          will: this.config.will,
        };

        const brokerUrl = `${this.config.broker}:${this.config.port}`;
        this.client = mqtt.connect(brokerUrl, options);

        this.setupEventHandlers();

        this.client.once('connect', () => {
          this.setStatus(ConnectionStatus.CONNECTED);
          this.reconnectAttempts = 0;
          this.lastError = null;
          
          if (isDevelopment) {
            console.log(`🔌 MQTT Connected to ${brokerUrl}`);
          }
          
          resolve();
        });

        this.client.once('error', (error) => {
          this.lastError = error;
          this.setStatus(ConnectionStatus.ERROR, error);
          
          if (isDevelopment) {
            console.error('❌ MQTT Connection Error:', error);
          }
          
          reject(error);
        });

        // Handle connection timeout
        setTimeout(() => {
          if (this.status === ConnectionStatus.CONNECTING) {
            const timeoutError = new Error('MQTT connection timeout');
            this.lastError = timeoutError;
            this.setStatus(ConnectionStatus.ERROR, timeoutError);
            reject(timeoutError);
          }
        }, this.config.connectTimeout);

      } catch (error) {
        this.lastError = error as Error;
        this.setStatus(ConnectionStatus.ERROR, error as Error);
        reject(error);
      }
    });
  }

  /**
   * Setup MQTT event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // Handle incoming messages
    this.client.on('message', (topic: string, message: Buffer, packet: mqtt.IPublishPacket) => {
      this.handleMessage(topic, message, packet);
    });

    // Handle disconnection
    this.client.on('close', () => {
      if (this.status === ConnectionStatus.CONNECTED) {
        this.setStatus(ConnectionStatus.DISCONNECTED);
        
        if (isDevelopment) {
          console.log('🔌 MQTT Disconnected');
        }
      }
    });

    // Handle reconnection
    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      this.setStatus(ConnectionStatus.RECONNECTING);
      
      if (isDevelopment) {
        console.log(`🔄 MQTT Reconnecting (attempt ${this.reconnectAttempts})`);
      }

      // Stop reconnecting after max attempts
      if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
        this.client?.end(true);
        this.setStatus(ConnectionStatus.ERROR, new Error('Max reconnection attempts reached'));
      }
    });

    // Handle connection errors
    this.client.on('error', (error) => {
      this.lastError = error;
      
      if (isDevelopment) {
        console.error('❌ MQTT Error:', error);
      }
    });

    // Handle offline status
    this.client.on('offline', () => {
      this.setStatus(ConnectionStatus.DISCONNECTED);
      
      if (isDevelopment) {
        console.log('📱 MQTT Offline');
      }
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer, packet: mqtt.IPublishPacket): void {
    try {
      // Call generic message handlers
      const handlers = this.subscriptions.get(topic) || new Set();
      handlers.forEach(handler => {
        try {
          handler(topic, message, packet);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });

      // Handle device data messages
      if (topic.startsWith('devices/') && topic.endsWith('/data')) {
        this.handleDeviceData(topic, message);
      }

      // Handle device status messages
      if (topic.startsWith('devices/') && topic.endsWith('/status')) {
        this.handleDeviceStatus(topic, message);
      }

      if (isDevelopment) {
        console.log(`📨 MQTT Message: ${topic}`, message.toString());
      }

    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Handle device data messages
   */
  private handleDeviceData(topic: string, message: Buffer): void {
    try {
      const deviceId = this.extractDeviceIdFromTopic(topic);
      const data = JSON.parse(message.toString());
      
      const deviceData: DeviceDataPoint = {
        deviceId,
        sensor: data.sensor || 'unknown',
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp || new Date().toISOString(),
        quality: data.quality || 'good',
      };

      this.deviceDataHandlers.forEach(handler => {
        try {
          handler(deviceData);
        } catch (error) {
          console.error('Error in device data handler:', error);
        }
      });

    } catch (error) {
      console.error('Error parsing device data message:', error);
    }
  }

  /**
   * Handle device status messages
   */
  private handleDeviceStatus(topic: string, message: Buffer): void {
    try {
      const deviceId = this.extractDeviceIdFromTopic(topic);
      const data = JSON.parse(message.toString());
      
      const deviceStatus: DeviceStatusUpdate = {
        deviceId,
        status: data.status || 'unknown',
        lastSeen: data.lastSeen || new Date().toISOString(),
        batteryLevel: data.batteryLevel,
        signalStrength: data.signalStrength,
      };

      this.deviceStatusHandlers.forEach(handler => {
        try {
          handler(deviceStatus);
        } catch (error) {
          console.error('Error in device status handler:', error);
        }
      });

    } catch (error) {
      console.error('Error parsing device status message:', error);
    }
  }

  /**
   * Extract device ID from topic
   */
  private extractDeviceIdFromTopic(topic: string): string {
    const parts = topic.split('/');
    return parts[1] || 'unknown';
  }

  /**
   * Subscribe to topic
   */
  public subscribe(
    topic: string | string[],
    handler?: MessageHandler,
    options?: IClientSubscribeOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      const topics = Array.isArray(topic) ? topic : [topic];
      
      this.client.subscribe(topics, options || { qos: 1 }, (error, granted) => {
        if (error) {
          reject(error);
          return;
        }

        // Add handler to subscriptions
        if (handler) {
          topics.forEach(t => {
            if (!this.subscriptions.has(t)) {
              this.subscriptions.set(t, new Set());
            }
            this.subscriptions.get(t)!.add(handler);
          });
        }

        if (isDevelopment) {
          console.log('📬 MQTT Subscribed to:', topics);
        }

        resolve();
      });
    });
  }

  /**
   * Unsubscribe from topic
   */
  public unsubscribe(topic: string | string[], handler?: MessageHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      const topics = Array.isArray(topic) ? topic : [topic];

      this.client.unsubscribe(topics, (error) => {
        if (error) {
          reject(error);
          return;
        }

        // Remove handler from subscriptions
        if (handler) {
          topics.forEach(t => {
            const handlers = this.subscriptions.get(t);
            if (handlers) {
              handlers.delete(handler);
              if (handlers.size === 0) {
                this.subscriptions.delete(t);
              }
            }
          });
        } else {
          // Remove all handlers for the topics
          topics.forEach(t => {
            this.subscriptions.delete(t);
          });
        }

        if (isDevelopment) {
          console.log('📪 MQTT Unsubscribed from:', topics);
        }

        resolve();
      });
    });
  }

  /**
   * Publish message
   */
  public publish(
    topic: string,
    message: string | Buffer | object,
    options?: IClientPublishOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      let payload: string | Buffer;
      
      if (typeof message === 'object' && !(message instanceof Buffer)) {
        payload = JSON.stringify(message);
      } else {
        payload = message as string | Buffer;
      }

      this.client.publish(topic, payload, options || { qos: 1 }, (error) => {
        if (error) {
          reject(error);
          return;
        }

        if (isDevelopment) {
          console.log(`📤 MQTT Published to ${topic}:`, payload);
        }

        resolve();
      });
    });
  }

  /**
   * Control device
   */
  public async controlDevice(deviceId: string, command: object): Promise<void> {
    const topic = `devices/${deviceId}/control`;
    await this.publish(topic, command);
  }

  /**
   * Subscribe to device data
   */
  public async subscribeToDeviceData(deviceId: string, handler: DeviceDataHandler): Promise<void> {
    this.deviceDataHandlers.add(handler);
    const topic = `devices/${deviceId}/data`;
    await this.subscribe(topic);
  }

  /**
   * Subscribe to device status
   */
  public async subscribeToDeviceStatus(deviceId: string, handler: DeviceStatusHandler): Promise<void> {
    this.deviceStatusHandlers.add(handler);
    const topic = `devices/${deviceId}/status`;
    await this.subscribe(topic);
  }

  /**
   * Subscribe to all device updates
   */
  public async subscribeToAllDevices(): Promise<void> {
    await this.subscribe(['devices/+/data', 'devices/+/status']);
  }

  /**
   * Add connection status handler
   */
  public onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * Add device data handler
   */
  public onDeviceData(handler: DeviceDataHandler): () => void {
    this.deviceDataHandlers.add(handler);
    
    return () => {
      this.deviceDataHandlers.delete(handler);
    };
  }

  /**
   * Add device status handler
   */
  public onDeviceStatus(handler: DeviceStatusHandler): () => void {
    this.deviceStatusHandlers.add(handler);
    
    return () => {
      this.deviceStatusHandlers.delete(handler);
    };
  }

  /**
   * Set connection status and notify handlers
   */
  private setStatus(status: ConnectionStatus, error?: Error): void {
    const previousStatus = this.status;
    this.status = status;

    if (previousStatus !== status) {
      this.statusHandlers.forEach(handler => {
        try {
          handler(status, error);
        } catch (err) {
          console.error('Error in status handler:', err);
        }
      });
    }
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get last error
   */
  public getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Check if client is connected
   */
  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Get subscription count
   */
  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get active subscriptions
   */
  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Disconnect from broker
   */
  public async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client) {
        resolve();
        return;
      }

      this.client.end(false, {}, () => {
        this.setStatus(ConnectionStatus.DISCONNECTED);
        this.client = null;
        this.subscriptions.clear();
        this.reconnectAttempts = 0;
        this.lastError = null;
        
        if (isDevelopment) {
          console.log('🔌 MQTT Disconnected');
        }
        
        resolve();
      });
    });
  }

  /**
   * Force disconnect (immediate)
   */
  public forceDisconnect(): void {
    if (this.client) {
      this.client.end(true);
      this.setStatus(ConnectionStatus.DISCONNECTED);
      this.client = null;
      this.subscriptions.clear();
      this.reconnectAttempts = 0;
      this.lastError = null;
    }
  }

  /**
   * Get client statistics
   */
  public getStats(): {
    status: ConnectionStatus;
    subscriptions: number;
    reconnectAttempts: number;
    lastError: string | null;
    clientId: string;
  } {
    return {
      status: this.status,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
      lastError: this.lastError?.message || null,
      clientId: this.config.clientId || 'unknown',
    };
  }
}

/**
 * WebSocket Client for additional real-time features
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private protocols?: string | string[];
  private messageHandlers = new Set<(data: any) => void>();
  private statusHandlers = new Set<(status: 'connecting' | 'open' | 'closing' | 'closed', event?: Event) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;
  private heartbeatDelay = 30000;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url, this.protocols);
        
        this.ws.onopen = (event) => {
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyStatusHandlers('open', event);
          
          if (isDevelopment) {
            console.log('🔌 WebSocket Connected');
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                console.error('Error in WebSocket message handler:', error);
              }
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();
          this.notifyStatusHandlers('closed', event);
          
          if (isDevelopment) {
            console.log('🔌 WebSocket Closed');
          }

          // Auto-reconnect if not intentionally closed
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect().catch(console.error);
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.ws.onerror = (event) => {
          if (isDevelopment) {
            console.error('❌ WebSocket Error:', event);
          }
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send message
   */
  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  /**
   * Add message handler
   */
  public onMessage(handler: (data: any) => void): () => void {
    this.messageHandlers.add(handler);
    
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Add status handler
   */
  public onStatusChange(handler: (status: 'connecting' | 'open' | 'closing' | 'closed', event?: Event) => void): () => void {
    this.statusHandlers.add(handler);
    
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.heartbeatDelay);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Notify status handlers
   */
  private notifyStatusHandlers(status: 'connecting' | 'open' | 'closing' | 'closed', event?: Event): void {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status, event);
      } catch (error) {
        console.error('Error in WebSocket status handler:', error);
      }
    });
  }

  /**
   * Disconnect
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export default MQTT client instance (will be configured at runtime)
export let defaultMQTTClient: MQTTClient | null = null;

/**
 * Initialize default MQTT client
 */
export const initializeMQTTClient = (config: MQTTClientConfig): MQTTClient => {
  defaultMQTTClient = new MQTTClient(config);
  return defaultMQTTClient;
};

/**
 * Get default MQTT client
 */
export const getMQTTClient = (): MQTTClient => {
  if (!defaultMQTTClient) {
    throw new Error('MQTT client not initialized. Call initializeMQTTClient first.');
  }
  return defaultMQTTClient;
};

// Export types are already declared above
