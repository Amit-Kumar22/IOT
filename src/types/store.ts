/**
 * Redux store types and utilities
 */

import { store } from '@/store';

// Infer the type of makeStore
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Generic async thunk state
export interface AsyncThunkState {
  loading: boolean;
  error: string | null;
  lastFetch?: string;
}

// Common slice state patterns
export interface EntityState<T> extends AsyncThunkState {
  entities: Record<string, T>;
  ids: string[];
}

export interface ListState<T> extends AsyncThunkState {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedState<T> extends AsyncThunkState {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// RTK Query types
export interface BaseQueryResult<T = unknown> {
  data?: T;
  error?: {
    status: number;
    data: unknown;
  };
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

export interface MutationResult<T = unknown> {
  data?: T;
  error?: {
    status: number;
    data: unknown;
  };
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

// Form state types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: Record<string, string>;
}

// UI state types
export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: unknown;
  props?: Record<string, unknown>;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  createdAt: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface LoadingState {
  global: boolean;
  operations: Record<string, boolean>;
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

// Navigation state
export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  breadcrumbs: Breadcrumb[];
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

export interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
}

// Search state
export interface SearchState<T = unknown> {
  query: string;
  results: T[];
  totalResults: number;
  isSearching: boolean;
  filters: Record<string, unknown>;
  suggestions: string[];
  recentSearches: string[];
}

// Filter state
export interface FilterState {
  activeFilters: Record<string, unknown>;
  availableFilters: FilterOption[];
  presets: FilterPreset[];
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault?: boolean;
}

// Table state
export interface TableState<T = unknown> {
  data: T[];
  loading: boolean;
  error?: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sorting: {
    field?: string;
    direction: 'asc' | 'desc';
  };
  selection: {
    selectedIds: string[];
    allSelected: boolean;
    indeterminate: boolean;
  };
  filters: Record<string, unknown>;
}

// Chart state
export interface ChartState {
  data: ChartDataPoint[];
  loading: boolean;
  error?: string;
  config: ChartConfig;
  timeRange: TimeRange;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  series?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title?: string;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: LegendConfig;
  colors?: string[];
  responsive?: boolean;
}

export interface AxisConfig {
  title?: string;
  min?: number;
  max?: number;
  format?: string;
  tickCount?: number;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TimeRange {
  start: string;
  end: string;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

// Preferences state
export interface PreferencesState {
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  tables: TablePreferences;
  charts: ChartPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
  types: Record<string, boolean>;
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: DashboardWidget[];
  refreshInterval: number;
  autoRefresh: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, unknown>;
  visible: boolean;
}

export interface TablePreferences {
  pageSize: number;
  density: 'compact' | 'standard' | 'comfortable';
  showGridLines: boolean;
  stickyHeader: boolean;
}

export interface ChartPreferences {
  theme: 'light' | 'dark';
  animations: boolean;
  tooltips: boolean;
  zoom: boolean;
  defaultTimeRange: string;
}
