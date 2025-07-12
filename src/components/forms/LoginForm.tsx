/**
 * LoginForm Component
 * 
 * Comprehensive login form with:
 * - Zod validation integration
 * - Real-time validation feedback
 * - Loading states and error handling
 * - Accessibility features (ARIA labels, focus management)
 * - Remember me functionality
 * - Responsive design
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginForm } from '@/hooks/auth';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSuccess?: (user: unknown) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  'aria-describedby'?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  icon,
  showPasswordToggle = false,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const actualType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const fieldId = `${name}-field`;
  const errorId = `${name}-error`;
  const helperTextId = `${name}-helper`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className={cn(
          'block text-sm font-medium transition-colors',
          error
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300',
          focused && 'text-blue-600 dark:text-blue-400'
        )}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={cn(
              'h-5 w-5 transition-colors',
              error
                ? 'text-red-400'
                : focused
                ? 'text-blue-500'
                : 'text-gray-400'
            )}>
              {icon}
            </div>
          </div>
        )}
        
        <input
          ref={inputRef}
          id={fieldId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            ariaDescribedBy && helperTextId
          )}
          className={cn(
            'w-full px-3 py-3 border rounded-lg transition-all duration-200',
            'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            showPasswordToggle && 'pr-10',
            error
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
            'dark:text-white text-gray-900'
          )}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={cn(
              'absolute inset-y-0 right-0 pr-3 flex items-center',
              'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      
      {error && (
        <div
          id={errorId}
          className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo,
  className
}) => {
  const router = useRouter();
  const {
    formData,
    formErrors,
    isLoading,
    error,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form submission
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    try {
      const result = await handleSubmit(e);
      
      if (result?.success) {
        onSuccess?.(result.user);
        
        // Handle redirect
        if (redirectTo) {
          router.push(redirectTo);
        }
      } else if (result?.error) {
        onError?.(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(message);
    }
  }, [handleSubmit, onSuccess, onError, redirectTo, router]);

  // Focus management
  useEffect(() => {
    if (submitAttempted && Object.keys(formErrors).length > 0) {
      // Focus first field with error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = formRef.current?.querySelector(`#${firstErrorField}-field`) as HTMLElement;
      errorElement?.focus();
    }
  }, [formErrors, submitAttempted]);

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div
            className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="space-y-6"
          noValidate
        >
          {/* Email Field */}
          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
            autoComplete="email"
            icon={<div className="text-gray-400">@</div>}
          />

          {/* Password Field */}
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
            autoComplete="current-password"
            showPasswordToggle
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className={cn(
                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                'dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600'
              )}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white',
              'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-3">
          <div className="text-sm">
            <a
              href="/auth/forgot-password"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              Forgot your password?
            </a>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <a
              href="/auth/register"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginForm };
export type { LoginFormProps };
