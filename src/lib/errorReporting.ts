/**
 * Error Reporting Service
 * Provides comprehensive error tracking, reporting, and analytics
 */

import { z } from 'zod';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  DEVICE_COMMUNICATION = 'device_communication',
  BUSINESS_LOGIC = 'business_logic',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown',
}

// Error context schema
const ErrorContextSchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  deviceId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  timestamp: z.number().positive(),
  url: z.string().optional(),
  method: z.string().optional(),
  statusCode: z.number().int().optional(),
  responseTime: z.number().positive().optional(),
  memoryUsage: z.number().positive().optional(),
  cpuUsage: z.number().min(0).max(100).optional(),
  additionalData: z.record(z.any()).optional(),
});

type ErrorContext = z.infer<typeof ErrorContextSchema>;

// Error report schema
const ErrorReportSchema = z.object({
  id: z.string().uuid(),
  message: z.string().min(1).max(1000),
  stack: z.string().optional(),
  severity: z.nativeEnum(ErrorSeverity),
  category: z.nativeEnum(ErrorCategory),
  source: z.string().min(1).max(100),
  context: ErrorContextSchema,
  tags: z.array(z.string()).optional(),
  fingerprint: z.string().optional(), // For grouping similar errors
  resolved: z.boolean().default(false),
  resolvedAt: z.number().positive().optional(),
  resolvedBy: z.string().uuid().optional(),
  occurrences: z.number().int().positive().default(1),
  firstOccurrence: z.number().positive(),
  lastOccurrence: z.number().positive(),
  metadata: z.record(z.any()).optional(),
});

type ErrorReport = z.infer<typeof ErrorReportSchema>;

// Error reporting configuration
const ErrorReportingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  endpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
  maxRetries: z.number().int().min(0).max(10).default(3),
  retryDelay: z.number().positive().default(1000),
  batchSize: z.number().int().min(1).max(100).default(10),
  flushInterval: z.number().positive().default(30000), // 30 seconds
  enableLocalStorage: z.boolean().default(true),
  maxLocalStorageSize: z.number().positive().default(1024 * 1024), // 1MB
  enableConsoleLogging: z.boolean().default(true),
  enableNetworkLogging: z.boolean().default(true),
  enablePerformanceTracking: z.boolean().default(true),
  enableUserTracking: z.boolean().default(true),
  enableDeviceTracking: z.boolean().default(true),
  sensitiveDataFields: z.array(z.string()).default(['password', 'token', 'apiKey']),
  ignoredErrors: z.array(z.string()).default([]),
  ignoredUrls: z.array(z.string()).default([]),
});

type ErrorReportingConfig = z.infer<typeof ErrorReportingConfigSchema>;

// Error reporting events
type ErrorReportingEvent = 'error' | 'sent' | 'failed' | 'batch_sent' | 'storage_full';

// Error reporting event listener
type ErrorReportingEventListener = (event: ErrorReportingEvent, data?: any) => void;

/**
 * Error Reporting Service
 * Comprehensive error tracking and reporting system
 */
