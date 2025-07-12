'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { BadgeProps } from '../../types/shared-components';
import { BADGE_VARIANTS, COMPONENT_SIZES, COMMON_CLASSES } from '../../lib/constants';
import { cn } from '../../lib/utils';

/**
 * Badge component for displaying status, labels, and categories
 * Supports multiple variants, sizes, and interactive features
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps & HTMLAttributes<HTMLSpanElement>>(
  ({
    children,
    variant = 'primary',
    size = 'medium',
    rounded = false,
    removable = false,
    onRemove,
    className,
    testId,
    ...props
  }, ref) => {
    
    const getVariantClasses = () => {
      switch (variant) {
        case BADGE_VARIANTS.PRIMARY:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case BADGE_VARIANTS.SECONDARY:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        case BADGE_VARIANTS.SUCCESS:
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case BADGE_VARIANTS.WARNING:
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case BADGE_VARIANTS.DANGER:
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case BADGE_VARIANTS.INFO:
          return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case COMPONENT_SIZES.SMALL:
          return 'px-2 py-0.5 text-xs';
        case COMPONENT_SIZES.MEDIUM:
          return 'px-2.5 py-1 text-sm';
        case COMPONENT_SIZES.LARGE:
          return 'px-3 py-1.5 text-base';
        default:
          return 'px-2.5 py-1 text-sm';
      }
    };

    const getRoundedClasses = () => {
      return rounded ? 'rounded-full' : 'rounded-md';
    };

    const badgeClasses = cn(
      // Base classes
      'inline-flex items-center font-medium',
      'transition-all duration-200',
      // Dynamic classes
      getVariantClasses(),
      getSizeClasses(),
      getRoundedClasses(),
      // Custom classes
      className
    );

    const RemoveIcon = () => (
      <svg
        className="ml-1 h-3 w-3 cursor-pointer hover:text-current"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={badgeClasses}
        data-testid={testId}
        {...props}
      >
        <span className="truncate">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
            aria-label="Remove badge"
          >
            <RemoveIcon />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
