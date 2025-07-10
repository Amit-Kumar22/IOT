/**
 * Test utilities for Redux and component testing
 */

import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authSlice from '@/store/slices/authSlice';
import deviceSlice from '@/store/slices/deviceSlice';
import billingSlice from '@/store/slices/billingSlice';
import uiSlice from '@/store/slices/uiSlice';

// Simple test store without persistence
export function createTestStore(preloadedState: any = {}) {
  const store = configureStore({
    reducer: {
      auth: authSlice,
      device: deviceSlice,
      billing: billingSlice,
      ui: uiSlice,
    } as any,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
  return store;
}

// This type interface extends the default options for render from RTL
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<object>): React.ReactElement {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock store for simpler tests
export const createMockStore = (initialState: any = {}) => {
  const defaultState = {
    auth: {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionId: undefined,
      lastActivity: undefined,
      ...initialState.auth,
    },
    device: {
      devices: [],
      selectedDevice: null,
      loading: false,
      error: null,
      ...initialState.device,
    },
    billing: {
      currentPlan: null,
      usage: null,
      invoices: [],
      loading: false,
      error: null,
      ...initialState.billing,
    },
    ui: {
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      ...initialState.ui,
    },
    ...initialState,
  };

  return createTestStore(defaultState);
};
