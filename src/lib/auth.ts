/**
 * Authentication utilities for JWT token management and validation
 */

import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';
import { JWTPayload, AuthTokens, User, UserRole } from '@/types/auth';

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

// Convert string time to seconds
const timeToSeconds = (time: string): number => {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1));
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900; // 15 minutes default
  }
};

// JWT secret keys as Uint8Array
const getSecretKey = (secret: string): Uint8Array => {
  return new TextEncoder().encode(secret);
};

/**
 * Generate JWT access token
 */
export async function generateAccessToken(user: User): Promise<string> {
  const jti = crypto.randomUUID();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + timeToSeconds(JWT_EXPIRES_IN);

  // Create payload compatible with jose library
  const payload: JoseJWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    permissions: user.permissions,
    iat,
    exp,
    jti
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setJti(jti)
    .sign(getSecretKey(JWT_SECRET));
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const jti = crypto.randomUUID();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + timeToSeconds(JWT_REFRESH_EXPIRES_IN);

  const payload: JoseJWTPayload = {
    userId,
    type: 'refresh',
    iat,
    exp,
    jti
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setJti(jti)
    .sign(getSecretKey(JWT_REFRESH_SECRET));
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(user: User): Promise<AuthTokens> {
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);
  
  return {
    accessToken,
    refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + timeToSeconds(JWT_EXPIRES_IN),
    tokenType: 'Bearer'
  };
}

/**
 * Verify JWT access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(JWT_SECRET));
    
    // Convert jose payload to our JWTPayload type
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      companyId: payload.companyId as string | undefined,
      permissions: payload.permissions as string[],
      iat: payload.iat as number,
      exp: payload.exp as number,
      jti: payload.jti as string | undefined
    };
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string; jti: string }> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(JWT_REFRESH_SECRET));
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return {
      userId: payload.userId as string,
      jti: payload.jti as string
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get current user from request headers
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }
    
    const payload = await verifyAccessToken(token);
    
    // In a real app, you'd fetch full user data from database
    // For now, return user data from token payload
    return {
      id: payload.userId,
      email: payload.email,
      name: '', // Would be fetched from DB
      role: payload.role,
      companyId: payload.companyId,
      permissions: payload.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has required permissions
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Check for specific permission
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }
  
  return requiredRoles.includes(userRole);
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token for password reset
 */
export function generateSecureToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score
  };
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() / 1000 >= expiresAt;
}

/**
 * Get time until token expiry in seconds
 */
export function getTimeUntilExpiry(expiresAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}