export class ErrorReportingService {
  private config: ErrorReportingConfig;
  private errorQueue: ErrorReport[] = [];
  private eventListeners: Map<ErrorReportingEvent, ErrorReportingEventListener[]> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline = true;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = ErrorReportingConfigSchema.parse(config);
    this.initializeService();
  }

  /**
   * Initialize error reporting service
   */
  private initializeService(): void {
    if (!this.config.enabled) return;

    // Set up automatic flushing
    this.setupAutoFlush();

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    // Set up network monitoring
    this.setupNetworkMonitoring();

    // Load queued errors from local storage
    this.loadQueuedErrors();
  }

  /**
   * Set up automatic error queue flushing
   */
  private setupAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushErrors();
    }, this.config.flushInterval);
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle uncaught JavaScript errors
      window.addEventListener('error', (event) => {
        this.reportError(event.error || new Error(event.message), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          source: 'global_error_handler',
          context: {
            url: event.filename,
            additionalData: {
              line: event.lineno,
              column: event.colno,
            },
          },
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError(new Error(event.reason), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          source: 'unhandled_promise_rejection',
        });
      });
    }

    // Handle Node.js uncaught exceptions
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.reportError(error, {
          severity: ErrorSeverity.CRITICAL,
          category: ErrorCategory.UNKNOWN,
          source: 'uncaught_exception',
        });
      });

      process.on('unhandledRejection', (reason) => {
        this.reportError(new Error(String(reason)), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          source: 'unhandled_rejection',
        });
      });
    }
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined' && window.navigator) {
      // Monitor online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushErrors(); // Flush queued errors when back online
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      this.isOnline = window.navigator.onLine;
    }
  }

  /**
   * Load queued errors from local storage
   */
  private loadQueuedErrors(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return;

    try {
      const storedErrors = localStorage.getItem('error_reporting_queue');
      if (storedErrors) {
        const parsedErrors = JSON.parse(storedErrors) as ErrorReport[];
        this.errorQueue.push(...parsedErrors);
        localStorage.removeItem('error_reporting_queue');
      }
    } catch (error) {
      console.warn('Failed to load queued errors from local storage:', error);
    }
  }

  /**
   * Save queued errors to local storage
   */
  private saveQueuedErrors(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return;

    try {
      const serializedErrors = JSON.stringify(this.errorQueue);
      
      // Check storage size limit
      if (serializedErrors.length > this.config.maxLocalStorageSize) {
        // Remove oldest errors to stay within limit
        while (this.errorQueue.length > 0 && JSON.stringify(this.errorQueue).length > this.config.maxLocalStorageSize) {
          this.errorQueue.shift();
        }
        this.emitEvent('storage_full');
      }

      localStorage.setItem('error_reporting_queue', JSON.stringify(this.errorQueue));
    } catch (error) {
      console.warn('Failed to save queued errors to local storage:', error);
    }
  }

  /**
   * Generate error fingerprint for grouping
   */
  private generateFingerprint(error: Error, source: string): string {
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    const stackLines = stack.split('\n').slice(0, 5); // First 5 lines of stack
    
    return btoa(`${source}:${message}:${stackLines.join('|')}`);
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitizeContext(context: Partial<ErrorContext>): ErrorContext {
    const sanitized = { ...context };
    
    // Remove sensitive fields
    this.config.sensitiveDataFields.forEach(field => {
      if (sanitized.additionalData && sanitized.additionalData[field]) {
        sanitized.additionalData[field] = '[REDACTED]';
      }
    });

    return {
      timestamp: Date.now(),
      ...sanitized,
    };
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: Error, context: Partial<ErrorContext>): boolean {
    const message = error.message || '';
    
    // Check ignored error messages
    if (this.config.ignoredErrors.some(ignored => message.includes(ignored))) {
      return true;
    }

    // Check ignored URLs
    if (context.url && this.config.ignoredUrls.some(ignored => context.url!.includes(ignored))) {
      return true;
    }

    return false;
  }

  /**
   * Emit error reporting event
   */
  private emitEvent(event: ErrorReportingEvent, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error reporting event listener error:', error);
      }
    });
  }

  /**
   * Get system context information
   */
  private getSystemContext(): Partial<ErrorContext> {
    const context: Partial<ErrorContext> = {
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined') {
      context.userAgent = window.navigator.userAgent;
      context.url = window.location.href;
    }

    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      context.memoryUsage = memUsage.heapUsed;
    }

    return context;
  }

  /**
   * Report an error
   */
  reportError(
    error: Error | string,
    options: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      source?: string;
      context?: Partial<ErrorContext>;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): void {
    if (!this.config.enabled) return;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const systemContext = this.getSystemContext();
    const fullContext = { ...systemContext, ...options.context };

    // Check if error should be ignored
    if (this.shouldIgnoreError(errorObj, fullContext)) {
      return;
    }

    const source = options.source || 'unknown';
    const fingerprint = this.generateFingerprint(errorObj, source);
    const now = Date.now();

    // Check if we already have this error (by fingerprint)
    const existingError = this.errorQueue.find(e => e.fingerprint === fingerprint);
    
    if (existingError) {
      // Update existing error
      existingError.occurrences++;
      existingError.lastOccurrence = now;
      existingError.context = this.sanitizeContext(fullContext);
    } else {
      // Create new error report
      const errorReport: ErrorReport = {
        id: crypto.randomUUID(),
        message: errorObj.message || 'Unknown error',
        stack: errorObj.stack,
        severity: options.severity || ErrorSeverity.MEDIUM,
        category: options.category || ErrorCategory.UNKNOWN,
        source,
        context: this.sanitizeContext(fullContext),
        tags: options.tags,
        fingerprint,
        resolved: false,
        occurrences: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        metadata: options.metadata,
      };

      this.errorQueue.push(errorReport);
    }

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      console.error('Error reported:', errorObj);
    }

    // Save to local storage
    this.saveQueuedErrors();

    // Emit event
    this.emitEvent('error', { error: errorObj, options });

    // Try to flush if we have enough errors or if critical
    if (this.errorQueue.length >= this.config.batchSize || 
        options.severity === ErrorSeverity.CRITICAL) {
      this.flushErrors();
    }
  }

  /**
   * Flush queued errors to remote endpoint
   */
  async flushErrors(): Promise<void> {
    if (!this.config.enabled || !this.config.endpoint || !this.isOnline) {
      return;
    }

    if (this.errorQueue.length === 0) {
      return;
    }

    const errorsToSend = this.errorQueue.splice(0, this.config.batchSize);
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.emitEvent('batch_sent', { count: errorsToSend.length });
    } catch (error) {
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errorsToSend);
      this.emitEvent('failed', { error, count: errorsToSend.length });
      
      // Save to local storage for later retry
      this.saveQueuedErrors();
    }
  }

  /**
   * Get error statistics
   */
  getStats(): {
    queueLength: number;
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorReport[];
  } {
    const totalErrors = this.errorQueue.reduce((sum, error) => sum + error.occurrences, 0);
    
    const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = this.errorQueue
        .filter(error => error.category === category)
        .reduce((sum, error) => sum + error.occurrences, 0);
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errorQueue
        .filter(error => error.severity === severity)
        .reduce((sum, error) => sum + error.occurrences, 0);
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const recentErrors = this.errorQueue
      .sort((a, b) => b.lastOccurrence - a.lastOccurrence)
      .slice(0, 10);

    return {
      queueLength: this.errorQueue.length,
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      recentErrors,
    };
  }

  /**
   * Clear error queue
   */
  clearQueue(): void {
    this.errorQueue = [];
    if (this.config.enableLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.removeItem('error_reporting_queue');
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event: ErrorReportingEvent, listener: ErrorReportingEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: ErrorReportingEvent, listener: ErrorReportingEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = ErrorReportingConfigSchema.parse({ ...this.config, ...newConfig });
    if (this.config.enabled) {
      this.initializeService();
    }
  }

  /**
   * Destroy service
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush before destroying
    this.flushErrors();
    
    this.eventListeners.clear();
    this.clearQueue();
  }
}

// Default error reporting instance
export const errorReporter = new ErrorReportingService();

// Utility functions
export const errorUtils = {
  /**
   * Report validation error
   */
  reportValidationError(
    field: string,
    message: string,
    context?: Partial<ErrorContext>
  ): void {
    errorReporter.reportError(new Error(`Validation error: ${field} - ${message}`), {
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.VALIDATION,
      source: 'validation',
      context,
      tags: ['validation', field],
    });
  },

  /**
   * Report authentication error
   */
  reportAuthError(message: string, context?: Partial<ErrorContext>): void {
    errorReporter.reportError(new Error(message), {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.AUTHENTICATION,
      source: 'auth',
      context,
      tags: ['auth'],
    });
  },

  /**
   * Report network error
   */
  reportNetworkError(
    url: string,
    statusCode: number,
    message: string,
    context?: Partial<ErrorContext>
  ): void {
    errorReporter.reportError(new Error(`Network error: ${message}`), {
      severity: statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      category: ErrorCategory.NETWORK,
      source: 'network',
      context: {
        ...context,
        url,
        statusCode,
      },
      tags: ['network', `status-${statusCode}`],
    });
  },

  /**
   * Report device communication error
   */
  reportDeviceError(
    deviceId: string,
    message: string,
    context?: Partial<ErrorContext>
  ): void {
    errorReporter.reportError(new Error(`Device error: ${message}`), {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.DEVICE_COMMUNICATION,
      source: 'device',
      context: {
        ...context,
        deviceId,
      },
      tags: ['device', deviceId],
    });
  },

  /**
   * Report performance issue
   */
  reportPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    context?: Partial<ErrorContext>
  ): void {
    errorReporter.reportError(new Error(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`), {
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.PERFORMANCE,
      source: 'performance',
      context: {
        ...context,
        responseTime: duration,
        additionalData: {
          operation,
          threshold,
        },
      },
      tags: ['performance', operation],
    });
  },

  /**
   * Create error reporting decorator
   */
  withErrorReporting<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      source?: string;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      tags?: string[];
    } = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result && typeof result.catch === 'function') {
          return result.catch((error: Error) => {
            errorReporter.reportError(error, {
              severity: options.severity || ErrorSeverity.MEDIUM,
              category: options.category || ErrorCategory.UNKNOWN,
              source: options.source || fn.name || 'decorated_function',
              tags: options.tags,
            });
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        errorReporter.reportError(error as Error, {
          severity: options.severity || ErrorSeverity.MEDIUM,
          category: options.category || ErrorCategory.UNKNOWN,
          source: options.source || fn.name || 'decorated_function',
          tags: options.tags,
        });
        throw error;
      }
    }) as T;
  },
};

// Export types
export type {
  ErrorReport,
  ErrorContext,
  ErrorReportingConfig,
  ErrorReportingEvent,
  ErrorReportingEventListener,
};
