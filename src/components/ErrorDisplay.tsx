/**
 * User-Friendly Error Messages Component
 * Provides intuitive error display with actionable suggestions
 */

import React, { useState, useEffect } from 'react';
import { errorReporter, ErrorSeverity, ErrorCategory } from '../lib/errorReporting';
import { performanceMonitor, MetricType } from '../lib/performance';
import { recoveryManager, RecoveryStrategy } from '../lib/errorRecovery';

// Error message types
interface ErrorMessage {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  actions?: ErrorAction[];
  dismissible?: boolean;
  persistent?: boolean;
  timestamp: number;
  context?: Record<string, any>;
}

// Error action interface
interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  type: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

// Error display props
interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  message?: string;
  showDetails?: boolean;
  showStack?: boolean;
  actions?: ErrorAction[];
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: 'inline' | 'modal' | 'toast';
}

// Error provider context
interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (error: Error | string, options?: Partial<ErrorMessage>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  retryLastAction: () => void;
}

// Create error context
const ErrorContext = React.createContext<ErrorContextType | undefined>(undefined);

/**
 * Error message utilities
 */
export const errorMessageUtils = {
  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error | string): {
    title: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    suggestions: string[];
  } {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? 'Error' : error.name;

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError') || 
        errorMessage.includes('ERR_NETWORK') || errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if you\'re using one',
          'Contact support if the problem persists',
        ],
      };
    }

    // Authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || 
        errorMessage.includes('authentication') || errorMessage.includes('login')) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please sign in again.',
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.MEDIUM,
        suggestions: [
          'Sign in again',
          'Clear your browser cache',
          'Check if your account is still active',
        ],
      };
    }

    // Permission errors
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || 
        errorMessage.includes('permission') || errorMessage.includes('access denied')) {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        category: ErrorCategory.AUTHORIZATION,
        severity: ErrorSeverity.MEDIUM,
        suggestions: [
          'Contact your administrator for access',
          'Make sure you\'re signed in to the correct account',
          'Check if your subscription includes this feature',
        ],
      };
    }

    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || 
        errorMessage.includes('required') || errorMessage.includes('format')) {
      return {
        title: 'Invalid Input',
        message: 'Please check your input and try again.',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        suggestions: [
          'Check all required fields are filled',
          'Verify the format of your input',
          'Remove any special characters if not allowed',
        ],
      };
    }

    // Device errors
    if (errorMessage.includes('device') || errorMessage.includes('sensor') || 
        errorMessage.includes('MQTT') || errorMessage.includes('IoT')) {
      return {
        title: 'Device Communication Error',
        message: 'Unable to communicate with the device. It may be offline or experiencing issues.',
        category: ErrorCategory.DEVICE_COMMUNICATION,
        severity: ErrorSeverity.HIGH,
        suggestions: [
          'Check if the device is powered on',
          'Verify the device\'s internet connection',
          'Try restarting the device',
          'Check device status in the dashboard',
        ],
      };
    }

    // Server errors
    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error') || 
        errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. We\'re working to fix this.',
        category: ErrorCategory.EXTERNAL_SERVICE,
        severity: ErrorSeverity.HIGH,
        suggestions: [
          'Try again in a few minutes',
          'Check our status page for updates',
          'Contact support if the issue persists',
        ],
      };
    }

    // Rate limiting
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || 
        errorMessage.includes('too many requests')) {
      return {
        title: 'Too Many Requests',
        message: 'You\'re making requests too quickly. Please slow down.',
        category: ErrorCategory.EXTERNAL_SERVICE,
        severity: ErrorSeverity.LOW,
        suggestions: [
          'Wait a moment before trying again',
          'Reduce the frequency of your actions',
          'Consider upgrading your plan for higher limits',
        ],
      };
    }

    // Chunk loading errors (common in SPAs)
    if (errorName === 'ChunkLoadError' || errorMessage.includes('Loading chunk')) {
      return {
        title: 'Update Available',
        message: 'The application has been updated. Please refresh the page.',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        suggestions: [
          'Refresh the page',
          'Clear your browser cache',
          'Try a hard refresh (Ctrl+F5)',
        ],
      };
    }

    // Performance errors
    if (errorMessage.includes('timeout') || errorMessage.includes('slow') || 
        errorMessage.includes('performance')) {
      return {
        title: 'Performance Issue',
        message: 'The operation is taking longer than expected.',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.LOW,
        suggestions: [
          'Try again with a smaller dataset',
          'Check your internet connection speed',
          'Close other browser tabs to free up memory',
        ],
      };
    }

    // Generic error
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Try again in a few minutes',
        'Contact support if the problem persists',
      ],
    };
  },

  /**
   * Get recovery actions for error
   */
  getRecoveryActions(error: Error | string, onRetry?: () => void): ErrorAction[] {
    const friendlyError = this.getUserFriendlyMessage(error);
    const actions: ErrorAction[] = [];

    // Add retry action if provided
    if (onRetry) {
      actions.push({
        label: 'Try Again',
        action: onRetry,
        type: 'primary',
      });
    }

    // Category-specific actions
    switch (friendlyError.category) {
      case ErrorCategory.NETWORK:
        actions.push(
          {
            label: 'Refresh Page',
            action: () => window.location.reload(),
            type: 'secondary',
          },
          {
            label: 'Check Connection',
            action: () => window.open('https://www.google.com', '_blank'),
            type: 'secondary',
          }
        );
        break;

      case ErrorCategory.AUTHENTICATION:
        actions.push({
          label: 'Sign In',
          action: () => {
            window.location.href = '/login';
          },
          type: 'primary',
        });
        break;

      case ErrorCategory.DEVICE_COMMUNICATION:
        actions.push(
          {
            label: 'Check Device Status',
            action: () => {
              window.location.href = '/devices';
            },
            type: 'secondary',
          },
          {
            label: 'Device Troubleshooting',
            action: () => {
              window.open('/help/device-troubleshooting', '_blank');
            },
            type: 'secondary',
          }
        );
        break;

      case ErrorCategory.EXTERNAL_SERVICE:
        actions.push({
          label: 'Status Page',
          action: () => {
            window.open('/status', '_blank');
          },
          type: 'secondary',
        });
        break;
    }

    // Always add contact support option
    actions.push({
      label: 'Contact Support',
      action: () => {
        window.open('/support', '_blank');
      },
      type: 'secondary',
    });

    return actions;
  },
};

