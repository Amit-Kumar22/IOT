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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { jwtVerify } = require('jose');
      const mockPayload = {
        userId: '2', // Use existing dummy user ID
        email: 'manager@acmecorp.com',
        role: 'company',
        sessionId: 'session123',
        iat: Date.now(),
        exp: Date.now() + 3600000
      };

      const user = await AuthMiddleware.getUserFromPayload(mockPayload);
      
      expect(user).toBeTruthy();
      expect(user?.id).toBe('2');
      expect(user?.email).toBe('manager@acmecorp.com');
      expect(user?.role).toBe('company');
    });
  });

  describe('verifyToken', () => {
    it('should return payload for valid token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { jwtVerify } = require('jose');
      const mockPayload = {
        userId: '2',
        email: 'manager@acmecorp.com',
        role: 'company',
        sessionId: 'session123',
        iat: Date.now(),
        exp: Date.now() + 3600000
      };
      jwtVerify.mockResolvedValue({
        payload: mockPayload
      });

      const result = await AuthMiddleware.verifyToken('valid.token');
      
      expect(result).toBeTruthy();
      expect(result?.userId).toBe('2');
    });

    it('should return null for invalid token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { jwtVerify } = require('jose');
      jwtVerify.mockRejectedValue(new Error('Invalid token'));

      const result = await AuthMiddleware.verifyToken('invalid.token');
      
      expect(result).toBeNull();
    });
  });
});
