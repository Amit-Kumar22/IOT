'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { CardProps } from '../../types/shared-components';
import { CARD_SHADOWS, CARD_PADDING, BORDER_RADIUS, COMMON_CLASSES } from '../../lib/constants';
import { cn } from '../../lib/utils';

/**
 * Versatile Card component with customizable styling
 * Supports headers, footers, and various visual configurations
 */
const Card = forwardRef<HTMLDivElement, CardProps & HTMLAttributes<HTMLDivElement>>(
  ({
    children,
    title,
    subtitle,
    headerActions,
    footerActions,
    padding = 'medium',
    shadow = 'medium',
    borderRadius = 'medium',
    hover = false,
    className,
    testId,
    ...props
  }, ref) => {
    
    const getPaddingClasses = () => {
      switch (padding) {
        case CARD_PADDING.NONE:
          return '';
        case CARD_PADDING.SMALL:
          return 'p-3';
        case CARD_PADDING.MEDIUM:
          return 'p-4';
        case CARD_PADDING.LARGE:
          return 'p-6';
        default:
          return 'p-4';
      }
    };

    const getShadowClasses = () => {
      switch (shadow) {
        case CARD_SHADOWS.NONE:
          return '';
        case CARD_SHADOWS.SMALL:
          return 'shadow-sm';
        case CARD_SHADOWS.MEDIUM:
          return 'shadow-md';
        case CARD_SHADOWS.LARGE:
          return 'shadow-lg';
        default:
          return 'shadow-md';
      }
    };

    const getBorderRadiusClasses = () => {
      switch (borderRadius) {
        case BORDER_RADIUS.NONE:
          return '';
        case BORDER_RADIUS.SMALL:
          return 'rounded';
        case BORDER_RADIUS.MEDIUM:
          return 'rounded-lg';
        case BORDER_RADIUS.LARGE:
          return 'rounded-xl';
        default:
          return 'rounded-lg';
      }
    };

    const getHoverClasses = () => {
      return hover
        ? 'transition-all duration-200 hover:shadow-lg hover:scale-102'
        : '';
    };

    const cardClasses = cn(
      // Base classes
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      'overflow-hidden',
      // Dynamic classes
      getPaddingClasses(),
      getShadowClasses(),
      getBorderRadiusClasses(),
      getHoverClasses(),
      // Custom classes
      className
    );

    const headerClasses = cn(
      'border-b border-gray-200 dark:border-gray-700',
      padding === 'none' ? 'p-4' : `-m-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'} mb-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'} p-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'}`
    );

    const footerClasses = cn(
      'border-t border-gray-200 dark:border-gray-700',
      padding === 'none' ? 'p-4' : `-m-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'} mt-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'} p-${padding === 'small' ? '3' : padding === 'medium' ? '4' : '6'}`
    );

    const hasHeader = title || subtitle || headerActions;
    const hasFooter = footerActions;

    return (
      <div
        ref={ref}
        className={cardClasses}
        data-testid={testId}
        {...props}
      >
        {hasHeader && (
          <div className={headerClasses}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center ml-4">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={hasHeader && padding !== 'none' ? '' : getPaddingClasses()}>
          {children}
        </div>
        
        {hasFooter && (
          <div className={footerClasses}>
            {footerActions}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