/**
 * Error Display Component
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  message,
  showDetails = false,
  showStack = false,
  actions,
  onDismiss,
  onRetry,
  className = '',
  variant = 'inline',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error && !title && !message) {
    return null;
  }

  const friendlyError = error ? errorMessageUtils.getUserFriendlyMessage(error) : null;
  const displayTitle = title || friendlyError?.title || 'Error';
  const displayMessage = message || friendlyError?.message || 'An error occurred';
  const errorActions = actions || errorMessageUtils.getRecoveryActions(error || '', onRetry);

  const handleRetry = async (action: ErrorAction) => {
    if (action.loading !== false) {
      setIsRetrying(true);
    }

    try {
      await action.action();
    } catch (retryError) {
      console.error('Retry action failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const baseClasses = `error-display rounded-lg border ${className}`;
  const variantClasses = {
    inline: 'p-4 bg-red-50 border-red-200',
    modal: 'p-6 bg-white border-gray-200 shadow-lg',
    toast: 'p-3 bg-red-600 text-white border-red-700',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-start space-x-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 ${
              variant === 'toast' ? 'text-white' : 'text-red-600'
            }`}
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

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-sm font-semibold ${
              variant === 'toast' ? 'text-white' : 'text-red-800'
            }`}
          >
            {displayTitle}
          </h3>

          {/* Message */}
          <p
            className={`mt-1 text-sm ${
              variant === 'toast' ? 'text-red-100' : 'text-red-700'
            }`}
          >
            {displayMessage}
          </p>

          {/* Suggestions */}
          {friendlyError?.suggestions && variant !== 'toast' && (
            <div className="mt-3">
              <p className="text-xs font-medium text-red-800 mb-1">
                Suggestions:
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                {friendlyError.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Details */}
          {(showDetails || showStack) && error && variant !== 'toast' && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium text-red-800 hover:text-red-900 flex items-center"
              >
                <span>Technical Details</span>
                <svg
                  className={`ml-1 w-3 h-3 transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
                  {showDetails && (
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                  )}
                  {showStack && error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {errorActions.length > 0 && variant !== 'toast' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {errorActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleRetry(action)}
                  disabled={isRetrying}
                  className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action.type === 'primary'
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                      : action.type === 'danger'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                      : 'bg-white text-red-700 border border-red-300 hover:bg-red-50 focus:ring-red-500'
                  } ${isRetrying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRetrying && action.type === 'primary' && (
                    <svg
                      className="w-3 h-3 mr-1 animate-spin"
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
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${
              variant === 'toast' ? 'text-white hover:text-red-100' : 'text-red-400 hover:text-red-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Error Provider Component
 */
export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const addError = (error: Error | string, options: Partial<ErrorMessage> = {}): string => {
    const id = crypto.randomUUID();
    const friendlyError = errorMessageUtils.getUserFriendlyMessage(error);
    
    const errorMessage: ErrorMessage = {
      id,
      type: 'error',
      title: friendlyError.title,
      message: friendlyError.message,
      timestamp: Date.now(),
      dismissible: true,
      ...options,
    };

    setErrors(prev => [...prev, errorMessage]);

    // Auto-dismiss non-persistent errors
    if (!errorMessage.persistent) {
      setTimeout(() => {
        removeError(id);
      }, 10000); // 10 seconds
    }

    // Report error
    if (typeof error !== 'string') {
      errorReporter.reportError(error, {
        severity: friendlyError.severity,
        category: friendlyError.category,
        source: 'error_provider',
        context: {
          timestamp: Date.now(),
          additionalData: options.context,
        },
      });
    }

    return id;
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const retryLastAction = () => {
    if (lastAction) {
      lastAction();
    }
  };

  const contextValue: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    retryLastAction,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Error Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errors
          .filter(error => error.type === 'error')
          .slice(-3) // Show only last 3 errors
          .map(error => (
            <ErrorDisplay
              key={error.id}
              title={error.title}
              message={error.message}
              variant="toast"
              onDismiss={error.dismissible ? () => removeError(error.id) : undefined}
            />
          ))}
      </div>
    </ErrorContext.Provider>
  );
};

/**
 * Hook to use error context
 */
export const useError = (): ErrorContextType => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * Hook for handling async operations with error display
 */
export const useAsyncError = () => {
  const { addError } = useError();

  const executeAsync = async <T,>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      addError(error as Error, {
        message: errorMessage,
      });
      return null;
    }
  };

  return { executeAsync };
};

// Export default
export default ErrorDisplay;
