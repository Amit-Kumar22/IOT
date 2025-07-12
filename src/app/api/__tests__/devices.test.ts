/**
 * Unit Tests for Devices API Route
 * 
 * Tests cover:
 * - GET /api/devices
 * - POST /api/devices
 * - Authentication checks
 * - Device CRUD operations
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '../devices/route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = init?.headers || {};
      this._body = init?.body;
    }
    url: string;
    method: string;
    headers: any;
    _body: any;
    
    json() {
      return Promise.resolve(JSON.parse(this._body || '{}'));
    }
  },
  NextResponse: {
    json: jest.fn((body, options) => ({
      json: jest.fn().mockResolvedValue(body),
      status: options?.status || 200,
    })),
  },
}));

// Mock the auth middleware
jest.mock('@/lib/auth-middleware', () => ({
  AuthMiddleware: {
    authenticate: jest.fn(),
  },
}));

// Mock the device service
jest.mock('@/lib/mockApi', () => ({
  getDevices: jest.fn(),
  createDevice: jest.fn(),
}));

import { AuthMiddleware } from '@/lib/auth-middleware';
const mockAuthMiddleware = AuthMiddleware as jest.Mocked<typeof AuthMiddleware>;
const mockGetDevices = require('@/lib/mockApi').getDevices as jest.Mock;
const mockCreateDevice = require('@/lib/mockApi').createDevice as jest.Mock;

describe('/api/devices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/devices', () => {
    it('should return devices for authenticated user', async () => {
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-01-01T00:00:00.000Z',
        isActive: true,
        emailVerified: true
      };
      const mockDevices = [
        { id: 'device-1', name: 'Smart Light', type: 'light' },
        { id: 'device-2', name: 'Smart Thermostat', type: 'thermostat' },
      ];

      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: true,
        user: mockUser,
      });
      mockGetDevices.mockResolvedValue(mockDevices);

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.devices).toEqual(mockDevices);
      expect(mockGetDevices).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 500 for server errors', async () => {
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-01-01T00:00:00.000Z',
        isActive: true,
        emailVerified: true
      };
      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: true,
        user: mockUser,
      });
      mockGetDevices.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/devices', () => {
    it('should create device for authenticated user', async () => {
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-01-01T00:00:00.000Z',
        isActive: true,
        emailVerified: true
      };
      const mockDevice = {
        id: 'device-123',
        name: 'New Smart Light',
        type: 'light',
        userId: mockUser.id,
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: true,
        user: mockUser,
      });
      mockCreateDevice.mockResolvedValue(mockDevice);

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
        body: JSON.stringify({
          name: 'New Smart Light',
          type: 'light',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.device).toEqual(mockDevice);
      expect(mockCreateDevice).toHaveBeenCalledWith({
        name: 'New Smart Light',
        type: 'light',
        userId: mockUser.id,
      });
    });

    it('should return 400 for invalid device data', async () => {
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-01-01T00:00:00.000Z',
        isActive: true,
        emailVerified: true
      };
      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
        body: JSON.stringify({
          // Missing required name field
          type: 'light',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockAuthMiddleware.authenticate.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost/api/devices', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Smart Light',
          type: 'light',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
