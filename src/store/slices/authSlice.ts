import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, AuthTokens } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionId: undefined,
  lastActivity: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Authentication actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens; sessionId: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.sessionId = action.payload.sessionId;
      state.error = null;
      state.lastActivity = new Date().toISOString();
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.sessionId = undefined;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.sessionId = undefined;
      state.lastActivity = undefined;
    },
    
    // Registration actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens; sessionId: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.sessionId = action.payload.sessionId;
      state.error = null;
      state.lastActivity = new Date().toISOString();
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Token management
    refreshTokenStart: (state) => {
      state.isLoading = true;
    },
    refreshTokenSuccess: (state, action: PayloadAction<{ tokens: AuthTokens; user?: User }>) => {
      state.isLoading = false;
      state.tokens = action.payload.tokens;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.error = null;
      state.lastActivity = new Date().toISOString();
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      // Force logout on refresh token failure
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.sessionId = undefined;
    },
    
    // User profile updates
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Session management
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
    
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    // Session expiry handling
    sessionExpired: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.sessionId = undefined;
      state.error = 'Your session has expired. Please log in again.';
    },
    
    // Password reset actions
    passwordResetStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    passwordResetSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    passwordResetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Email verification
    emailVerificationStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    emailVerificationSuccess: (state) => {
      state.isLoading = false;
      if (state.user) {
        state.user.emailVerified = true;
      }
      state.error = null;
    },
    emailVerificationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Rehydration from persistence
    rehydrateAuth: (state, action: PayloadAction<AuthState>) => {
      const { user, tokens, isAuthenticated, sessionId, lastActivity } = action.payload;
      
      // Only rehydrate if we have valid user and tokens
      if (user && tokens && isAuthenticated) {
        state.user = user;
        state.tokens = tokens;
        state.isAuthenticated = isAuthenticated;
        state.sessionId = sessionId;
        state.lastActivity = lastActivity;
        
        // Check if tokens are expired
        const now = Math.floor(Date.now() / 1000);
        if (tokens.expiresAt <= now) {
          // Token expired, clear state
          state.user = null;
          state.tokens = null;
          state.isAuthenticated = false;
          state.sessionId = undefined;
          state.error = 'Your session has expired. Please log in again.';
        }
      }
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUserProfile,
  updateLastActivity,
  setSessionId,
  clearError,
  setError,
  sessionExpired,
  passwordResetStart,
  passwordResetSuccess,
  passwordResetFailure,
  emailVerificationStart,
  emailVerificationSuccess,
  emailVerificationFailure,
  rehydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;

// Enhanced Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.user?.permissions || [];
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.tokens?.accessToken;
export const selectSessionId = (state: { auth: AuthState }) => state.auth.sessionId;
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;

// Computed selectors
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  const tokens = state.auth.tokens;
  if (!tokens) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return tokens.expiresAt <= now;
};

export const selectTimeUntilTokenExpiry = (state: { auth: AuthState }) => {
  const tokens = state.auth.tokens;
  if (!tokens) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, tokens.expiresAt - now);
};

export const selectCanAccess = (requiredRole: string[]) => (state: { auth: AuthState }) => {
  const userRole = state.auth.user?.role;
  if (!userRole) return false;
  
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  return requiredRole.includes(userRole);
};

export const selectHasPermission = (permission: string) => (state: { auth: AuthState }) => {
  const permissions = state.auth.user?.permissions || [];
  
  // Admin has all permissions
  if (permissions.includes('*')) return true;
  
  return permissions.includes(permission);
};
