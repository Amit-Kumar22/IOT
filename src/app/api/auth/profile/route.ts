/**
 * Dummy profile API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from '@/lib/auth';
import type { User } from '@/types/auth';

// Dummy users data
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
  }
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const payload = await verifyAccessToken(token);
    const user = DUMMY_USERS.find(u => u.id === payload.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const payload = await verifyAccessToken(token);
    const userIndex = DUMMY_USERS.findIndex(u => u.id === payload.userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, avatar } = body;

    // Update user data
    const user = DUMMY_USERS[userIndex];
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    user.updatedAt = new Date().toISOString();

    return NextResponse.json(user);

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
