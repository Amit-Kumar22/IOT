/**
 * Core authentication types for the IoT platform
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
}

export type UserRole = 'admin' | 'company' | 'consumer';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  companyName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfile {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// JWT-specific types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
  permissions: string[];
  iat: number;
  exp: number;
  jti?: string; // JWT ID for token tracking
}

// Session management
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

// Auth state for Redux
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId?: string;
  lastActivity?: string;
}

// Role-based access control
export interface RolePermissions {
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    read: ['*'],
    write: ['*'],
    delete: ['*'],
    admin: ['*']
  },
  company: {
    read: ['devices', 'analytics', 'billing', 'profile', 'company'],
    write: ['devices', 'profile', 'company'],
    delete: ['devices'],
    admin: ['company']
  },
  consumer: {
    read: ['devices', 'profile', 'analytics'],
    write: ['devices', 'profile'],
    delete: [],
    admin: []
  }
};

// Form validation types
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  companyName?: string;
  general?: string;
}

// Authentication events for audit logging
export type AuthEvent = 
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_VERIFIED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED';

export interface AuthEventData {
  event: AuthEvent;
  userId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

// Password validation
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Rate limiting types
export interface RateLimitInfo {
  attempts: number;
  resetTime: Date;
  blocked: boolean;
}

// API response enhancements
export interface RefreshTokenResponse {
  tokens: AuthTokens;
  user?: User; // In case user data needs updating
}

export interface LogoutResponse {
  message: string;
  loggedOut: boolean;
}
