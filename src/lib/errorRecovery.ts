/**
 * Error Recovery Mechanisms
 * Provides automated error recovery strategies and user-friendly error handling
 */

import { errorReporter, ErrorSeverity, ErrorCategory } from './errorReporting';
import { performanceMonitor, MetricType } from './performance';
import { cache } from './cache';
import { secureLocalStorage } from './storage';

// Recovery strategy types
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CACHE = 'cache',
  OFFLINE = 'offline',
  REFRESH = 'refresh',
  REDIRECT = 'redirect',
  RESET = 'reset',
}

// Recovery configuration
interface RecoveryConfig {
  strategy: RecoveryStrategy;
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  fallbackData?: any;
  fallbackUrl?: string;
  cacheKey?: string;
  condition?: (error: Error, attempt: number) => boolean;
  onSuccess?: (result: any, attempt: number) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

// Recovery result
interface RecoveryResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  strategy: RecoveryStrategy;
  attempts: number;
  duration: number;
}

// Error context for recovery
interface ErrorRecoveryContext {
  operationName: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Error Recovery Manager
 * Handles automated error recovery with multiple strategies
 */
export class ErrorRecoveryManager {
  private recoveryAttempts = new Map<string, number>();
  private recoveryTimestamps = new Map<string, number>();
  private fallbackCache = new Map<string, any>();

  /**
   * Execute operation with automatic recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T> | T,
    recoveryConfigs: RecoveryConfig[],
    context: ErrorRecoveryContext
  ): Promise<RecoveryResult<T>> {
    const startTime = performance.now();
    const operationKey = this.generateOperationKey(context);
    
    let lastError: Error | null = null;
    let totalAttempts = 0;

    // Try each recovery strategy
    for (const config of recoveryConfigs) {
      const strategyResult = await this.executeStrategy(
        operation,
        config,
        context,
        operationKey
      );

      totalAttempts += strategyResult.attempts;

      if (strategyResult.success) {
        // Reset recovery attempts on success
        this.recoveryAttempts.delete(operationKey);
        this.recoveryTimestamps.delete(operationKey);

        // Track successful recovery
        performanceMonitor.recordMetric('error_recovery_success', 1, MetricType.COUNTER, {
          strategy: config.strategy,
          operation: context.operationName,
          attempts: String(totalAttempts),
        });

        return {
          success: true,
          data: strategyResult.data,
          strategy: config.strategy,
          attempts: totalAttempts,
          duration: performance.now() - startTime,
        };
      }

      lastError = strategyResult.error || lastError;
    }

    // All strategies failed
    const duration = performance.now() - startTime;
    
    // Track failed recovery
    performanceMonitor.recordMetric('error_recovery_failure', 1, MetricType.COUNTER, {
      operation: context.operationName,
      total_attempts: String(totalAttempts),
    });

    // Report the final error
    if (lastError) {
      errorReporter.reportError(lastError, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.BUSINESS_LOGIC,
        source: 'error_recovery_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            operationName: context.operationName,
            totalAttempts,
            duration,
            strategiesAttempted: recoveryConfigs.map(c => c.strategy),
          },
        },
        tags: ['error_recovery', 'failure'],
      });
    }

    return {
      success: false,
      error: lastError || new Error('All recovery strategies failed'),
      strategy: recoveryConfigs[recoveryConfigs.length - 1]?.strategy || RecoveryStrategy.RETRY,
      attempts: totalAttempts,
      duration,
    };
  }

  /**
   * Execute a specific recovery strategy
   */
  private async executeStrategy<T>(
    operation: () => Promise<T> | T,
    config: RecoveryConfig,
    context: ErrorRecoveryContext,
    operationKey: string
  ): Promise<RecoveryResult<T>> {
    const startTime = performance.now();
    let attempts = 0;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      attempts++;

      try {
        // Check if we should attempt recovery
        if (config.condition && !config.condition(lastError || new Error(), attempt)) {
          break;
        }

        let result: T;

        switch (config.strategy) {
          case RecoveryStrategy.RETRY:
            result = await this.executeRetry(operation, attempt, config);
            break;
          
          case RecoveryStrategy.FALLBACK:
            result = await this.executeFallback(operation, config);
            break;
          
          case RecoveryStrategy.CACHE:
            result = await this.executeCache(operation, config, context);
            break;
          
          case RecoveryStrategy.OFFLINE:
            result = await this.executeOffline(operation, config, context);
            break;
          
          case RecoveryStrategy.REFRESH:
            result = await this.executeRefresh(operation);
            break;
          
          case RecoveryStrategy.REDIRECT:
            result = await this.executeRedirect(config);
            break;
          
          case RecoveryStrategy.RESET:
            result = await this.executeReset(operation, config, context);
            break;
          
          default:
            result = await operation();
        }

        // Success
        if (config.onSuccess) {
          config.onSuccess(result, attempt);
        }

        return {
          success: true,
          data: result,
          strategy: config.strategy,
          attempts,
          duration: performance.now() - startTime,
        };

      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry (except on last attempt)
        if (attempt < config.maxAttempts) {
          const delay = this.calculateDelay(config, attempt);
          await this.sleep(delay);
        }
      }
    }

