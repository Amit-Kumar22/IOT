/**
 * @jest-environment jsdom
 */

import { AuthMiddleware } from '@/lib/auth-middleware';

// Mock jose functions
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createSecretKey: jest.fn(() => ({ type: 'secret' })),
}));

describe('AuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === 'authorization') return 'Bearer test.token.here';
            return null;
          })
        }
      };
      
      const token = AuthMiddleware.extractToken(mockRequest as any);
      expect(token).toBe('test.token.here');
    });

    it('should return null for missing header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      };
      
      const token = AuthMiddleware.extractToken(mockRequest as any);
      expect(token).toBeNull();
    });

    it('should return null for invalid format', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => 'InvalidFormat')
        }
      };
      
      const token = AuthMiddleware.extractToken(mockRequest as any);
      expect(token).toBeNull();
    });
  });

  describe('getUserFromPayload', () => {
    it('should return user data from valid payload', async () => {
      const mockPayload = {
        userId: '2', // Use existing dummy user ID
        email: 'manager@acmecorp.com',
        role: 'company',
        sessionId: 'test-session-123',
        permissions: ['read', 'write'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      } as any;

      const user = await AuthMiddleware.getUserFromPayload(mockPayload);
      
      expect(user).toEqual({
        id: '2',
        email: 'manager@acmecorp.com',
        name: 'John Smith',
        role: 'company',
        companyId: 'acme-corp-001',
        isActive: true,
        emailVerified: true,
        lastLoginAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        permissions: expect.any(Array)
      });
    });
  });

  describe('verifyToken', () => {
    it('should return payload for valid token', async () => {
      const { jwtVerify } = require('jose');
      const mockPayload = {
        userId: '2',
        email: 'manager@acmecorp.com',
        role: 'company',
        sessionId: 'test-session-123',
        permissions: ['read', 'write'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      jwtVerify.mockResolvedValue({
        payload: mockPayload
      });

      const result = await AuthMiddleware.verifyToken('valid.token');
      
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', async () => {
      const { jwtVerify } = require('jose');
      jwtVerify.mockRejectedValue(new Error('Invalid token'));

      const result = await AuthMiddleware.verifyToken('invalid.token');
      
      expect(result).toBeNull();
    });
  });
});
