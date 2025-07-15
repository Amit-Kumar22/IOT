/**
 * Core API Client for IoT Platform
 * Provides HTTP client with retry logic, auth injection, error handling, and real-time capabilities
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { apiConfig, isDevelopment } from './config';
import { ApiResponse, ApiError, MqttConfig, WebSocketMessage } from '@/types/api';
import CryptoJS from 'crypto-js';

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  authHeader?: string;
  encryptionKey?: string;
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: apiConfig.baseUrl,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Request retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Default retry condition - retry on network errors and 5xx server errors
const defaultRetryCondition = (error: AxiosError): boolean => {
  return !error.response || (error.response.status >= 500);
};

/**
 * Core API Client Class
 */
export class ApiClient {
  private instance: AxiosInstance;
  private config: ApiClientConfig;
  private authToken?: string;
  private refreshToken?: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create axios instance with base configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': process.env.npm_package_version || '1.0.0',
        'X-Environment': process.env.NODE_ENV || 'development',
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and request signing
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add timestamp
        config.headers['X-Timestamp'] = new Date().toISOString();

        // Sign request if encryption key is provided
        if (this.config.encryptionKey && config.data) {
          config.headers['X-Signature'] = this.signRequest(config.data);
        }

        // Log request in development
        if (isDevelopment) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
            headers: config.headers,
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (isDevelopment) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAuthToken();
            this.authToken = newToken;
            this.processFailedQueue(newToken, null);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processFailedQueue(null, refreshError);
            this.clearAuth();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Retry logic for network errors and 5xx errors
        if (this.shouldRetry(error)) {
          return this.retryRequest(originalRequest, error);
        }