    // Strategy failed
    if (config.onFailure) {
      config.onFailure(lastError || new Error('Strategy failed'), attempts);
    }

    return {
      success: false,
      error: lastError || new Error(`${config.strategy} strategy failed`),
      strategy: config.strategy,
      attempts,
      duration: performance.now() - startTime,
    };
  }

  /**
   * Execute retry strategy
   */
  private async executeRetry<T>(
    operation: () => Promise<T> | T,
    attempt: number,
    config: RecoveryConfig
  ): Promise<T> {
    // Track retry attempt
    performanceMonitor.recordMetric('error_recovery_retry', 1, MetricType.COUNTER, {
      attempt: String(attempt),
    });

    return await operation();
  }

  /**
   * Execute fallback strategy
   */
  private async executeFallback<T>(
    operation: () => Promise<T> | T,
    config: RecoveryConfig
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Use fallback data if provided
      if (config.fallbackData !== undefined) {
        performanceMonitor.recordMetric('error_recovery_fallback_data', 1, MetricType.COUNTER);
        return config.fallbackData as T;
      }

      // Try fallback URL if provided
      if (config.fallbackUrl && typeof fetch !== 'undefined') {
        performanceMonitor.recordMetric('error_recovery_fallback_url', 1, MetricType.COUNTER);
        const response = await fetch(config.fallbackUrl);
        return await response.json() as T;
      }

      throw error;
    }
  }

  /**
   * Execute cache strategy
   */
  private async executeCache<T>(
    operation: () => Promise<T> | T,
    config: RecoveryConfig,
    context: ErrorRecoveryContext
  ): Promise<T> {
    const cacheKey = config.cacheKey || `recovery:${context.operationName}`;

    try {
      const result = await operation();
      // Cache the successful result
      cache.set(cacheKey, result, { ttl: 300000 }); // 5 minutes
      return result;
    } catch (error) {
      // Try to get from cache
      const cachedResult = cache.get<T>(cacheKey);
      if (cachedResult !== null) {
        performanceMonitor.recordMetric('error_recovery_cache_hit', 1, MetricType.COUNTER);
        return cachedResult;
      }

      performanceMonitor.recordMetric('error_recovery_cache_miss', 1, MetricType.COUNTER);
      throw error;
    }
  }

  /**
   * Execute offline strategy
   */
  private async executeOffline<T>(
    operation: () => Promise<T> | T,
    config: RecoveryConfig,
    context: ErrorRecoveryContext
  ): Promise<T> {
    try {
      const result = await operation();
      // Store in offline storage for future use
      const offlineKey = `offline:${context.operationName}`;
      secureLocalStorage.set(offlineKey, result, { expiry: Date.now() + 86400000 }); // 24 hours
      return result;
    } catch (error) {
      // Check if we're offline and have stored data
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline) {
        const offlineKey = `offline:${context.operationName}`;
        const offlineData = secureLocalStorage.get<T>(offlineKey);
        if (offlineData !== null) {
          performanceMonitor.recordMetric('error_recovery_offline_hit', 1, MetricType.COUNTER);
          return offlineData;
        }
      }

      performanceMonitor.recordMetric('error_recovery_offline_miss', 1, MetricType.COUNTER);
      throw error;
    }
  }

  /**
   * Execute refresh strategy
   */
  private async executeRefresh<T>(operation: () => Promise<T> | T): Promise<T> {
    if (typeof window !== 'undefined') {
      performanceMonitor.recordMetric('error_recovery_refresh', 1, MetricType.COUNTER);
      window.location.reload();
      // This will never resolve as the page reloads
      return new Promise(() => {});
    }
    
    return await operation();
  }

  /**
   * Execute redirect strategy
   */
  private async executeRedirect<T>(config: RecoveryConfig): Promise<T> {
    if (typeof window !== 'undefined' && config.fallbackUrl) {
      performanceMonitor.recordMetric('error_recovery_redirect', 1, MetricType.COUNTER);
      window.location.href = config.fallbackUrl;
      // This will never resolve as the page redirects
      return new Promise(() => {});
    }
    
    throw new Error('Redirect strategy requires fallbackUrl and browser environment');
  }

  /**
   * Execute reset strategy
   */
  private async executeReset<T>(
    operation: () => Promise<T> | T,
    config: RecoveryConfig,
    context: ErrorRecoveryContext
  ): Promise<T> {
    // Clear relevant caches and storage
    const resetKey = `reset:${context.operationName}`;
    cache.delete(resetKey);
    secureLocalStorage.remove(resetKey);
    this.fallbackCache.delete(resetKey);

    performanceMonitor.recordMetric('error_recovery_reset', 1, MetricType.COUNTER);
    
    // Try operation after reset
    return await operation();
  }

  /**
   * Calculate delay between retry attempts
   */
  private calculateDelay(config: RecoveryConfig, attempt: number): number {
    const baseDelay = config.delay || 1000;
    
    switch (config.backoff) {
      case 'exponential':
        return baseDelay * Math.pow(2, attempt - 1);
      case 'linear':
      default:
        return baseDelay * attempt;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate operation key for tracking
   */
  private generateOperationKey(context: ErrorRecoveryContext): string {
    return `${context.operationName}:${context.userId || 'anonymous'}:${context.sessionId || 'no-session'}`;
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    activeRecoveries: number;
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
  } {
    return {
      activeRecoveries: this.recoveryAttempts.size,
      totalAttempts: Array.from(this.recoveryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0),
      successfulRecoveries: 0, // Would need to track this separately
      failedRecoveries: 0, // Would need to track this separately
    };
  }

  /**
   * Clear recovery data
   */
  clearRecoveryData(): void {
    this.recoveryAttempts.clear();
    this.recoveryTimestamps.clear();
    this.fallbackCache.clear();
  }
}

/**
 * Utility functions for common recovery patterns
 */
export const recoveryUtils = {
  /**
   * Create retry-only recovery config
   */
  createRetryConfig(maxAttempts = 3, delay = 1000, backoff: 'linear' | 'exponential' = 'exponential'): RecoveryConfig {
    return {
      strategy: RecoveryStrategy.RETRY,
      maxAttempts,
      delay,
      backoff,
    };
  },

  /**
   * Create cache-first recovery config
   */
  createCacheConfig(cacheKey: string, maxAttempts = 1): RecoveryConfig {
    return {
      strategy: RecoveryStrategy.CACHE,
      maxAttempts,
      delay: 0,
      backoff: 'linear',
      cacheKey,
    };
  },

  /**
   * Create fallback recovery config
   */
  createFallbackConfig(fallbackData: any): RecoveryConfig {
    return {
      strategy: RecoveryStrategy.FALLBACK,
      maxAttempts: 1,
      delay: 0,
      backoff: 'linear',
      fallbackData,
    };
  },

  /**
   * Create offline-first recovery config
   */
  createOfflineConfig(maxAttempts = 1): RecoveryConfig {
    return {
      strategy: RecoveryStrategy.OFFLINE,
      maxAttempts,
      delay: 0,
      backoff: 'linear',
    };
  },

  /**
   * Create comprehensive recovery strategy
   */
  createComprehensiveStrategy(operationName: string): RecoveryConfig[] {
    return [
      // First try cache
      recoveryUtils.createCacheConfig(`comprehensive:${operationName}`),
      // Then retry with exponential backoff
      recoveryUtils.createRetryConfig(3, 1000, 'exponential'),
      // Then try offline data
      recoveryUtils.createOfflineConfig(),
      // Finally use fallback data
      recoveryUtils.createFallbackConfig(null),
    ];
  },

  /**
   * Recovery decorator for functions
   */
  withRecovery<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    recoveryConfigs: RecoveryConfig[],
    operationName?: string
  ): T {
    const recoveryManager = new ErrorRecoveryManager();
    const name = operationName || fn.name || 'anonymous_function';

    return (async (...args: Parameters<T>) => {
      const context: ErrorRecoveryContext = {
        operationName: name,
        timestamp: Date.now(),
        metadata: { args },
      };

      const result = await recoveryManager.executeWithRecovery(
        () => fn(...args),
        recoveryConfigs,
        context
      );

      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    }) as T;
  },

  /**
   * Network request with recovery
   */
  async fetchWithRecovery<T>(
    url: string,
    options: RequestInit = {},
    recoveryConfigs?: RecoveryConfig[]
  ): Promise<T> {
    const recoveryManager = new ErrorRecoveryManager();
    const configs = recoveryConfigs || recoveryUtils.createComprehensiveStrategy('fetch');

    const context: ErrorRecoveryContext = {
      operationName: 'fetch',
      url,
      timestamp: Date.now(),
      metadata: { method: options.method || 'GET' },
    };

    const result = await recoveryManager.executeWithRecovery(
      async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json() as T;
      },
      configs,
      context
    );

    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  },
};

// Default recovery manager instance
export const recoveryManager = new ErrorRecoveryManager();

// Export types
export type {
  RecoveryConfig,
  RecoveryResult,
  ErrorRecoveryContext,
};
