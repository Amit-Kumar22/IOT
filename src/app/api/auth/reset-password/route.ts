/**
 * Dummy reset password API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { validatePasswordReset } from '@/lib/validations';

// In-memory password reset tokens (shared with forgot-password endpoint)
const RESET_TOKENS = new Map<string, {
  email: string;
  token: string;
  expiresAt: Date;
}>();

// Dummy users data (shared with other auth endpoints)
const DUMMY_USERS = [
  {
    id: '1',
    email: 'admin@iotplatform.com',
    password: '$2a$10$8K7A6K7A6K7A6K7A6K7A6O8J9I8H7G6F5E4D3C2B1A0Z9Y8X7W6V5U', // Admin123!
    role: 'admin' as const,
    firstName: 'System',
    lastName: 'Administrator',
    companyId: null,
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'manager@acmecorp.com',
    password: '$2a$10$9L8B7K6J5I4H3G2F1E0D9C8B7A6Z5Y4X3W2V1U0T9S8R7Q6P5O4N3M', // Manager456!
    role: 'company' as const,
    firstName: 'John',
    lastName: 'Smith',
    companyId: 'acme-corp-001',
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'jane.doe@example.com',
    password: '$2a$10$7J6I5H4G3F2E1D0C9B8A7Z6Y5X4W3V2U1T0S9R8Q7P6O5N4M3L2K1J', // Consumer789!
    role: 'consumer' as const,
    firstName: 'Jane',
    lastName: 'Doe',
    companyId: null,
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validatePasswordReset(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid reset data',
          errors: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Check if token exists and is valid
    const resetData = RESET_TOKENS.get(token);
    if (!resetData) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      RESET_TOKENS.delete(token);
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Find user
    const userIndex = DUMMY_USERS.findIndex(
      user => user.email.toLowerCase() === resetData.email
    );

    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user password
    DUMMY_USERS[userIndex].password = hashedPassword;
    DUMMY_USERS[userIndex].updatedAt = new Date().toISOString();

    // Remove used token
    RESET_TOKENS.delete(token);

    console.log(`Password reset successful for: ${resetData.email}`);

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
