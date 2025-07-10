/**
 * Redux Provider with Persistence
 * Wraps the app with Redux store and persistence functionality
 */

'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingSpinner />} 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}

// Token refresh hook for automatic token management
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useRefreshTokenMutation } from '@/store/api/authApi';
import { refreshTokenSuccess, logout } from '@/store/slices/authSlice';

export function useTokenRefresh() {
  const dispatch = useDispatch();
  const { tokens } = useSelector((state: RootState) => state.auth);
  const [refreshTokenMutation] = useRefreshTokenMutation();

  useEffect(() => {
    if (!tokens?.accessToken || !tokens?.refreshToken) return;

    // Calculate time until token expires (refresh 5 minutes before expiry)
    const expiresAt = tokens.expiresAt * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - (5 * 60 * 1000); // 5 minutes before expiry

    if (timeUntilRefresh <= 0) {
      // Token is already expired or about to expire, refresh immediately
      handleTokenRefresh();
      return;
    }

    // Set timeout to refresh token
    const refreshTimeout = setTimeout(() => {
      handleTokenRefresh();
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimeout);
  }, [tokens]);

  const handleTokenRefresh = async () => {
    if (!tokens?.refreshToken) return;

    try {
      const result = await refreshTokenMutation().unwrap();
      
      dispatch(refreshTokenSuccess({
        tokens: result.tokens,
        user: result.user
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch(logout());
    }
  };

  return { refreshToken: handleTokenRefresh };
}

// Cross-tab session synchronization
export function useSessionSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'persist:iot-platform-root' && e.newValue !== e.oldValue) {
        // Auth state changed in another tab
        if (e.newValue === null) {
          // User logged out in another tab
          dispatch(logout());
        } else {
          // Auth state updated in another tab - let Redux Persist handle it
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // Broadcast logout to other tabs
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('logout-broadcast', Date.now().toString());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleLogoutBroadcast = (e: StorageEvent) => {
      if (e.key === 'logout-broadcast') {
        dispatch(logout());
      }
    };

    window.addEventListener('storage', handleLogoutBroadcast);
    return () => window.removeEventListener('storage', handleLogoutBroadcast);
  }, [dispatch]);
}

// Auth initialization hook
export function useAuthInit() {
  const { user, tokens } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user has valid tokens on app init
    if (user && tokens?.refreshToken && !tokens?.accessToken) {
      // User data exists but no access token - likely expired
      // Try to refresh token
      handleTokenRefresh();
    }
  }, []);

  const handleTokenRefresh = async () => {
    if (!tokens?.refreshToken) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.ok) {
        const result = await response.json();
        dispatch(refreshTokenSuccess({
          tokens: result.tokens,
          user: result.user
        }));
      } else {
        // Refresh failed, logout user
        dispatch(logout());
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch(logout());
    }
  };
}
