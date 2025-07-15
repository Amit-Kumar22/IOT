/**
 * Unit tests for MQTT and WebSocket clients
 */

import { MQTTClient, WebSocketClient, ConnectionStatus, initializeMQTTClient, getMQTTClient } from '../realtime';

// Mock MQTT library
jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

// Mock WebSocket
(global as any).WebSocket = jest.fn();

describe('MQTTClient', () => {
  let mqttClient: MQTTClient;
  let mockMqttInstance: any;

  beforeEach(() => {
    mockMqttInstance = {
      connected: false,
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
    };

    const mqtt = require('mqtt');
    mqtt.connect.mockReturnValue(mockMqttInstance);

    mqttClient = new MQTTClient({
      broker: 'mqtt://localhost',
      port: 1883,
      username: 'test',
      password: 'test',
      keepAlive: 60,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(mqttClient).toBeInstanceOf(MQTTClient);
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should generate client ID if not provided', () => {
      const client = new MQTTClient({
        broker: 'mqtt://localhost',
        port: 1883,
        keepAlive: 60,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 5000,
      });
      
      expect(client).toBeInstanceOf(MQTTClient);
    });
  });

  describe('Connection', () => {
    it('should connect successfully', async () => {
      mockMqttInstance.connected = true;
      
      // Simulate successful connection
      const connectPromise = mqttClient.connect();
      
      // Trigger connect event
      const connectHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      
      await connectPromise;
      
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.CONNECTED);
      expect(mqttClient.isConnected()).toBe(true);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      
      const connectPromise = mqttClient.connect();
      
      // Trigger error event
      const errorHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'error')[1];
      errorHandler(error);
      
      await expect(connectPromise).rejects.toThrow('Connection failed');
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.ERROR);
      expect(mqttClient.getLastError()).toBe(error);
    });

    it('should handle connection timeout', async () => {
      jest.useFakeTimers();
      
      const connectPromise = mqttClient.connect();
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(6000);
      
      await expect(connectPromise).rejects.toThrow('MQTT connection timeout');
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.ERROR);
      
      jest.useRealTimers();
    });

    it('should return immediately if already connected', async () => {
      mockMqttInstance.connected = true;
      
      await mqttClient.connect();
    });
  });

  describe('Subscription', () => {
    beforeEach(async () => {
      mockMqttInstance.connected = true;
      
      const connectPromise = mqttClient.connect();
      const connectHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should subscribe to single topic', async () => {
      const handler = jest.fn();
      mockMqttInstance.subscribe.mockImplementation((topics: any, options: any, callback: any) => {
        callback(null, [{ topic: 'test/topic', qos: 1 }]);
      });

      await mqttClient.subscribe('test/topic', handler);

      expect(mockMqttInstance.subscribe).toHaveBeenCalledWith(
        ['test/topic'],
        { qos: 1 },
        expect.any(Function)
      );
      expect(mqttClient.getSubscriptionCount()).toBe(1);
      expect(mqttClient.getSubscriptions()).toContain('test/topic');
    });

    it('should subscribe to multiple topics', async () => {
      const handler = jest.fn();
      mockMqttInstance.subscribe.mockImplementation((topics: any, options: any, callback: any) => {
        callback(null, topics.map((topic: string) => ({ topic, qos: 1 })));
      });

      await mqttClient.subscribe(['topic1', 'topic2'], handler);

      expect(mockMqttInstance.subscribe).toHaveBeenCalledWith(
        ['topic1', 'topic2'],
        { qos: 1 },
        expect.any(Function)
      );
    });

    it('should handle subscription errors', async () => {
      const error = new Error('Subscription failed');
      mockMqttInstance.subscribe.mockImplementation((topics: any, options: any, callback: any) => {
        callback(error);
      });

      await expect(mqttClient.subscribe('test/topic')).rejects.toThrow('Subscription failed');
    });

    it('should reject subscription when not connected', async () => {
      mockMqttInstance.connected = false;
      
      await expect(mqttClient.subscribe('test/topic')).rejects.toThrow('MQTT client not connected');
    });
  });

  describe('Unsubscription', () => {
    beforeEach(async () => {
      mockMqttInstance.connected = true;
      
      const connectPromise = mqttClient.connect();
      const connectHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should unsubscribe from topic', async () => {
      mockMqttInstance.unsubscribe.mockImplementation((topics: any, callback: any) => {
        callback(null);
      });

      await mqttClient.unsubscribe('test/topic');

      expect(mockMqttInstance.unsubscribe).toHaveBeenCalledWith(
        ['test/topic'],
        expect.any(Function)
      );
    });

    it('should handle unsubscription errors', async () => {
      const error = new Error('Unsubscription failed');
      mockMqttInstance.unsubscribe.mockImplementation((topics: any, callback: any) => {
        callback(error);
      });

      await expect(mqttClient.unsubscribe('test/topic')).rejects.toThrow('Unsubscription failed');
    });
  });

  describe('Publishing', () => {
    beforeEach(async () => {
      mockMqttInstance.connected = true;
      
      const connectPromise = mqttClient.connect();
      const connectHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should publish string message', async () => {
      mockMqttInstance.publish.mockImplementation((topic: any, message: any, options: any, callback: any) => {
        callback(null);
      });

      await mqttClient.publish('test/topic', 'test message');

      expect(mockMqttInstance.publish).toHaveBeenCalledWith(
        'test/topic',
        'test message',
        { qos: 1 },
        expect.any(Function)
      );
    });

    it('should publish object message as JSON', async () => {
      mockMqttInstance.publish.mockImplementation((topic: any, message: any, options: any, callback: any) => {
        callback(null);
      });

      const messageObj = { value: 42, sensor: 'temperature' };
      await mqttClient.publish('test/topic', messageObj);

      expect(mockMqttInstance.publish).toHaveBeenCalledWith(
        'test/topic',
        JSON.stringify(messageObj),
        { qos: 1 },
        expect.any(Function)
      );
    });

    it('should handle publish errors', async () => {
      const error = new Error('Publish failed');
      mockMqttInstance.publish.mockImplementation((topic: any, message: any, options: any, callback: any) => {
        callback(error);
      });

      await expect(mqttClient.publish('test/topic', 'message')).rejects.toThrow('Publish failed');
    });

    it('should reject publish when not connected', async () => {
      mockMqttInstance.connected = false;
      
      await expect(mqttClient.publish('test/topic', 'message')).rejects.toThrow('MQTT client not connected');
    });
  });

  describe('Device Control', () => {
    beforeEach(async () => {
      mockMqttInstance.connected = true;
      
      const connectPromise = mqttClient.connect();
      const connectHandler = mockMqttInstance.once.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should control device', async () => {
      mockMqttInstance.publish.mockImplementation((topic: any, message: any, options: any, callback: any) => {
        callback(null);
      });

      const command = { action: 'turn_on', brightness: 80 };
      await mqttClient.controlDevice('device123', command);

      expect(mockMqttInstance.publish).toHaveBeenCalledWith(
        'devices/device123/control',
        JSON.stringify(command),
        { qos: 1 },
        expect.any(Function)
      );
    });
  });

  describe('Event Handlers', () => {
    it('should handle status change events', () => {
      const statusHandler = jest.fn();
      const unsubscribe = mqttClient.onStatusChange(statusHandler);

      // Manually trigger status change
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.DISCONNECTED);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle device data events', () => {
      const dataHandler = jest.fn();
      const unsubscribe = mqttClient.onDeviceData(dataHandler);

      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });

    it('should handle device status events', () => {
      const statusHandler = jest.fn();
      const unsubscribe = mqttClient.onDeviceStatus(statusHandler);

      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });
  });

  describe('Disconnection', () => {
    it('should disconnect gracefully', async () => {
      mockMqttInstance.end.mockImplementation((force: any, options: any, callback: any) => {
        if (callback) callback();
      });

      await mqttClient.disconnect();

      expect(mockMqttInstance.end).toHaveBeenCalledWith(false, {}, expect.any(Function));
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should force disconnect immediately', () => {
      mqttClient.forceDisconnect();

      expect(mockMqttInstance.end).toHaveBeenCalledWith(true);
      expect(mqttClient.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });
  });

  describe('Statistics', () => {
    it('should return client statistics', () => {
      const stats = mqttClient.getStats();

      expect(stats).toHaveProperty('status');
      expect(stats).toHaveProperty('subscriptions');
      expect(stats).toHaveProperty('reconnectAttempts');
      expect(stats).toHaveProperty('lastError');
      expect(stats).toHaveProperty('clientId');
    });
  });
});

