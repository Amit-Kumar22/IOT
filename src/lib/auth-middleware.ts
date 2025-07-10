/**
 * JWT Authentication middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { User } from '@/types/auth';

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  sessionId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Dummy active sessions (in production, use Redis or database)
const ACTIVE_SESSIONS = new Set<string>();

export class AuthMiddleware {
  /**
   * Extract token from Authorization header
   */
  static extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return null;
    }

    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  /**
   * Verify JWT token and extract payload
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Validate payload structure
      if (
        typeof payload.userId === 'string' &&
        typeof payload.email === 'string' &&
        typeof payload.role === 'string' &&
        typeof payload.sessionId === 'string' &&
        typeof payload.iat === 'number' &&
        typeof payload.exp === 'number'
      ) {
        return payload as unknown as JWTPayload;
      }
      
      return null;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Check if session is active
   */
  static isSessionActive(sessionId: string): boolean {
    return ACTIVE_SESSIONS.has(sessionId);
  }

  /**
   * Add session to active sessions
   */
  static addActiveSession(sessionId: string): void {
    ACTIVE_SESSIONS.add(sessionId);
  }

  /**
   * Remove session from active sessions
   */
  static removeActiveSession(sessionId: string): void {
    ACTIVE_SESSIONS.delete(sessionId);
  }

  /**
   * Get user data from JWT payload (dummy implementation)
   */
  static async getUserFromPayload(payload: JWTPayload): Promise<User | null> {
    // In production, fetch from database
    const DUMMY_USERS: User[] = [
      {
        id: '1',
        email: 'admin@iotplatform.com',
        name: 'System Administrator',
        role: 'admin' as const,
        companyId: undefined,
        isActive: true,
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        permissions: ['*'], // Admin has all permissions
      },
      {
        id: '2',
        email: 'manager@acmecorp.com',
        name: 'John Smith',
        role: 'company' as const,
        companyId: 'acme-corp-001',
        isActive: true,
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        permissions: ['devices.read', 'devices.write', 'analytics.read', 'users.read'],
      },
      {
        id: '3',
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: 'consumer' as const,
        companyId: undefined,
        isActive: true,
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        permissions: ['devices.read', 'analytics.read'],
      }
    ];

    return DUMMY_USERS.find(user => user.id === payload.userId) || null;
  }

  /**
   * Authenticate request and attach user data
   */
  static async authenticate(request: NextRequest): Promise<{
    success: boolean;
    user?: User;
    sessionId?: string;
    error?: string;
  }> {
    const token = this.extractToken(request);
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }

    const payload = await this.verifyToken(token);
    
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

    // Check if session is still active
    if (!this.isSessionActive(payload.sessionId)) {
      return {
        success: false,
        error: 'Session has been terminated'
      };
    }

    const user = await this.getUserFromPayload(payload);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'User account is deactivated'
      };
    }

    return {
      success: true,
      user,
      sessionId: payload.sessionId
    };
  }

  /**
   * Require authentication middleware
   */
  static requireAuth() {
    return async (request: NextRequest) => {
      const auth = await this.authenticate(request);
      
      if (!auth.success) {
        return NextResponse.json(
          { 
            message: auth.error || 'Authentication required',
            error: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      // Attach user data to request (for TypeScript purposes, we'll use headers)
      const response = NextResponse.next();
      response.headers.set('x-user-id', auth.user!.id);
      response.headers.set('x-user-email', auth.user!.email);
      response.headers.set('x-user-role', auth.user!.role);
      response.headers.set('x-session-id', auth.sessionId!);
      
      return response;
    };
  }

  /**
   * Require specific role middleware
   */
  static requireRole(allowedRoles: string[]) {
    return async (request: NextRequest) => {
      const auth = await this.authenticate(request);
      
      if (!auth.success) {
        return NextResponse.json(
          { 
            message: auth.error || 'Authentication required',
            error: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      const userRole = auth.user!.role;
      
      // Admin can access everything
      if (userRole === 'admin') {
        const response = NextResponse.next();
        response.headers.set('x-user-id', auth.user!.id);
        response.headers.set('x-user-email', auth.user!.email);
        response.headers.set('x-user-role', auth.user!.role);
        response.headers.set('x-session-id', auth.sessionId!);
        return response;
      }

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { 
            message: 'Insufficient permissions',
            error: 'FORBIDDEN',
            required: allowedRoles,
            current: userRole
          },
          { status: 403 }
        );
      }

      const response = NextResponse.next();
      response.headers.set('x-user-id', auth.user!.id);
      response.headers.set('x-user-email', auth.user!.email);
      response.headers.set('x-user-role', auth.user!.role);
      response.headers.set('x-session-id', auth.sessionId!);
      
      return response;
    };
  }

  /**
   * Require specific permission middleware
   */
  static requirePermission(requiredPermissions: string[]) {
    return async (request: NextRequest) => {
      const auth = await this.authenticate(request);
      
      if (!auth.success) {
        return NextResponse.json(
          { 
            message: auth.error || 'Authentication required',
            error: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      const userPermissions = auth.user!.permissions || [];
      
      // Check for wildcard permission (admin)
      if (userPermissions.includes('*')) {
        const response = NextResponse.next();
        response.headers.set('x-user-id', auth.user!.id);
        response.headers.set('x-user-email', auth.user!.email);
        response.headers.set('x-user-role', auth.user!.role);
        response.headers.set('x-session-id', auth.sessionId!);
        return response;
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return NextResponse.json(
          { 
            message: 'Insufficient permissions',
            error: 'FORBIDDEN',
            required: requiredPermissions,
            current: userPermissions
          },
          { status: 403 }
        );
      }

      const response = NextResponse.next();
      response.headers.set('x-user-id', auth.user!.id);
      response.headers.set('x-user-email', auth.user!.email);
      response.headers.set('x-user-role', auth.user!.role);
      response.headers.set('x-session-id', auth.sessionId!);
      
      return response;
    };
  }

  /**
   * Optional authentication (user data if available)
   */
  static optionalAuth() {
    return async (request: NextRequest) => {
      const auth = await this.authenticate(request);
      
      const response = NextResponse.next();
      
      if (auth.success) {
        response.headers.set('x-user-id', auth.user!.id);
        response.headers.set('x-user-email', auth.user!.email);
        response.headers.set('x-user-role', auth.user!.role);
        response.headers.set('x-session-id', auth.sessionId!);
      }
      
      return response;
    };
  }
}

// Helper function to get user from request headers (set by middleware)
export function getUserFromRequest(request: NextRequest): {
  id: string;
  email: string;
  role: string;
  sessionId: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const sessionId = request.headers.get('x-session-id');

  if (!userId || !userEmail || !userRole || !sessionId) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    sessionId: sessionId
  };
}

// Helper function to combine multiple middleware
export function combineMiddleware(...middlewares: Array<(request: NextRequest) => Promise<NextResponse> | NextResponse>) {
  return async (request: NextRequest) => {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response.status !== 200) {
        return response;
      }
    }
    return NextResponse.next();
  };
}
