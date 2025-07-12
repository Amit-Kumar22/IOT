/**
 * Unit Tests for Login API Route
 * 
 * Tests cover:
 * - POST /api/auth/login
 * - Input validation
 * - Authentication logic
 * - Error handling
 * - Response format
 */

import { NextRequest } from 'next/server';
import { POST } from '../login/route';

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  validateCredentials: jest.fn(),
  generateTokens: jest.fn(),
}));

// Mock the rate limiting
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(),
}));

import { validateCredentials, generateTokens } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const mockValidateCredentials = validateCredentials as jest.Mock;
const mockGenerateTokens = generateTokens as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue(undefined);
  });

  it('should authenticate user with valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'consumer',
    };

    const mockTokens = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
    };

    mockValidateCredentials.mockResolvedValue(mockUser);
    mockGenerateTokens.mockResolvedValue(mockTokens);

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual(mockUser);
    expect(data.tokens).toEqual(mockTokens);
    expect(mockValidateCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockGenerateTokens).toHaveBeenCalledWith(mockUser);
  });

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 400 for missing password', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 401 for invalid credentials', async () => {
    mockValidateCredentials.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 429 when rate limited', async () => {
    mockRateLimit.mockRejectedValue(new Error('Rate limit exceeded'));

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many attempts');
  });

  it('should return 500 for server errors', async () => {
    mockValidateCredentials.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
