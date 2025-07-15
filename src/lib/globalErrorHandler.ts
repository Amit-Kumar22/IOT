/**
 * Global Error Handling Middleware
 * Provides centralized error handling across the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorReporter, ErrorSeverity, ErrorCategory } from '../lib/errorReporting';
import { performanceMonitor, MetricType } from '../lib/performance';

// Error handler configuration
interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enablePerformanceTracking: boolean;
  enableStackTrace: boolean;
  enableUserContext: boolean;
  sensitiveFields: string[];
  ignoredErrors: string[];
  rateLimitWindow: number; // ms
  rateLimitMax: number;
}

// Default configuration
const defaultConfig: ErrorHandlerConfig = {
  enableLogging: true,
  enableReporting: true,
  enablePerformanceTracking: true,
  enableStackTrace: process.env.NODE_ENV === 'development',
  enableUserContext: true,
  sensitiveFields: ['password', 'token', 'apiKey', 'secret'],
  ignoredErrors: ['AbortError', 'NetworkError'],
  rateLimitWindow: 60000, // 1 minute
  rateLimitMax: 10,
};

// Error context interface
interface ErrorContext {
  url?: string;
  method?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

// Rate limiting storage
const errorRateLimit = new Map<string, { count: number; resetTime: number }>();

/**
 * Global Error Handler Class
 * Centralized error handling with context, rate limiting, and reporting
 */