describe('WebSocketClient', () => {
  let wsClient: WebSocketClient;
  let mockWebSocket: any;

  beforeEach(() => {
    mockWebSocket = {
      readyState: 1, // OPEN
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    (WebSocket as any).mockImplementation(() => mockWebSocket);
    (WebSocket as any).OPEN = 1;
    (WebSocket as any).CLOSED = 3;

    wsClient = new WebSocketClient('ws://localhost:8080');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Connection', () => {
    it('should connect successfully', async () => {
      const connectPromise = wsClient.connect();
      
      // Simulate successful connection
      mockWebSocket.onopen({ type: 'open' });
      
      await connectPromise;
      
      expect(wsClient.isConnected()).toBe(true);
    });

    it('should handle connection errors', async () => {
      const connectPromise = wsClient.connect();
      
      // Simulate connection error
      mockWebSocket.onerror({ type: 'error' });
      
      await expect(connectPromise).rejects.toThrow('WebSocket connection failed');
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      const connectPromise = wsClient.connect();
      mockWebSocket.onopen({ type: 'open' });
      await connectPromise;
    });

    it('should send messages', () => {
      const data = { type: 'test', message: 'hello' };
      
      wsClient.send(data);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(data));
    });

    it('should handle incoming messages', () => {
      const messageHandler = jest.fn();
      wsClient.onMessage(messageHandler);
      
      const testData = { type: 'response', data: 'test' };
      mockWebSocket.onmessage({ data: JSON.stringify(testData) });
      
      expect(messageHandler).toHaveBeenCalledWith(testData);
    });

    it('should throw error when sending while disconnected', () => {
      mockWebSocket.readyState = 3; // CLOSED
      
      expect(() => {
        wsClient.send({ test: 'data' });
      }).toThrow('WebSocket not connected');
    });
  });

  describe('Event Handlers', () => {
    it('should handle status change events', () => {
      const statusHandler = jest.fn();
      const unsubscribe = wsClient.onStatusChange(statusHandler);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });

    it('should unsubscribe message handlers', () => {
      const messageHandler = jest.fn();
      const unsubscribe = wsClient.onMessage(messageHandler);
      
      unsubscribe();
      
      // Message should not be handled after unsubscribe
      mockWebSocket.onmessage({ data: JSON.stringify({ test: 'data' }) });
      expect(messageHandler).not.toHaveBeenCalled();
    });
  });

  describe('Disconnection', () => {
    beforeEach(async () => {
      const connectPromise = wsClient.connect();
      mockWebSocket.onopen({ type: 'open' });
      await connectPromise;
    });

    it('should disconnect cleanly', () => {
      wsClient.disconnect();
      
      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect');
    });
  });
});

describe('Default MQTT Client', () => {
  it('should initialize default client', () => {
    const config = {
      broker: 'mqtt://localhost',
      port: 1883,
      keepAlive: 60,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    };
    
    const client = initializeMQTTClient(config);
    
    expect(client).toBeInstanceOf(MQTTClient);
    expect(getMQTTClient()).toBe(client);
  });

  it('should throw error when getting uninitialized client', () => {
    // Reset the default client
    jest.resetModules();
    
    expect(() => {
      getMQTTClient();
    }).toThrow('MQTT client not initialized');
  });
});
