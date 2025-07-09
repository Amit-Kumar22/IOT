/**
 * API types and interfaces for IoT platform
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  pagination?: Pagination;
  totalCount?: number;
  requestId?: string;
  rateLimit?: RateLimit;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiRequestParams extends PaginationParams, FilterParams {
  include?: string[];
  fields?: string[];
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Endpoints
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  authenticated?: boolean;
  roles?: string[];
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// WebSocket Types
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  id?: string;
  timestamp: string;
}

export interface WebSocketEvent {
  event: string;
  data: unknown;
  room?: string;
}

// Real-time data types
export interface DeviceDataPoint {
  deviceId: string;
  sensor: string;
  value: number | string | boolean;
  unit?: string;
  timestamp: string;
  quality?: DataQuality;
}

export type DataQuality = 'good' | 'uncertain' | 'bad';

export interface DeviceStatusUpdate {
  deviceId: string;
  status: string;
  lastSeen: string;
  batteryLevel?: number;
  signalStrength?: number;
}

// MQTT Types
export interface MqttMessage {
  topic: string;
  payload: Buffer | string;
  qos: 0 | 1 | 2;
  retain: boolean;
  timestamp: string;
}

export interface MqttConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive: number;
  clean: boolean;
  reconnectPeriod: number;
  connectTimeout: number;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

// Analytics Types
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AggregatedData {
  period: string;
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  percentiles?: Record<string, number>;
}

export interface QueryParams {
  startTime?: string;
  endTime?: string;
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy?: string[];
}

// Search Types
export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  query: string;
  executionTime: number;
}

export interface SearchFacet {
  field: string;
  values: SearchFacetValue[];
}

export interface SearchFacetValue {
  value: string;
  count: number;
}

// Validation Types
export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: string;
  accessedAt: string;
  hitCount: number;
}

// Feature Flag Types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions?: FeatureFlagCondition[];
  rolloutPercentage?: number;
  metadata?: Record<string, unknown>;
}

export interface FeatureFlagCondition {
  field: string;
  operator: string;
  value: unknown;
}
