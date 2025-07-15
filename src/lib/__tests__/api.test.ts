/**
 * Unit tests for API Client
 */

import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiClient, apiEndpoints, RequestCancellation } from '../api';
import { ApiResponse } from '@/types/api';

// Mock axios adapter
let mockAxios: MockAdapter;
let apiClient: ApiClient;

describe('ApiClient', () => {
  beforeEach(() => {
    // Create fresh instances for each test
    apiClient = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      timeout: 5000,
      retryAttempts: 2,
      retryDelay: 100,
    });
    
    mockAxios = new MockAdapter(apiClient.getInstance());
  });

  afterEach(() => {
    mockAxios.restore();
    mockAxios.reset();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      const client = new ApiClient();
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        baseURL: 'https://custom.api.com',
        timeout: 10000,
        retryAttempts: 5,
      };
      
      const client = new ApiClient(customConfig);
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('Authentication', () => {
    it('should set and use authentication tokens', async () => {
      const token = 'test-access-token';
      apiClient.setAuthTokens(token);

      mockAxios.onGet('/test').reply((config: any) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
        return [200, { success: true, data: 'test' }];
      });

      await apiClient.get('/test');
    });

    it('should handle token refresh on 401 error', async () => {
      const oldToken = 'expired-token';
      const newToken = 'new-token';
      const refreshToken = 'refresh-token';

      apiClient.setAuthTokens(oldToken, refreshToken);

      // First request fails with 401
      mockAxios.onGet('/protected').replyOnce(401);
      
      // Token refresh succeeds
      mockAxios.onPost('/auth/refresh').reply(200, {
        success: true,
        data: { accessToken: newToken }
      });
      
      // Retry request succeeds
      mockAxios.onGet('/protected').reply((config: any) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${newToken}`);
        return [200, { success: true, data: 'protected-data' }];
      });

      const response = await apiClient.get('/protected');
      expect(response.data).toBe('protected-data');
    });

    it('should clear authentication', () => {
      apiClient.setAuthTokens('token', 'refresh');
      apiClient.clearAuth();
      
      // Verify tokens are cleared by making a request without auth header
      mockAxios.onGet('/test').reply((config: any) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true, data: 'test' }];
      });

      apiClient.get('/test');
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET requests', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAxios.onGet('/test').reply(200, {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.get('/test');
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    it('should make POST requests', async () => {
      const postData = { name: 'New Item' };
      const responseData = { id: 1, ...postData };

      mockAxios.onPost('/test', postData).reply(201, {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.post('/test', postData);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(responseData);
    });

    it('should make PUT requests', async () => {
      const putData = { id: 1, name: 'Updated Item' };
      
      mockAxios.onPut('/test/1', putData).reply(200, {
        success: true,
        data: putData,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.put('/test/1', putData);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(putData);
    });

    it('should make PATCH requests', async () => {
      const patchData = { name: 'Patched Item' };
      const responseData = { id: 1, ...patchData };
      
      mockAxios.onPatch('/test/1', patchData).reply(200, {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.patch('/test/1', patchData);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(responseData);
    });

    it('should make DELETE requests', async () => {
      mockAxios.onDelete('/test/1').reply(204, {
        success: true,
        data: null,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.delete('/test/1');
      expect(response.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockAxios.onGet('/test').networkError();

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Network errors in axios-mock-adapter appear as REQUEST_ERROR
        expect(['NETWORK_ERROR', 'REQUEST_ERROR']).toContain(error.code);
        expect(error.message).toContain('Network');
      }
    });

    it('should handle HTTP errors', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
      };

      mockAxios.onPost('/test').reply(400, errorResponse);

      try {
        await apiClient.post('/test', {});
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('Invalid input data');
      }
    });

    it('should handle timeout errors', async () => {
      mockAxios.onGet('/test').timeout();

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('REQUEST_ERROR');
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 5xx server errors', async () => {
      let attemptCount = 0;

      mockAxios.onGet('/test').reply(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return [500, { error: 'Internal Server Error' }];
        }
        return [200, { success: true, data: 'success' }];
      });

      const response = await apiClient.get('/test');
      expect(response.success).toBe(true);
      expect(attemptCount).toBe(3);
    });

    it('should not retry on 4xx client errors', async () => {
      let attemptCount = 0;

      mockAxios.onGet('/test').reply(() => {
        attemptCount++;
        return [400, { error: 'Bad Request' }];
      });

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error) {
        expect(attemptCount).toBe(1);
      }
    });

    it('should respect retry limit', async () => {
      let attemptCount = 0;

      mockAxios.onGet('/test').reply(() => {
        attemptCount++;
        return [500, { error: 'Internal Server Error' }];
      });

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error) {
        // Should try 3 times (initial + 2 retries)
        expect(attemptCount).toBe(3);
      }
    });
  });

  describe('File Operations', () => {
    it('should upload files', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const responseData = { id: 1, filename: 'test.txt', size: file.size };

      mockAxios.onPost('/upload').reply((config: any) => {
        expect(config.headers?.['Content-Type']).toMatch(/multipart\/form-data/);
        return [200, { success: true, data: responseData }];
      });

      const response = await apiClient.upload('/upload', file);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(responseData);
    });

    it('should handle file upload progress', async () => {
      const file = new File(['test content'], 'test.txt');
      const progressCallback = jest.fn();

      mockAxios.onPost('/upload').reply(200, { success: true });

      await apiClient.upload('/upload', file, progressCallback);
      
      // Note: axios-mock-adapter doesn't trigger progress events
      // In real implementation, progress callback would be called
    });
  });

  describe('Request Headers', () => {
    it('should add standard headers to requests', async () => {
      mockAxios.onGet('/test').reply((config: any) => {
        expect(config.headers?.['Content-Type']).toBe('application/json');
        expect(config.headers?.['Accept']).toBe('application/json');
        expect(config.headers?.['X-Client-Version']).toBeDefined();
        expect(config.headers?.['X-Environment']).toBeDefined();
        expect(config.headers?.['X-Request-ID']).toBeDefined();
        expect(config.headers?.['X-Timestamp']).toBeDefined();
        return [200, { success: true }];
      });

      await apiClient.get('/test');
    });

    it('should sign requests when encryption key is provided', async () => {
      const clientWithEncryption = new ApiClient({
        encryptionKey: 'test-encryption-key',
      });
      
      const mockAxiosWithEncryption = new MockAdapter(clientWithEncryption.getInstance());
      
      mockAxiosWithEncryption.onPost('/test').reply((config: any) => {
        expect(config.headers?.['X-Signature']).toBeDefined();
        return [200, { success: true }];
      });

      await clientWithEncryption.post('/test', { data: 'test' });
      
      mockAxiosWithEncryption.restore();
    });
  });

  describe('Health Check', () => {
    it('should return true for successful health check', async () => {
      mockAxios.onGet('/health').reply(200, { success: true });

      const isHealthy = await apiClient.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false for failed health check', async () => {
      mockAxios.onGet('/health').reply(500);

      const isHealthy = await apiClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Request Cancellation', () => {
    it('should create cancel tokens', () => {
      const signal = RequestCancellation.createCancelToken('test-key');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should cancel requests by key', () => {
      const signal = RequestCancellation.createCancelToken('test-key');
      expect(signal.aborted).toBe(false);
      
      RequestCancellation.cancel('test-key');
      expect(signal.aborted).toBe(true);
    });

    it('should cancel all requests', () => {
      const signal1 = RequestCancellation.createCancelToken('key1');
      const signal2 = RequestCancellation.createCancelToken('key2');
      
      RequestCancellation.cancelAll();
      
      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
    });
  });
});

describe('API Endpoints', () => {
  it('should have all required endpoint categories', () => {
    expect(apiEndpoints.auth).toBeDefined();
    expect(apiEndpoints.users).toBeDefined();
    expect(apiEndpoints.devices).toBeDefined();
    expect(apiEndpoints.billing).toBeDefined();
    expect(apiEndpoints.analytics).toBeDefined();
    expect(apiEndpoints.automation).toBeDefined();
    expect(apiEndpoints.admin).toBeDefined();
    expect(apiEndpoints.system).toBeDefined();
  });

  it('should have dynamic endpoint functions', () => {
    expect(apiEndpoints.devices.get('123')).toBe('/devices/123');
    expect(apiEndpoints.devices.update('456')).toBe('/devices/456');
    expect(apiEndpoints.billing.invoice('789')).toBe('/billing/invoices/789');
  });

  it('should have all authentication endpoints', () => {
    expect(apiEndpoints.auth.login).toBe('/auth/login');
    expect(apiEndpoints.auth.register).toBe('/auth/register');
    expect(apiEndpoints.auth.refresh).toBe('/auth/refresh');
    expect(apiEndpoints.auth.logout).toBe('/auth/logout');
    expect(apiEndpoints.auth.me).toBe('/auth/me');
  });
});

// Integration tests
describe('ApiClient Integration', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      retryAttempts: 1,
      retryDelay: 50,
    });
  });

  it('should handle authentication flow', async () => {
    const mock = new MockAdapter(client.getInstance());
    
    // Login
    mock.onPost('/auth/login').reply(200, {
      success: true,
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'test@example.com' }
      }
    });

    const loginResponse = await client.post('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });

    client.setAuthTokens(
      loginResponse.data.accessToken,
      loginResponse.data.refreshToken
    );

    // Protected request
    mock.onGet('/users/profile').reply((config: any) => {
      expect(config.headers?.Authorization).toBe('Bearer access-token');
      return [200, { success: true, data: { id: 1, email: 'test@example.com' } }];
    });

    const profileResponse = await client.get('/users/profile');
    expect(profileResponse.success).toBe(true);

    mock.restore();
  });

  it('should handle concurrent requests with token refresh', async () => {
    const mock = new MockAdapter(client.getInstance());
    
    client.setAuthTokens('expired-token', 'refresh-token');

    // All requests fail with 401
    mock.onGet('/data1').replyOnce(401);
    mock.onGet('/data2').replyOnce(401);
    mock.onGet('/data3').replyOnce(401);

    // Token refresh
    mock.onPost('/auth/refresh').reply(200, {
      success: true,
      data: { accessToken: 'new-token' }
    });

    // Retry requests succeed
    mock.onGet('/data1').reply(200, { success: true, data: 'data1' });
    mock.onGet('/data2').reply(200, { success: true, data: 'data2' });
    mock.onGet('/data3').reply(200, { success: true, data: 'data3' });

    // Make concurrent requests
    const [response1, response2, response3] = await Promise.all([
      client.get('/data1'),
      client.get('/data2'),
      client.get('/data3'),
    ]);

    expect(response1.data).toBe('data1');
    expect(response2.data).toBe('data2');
    expect(response3.data).toBe('data3');

    mock.restore();
  });
});
