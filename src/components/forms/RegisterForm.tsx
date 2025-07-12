/**
 * RegisterForm Component
 * 
 * Comprehensive registration form with:
 * - Multi-step registration process
 * - Role selection (Company/Consumer)
 * - Company name field for company users
 * - Password strength validation
 * - Terms acceptance checkbox
 * - Real-time validation feedback
 * - Loading states and error handling
 * - Accessibility features (ARIA labels, focus management)
 * - Responsive design
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterForm } from '@/hooks/auth';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Building, 
  Mail, 
  Lock, 
  Shield 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidPassword } from '@/lib/validations';
import type { RegisterFormData } from '@/lib/validations';

interface RegisterFormProps {
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

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
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

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className 
}) => {
  const requirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
    { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) }
  ];

  const metCount = requirements.filter(req => req.test(password)).length;
  const strength = metCount === 0 ? 0 : Math.round((metCount / requirements.length) * 100);

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password strength: {getStrengthText()}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {metCount}/{requirements.length}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', getStrengthColor())}
          style={{ width: `${strength}%` }}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-1 text-xs">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-2',
              req.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {req.test(password) ? <CheckCircle size={12} /> : <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />}
            </div>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-2',
              index < currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                index < currentStep
                  ? 'bg-blue-600 text-white'
                  : index === currentStep
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              )}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {title}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'flex-1 h-1 mx-1 rounded-full transition-colors',
              index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>
    </div>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({
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
  } = useRegisterForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const stepTitles = ['Account', 'Role', 'Security'];
  const totalSteps = stepTitles.length;

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

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const stepFields = getStepFields(step);
    return stepFields.every(field => !formErrors[field]);
  }, [formErrors]);

  // Get fields for current step
  const getStepFields = useCallback((step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 0:
        return ['name', 'email'];
      case 1:
        return ['role', ...(formData.role === 'company' ? ['companyName'] : [])];
      case 2:
        return ['password', 'confirmPassword', 'acceptTerms'];
      default:
        return [];
    }
  }, [formData.role]);

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, validateStep]);

  // Handle previous step
  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Handle role selection
  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    // Clear company name if switching to consumer
    if (e.target.value === 'consumer') {
      const event = {
        target: { name: 'companyName', value: '', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    }
  }, [handleChange]);

  // Focus management
  useEffect(() => {
    if (submitAttempted && Object.keys(formErrors).length > 0) {
      // Focus first field with error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = formRef.current?.querySelector(`#${firstErrorField}-field`) as HTMLElement;
      errorElement?.focus();
    }
  }, [formErrors, submitAttempted]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
              autoComplete="name"
              icon={<User size={20} />}
            />
            
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
              icon={<Mail size={20} />}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Type <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="radio"
                    id="role-consumer"
                    name="role"
                    value="consumer"
                    checked={formData.role === 'consumer'}
                    onChange={handleRoleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="role-consumer"
                    className={cn(
                      'block p-4 border rounded-lg cursor-pointer transition-all',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      formData.role === 'consumer'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Consumer
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Individual user managing personal IoT devices
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <input
                    type="radio"
                    id="role-company"
                    name="role"
                    value="company"
                    checked={formData.role === 'company'}
                    onChange={handleRoleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="role-company"
                    className={cn(
                      'block p-4 border rounded-lg cursor-pointer transition-all',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      formData.role === 'company'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Company
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Business managing multiple devices and users
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {formErrors.role && (
                <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={16} />
                  <span>{formErrors.role}</span>
                </div>
              )}
            </div>

            {formData.role === 'company' && (
              <FormField
                label="Company Name"
                name="companyName"
                type="text"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleChange}
                error={formErrors.companyName}
                required
                autoComplete="organization"
                icon={<Building size={20} />}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                required
                autoComplete="new-password"
                icon={<Lock size={20} />}
                showPasswordToggle
              />
              
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
              autoComplete="new-password"
              icon={<Shield size={20} />}
              showPasswordToggle
            />

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={cn(
                    'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1',
                    'dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600'
                  )}
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the{' '}
                  <a
                    href="/terms"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              {formErrors.acceptTerms && (
                <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={16} />
                  <span>{formErrors.acceptTerms}</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join our IoT platform to get started
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />

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
          onSubmit={currentStep === totalSteps - 1 ? onSubmit : undefined}
          className="space-y-6"
          noValidate
          role="form"
        >
          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between space-x-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className={cn(
                  'flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium',
                  'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800',
                  'hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  'transition-colors duration-200'
                )}
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!validateStep(currentStep)}
                className={cn(
                  'flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white',
                  'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !validateStep(currentStep)}
                className={cn(
                  'flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white',
                  'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export { RegisterForm };
export type { RegisterFormProps };
