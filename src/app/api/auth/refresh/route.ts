/**
 * Dummy token refresh API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTokens } from '@/lib/auth';
import type { User, RefreshTokenResponse } from '@/types/auth';

// Dummy user lookup (in real app, verify refresh token and get user from database)
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
  }
];

export async function POST(request: NextRequest) {
  try {
    // In real app, extract refresh token from httpOnly cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // In real app, verify refresh token and get user
    // For dummy implementation, just use first user
    const user = DUMMY_USERS[0];
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokens = await generateTokens(user);

    const response: RefreshTokenResponse = {
      tokens,
      user // Include updated user data if needed
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}
