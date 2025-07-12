'use client';

import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { InputProps } from '../../types/shared-components';
import { COMPONENT_SIZES, COMMON_CLASSES, INPUT_TYPES } from '../../lib/constants';
import { validateInput } from '../../lib/validators';
import { cn } from '../../lib/utils';

/**
 * Enhanced Input component with validation, icons, and accessibility features
 * Supports various input types and provides real-time validation feedback
 */
const Input = forwardRef<HTMLInputElement, InputProps & InputHTMLAttributes<HTMLInputElement>>(
  ({
    label,
    type = INPUT_TYPES.TEXT,
    placeholder,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    leftIcon,
    rightIcon,
    className,
    testId,
    ...props
  }, ref) => {
    
    const [internalValue, setInternalValue] = useState(value || defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [validationError, setValidationError] = useState<string | undefined>(error);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      
      // Real-time validation
      if (type && newValue) {
        const validation = validateInput(newValue, type, required);
        setValidationError(validation.isValid ? undefined : validation.error);
      } else if (required && !newValue) {
        setValidationError('This field is required');
      } else {
        setValidationError(undefined);
      }
      
      onChange?.(newValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Validate on blur
      if (type && internalValue) {
        const validation = validateInput(internalValue, type, required);
        setValidationError(validation.isValid ? undefined : validation.error);
      }
      
      onBlur?.();
    };

    const hasError = validationError || error;
    const displayValue = value !== undefined ? value : internalValue;

    const getInputClasses = () => {
      const baseClasses = [
        'block w-full rounded-md border-0 py-2 px-3',
        'text-gray-900 dark:text-gray-100',
        'ring-1 ring-inset ring-gray-300 dark:ring-gray-600',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus:ring-2 focus:ring-inset',
        'sm:text-sm sm:leading-6',
        'transition-colors duration-200',
        'dark:bg-gray-800'
      ];

      // Add padding for icons
      if (leftIcon) {
        baseClasses.push('pl-10');
      }
      if (rightIcon) {
        baseClasses.push('pr-10');
      }

      // State-specific classes
      if (hasError) {
        baseClasses.push(
          'ring-red-500 focus:ring-red-500',
          'text-red-900 dark:text-red-100',
          'placeholder:text-red-400'
        );
      } else if (isFocused) {
        baseClasses.push('ring-blue-500 focus:ring-blue-500');
      } else {
        baseClasses.push('focus:ring-blue-500');
      }

      if (disabled) {
        baseClasses.push(
          'bg-gray-50 dark:bg-gray-900',
          'text-gray-500 dark:text-gray-400',
          'cursor-not-allowed'
        );
      }

      if (readOnly) {
        baseClasses.push(
          'bg-gray-50 dark:bg-gray-900',
          'cursor-default'
        );
      }

      return cn(baseClasses, className);
    };

    const getLabelClasses = () => {
      return cn(
        'block text-sm font-medium leading-6',
        hasError
          ? 'text-red-700 dark:text-red-400'
          : 'text-gray-900 dark:text-gray-100'
      );
    };

    const inputId = props.id || `input-${testId || 'default'}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={getLabelClasses()}
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative mt-2">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className={cn(
                'h-5 w-5',
                hasError
                  ? 'text-red-500'
                  : 'text-gray-400 dark:text-gray-500'
              )}>
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={displayValue}
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={getInputClasses()}
            data-testid={testId}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className={cn(
                'h-5 w-5',
                hasError
                  ? 'text-red-500'
                  : 'text-gray-400 dark:text-gray-500'
              )}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {validationError || error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
