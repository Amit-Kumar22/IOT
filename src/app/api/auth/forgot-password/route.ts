/**
 * Dummy forgot password API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePasswordResetRequest } from '@/lib/validations';

// Generate secure token utility
const generateSecureToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// In-memory password reset tokens (in real app, store in database with expiry)
const RESET_TOKENS = new Map<string, {
  email: string;
  token: string;
  expiresAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validatePasswordResetRequest(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid email format',
          errors: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Generate reset token
    const resetToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    RESET_TOKENS.set(resetToken, {
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt
    });

    // In real app, send email with reset link
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
