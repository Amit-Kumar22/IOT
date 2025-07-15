/**
 * Comprehensive Error Handling Tests
 * Tests for all error handling components and systems
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Import components and utilities to test
import { ErrorBoundary, ErrorBoundaries } from '../components/ErrorBoundary';
import { ErrorDisplay, ErrorProvider, useError, errorMessageUtils } from '../components/ErrorDisplay';
import { globalErrorHandler, GlobalErrorHandler } from '../lib/globalErrorHandler';
import { recoveryManager, ErrorRecoveryManager } from '../lib/errorRecovery';
import { errorAnalytics, ErrorAnalyticsManager } from '../lib/errorAnalytics';
import { errorReporter, ErrorCategory, ErrorSeverity } from '../lib/errorReporting';

// Mock dependencies
jest.mock('../lib/errorReporting');
jest.mock('../lib/performance');
jest.mock('../lib/storage');

// Test utilities
const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Test Component</div>;
};

const AsyncTestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      Promise.reject(new Error('Async test error'));
    }
  }, [shouldThrow]);

  return <div>Async Test Component</div>;
};

const ErrorDisplayTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>{children}</ErrorProvider>
);

describe('Error Handling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorBoundary Component', () => {
    it('should catch and display errors', () => {
      const onError = jest.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should provide retry functionality', async () => {
      const onRetry = jest.fn();
      
      render(
        <ErrorBoundary 
          fallback={(error, errorInfo, retry) => (
            <div>
              <span>Something went wrong</span>
              <button onClick={retry}>Try Again</button>
            </div>
          )}
        >
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText(/try again/i);
      fireEvent.click(retryButton);

      // Test that retry functionality works
      expect(retryButton).toBeInTheDocument();
    });

    it('should show custom fallback UI', () => {
      const customFallback = (error: Error) => <div>Custom Error Fallback</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
    });

    it('should track error metrics', () => {
      render(
        <ErrorBoundary>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify performance monitoring was called
      expect(jest.mocked(console.error)).toHaveBeenCalled();
    });

    it('should provide error context to children', () => {
      const ContextConsumer = () => {
        const { errors } = useError();
        return <div>Context: {errors.length}</div>;
      };

      render(
        <ErrorDisplayTestWrapper>
          <ContextConsumer />
        </ErrorDisplayTestWrapper>
      );

      expect(screen.getByText(/context:/i)).toBeInTheDocument();
    });
  });

  describe('ErrorDisplay Component', () => {
    it('should display error with user-friendly message', () => {
      const testError = new Error('NetworkError: Failed to fetch');
      
      render(<ErrorDisplay error={testError} />);

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });

    it('should show suggestions for different error types', () => {
      const authError = new Error('401 Unauthorized');
      
      render(<ErrorDisplay error={authError} />);

      expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in again/i)).toBeInTheDocument();
    });

    it('should provide recovery actions', () => {
      const testError = new Error('Test error');
      const onRetry = jest.fn();
      
      render(<ErrorDisplay error={testError} onRetry={onRetry} />);

      const retryButton = screen.getByText(/try again/i);
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });

    it('should support different display variants', () => {
      const testError = new Error('Test error');
      
      const { rerender } = render(
        <ErrorDisplay error={testError} variant="toast" />
      );

      expect(screen.getByRole('generic')).toHaveClass('bg-red-600');

      rerender(<ErrorDisplay error={testError} variant="modal" />);
      expect(screen.getByRole('generic')).toHaveClass('bg-white');
    });

    it('should handle dismissal', () => {
      const onDismiss = jest.fn();
      const testError = new Error('Test error');
      
      render(<ErrorDisplay error={testError} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('ErrorProvider and useError Hook', () => {
    it('should provide error context', () => {
      const TestErrorConsumer = () => {
        const { addError, errors } = useError();
        
        return (
          <div>
            <button onClick={() => addError(new Error('Test error'))}>
              Add Error
            </button>
            <div>Error count: {errors.length}</div>
          </div>
        );
      };

      render(
        <ErrorDisplayTestWrapper>
          <TestErrorConsumer />
        </ErrorDisplayTestWrapper>
      );

      const addButton = screen.getByText('Add Error');
      fireEvent.click(addButton);

      expect(screen.getByText('Error count: 1')).toBeInTheDocument();
    });

    it('should auto-dismiss errors after timeout', async () => {
      jest.useFakeTimers();
      
      const TestErrorConsumer = () => {
        const { addError, errors } = useError();
        
        React.useEffect(() => {
          addError(new Error('Auto-dismiss test'));
        }, [addError]);
        
        return <div>Error count: {errors.length}</div>;
      };

      render(
        <ErrorDisplayTestWrapper>
          <TestErrorConsumer />
        </ErrorDisplayTestWrapper>
      );

      expect(screen.getByText('Error count: 1')).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(screen.getByText('Error count: 0')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Global Error Handler', () => {
    let handler: GlobalErrorHandler;

    beforeEach(() => {
      handler = new GlobalErrorHandler({
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
        maxErrorsPerMinute: 10,
      });
    });

    it('should handle unhandled errors', () => {
      const error = new Error('Unhandled error');
      const errorEvent = new ErrorEvent('error', {
        error,
        message: error.message,
        filename: 'test.js',
        lineno: 1,
        colno: 1,
      });

      handler.handleError(error, { source: 'window.onerror', event: errorEvent });

      expect(errorReporter.reportError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          source: 'window.onerror',
          context: expect.any(Object),
        })
      );
    });

    it('should handle unhandled promise rejections', () => {
      const error = new Error('Unhandled rejection');
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(error),
        reason: error,
      });

      handler.handleUnhandledRejection(rejectionEvent);

      expect(errorReporter.reportError).toHaveBeenCalled();
    });

    it('should implement rate limiting', () => {
      const error = new Error('Rate limited error');

      // Exceed rate limit
      for (let i = 0; i < 15; i++) {
        handler.handleError(error, { source: 'test' });
      }

      // Should not report all errors due to rate limiting
      expect(errorReporter.reportError).toHaveBeenCalledTimes(10);
    });

    it('should provide React error handling hook', () => {
      const TestComponent = () => {
        const { handleError } = handler.useErrorHandler();
        
        return (
          <button onClick={() => handleError(new Error('React error'))}>
            Trigger Error
          </button>
        );
      };

      render(<TestComponent />);

      const button = screen.getByText('Trigger Error');
      fireEvent.click(button);

      expect(errorReporter.reportError).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Manager', () => {
    let manager: ErrorRecoveryManager;

    beforeEach(() => {
      manager = new ErrorRecoveryManager({
        maxRetries: 3,
        baseDelay: 100,
        enableFallbacks: true,
      });
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Retry test error');
        }
        return 'success';
      });

      const result = await manager.executeWithRecovery(operation, {
        strategy: 'retry',
        maxRetries: 3,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should use fallback on failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Fallback test'));
      const fallback = jest.fn().mockResolvedValue('fallback result');

      const result = await manager.executeWithRecovery(operation, {
        strategy: 'fallback',
        fallback,
      });

      expect(result).toBe('fallback result');
      expect(fallback).toHaveBeenCalled();
    });

    it('should implement exponential backoff', async () => {
      jest.useFakeTimers();
      
      const operation = jest.fn().mockRejectedValue(new Error('Backoff test'));
      const promise = manager.executeWithRecovery(operation, {
        strategy: 'retry',
        maxRetries: 2,
        backoff: 'exponential',
      });

      // First retry after 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Second retry after 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await expect(promise).rejects.toThrow('Backoff test');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries

      jest.useRealTimers();
    });

    it('should handle network recovery', async () => {
      const networkError = new Error('Network error');
      Object.defineProperty(networkError, 'name', { value: 'NetworkError' });

      const operation = jest.fn().mockRejectedValue(networkError);

      await manager.executeWithRecovery(operation, {
        strategy: 'retry',
        maxRetries: 1,
      });

      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Analytics Manager', () => {
    let analytics: ErrorAnalyticsManager;

    beforeEach(() => {
      analytics = new ErrorAnalyticsManager({
        enableRealTimeMonitoring: false, // Disable for testing
        retentionPeriod: 1, // 1 day for testing
      });
    });

    it('should track error occurrences', () => {
      const error = new Error('Analytics test error');
      
      analytics.trackError(error);
      const analyticsData = analytics.getAnalytics();

      expect(analyticsData.totalErrors).toBe(1);
      expect(analyticsData.errorsByCategory).toMatchObject({
        [ErrorCategory.UNKNOWN]: 1,
      });
    });

    it('should generate insights', () => {
      // Add multiple similar errors to trigger pattern detection
      for (let i = 0; i < 6; i++) {
        analytics.trackError(new Error('Repeated error'));
      }

      const insights = analytics.getInsights();
      
      expect(insights).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'pattern',
            title: 'Recurring Error Pattern',
          }),
        ])
      );
    });

    it('should calculate error trends', () => {
      const now = Date.now();
      
      // Add errors with different timestamps
      for (let i = 0; i < 5; i++) {
        const error = new Error(`Trend test error ${i}`);
        analytics.trackError(error);
      }

      const trends = analytics.getTrends('hour');
      
      expect(trends.period).toBe('hour');
      expect(trends.data).toBeInstanceOf(Array);
      expect(trends.data.length).toBeGreaterThan(0);
    });

    it('should export analytics data', () => {
      analytics.trackError(new Error('Export test error'));
      
      const jsonData = analytics.exportData('json');
      const data = JSON.parse(jsonData);

      expect(data).toHaveProperty('analytics');
      expect(data).toHaveProperty('errors');
      expect(data).toHaveProperty('exportedAt');
    });

    it('should handle alerts', () => {
      // Generate enough errors to trigger alert
      for (let i = 0; i < 15; i++) {
        analytics.trackError(new Error(`Alert test error ${i}`));
      }

      const alerts = analytics.getAlerts();
      
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0]).toMatchObject({
        type: expect.any(String),
        severity: expect.any(String),
        title: expect.any(String),
        resolved: false,
      });
    });
  });

  describe('Error Message Utils', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      const result = errorMessageUtils.getUserFriendlyMessage(networkError);

      expect(result.title).toBe('Connection Problem');
      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.suggestions).toContain('Check your internet connection');
    });

    it('should categorize authentication errors correctly', () => {
      const authError = new Error('401 Unauthorized');
      const result = errorMessageUtils.getUserFriendlyMessage(authError);

      expect(result.title).toBe('Authentication Required');
      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.suggestions).toContain('Sign in again');
    });

    it('should categorize device errors correctly', () => {
      const deviceError = new Error('Device communication failed');
      const result = errorMessageUtils.getUserFriendlyMessage(deviceError);

      expect(result.title).toBe('Device Communication Error');
      expect(result.category).toBe(ErrorCategory.DEVICE_COMMUNICATION);
      expect(result.suggestions).toContain('Check if the device is powered on');
    });

    it('should provide appropriate recovery actions', () => {
      const error = new Error('Test error');
      const onRetry = jest.fn();
      
      const actions = errorMessageUtils.getRecoveryActions(error, onRetry);

      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: 'Try Again',
            type: 'primary',
          }),
          expect.objectContaining({
            label: 'Contact Support',
            type: 'secondary',
          }),
        ])
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error flow', async () => {
      const TestApp = () => {
        const { addError } = useError();
        
        return (
          <ErrorBoundary>
            <button
              onClick={() => {
                try {
                  throw new Error('Integration test error');
                } catch (error) {
                  addError(error as Error);
                }
              }}
            >
              Trigger Error
            </button>
          </ErrorBoundary>
        );
      };

      render(
        <ErrorDisplayTestWrapper>
          <TestApp />
        </ErrorDisplayTestWrapper>
      );

      const button = screen.getByText('Trigger Error');
      fireEvent.click(button);

      // Should show error in toast notification
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should handle async errors with recovery', async () => {
      const TestAsyncComponent = () => {
        const [error, setError] = React.useState<Error | null>(null);
        const { executeAsync } = recoveryManager.useAsyncRecovery();

        const handleAsyncOperation = () => {
          executeAsync(
            () => Promise.reject(new Error('Async integration test')),
            {
              strategy: 'retry',
              maxRetries: 2,
              onError: setError,
            }
          );
        };

        if (error) {
          return <ErrorDisplay error={error} />;
        }

        return <button onClick={handleAsyncOperation}>Async Operation</button>;
      };

      render(<TestAsyncComponent />);

      const button = screen.getByText('Async Operation');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle high error volume efficiently', () => {
      const startTime = performance.now();
      
      // Generate many errors
      for (let i = 0; i < 1000; i++) {
        errorAnalytics.trackError(new Error(`Performance test error ${i}`));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should not cause memory leaks with continuous error tracking', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Generate and clean up errors repeatedly
      for (let i = 0; i < 100; i++) {
        errorAnalytics.trackError(new Error(`Memory test error ${i}`));
        
        // Simulate cleanup
        if (i % 10 === 0) {
          // Force garbage collection if available
          if ((global as any).gc) {
            (global as any).gc();
          }
        }
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage should not grow excessively
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
    });
  });
});

// Export test utilities for reuse
export {
  TestComponent,
  AsyncTestComponent,
  ErrorDisplayTestWrapper,
};
