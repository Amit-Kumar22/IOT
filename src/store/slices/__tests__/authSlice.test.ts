/**
 * Unit Tests for Auth Redux Slice
 * 
 * Tests cover:
 * - Authentication state management
 * - Login/logout flows
 * - Token management
 * - Session handling
 * - User profile updates
 * - Error states
 */

import { configureStore } from '@reduxjs/toolkit';
import authSlice, { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError, 
  setError,
  updateUserProfile,
  updateLastActivity,
  setSessionId,
  sessionExpired,
  rehydrateAuth
} from '../authSlice';
import { User, AuthTokens, AuthState } from '@/types/auth';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'consumer',
  permissions: ['read:devices'],
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  lastLoginAt: '2023-01-01T00:00:00.000Z',
  isActive: true,
  emailVerified: true,
};

const mockTokens: AuthTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-123',
  expiresAt: Date.now() + 3600000, // 1 hour from now
  tokenType: 'Bearer',
};

const mockSessionId = 'session-123';

// Type for the Redux store
interface RootState {
  auth: AuthState;
}

describe('Auth Slice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionId: undefined,
        lastActivity: undefined,
      });
    });
  });

  describe('Login Flow', () => {
    it('should handle login start', () => {
      store.dispatch(loginStart());
      const state = store.getState().auth;
      
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle login success', () => {
      const loginData = {
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      };

      store.dispatch(loginSuccess(loginData));
      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.sessionId).toBe(mockSessionId);
      expect(state.error).toBe(null);
      expect(state.lastActivity).toBeDefined();
    });

    it('should handle login failure', () => {
      const errorMessage = 'Invalid credentials';
      
      store.dispatch(loginFailure(errorMessage));
      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Logout Flow', () => {
    it('should handle logout', () => {
      // First login
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      }));

      // Then logout
      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.sessionId).toBe(undefined);
      expect(state.error).toBe(null);
      expect(state.lastActivity).toBe(undefined);
    });
  });

  describe('Token Management', () => {
    it('should handle token refresh', () => {
      // First login
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      }));

      const newTokens: AuthTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 7200000, // 2 hours from now
        tokenType: 'Bearer',
      };

      // Login again with new tokens simulates refresh
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: newTokens,
        sessionId: mockSessionId,
      }));
      
      const state = store.getState().auth;
      expect(state.tokens).toEqual(newTokens);
      expect(state.lastActivity).toBeDefined();
    });
  });

  describe('User Updates', () => {
    it('should update user profile', () => {
      // First login
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      }));

      const profileUpdate = {
        name: 'Updated Profile Name',
        email: 'profile@example.com',
      };

      store.dispatch(updateUserProfile(profileUpdate));
      const state = store.getState().auth;

      expect(state.user?.name).toBe(profileUpdate.name);
      expect(state.user?.email).toBe(profileUpdate.email);
    });

    it('should rehydrate auth state', () => {
      const authData = {
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
        lastActivity: '2023-07-15T10:30:00.000Z',
      };

      store.dispatch(rehydrateAuth(authData));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.sessionId).toBe(mockSessionId);
      expect(state.isAuthenticated).toBe(true);
      expect(state.lastActivity).toBe(authData.lastActivity);
    });
  });

  describe('Session Management', () => {
    it('should update session activity', () => {
      store.dispatch(updateLastActivity());
      const state = store.getState().auth;

      expect(state.lastActivity).toBeDefined();
    });

    it('should set session ID', () => {
      const sessionId = 'new-session-123';
      
      store.dispatch(setSessionId(sessionId));
      const state = store.getState().auth;

      expect(state.sessionId).toBe(sessionId);
    });

    it('should handle session expiration', () => {
      // First login
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      }));

      // Then expire session
      store.dispatch(sessionExpired());
      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.sessionId).toBe(undefined);
      expect(state.error).toBe('Your session has expired. Please log in again.');
    });
  });

  describe('Error Management', () => {
    it('should clear error', () => {
      // First create an error
      store.dispatch(loginFailure('Test error'));
      expect(store.getState().auth.error).toBe('Test error');

      // Then clear it
      store.dispatch(clearError());
      const state = store.getState().auth;

      expect(state.error).toBe(null);
    });

    it('should set error', () => {
      const errorMessage = 'Custom error message';
      
      store.dispatch(setError(errorMessage));
      const state = store.getState().auth;

      expect(state.error).toBe(errorMessage);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during complex flows', () => {
      // Start with login attempt
      store.dispatch(loginStart());
      expect(store.getState().auth.isLoading).toBe(true);

      // Successful login
      store.dispatch(loginSuccess({
        user: mockUser,
        tokens: mockTokens,
        sessionId: mockSessionId,
      }));

      let state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);

      // Update profile
      store.dispatch(updateUserProfile({ name: 'New Name' }));
      state = store.getState().auth;
      expect(state.user?.name).toBe('New Name');
      expect(state.isAuthenticated).toBe(true);

      // Update last activity
      store.dispatch(updateLastActivity());
      state = store.getState().auth;
      expect(state.lastActivity).toBeDefined();
      expect(state.isAuthenticated).toBe(true);

      // Set error
      store.dispatch(setError('Test error'));
      state = store.getState().auth;
      expect(state.error).toBe('Test error');
      expect(state.isAuthenticated).toBe(true); // Should remain authenticated

      // Clear error
      store.dispatch(clearError());
      state = store.getState().auth;
      expect(state.error).toBe(null);
      expect(state.isAuthenticated).toBe(true);

      // Logout
      store.dispatch(logout());
      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
    });
  });
});
