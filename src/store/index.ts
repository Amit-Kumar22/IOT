import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import deviceSlice from './slices/deviceSlice';
import billingSlice from './slices/billingSlice';
import uiSlice from './slices/uiSlice';
import { authApi } from './api/authApi';
import { deviceApi } from './api/deviceApi';
import { billingApi } from './api/billingApi';
import { analyticsApi } from './api/analyticsApi';

export const store = configureStore({
  reducer: {
    // State slices
    auth: authSlice,
    device: deviceSlice,
    billing: billingSlice,
    ui: uiSlice,
    // API slices
    [authApi.reducerPath]: authApi.reducer,
    [deviceApi.reducerPath]: deviceApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // RTK Query actions that contain non-serializable data
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      },
    }).concat(
      authApi.middleware,
      deviceApi.middleware,
      billingApi.middleware,
      analyticsApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
