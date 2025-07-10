/**
 * Next.js Middleware for route protection and authentication
 * This middleware runs on the Edge Runtime for better performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT Secret for verification
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
  '/company',
  '/consumer',
  '/dashboard',
  '/devices',
  '/analytics',
  '/billing',
  '/profile',
  '/settings',
];

// Routes that are only accessible when not authenticated
const AUTH_ONLY_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/terms',
  '/privacy',
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/devices',
  '/api/analytics',
  '/api/billing',
  '/api/profile',
  '/api/admin',
];

// Role-based route access
const ROLE_ROUTES = {
  admin: ['/admin'],
  company: ['/company', '/billing'],
  consumer: ['/consumer'],
} as const;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') || // Allow auth endpoints
    pathname.includes('.') || // Skip files with extensions
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get authentication token
  const token = getTokenFromRequest(request);
  const user = await verifyToken(token);

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!user) {
      return redirectToLogin(request);
    }

    // Check role-based access
    if (!hasRoleAccess(pathname, user.role)) {
      return NextResponse.json(
        { message: 'Access denied', error: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api')) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', user.userId);
      response.headers.set('x-user-email', user.email);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-session-id', user.sessionId);
      return response;
    }

    return NextResponse.next();
  }

  // Handle auth-only routes (redirect authenticated users)
  if (isAuthOnlyRoute(pathname)) {
    if (user) {
      return redirectToDashboard(user.role);
    }
    return NextResponse.next();
  }

  // Handle protected API routes
  if (isProtectedApiRoute(pathname)) {
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Add user info to request headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-session-id', user.sessionId);
    return response;
  }

  // All other routes are allowed
  return NextResponse.next();
}

/**
 * Extract JWT token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Verify JWT token and extract user info
 */
async function verifyToken(token: string | null): Promise<JWTPayload | null> {
  if (!token) return null;

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
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is auth-only (login, register, etc.)
 */
function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if API route requires authentication
 */
function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if user has role-based access to route
 */
function hasRoleAccess(pathname: string, userRole: string): boolean {
  // Admin has access to everything
  if (userRole === 'admin') return true;

  // Check specific role routes
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (role === userRole) {
      // If user has access to any route that matches, allow
      const hasAccess = routes.some(route => pathname.startsWith(route));
      if (hasAccess) return true;
    }
  }

  // Check if it's a general protected route (dashboard, devices, etc.)
  const generalRoutes = ['/dashboard', '/devices', '/analytics', '/profile', '/settings'];
  if (generalRoutes.some(route => pathname.startsWith(route))) {
    return true; // All authenticated users can access these
  }

  return false;
}

/**
 * Redirect to login page
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Redirect to appropriate dashboard based on role
 */
function redirectToDashboard(userRole: string): NextResponse {
  const dashboards = {
    admin: '/admin',
    company: '/company',
    consumer: '/consumer',
  };

  const dashboardPath = dashboards[userRole as keyof typeof dashboards] || '/dashboard';
  return NextResponse.redirect(new URL(dashboardPath, 'http://localhost:3000'));
}

// Configuration for Next.js middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (.js, .css, .png, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
