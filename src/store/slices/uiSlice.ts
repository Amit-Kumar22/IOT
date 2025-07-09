import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface Sidebar {
  isCollapsed: boolean;
  isPinned: boolean;
  activeSection?: string;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  density: 'compact' | 'normal' | 'comfortable';
}

export interface UIState {
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Modals
  modals: Modal[];
  
  // Toast notifications
  toasts: Toast[];
  
  // Layout
  sidebar: Sidebar;
  
  // Theme
  theme: Theme;
  
  // Page states
  pageTitle: string;
  breadcrumbs: { label: string; href?: string }[];
  
  // Search
  globalSearch: {
    isOpen: boolean;
    query: string;
    results: any[];
    isLoading: boolean;
  };
  
  // Device status
  connectionStatus: 'online' | 'offline' | 'connecting';
  realTimeEnabled: boolean;
  
  // User preferences
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
  };
  
  // Error boundaries
  errors: {
    id: string;
    message: string;
    stack?: string;
    timestamp: string;
  }[];
}

const initialState: UIState = {
  globalLoading: false,
  loadingStates: {},
  modals: [],
  toasts: [],
  sidebar: {
    isCollapsed: false,
    isPinned: true,
  },
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6',
    density: 'normal',
  },
  pageTitle: '',
  breadcrumbs: [],
  globalSearch: {
    isOpen: false,
    query: '',
    results: [],
    isLoading: false,
  },
  connectionStatus: 'online',
  realTimeEnabled: true,
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    notifications: {
      email: true,
      push: true,
      desktop: false,
    },
  },
  errors: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const modal: Modal = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.modals.push(modal);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    // Toast notifications
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        duration: 5000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload;
    },
    setSidebarPinned: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isPinned = action.payload;
    },
    setActiveSidebarSection: (state, action: PayloadAction<string>) => {
      state.sidebar.activeSection = action.payload;
    },
    
    // Theme
    setThemeMode: (state, action: PayloadAction<Theme['mode']>) => {
      state.theme.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
    },
    setDensity: (state, action: PayloadAction<Theme['density']>) => {
      state.theme.density = action.payload;
    },
    
    // Page state
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<{ label: string; href?: string }[]>) => {
      state.breadcrumbs = action.payload;
    },
    
    // Global search
    setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.globalSearch.isOpen = action.payload;
    },
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearch.query = action.payload;
    },
    setGlobalSearchResults: (state, action: PayloadAction<any[]>) => {
      state.globalSearch.results = action.payload;
    },
    setGlobalSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.globalSearch.isLoading = action.payload;
    },
    
    // Connection and real-time
    setConnectionStatus: (state, action: PayloadAction<UIState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTimeEnabled = action.payload;
    },
    
    // User preferences
    setPreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setNotificationPreferences: (state, action: PayloadAction<Partial<UIState['preferences']['notifications']>>) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },
    
    // Error handling
    addError: (state, action: PayloadAction<{ message: string; stack?: string }>) => {
      state.errors.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
      
      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(-50);
      }
    },
    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    clearAllErrors: (state) => {
      state.errors = [];
    },
  },
});

export const {
  setGlobalLoading,
  setLoading,
  clearLoading,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearAllToasts,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarPinned,
  setActiveSidebarSection,
  setThemeMode,
  setPrimaryColor,
  setDensity,
  setPageTitle,
  setBreadcrumbs,
  setGlobalSearchOpen,
  setGlobalSearchQuery,
  setGlobalSearchResults,
  setGlobalSearchLoading,
  setConnectionStatus,
  setRealTimeEnabled,
  setPreferences,
  setNotificationPreferences,
  addError,
  removeError,
  clearAllErrors,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectLoadingState = (key: string) => (state: { ui: UIState }) => 
  state.ui.loadingStates[key] || false;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectSidebar = (state: { ui: UIState }) => state.ui.sidebar;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectGlobalSearch = (state: { ui: UIState }) => state.ui.globalSearch;
export const selectConnectionStatus = (state: { ui: UIState }) => state.ui.connectionStatus;
export const selectRealTimeEnabled = (state: { ui: UIState }) => state.ui.realTimeEnabled;
export const selectPreferences = (state: { ui: UIState }) => state.ui.preferences;
export const selectErrors = (state: { ui: UIState }) => state.ui.errors;

// Computed selectors
export const selectIsLoading = (state: { ui: UIState }) => {
  return state.ui.globalLoading || Object.values(state.ui.loadingStates).some(loading => loading);
};

export const selectCurrentModal = (state: { ui: UIState }) => {
  return state.ui.modals[state.ui.modals.length - 1] || null;
};

export const selectRecentErrors = (state: { ui: UIState }) => {
  return state.ui.errors.slice(-10);
};
