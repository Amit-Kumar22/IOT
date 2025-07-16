/**
 * Accessibility Utilities
 * Comprehensive accessibility features for WCAG 2.1 AA compliance
 */

'use client';

import { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Accessibility Context
 */
interface AccessibilityContextValue {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusMainContent: () => void;
  reducedMotion: boolean;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

/**
 * AccessibilityProvider Component
 * Provides accessibility features throughout the app
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Announce messages to screen readers
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.textContent = message;
      liveRegionRef.current.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        if (liveRegionRef.current?.contains(announcement)) {
          liveRegionRef.current.removeChild(announcement);
        }
      }, 1000);
    }
  };

  // Focus main content
  const focusMainContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const value = {
    announceMessage,
    focusMainContent,
    reducedMotion,
    highContrast,
    setHighContrast
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen Reader Live Region */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Main Content Reference */}
      <div ref={mainContentRef} tabIndex={-1} className="sr-only">
        Main content
      </div>
    </AccessibilityContext.Provider>
  );
}

/**
 * SkipToContent Component
 * Skip navigation for keyboard users
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  const handleSkip = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onKeyDown={handleSkip}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-50
        px-4 py-2 bg-blue-600 text-white
        rounded-md shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-all duration-200
      "
    >
      Skip to main content
    </a>
  );
}

/**
 * FocusTrap Component
 * Traps focus within a container (for modals, dialogs)
 */
export function FocusTrap({
  children,
  isActive = true,
  restoreFocus = true,
  className = ''
}: {
  children: ReactNode;
  isActive?: boolean;
  restoreFocus?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Focus the first focusable element in the container
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, restoreFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * AccessibleButton Component
 * Button with comprehensive accessibility features
 */
export function AccessibleButton({
  children,
  onClick,
  onKeyDown,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { announceMessage } = useAccessibility();

  const handleClick = () => {
    if (loading || disabled) return;
    
    if (onClick) {
      onClick();
    }
    
    // Announce button action to screen readers
    if (ariaLabel) {
      announceMessage(`${ariaLabel} activated`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    
    // Handle Enter and Space keys
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center
        font-medium rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

/**
 * AccessibleInput Component
 * Input field with accessibility features
 */
export function AccessibleInput({
  label,
  error,
  helperText,
  required = false,
  type = 'text',
  className = '',
  ...props
}: {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  type?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <input
        {...props}
        id={inputId}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
        `}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * RouteAnnouncer Component
 * Announces route changes to screen readers
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const { announceMessage } = useAccessibility();
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPath) {
      // Extract page title from pathname
      const pageTitle = pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, ' ')
        ?.replace(/\b\w/g, l => l.toUpperCase()) || 'Home';

      announceMessage(`Navigated to ${pageTitle} page`, 'polite');
      setPreviousPath(pathname);
    }
  }, [pathname, previousPath, announceMessage]);

  return null;
}

/**
 * KeyboardNavigation Component
 * Enables keyboard navigation for interactive elements
 */
export function KeyboardNavigation({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add keyboard shortcuts
      if (e.altKey || e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            // Alt+H: Focus main heading
            e.preventDefault();
            const mainHeading = document.querySelector('h1');
            if (mainHeading) {
              (mainHeading as HTMLElement).focus();
            }
            break;
          case 'm':
            // Alt+M: Focus main content
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              mainContent.focus();
            }
            break;
          case 's':
            // Alt+S: Focus search
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
              (searchInput as HTMLElement).focus();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
}

/**
 * ColorContrastProvider Component
 * Provides high contrast mode support
 */
export function ColorContrastProvider({ children }: { children: ReactNode }) {
  const { highContrast } = useAccessibility();

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return <>{children}</>;
}

/**
 * ScreenReaderOnly Component
 * Content visible only to screen readers
 */
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * VisuallyHidden Component
 * Visually hidden but accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  );
}

/**
 * AccessibilityAnnouncer Component
 * Announces important changes to screen readers
 */
export function AccessibilityAnnouncer({
  message,
  priority = 'polite',
  clearAfter = 5000
}: {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

export default {
  AccessibilityProvider,
  SkipToContent,
  FocusTrap,
  AccessibleButton,
  AccessibleInput,
  RouteAnnouncer,
  KeyboardNavigation,
  ColorContrastProvider,
  ScreenReaderOnly,
  VisuallyHidden,
  AccessibilityAnnouncer,
  useAccessibility
};