export class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCounts = new Map<string, number>();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initializeGlobalHandlers();
  }

  /**
   * Initialize global error handlers
   */
  private initializeGlobalHandlers(): void {
    // Browser global error handlers
    if (typeof window !== 'undefined') {
      // Unhandled JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleError(
          event.error || new Error(event.message),
          this.createBrowserContext(event)
        );
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          new Error(event.reason),
          this.createBrowserContext()
        );
      });

      // Resource loading errors
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.handleResourceError(event);
        }
      }, true);
    }

    // Node.js global error handlers
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.handleError(error, this.createNodeContext(), ErrorSeverity.CRITICAL);
      });

      process.on('unhandledRejection', (reason, promise) => {
        this.handleError(
          new Error(`Unhandled rejection: ${reason}`),
          this.createNodeContext(),
          ErrorSeverity.HIGH
        );
      });
    }
  }

  /**
   * Create browser error context
   */
  private createBrowserContext(event?: ErrorEvent): ErrorContext {
    const context: ErrorContext = {
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined') {
      context.url = window.location.href;
      context.userAgent = window.navigator.userAgent;
    }

    if (event) {
      context.additionalData = {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      };
    }

    return context;
  }

  /**
   * Create Node.js error context
   */
  private createNodeContext(): ErrorContext {
    return {
      timestamp: Date.now(),
      additionalData: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  /**
   * Handle resource loading errors
   */
  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const source = target.getAttribute('src') || target.getAttribute('href') || 'unknown';

    this.handleError(
      new Error(`Resource loading failed: ${tagName} - ${source}`),
      {
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        additionalData: {
          resourceType: tagName,
          resourceSource: source,
        },
      },
      ErrorSeverity.LOW,
      ErrorCategory.NETWORK
    );
  }

  /**
   * Sanitize error context
   */
  private sanitizeContext(context: ErrorContext): ErrorContext {
    const sanitized = { ...context };

    if (sanitized.additionalData) {
      this.config.sensitiveFields.forEach(field => {
        if (sanitized.additionalData![field]) {
          sanitized.additionalData![field] = '[REDACTED]';
        }
      });
    }

    return sanitized;
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: Error): boolean {
    const message = error.message || '';
    const name = error.name || '';

    return this.config.ignoredErrors.some(ignored => 
      message.includes(ignored) || name === ignored
    );
  }

  /**
   * Check rate limiting
   */
  private isRateLimited(errorKey: string): boolean {
    const now = Date.now();
    const entry = errorRateLimit.get(errorKey);

    if (!entry || now > entry.resetTime) {
      errorRateLimit.set(errorKey, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return false;
    }

    if (entry.count >= this.config.rateLimitMax) {
      return true;
    }

    entry.count++;
    return false;
  }

  /**
   * Generate error fingerprint for rate limiting
   */
  private generateErrorKey(error: Error, context: ErrorContext): string {
    const message = error.message || 'unknown';
    const stack = error.stack?.split('\n').slice(0, 3).join('|') || '';
    const url = context.url || 'unknown';
    
    return btoa(`${message}:${stack}:${url}`);
  }

  /**
   * Main error handling method
   */
  handleError(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): void {
    // Skip ignored errors
    if (this.shouldIgnoreError(error)) {
      return;
    }

    // Check rate limiting
    const errorKey = this.generateErrorKey(error, context);
    if (this.isRateLimited(errorKey)) {
      return;
    }

    // Sanitize context
    const sanitizedContext = this.sanitizeContext(context);

    // Log error if enabled
    if (this.config.enableLogging) {
      this.logError(error, sanitizedContext, severity);
    }

    // Report error if enabled
    if (this.config.enableReporting) {
      this.reportError(error, sanitizedContext, severity, category);
    }

    // Track performance impact if enabled
    if (this.config.enablePerformanceTracking) {
      this.trackErrorPerformance(error, severity);
    }

    // Update error counts
    this.updateErrorCounts(error, severity);
  }

  /**
   * Log error to console
   */
  private logError(error: Error, context: ErrorContext, severity: ErrorSeverity): void {
    const logMethod = severity === ErrorSeverity.CRITICAL ? 'error' : 
                     severity === ErrorSeverity.HIGH ? 'error' :
                     severity === ErrorSeverity.MEDIUM ? 'warn' : 'log';

    console.group(`🚨 Global Error Handler - ${severity.toUpperCase()}`);
    console[logMethod]('Error:', error.message);
    
    if (this.config.enableStackTrace && error.stack) {
      console[logMethod]('Stack:', error.stack);
    }
    
    console.log('Context:', context);
    console.groupEnd();
  }

  /**
   * Report error to external service
   */
  private reportError(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity,
    category: ErrorCategory
  ): void {
    errorReporter.reportError(error, {
      severity,
      category,
      source: 'global_error_handler',
      context: {
        timestamp: context.timestamp,
        url: context.url,
        userAgent: context.userAgent,
        userId: context.userId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        additionalData: context.additionalData,
      },
      tags: ['global', 'unhandled'],
    });
  }

  /**
   * Track error performance impact
   */
  private trackErrorPerformance(error: Error, severity: ErrorSeverity): void {
    performanceMonitor.recordMetric('global_error_count', 1, MetricType.COUNTER, {
      severity: severity.toString(),
      error_type: error.name,
    });

    // Track critical errors separately
    if (severity === ErrorSeverity.CRITICAL) {
      performanceMonitor.recordMetric('critical_error_count', 1, MetricType.COUNTER);
    }
  }

  /**
   * Update error statistics
   */
  private updateErrorCounts(error: Error, severity: ErrorSeverity): void {
    const key = `${severity}:${error.name}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: Array<{ error: string; count: number; severity: string }>;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    const recentErrors: Array<{ error: string; count: number; severity: string }> = [];

    this.errorCounts.forEach((count, key) => {
      const [severity, errorType] = key.split(':');
      
      errorsByType[errorType] = (errorsByType[errorType] || 0) + count;
      errorsBySeverity[severity as ErrorSeverity] += count;
      
      recentErrors.push({
        error: errorType,
        count,
        severity,
      });
    });

    // Sort recent errors by count (descending)
    recentErrors.sort((a, b) => b.count - a.count);

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      recentErrors: recentErrors.slice(0, 10),
    };
  }

  /**
   * Clear error statistics
   */
  clearStats(): void {
    this.errorCounts.clear();
    errorRateLimit.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Next.js Middleware for API error handling
 */
export function createErrorMiddleware(config?: Partial<ErrorHandlerConfig>) {
  const errorHandler = new GlobalErrorHandler(config);

  return function errorMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
  ) {
    return async function wrappedHandler(req: NextRequest): Promise<NextResponse> {
      const startTime = performance.now();
      
      try {
        const response = await handler(req);
        
        // Track successful requests
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric('api_request_duration', duration, MetricType.TIMING, {
          method: req.method,
          success: 'true',
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        // Create error context from request
        const context: ErrorContext = {
          timestamp: Date.now(),
          url: req.url,
          method: req.method,
          userAgent: req.headers.get('user-agent') || undefined,
          requestId: req.headers.get('x-request-id') || undefined,
          additionalData: {
            requestDuration: duration,
            headers: Object.fromEntries(req.headers.entries()),
          },
        };

        // Handle the error
        errorHandler.handleError(
          error as Error,
          context,
          ErrorSeverity.HIGH,
          ErrorCategory.EXTERNAL_SERVICE
        );

        // Track failed requests
        performanceMonitor.recordMetric('api_request_duration', duration, MetricType.TIMING, {
          method: req.method,
          success: 'false',
        });

        // Return error response
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
            timestamp: Date.now(),
            requestId: context.requestId,
          },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * React component error handler hook
 */
export function useGlobalErrorHandler() {
  const errorHandler = React.useMemo(() => new GlobalErrorHandler(), []);

  const handleError = React.useCallback((
    error: Error,
    context?: Partial<ErrorContext>,
    severity?: ErrorSeverity,
    category?: ErrorCategory
  ) => {
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...context,
    };

    errorHandler.handleError(error, fullContext, severity, category);
  }, [errorHandler]);

  const getStats = React.useCallback(() => {
    return errorHandler.getErrorStats();
  }, [errorHandler]);

  const clearStats = React.useCallback(() => {
    errorHandler.clearStats();
  }, [errorHandler]);

  return {
    handleError,
    getStats,
    clearStats,
  };
}

/**
 * Error handling decorator for functions
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    context?: Partial<ErrorContext>;
  } = {}
): T {
  const errorHandler = new GlobalErrorHandler();

  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          errorHandler.handleError(
            error,
            {
              timestamp: Date.now(),
              ...options.context,
            },
            options.severity,
            options.category
          );
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          timestamp: Date.now(),
          ...options.context,
        },
        options.severity,
        options.category
      );
      throw error;
    }
  }) as T;
}

// Default global error handler instance
export const globalErrorHandler = new GlobalErrorHandler();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Additional browser-specific error handling
  window.addEventListener('beforeunload', () => {
    // Flush any pending error reports before page unload
    errorReporter.flushErrors();
  });
}

// React import for hooks
let React: any;
try {
  React = require('react');
} catch (e) {
  // React not available
}

// Export types
export type {
  ErrorHandlerConfig,
  ErrorContext,
};
