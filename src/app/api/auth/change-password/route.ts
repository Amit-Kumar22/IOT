/**
 * Dummy change password API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { jwtVerify } from 'jose';
import { z } from 'zod';

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

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

// Password change validation schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
});

export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let payload;
    try {
      const { payload: jwtPayload } = await jwtVerify(token, secret);
      payload = jwtPayload as any;
    } catch {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = passwordChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid password change data',
          errors: validation.error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Find user
    const userIndex = DUMMY_USERS.findIndex(user => user.id === payload.userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = DUMMY_USERS[userIndex];

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 10);

    // Update user password
    DUMMY_USERS[userIndex].password = hashedNewPassword;
    DUMMY_USERS[userIndex].updatedAt = new Date().toISOString();

    console.log(`Password changed successfully for user: ${user.email}`);

    return NextResponse.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
