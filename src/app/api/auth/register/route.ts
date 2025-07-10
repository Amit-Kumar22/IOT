/**
 * Dummy registration API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTokens } from '@/lib/auth';
import { validateRegisterForm } from '@/lib/validations';
import type { User, AuthResponse } from '@/types/auth';

// Import dummy data from login endpoint
const DUMMY_USERS: User[] = [];
const DUMMY_PASSWORDS: Record<string, string> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validateRegisterForm(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid input data',
          errors: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { email, password, name, role, companyName } = validation.data;

    // Check if user already exists
    const existingUser = DUMMY_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user-${role}-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role: role as 'company' | 'consumer',
      companyId: role === 'company' ? `company-${Date.now()}` : undefined,
      permissions: role === 'company' 
        ? ['devices', 'analytics', 'billing', 'profile', 'company']
        : ['devices', 'profile', 'analytics'],
      avatar: `/avatars/${role}.jpg`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      emailVerified: false, // In real app, send verification email
      twoFactorEnabled: false
    };

    // Store user and password (in real app, hash password and store in database)
    DUMMY_USERS.push(newUser);
    DUMMY_PASSWORDS[email.toLowerCase()] = password;

    // Generate tokens
    const tokens = await generateTokens(newUser);
    const sessionId = crypto.randomUUID();

    // Create company record if needed
    if (role === 'company' && companyName) {
      // In real app, create company record in database
      console.log(`Created company: ${companyName} for user: ${newUser.id}`);
    }

    const response: AuthResponse & { sessionId: string } = {
      user: newUser,
      tokens,
      message: 'Registration successful. Please verify your email address.',
      sessionId
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