        // Log error in development
        if (isDevelopment) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };
    const retryCount = config.retryCount || 0;
    
    return retryCount < this.config.retryAttempts && defaultRetryCondition(error);
  }

  /**
   * Retry failed request
   */
  private async retryRequest(
    config: InternalAxiosRequestConfig & { retryCount?: number },
    error: AxiosError
  ): Promise<AxiosResponse> {
    config.retryCount = (config.retryCount || 0) + 1;
    
    // Exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, config.retryCount - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.instance(config);
  }

  /**
   * Process failed queue after token refresh
   */
  private processFailedQueue(token: string | null, error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.instance.post('/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    return response.data.data.accessToken;
  }

  /**
   * Transform axios error to standardized API error
   */
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        code: data?.code || `HTTP_${error.response.status}`,
        message: data?.message || error.message,
        details: {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
          method: error.config?.method,
        },
      };
    } else if (error.request) {
      // Request was made but no response received - this includes network errors
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - no response received',
        details: {
          url: error.config?.url,
          method: error.config?.method,
        },
      };
    } else {
      // Something else happened
      return {
        code: 'REQUEST_ERROR',
        message: error.message,
        details: {
          url: error.config?.url,
          method: error.config?.method,
        },
      };
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sign request for security
   */
  private signRequest(data: any): string {
    if (!this.config.encryptionKey) return '';
    
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.HmacSHA256(payload, this.config.encryptionKey).toString();
  }

  /**
   * Set authentication tokens
   */
  public setAuthTokens(accessToken: string, refreshToken?: string): void {
    this.authToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  /**
   * Clear authentication
   */
  public clearAuth(): void {
    this.authToken = undefined;
    this.refreshToken = undefined;
  }

  /**
   * GET request
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get(endpoint, { params, ...config });
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post(endpoint, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put(endpoint, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(endpoint, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(endpoint, config);
    return response.data;
  }

  /**
   * Upload file
   */
  public async upload<T = any>(
    endpoint: string,
    file: File,
    onProgress?: (progressEvent: any) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const response = await this.instance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    
    return response.data;
  }

  /**
   * Download file
   */
  public async download(
    endpoint: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.instance.get(endpoint, {
      ...config,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download', 
      filename || this.extractFilenameFromResponse(response) || 'download'
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Extract filename from response headers
   */
  private extractFilenameFromResponse(response: AxiosResponse): string | null {
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      return match ? match[1] : null;
    }
    return null;
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    // Create new axios instance to effectively cancel all requests
    this.instance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Get instance for direct axios access if needed
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * API Endpoints Configuration
 */
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },

  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    preferences: '/users/preferences',
    notifications: '/users/notifications',
    sessions: '/users/sessions',
    devices: '/users/devices',
  },

  // Devices
  devices: {
    list: '/devices',
    create: '/devices',
    get: (id: string) => `/devices/${id}`,
    update: (id: string) => `/devices/${id}`,
    delete: (id: string) => `/devices/${id}`,
    control: (id: string) => `/devices/${id}/control`,
    status: (id: string) => `/devices/${id}/status`,
    history: (id: string) => `/devices/${id}/history`,
    firmware: (id: string) => `/devices/${id}/firmware`,
    diagnostics: (id: string) => `/devices/${id}/diagnostics`,
    
    // Device groups
    groups: '/devices/groups',
    createGroup: '/devices/groups',
    updateGroup: (id: string) => `/devices/groups/${id}`,
    deleteGroup: (id: string) => `/devices/groups/${id}`,
    addToGroup: (groupId: string, deviceId: string) => `/devices/groups/${groupId}/devices/${deviceId}`,
    removeFromGroup: (groupId: string, deviceId: string) => `/devices/groups/${groupId}/devices/${deviceId}`,
  },

  // Billing
  billing: {
    usage: '/billing/usage',
    plans: '/billing/plans',
    subscription: '/billing/subscription',
    invoices: '/billing/invoices',
    invoice: (id: string) => `/billing/invoices/${id}`,
    paymentMethods: '/billing/payment-methods',
    addPaymentMethod: '/billing/payment-methods',
    deletePaymentMethod: (id: string) => `/billing/payment-methods/${id}`,
    processPayment: '/billing/process-payment',
    estimateCost: '/billing/estimate',
  },

  // Analytics
  analytics: {
    energy: '/analytics/energy',
    usage: '/analytics/usage',
    trends: '/analytics/trends',
    reports: '/analytics/reports',
    export: '/analytics/export',
    dashboard: '/analytics/dashboard',
    insights: '/analytics/insights',
  },

  // Automation
  automation: {
    rules: '/automation/rules',
    createRule: '/automation/rules',
    updateRule: (id: string) => `/automation/rules/${id}`,
    deleteRule: (id: string) => `/automation/rules/${id}`,
    enableRule: (id: string) => `/automation/rules/${id}/enable`,
    disableRule: (id: string) => `/automation/rules/${id}/disable`,
    schedules: '/automation/schedules',
    scenes: '/automation/scenes',
  },

  // Admin
  admin: {
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    devices: '/admin/devices',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
    logs: '/admin/logs',
    audit: '/admin/audit',
  },

  // System
  system: {
    health: '/health',
    info: '/info',
    version: '/version',
    status: '/status',
  },
} as const;

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Utility function to create API client with custom config
 */
export const createApiClient = (config: Partial<ApiClientConfig>): ApiClient => {
  return new ApiClient(config);
};

/**
 * Request cancellation utilities
 */
export class RequestCancellation {
  private static cancelTokens = new Map<string, AbortController>();

  static createCancelToken(key: string): AbortSignal {
    // Cancel existing request with same key
    this.cancel(key);
    
    const controller = new AbortController();
    this.cancelTokens.set(key, controller);
    
    return controller.signal;
  }

  static cancel(key: string): void {
    const controller = this.cancelTokens.get(key);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(key);
    }
  }

  static cancelAll(): void {
    this.cancelTokens.forEach((controller) => controller.abort());
    this.cancelTokens.clear();
  }
}

// Export types for convenience (avoid conflicts with types already exported from types/api.ts)
