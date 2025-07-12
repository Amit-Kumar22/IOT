/**
 * Unit Tests for Auth Library
 * 
 * Tests cover:
 * - JWT token generation and validation
 * - Password hashing and verification
 * - Token validation
 * - Password strength validation
 * - User authentication helpers
 */

import { 
  generateTokens, 
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  validatePasswordStrength,
  getCurrentUser
} from '../auth';

// Mock jose for JWT operations
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: jest.fn(),
}));

// Mock bcrypt for password hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockJwtVerify = require('jose').jwtVerify as jest.Mock;
const mockBcryptHash = require('bcrypt').hash as jest.Mock;
const mockBcryptCompare = require('bcrypt').compare as jest.Mock;

describe('Auth Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        emailVerified: true,
      };

      const tokens = await generateTokens(mockUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBe('mock-jwt-token');
      expect(tokens.refreshToken).toBe('mock-jwt-token');
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with user data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer' as const,
        permissions: ['read:devices'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        emailVerified: true,
      };

      const token = await generateAccessToken(mockUser);

      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with user ID', async () => {
      const userId = 'user-123';

      const token = await generateRefreshToken(userId);

      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'consumer',
        permissions: ['read:devices'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      };

      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      const result = await verifyAccessToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      await expect(verifyAccessToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const mockPayload = {
        userId: 'user-123',
        jti: 'token-id-123',
      };

      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      const result = await verifyRefreshToken('valid-refresh-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid refresh token', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      await expect(verifyRefreshToken('invalid-refresh-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      mockBcryptHash.mockResolvedValue('hashed-password');

      const result = await hashPassword('password123');

      expect(result).toBe('hashed-password');
      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      mockBcryptCompare.mockResolvedValue(true);

      const result = await verifyPassword('password123', 'hashed-password');

      expect(result).toBe(true);
      expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should reject incorrect password', async () => {
      mockBcryptCompare.mockResolvedValue(false);

      const result = await verifyPassword('wrongpassword', 'hashed-password');

      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPassword123!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = validatePasswordStrength('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require minimum length', () => {
      const result = validatePasswordStrength('short');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should require uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from valid token', async () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'consumer',
        permissions: ['read:devices'],
      };

      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
      } as any;

      const result = await getCurrentUser(mockRequest);

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('Bearer invalid-token'),
        },
      } as any;

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });

    it('should return null for missing authorization header', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as any;

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });
  });
});
