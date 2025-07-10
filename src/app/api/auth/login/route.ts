/**
 * Dummy authentication API endpoints with realistic data
 * Replace with real API when backend is ready
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, hashPassword, verifyPassword, generateSecureToken } from '@/lib/auth';
import { validateLoginForm } from '@/lib/validations';
import type { User, AuthResponse } from '@/types/auth';

// In-memory dummy database (replace with real database)
const DUMMY_USERS: User[] = [
  {
    id: 'user-admin-001',
    email: 'admin@iotplatform.com',
    name: 'System Administrator',
    role: 'admin',
    permissions: ['*'],
    avatar: '/avatars/admin.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-07-09T00:00:00Z',
    lastLoginAt: '2024-07-08T15:30:00Z',
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'user-company-001',
    email: 'manager@acmecorp.com',
    name: 'John Smith',
    role: 'company',
    companyId: 'company-001',
    permissions: ['devices', 'analytics', 'billing', 'profile', 'company'],
    avatar: '/avatars/company.jpg',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-07-09T00:00:00Z',
    lastLoginAt: '2024-07-08T14:20:00Z',
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'user-consumer-001',
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
    role: 'consumer',
    permissions: ['devices', 'profile', 'analytics'],
    avatar: '/avatars/consumer.jpg',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-07-09T00:00:00Z',
    lastLoginAt: '2024-07-08T16:45:00Z',
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'user-company-002',
    email: 'tech@smartfactory.io',
    name: 'Sarah Johnson',
    role: 'company',
    companyId: 'company-002',
    permissions: ['devices', 'analytics', 'billing', 'profile', 'company'],
    avatar: '/avatars/company2.jpg',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-07-09T00:00:00Z',
    lastLoginAt: '2024-07-07T10:30:00Z',
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: true
  }
];

// Dummy password storage (in real app, these would be hashed in database)
const DUMMY_PASSWORDS: Record<string, string> = {
  'admin@iotplatform.com': 'Admin123!',
  'manager@acmecorp.com': 'Manager456!',
  'jane.doe@example.com': 'Consumer789!',
  'tech@smartfactory.io': 'SmartTech123!'
};

// In-memory sessions storage
const ACTIVE_SESSIONS = new Map<string, {
  userId: string;
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validateLoginForm(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid input data',
          errors: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // Find user by email
    const user = DUMMY_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Simulate delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password (in real app, compare with hashed password)
    const expectedPassword = DUMMY_PASSWORDS[email.toLowerCase()];
    if (password !== expectedPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = await generateTokens(user);
    const sessionId = crypto.randomUUID();

    // Store session
    ACTIVE_SESSIONS.set(sessionId, {
      userId: user.id,
      sessionId,
      deviceInfo: request.headers.get('user-agent') || 'Unknown Device',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
      lastActivity: new Date()
    });

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    const response: AuthResponse & { sessionId: string } = {
      user,
      tokens,
      message: 'Login successful',
      sessionId
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
