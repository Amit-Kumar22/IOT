/**
 * Custom authentication hooks for form handling and auth state management
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  selectUserPermissions,
  selectIsTokenExpired,
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateLastActivity
} from '@/store/slices/authSlice';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validations';
import { hasPermission, hasRole } from '@/lib/auth';
import type { UserRole } from '@/types/auth';

/**
 * Main authentication hook
 * Provides auth state and authentication methods
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);
  const permissions = useAppSelector(selectUserPermissions);
  const isTokenExpired = useAppSelector(selectIsTokenExpired);

  // Login function
  const login = useCallback(async (credentials: LoginFormData) => {
    dispatch(loginStart());
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess({
          user: data.user,
          tokens: data.tokens,
          sessionId: data.sessionId
        }));
        
        // Redirect to appropriate dashboard
        const dashboardPath = getDashboardPath(data.user.role);
        router.push(dashboardPath);
        return { success: true, user: data.user };
      } else {
        dispatch(loginFailure(data.message || 'Login failed'));
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, router]);

  // Register function
  const register = useCallback(async (userData: RegisterFormData) => {
    dispatch(registerStart());
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(registerSuccess({
          user: data.user,
          tokens: data.tokens,
          sessionId: data.sessionId
        }));
        
        // Redirect to appropriate dashboard
        const dashboardPath = getDashboardPath(data.user.role);
        router.push(dashboardPath);
        return { success: true, user: data.user };
      } else {
        dispatch(registerFailure(data.message || 'Registration failed'));
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch(registerFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, router]);

  // Logout function
  const signOut = useCallback(async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.tokens?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      dispatch(logout());
      router.push('/login');
    }
  }, [dispatch, router, auth.tokens]);

  // Update user activity
  const updateActivity = useCallback(() => {
    if (isAuthenticated && !isTokenExpired) {
      dispatch(updateLastActivity());
    }
  }, [dispatch, isAuthenticated, isTokenExpired]);

  // Check if user has permission
  const checkPermission = useCallback((permission: string): boolean => {
    return hasPermission(permissions, permission);
  }, [permissions]);

  // Check if user has role
  const checkRole = useCallback((roles: UserRole[]): boolean => {
    return userRole ? hasRole(userRole, roles) : false;
  }, [userRole]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    userRole,
    permissions,
    isTokenExpired,
    
    // Actions
    login,
    register,
    logout: signOut,
    updateActivity,
    checkPermission,
    checkRole,
  };
}

/**
 * Hook for login form management
 */
export function useLoginForm() {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when form data changes
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [formData]);

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, validateForm]);

  return {
    formData,
    formErrors,
    isLoading: isLoading || isSubmitting,
    error,
    handleChange,
    handleSubmit,
    setFormData,
  };
}

/**
 * Hook for register form management
 */
export function useRegisterForm() {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'consumer',
    companyName: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when form data changes
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [formData]);

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const result = registerSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, register, validateForm]);

  return {
    formData,
    formErrors,
    isLoading: isLoading || isSubmitting,
    error,
    handleChange,
    handleSubmit,
    setFormData,
  };
}

/**
 * Hook that requires authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading, isTokenExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || isTokenExpired)) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, isTokenExpired, router, redirectTo]);

  return { isAuthenticated: isAuthenticated && !isTokenExpired, isLoading };
}

/**
 * Hook for role-based access control
 */
export function useRoleAccess(allowedRoles: UserRole[]) {
  const { userRole, isAuthenticated, checkRole } = useAuth();
  
  const hasAccess = isAuthenticated && checkRole(allowedRoles);
  
  return {
    hasAccess,
    userRole,
    isAuthenticated,
  };
}

/**
 * Hook for permission-based access control
 */
export function usePermissionAccess(requiredPermissions: string[]) {
  const { permissions, isAuthenticated, checkPermission } = useAuth();
  
  const hasAllPermissions = isAuthenticated && 
    requiredPermissions.every(permission => checkPermission(permission));
  
  const hasAnyPermission = isAuthenticated && 
    requiredPermissions.some(permission => checkPermission(permission));
  
  return {
    hasAllPermissions,
    hasAnyPermission,
    permissions,
    isAuthenticated,
  };
}

/**
 * Hook for session management
 */
export function useSession() {
  const { user, isAuthenticated, isTokenExpired, updateActivity, logout } = useAuth();
  const auth = useAppSelector(selectAuth);
  
  // Auto-logout on token expiry
  useEffect(() => {
    if (isAuthenticated && isTokenExpired) {
      logout();
    }
  }, [isAuthenticated, isTokenExpired, logout]);

  // Update activity on user interactions
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    if (isAuthenticated && !isTokenExpired) {
      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isAuthenticated, isTokenExpired, updateActivity]);

  return {
    user,
    isAuthenticated: isAuthenticated && !isTokenExpired,
    sessionId: auth.sessionId,
    lastActivity: auth.lastActivity,
    isTokenExpired,
  };
}

// Helper function to get dashboard path based on role
function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'company':
      return '/company/devices';
    case 'consumer':
      return '/consumer/devices';
    default:
      return '/';
  }
}
