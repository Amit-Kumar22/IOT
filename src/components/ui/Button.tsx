'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { ButtonProps } from '../../types/shared-components';
import { BUTTON_VARIANTS, COMPONENT_SIZES, COMMON_CLASSES } from '../../lib/constants';
import { cn } from '../../lib/utils';

/**
 * Enhanced Button component with multiple variants and sizes
 * Supports loading states, icons, and accessibility features
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    testId,
    type = 'button',
    onClick,
    ...props
  }, ref) => {
    
    const getVariantClasses = () => {
      switch (variant) {
        case BUTTON_VARIANTS.PRIMARY:
          return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-500';
        case BUTTON_VARIANTS.SECONDARY:
          return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700 focus:ring-gray-500';
        case BUTTON_VARIANTS.OUTLINE:
          return 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500';
        case BUTTON_VARIANTS.GHOST:
          return 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent hover:border-gray-300 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600';
        case BUTTON_VARIANTS.DANGER:
          return 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-500';
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-500';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case COMPONENT_SIZES.SMALL:
          return 'px-3 py-1.5 text-sm';
        case COMPONENT_SIZES.MEDIUM:
          return 'px-4 py-2 text-base';
        case COMPONENT_SIZES.LARGE:
          return 'px-6 py-3 text-lg';
        default:
          return 'px-4 py-2 text-base';
      }
    };

    const getDisabledClasses = () => {
      return disabled || loading
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer';
    };

    const buttonClasses = cn(
      // Base classes
      'inline-flex items-center justify-center font-medium rounded-md border',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Variant classes
      getVariantClasses(),
      // Size classes
      getSizeClasses(),
      // Disabled classes
      getDisabledClasses(),
      // Custom classes
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const LoadingSpinner = () => (
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
    );

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        data-testid={testId}
        aria-disabled={disabled || loading}
        aria-describedby={loading ? 'button-loading' : undefined}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
        {loading && (
          <span id="button-loading" className="sr-only">
            Loading...
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
