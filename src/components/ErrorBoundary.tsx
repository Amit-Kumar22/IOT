/**
 * React Error Boundary Component
 * Provides comprehensive error catching and recovery for React components
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorReporter, ErrorSeverity, ErrorCategory } from '../lib/errorReporting';
import { performanceMonitor, MetricType } from '../lib/performance';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

// Error boundary props interface
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  isolate?: boolean; // Whether to isolate errors to this boundary
  level?: 'page' | 'section' | 'component';
  name?: string; // Custom name for the boundary
  enableRecovery?: boolean; // Whether to attempt automatic recovery
  recoveryStrategies?: Array<'retry' | 'refresh' | 'redirect'>;
}

// Default error boundary props
const defaultProps: Partial<ErrorBoundaryProps> = {
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  isolate: true,
  level: 'component',
  enableRecovery: true,
  recoveryStrategies: ['retry', 'refresh'],
};

/**
 * React Error Boundary with Advanced Recovery and Monitoring
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private recoveryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, name, level } = { ...defaultProps, ...this.props };
    
    // Generate unique error ID
    const errorId = crypto.randomUUID();
    
    // Update state with error information
    this.setState({
      errorInfo,
      errorId,
    });

    // Report error to error reporting service
    this.reportError(error, errorInfo, errorId);

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Start performance monitoring for error recovery
    performanceMonitor.startTiming(`error_boundary_recovery_${level}_${name || 'unnamed'}`);

    // Attempt automatic recovery if enabled
    if (this.props.enableRecovery) {
      this.attemptRecovery();
    }
  }

  /**
   * Report error to monitoring services
   */
  private reportError(error: Error, errorInfo: ErrorInfo, errorId: string): void {
    const { name, level } = { ...defaultProps, ...this.props };
    
    errorReporter.reportError(error, {
      severity: this.getErrorSeverity(error),
      category: ErrorCategory.UNKNOWN,
      source: 'error_boundary',
      context: {
        timestamp: Date.now(),
        additionalData: {
          errorId,
          componentStack: errorInfo.componentStack,
          errorBoundaryName: name,
          errorBoundaryLevel: level,
          retryCount: this.state.retryCount,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      },
      tags: ['error_boundary', level || 'component', name || 'unnamed'],
      metadata: {
        errorBoundary: true,
        componentStack: errorInfo.componentStack,
        errorStack: error.stack,
      },
    });
  }

  /**
   * Determine error severity based on error type and level
   */
  private getErrorSeverity(error: Error): ErrorSeverity {
    const { level } = { ...defaultProps, ...this.props };
    
    // Critical errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return ErrorSeverity.HIGH;
    }
    
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Based on boundary level
    switch (level) {
      case 'page':
        return ErrorSeverity.HIGH;
      case 'section':
        return ErrorSeverity.MEDIUM;
      case 'component':
      default:
        return ErrorSeverity.LOW;
    }
  }

  /**
   * Attempt automatic error recovery
   */
  private attemptRecovery(): void {
    const { recoveryStrategies, retryDelay } = { ...defaultProps, ...this.props };
    
    if (!recoveryStrategies || recoveryStrategies.length === 0) {
      return;
    }

    // Try recovery strategies in order
    const strategy = recoveryStrategies[0];
    
    this.recoveryTimeoutId = setTimeout(() => {
      switch (strategy) {
        case 'retry':
          this.handleRetry();
          break;
        case 'refresh':
          this.handleRefresh();
          break;
        case 'redirect':
          this.handleRedirect();
          break;
      }
    }, retryDelay);
  }

  /**
   * Handle retry recovery
   */
  private handleRetry = (): void => {
    const { maxRetries } = { ...defaultProps, ...this.props };
    
    if (this.state.retryCount < (maxRetries || 3)) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
      }));
      
      // Record recovery attempt
      performanceMonitor.recordMetric('error_boundary_retry', 1, MetricType.COUNTER, {
        boundary_name: this.props.name || 'unnamed',
        retry_count: String(this.state.retryCount + 1),
      });
    }
  };

  /**
   * Handle page refresh recovery
   */
  private handleRefresh = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  /**
   * Handle redirect recovery
   */
  private handleRedirect = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Manual retry function
   */
  private retry = (): void => {
    const { maxRetries } = { ...defaultProps, ...this.props };
    
    if (this.state.retryCount >= (maxRetries || 3)) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  /**
   * Check if component should show retry button
   */
  private shouldShowRetry(): boolean {
    const { enableRetry, maxRetries } = { ...defaultProps, ...this.props };
    return (enableRetry ?? true) && this.state.retryCount < (maxRetries ?? 3);
  }

  /**
   * Clean up timers on unmount
   */
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }

  /**
   * Default error fallback UI
   */
  private renderDefaultFallback(): ReactNode {
    const { error, errorInfo, errorId, retryCount } = this.state;
    const { level, name } = this.props;
    
    return (
      <div className="error-boundary-container bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h3>
            
            <p className="mt-2 text-sm text-red-700">
              {level === 'page' 
                ? 'The page encountered an error and cannot be displayed.'
                : level === 'section'
                ? 'This section encountered an error.'
                : 'A component error occurred.'
              }
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="mt-4 flex space-x-3">
              {this.shouldShowRetry() && (
                <button
                  onClick={this.retry}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again {retryCount > 0 && `(${retryCount + 1}/${this.props.maxRetries || 3})`}
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh Page
              </button>
            </div>
            
            {errorId && (
              <p className="mt-3 text-xs text-gray-500">
                Error ID: {errorId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error && errorInfo) {
      // Custom fallback provided
      if (fallback) {
        try {
          return fallback(error, errorInfo, this.retry);
        } catch (fallbackError) {
          console.error('Error in custom fallback component:', fallbackError);
          // Fall back to default fallback
          return this.renderDefaultFallback();
        }
      }
      
      // Default fallback
      return this.renderDefaultFallback();
    }

    // No error, render children normally
    return children;
  }
}

/**
 * Higher-Order Component for adding error boundaries
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
): React.ComponentType<P> {
  const WithErrorBoundaryComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * React Hook for error boundary integration
 */
export function useErrorHandler(): {
  reportError: (error: Error, context?: any) => void;
  clearError: () => void;
} {
  const reportError = React.useCallback((error: Error, context?: any) => {
    errorReporter.reportError(error, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      source: 'use_error_handler',
      context: {
        timestamp: Date.now(),
        additionalData: context,
      },
    });
  }, []);

  const clearError = React.useCallback(() => {
    // Implementation for clearing errors if needed
    // This could trigger a state update in a parent error boundary
  }, []);

  return { reportError, clearError };
}

/**
 * Async error handler for promises and async functions
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string
): Promise<T> {
  return promise.catch((error: Error) => {
    errorReporter.reportError(error, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      source: 'async_error_handler',
      context: {
        timestamp: Date.now(),
        additionalData: { context },
      },
      tags: ['async', 'promise'],
    });
    
    throw error; // Re-throw to maintain promise chain behavior
  });
}

/**
 * Error boundary factory for different levels
 */
export const ErrorBoundaries = {
  Page: (props: Omit<ErrorBoundaryProps, 'level'>) => (
    <ErrorBoundary {...props} level="page" />
  ),
  
  Section: (props: Omit<ErrorBoundaryProps, 'level'>) => (
    <ErrorBoundary {...props} level="section" />
  ),
  
  Component: (props: Omit<ErrorBoundaryProps, 'level'>) => (
    <ErrorBoundary {...props} level="component" />
  ),
};

// Export default
export default ErrorBoundary;
