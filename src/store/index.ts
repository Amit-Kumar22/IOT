import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import deviceSlice from './slices/deviceSlice';
import billingSlice from './slices/billingSlice';
import uiSlice from './slices/uiSlice';
import { authApi } from './api/authApi';
import { deviceApi } from './api/deviceApi';
import { billingApi } from './api/billingApi';
import { analyticsApi } from './api/analyticsApi';

// Redux Persist configuration
const persistConfig = {
  key: 'iot-platform-root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth slice
  blacklist: ['ui'], // Don't persist UI state
};

// Auth-specific persist config with token refresh handling
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'refreshToken'], // Persist user data but not access token for security
  blacklist: ['accessToken', 'loading', 'error'], // Don't persist temporary states
};

// Combine reducers
const rootReducer = combineReducers({
  // State slices with persistence
  auth: persistReducer(authPersistConfig, authSlice),
  device: deviceSlice,
  billing: billingSlice,
  ui: uiSlice,
  // API slices (not persisted)
  [authApi.reducerPath]: authApi.reducer,
  [deviceApi.reducerPath]: deviceApi.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Redux Persist actions
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        ignoredPaths: ['persist'],
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

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
