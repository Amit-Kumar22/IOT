/**
 * Unit Tests for Register API Route
 * 
 * Tests cover:
 * - POST /api/auth/register
 * - Input validation
 * - User creation
 * - Error handling
 * - Response format
 */

import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../register/route';

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

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  createUser: jest.fn(),
  generateTokens: jest.fn(),
}));

// Mock the rate limiting
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(),
}));

const mockCreateUser = require('@/lib/auth').createUser as jest.Mock;
const mockGenerateTokens = require('@/lib/auth').generateTokens as jest.Mock;
const mockRateLimit = require('@/lib/rate-limit').rateLimit as jest.Mock;

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue(undefined);
  });

  it('should create new user with valid data', async () => {
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

    mockCreateUser.mockResolvedValue(mockUser);
    mockGenerateTokens.mockResolvedValue(mockTokens);

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'consumer',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toEqual(mockUser);
    expect(data.tokens).toEqual(mockTokens);
  });

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'consumer',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        // Missing name and role
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    mockCreateUser.mockRejectedValue(new Error('Email already exists'));

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'consumer',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Email already exists');
  });

  it('should return 429 when rate limited', async () => {
    mockRateLimit.mockRejectedValue(new Error('Rate limit exceeded'));

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'consumer',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many attempts');
  });
});
