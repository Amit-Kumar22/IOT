/**
 * Dummy logout API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const payload = await verifyAccessToken(token);
      
      // In real app, invalidate token in database/cache
      console.log(`User ${payload.userId} logged out successfully`);
      
      return NextResponse.json({
        message: 'Logout successful',
        loggedOut: true
      });
      
    } catch (error) {
      // Token invalid, but still return success for logout
      return NextResponse.json({
        message: 'Logout successful',
        loggedOut: true
      });
    }

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
