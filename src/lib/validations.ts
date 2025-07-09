/**
 * Zod validation schemas for authentication forms
 */

import { z } from 'zod';
import { DEFAULT_PASSWORD_REQUIREMENTS } from '@/types/auth';

// Password validation schema
const passwordSchema = z
  .string()
  .min(DEFAULT_PASSWORD_REQUIREMENTS.minLength, {
    message: `Password must be at least ${DEFAULT_PASSWORD_REQUIREMENTS.minLength} characters long`
  })
  .refine((password) => {
    if (!DEFAULT_PASSWORD_REQUIREMENTS.requireUppercase) return true;
    return /[A-Z]/.test(password);
  }, {
    message: 'Password must contain at least one uppercase letter'
  })
  .refine((password) => {
    if (!DEFAULT_PASSWORD_REQUIREMENTS.requireLowercase) return true;
    return /[a-z]/.test(password);
  }, {
    message: 'Password must contain at least one lowercase letter'
  })
  .refine((password) => {
    if (!DEFAULT_PASSWORD_REQUIREMENTS.requireNumbers) return true;
    return /\d/.test(password);
  }, {
    message: 'Password must contain at least one number'
  })
  .refine((password) => {
    if (!DEFAULT_PASSWORD_REQUIREMENTS.requireSpecialChars) return true;
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }, {
    message: 'Password must contain at least one special character'
  });

// Email validation schema
const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .max(254, { message: 'Email address is too long' });

// Name validation schema
const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .min(2, { message: 'Name must be at least 2 characters long' })
  .max(100, { message: 'Name is too long' })
  .regex(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  });

// Company name validation schema
const companyNameSchema = z
  .string()
  .min(1, { message: 'Company name is required' })
  .min(2, { message: 'Company name must be at least 2 characters long' })
  .max(100, { message: 'Company name is too long' })
  .regex(/^[a-zA-Z0-9\s&.-]+$/, {
    message: 'Company name contains invalid characters'
  });

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional().default(false)
});

// Register form validation schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  name: nameSchema,
  role: z.enum(['company', 'consumer'], {
    required_error: 'Please select a role',
    invalid_type_error: 'Invalid role selected'
  }),
  companyName: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data) => {
  // Company role requires company name
  if (data.role === 'company' && (!data.companyName || data.companyName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Company name is required for company accounts',
  path: ['companyName']
}).refine((data) => {
  // Validate company name if provided
  if (data.companyName) {
    const result = companyNameSchema.safeParse(data.companyName);
    return result.success;
  }
  return true;
}, {
  message: 'Invalid company name format',
  path: ['companyName']
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your new password' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  avatar: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal(''))
}).refine((data) => {
  // At least one field must be provided
  return data.name || data.email || data.avatar;
}, {
  message: 'At least one field must be updated'
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  code: z.string()
    .length(6, { message: 'Verification code must be 6 digits' })
    .regex(/^\d{6}$/, { message: 'Verification code must contain only numbers' })
});

// Login with 2FA schema
export const loginWith2FASchema = loginSchema.extend({
  twoFactorCode: z.string()
    .length(6, { message: 'Two-factor code must be 6 digits' })
    .regex(/^\d{6}$/, { message: 'Two-factor code must contain only numbers' })
});

// API key generation schema
export const apiKeyGenerationSchema = z.object({
  name: z.string()
    .min(1, { message: 'API key name is required' })
    .min(3, { message: 'API key name must be at least 3 characters' })
    .max(50, { message: 'API key name is too long' }),
  permissions: z.array(z.string()).min(1, { message: 'At least one permission is required' }),
  expiresAt: z.date().optional()
});

// Session management schema
export const sessionManagementSchema = z.object({
  sessionId: z.string().uuid({ message: 'Invalid session ID' }),
  action: z.enum(['revoke', 'extend'], {
    required_error: 'Action is required',
    invalid_type_error: 'Invalid action'
  })
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type TwoFactorSetupData = z.infer<typeof twoFactorSetupSchema>;
export type LoginWith2FAData = z.infer<typeof loginWith2FASchema>;
export type ApiKeyGenerationData = z.infer<typeof apiKeyGenerationSchema>;
export type SessionManagementData = z.infer<typeof sessionManagementSchema>;

// Form validation helpers
export const validateLoginForm = (data: unknown) => loginSchema.safeParse(data);
export const validateRegisterForm = (data: unknown) => registerSchema.safeParse(data);
export const validatePasswordResetRequest = (data: unknown) => passwordResetRequestSchema.safeParse(data);
export const validatePasswordReset = (data: unknown) => passwordResetSchema.safeParse(data);
export const validateChangePassword = (data: unknown) => changePasswordSchema.safeParse(data);
export const validateUpdateProfile = (data: unknown) => updateProfileSchema.safeParse(data);
export const validateTwoFactorSetup = (data: unknown) => twoFactorSetupSchema.safeParse(data);
export const validateLoginWith2FA = (data: unknown) => loginWith2FASchema.safeParse(data);
export const validateApiKeyGeneration = (data: unknown) => apiKeyGenerationSchema.safeParse(data);
export const validateSessionManagement = (data: unknown) => sessionManagementSchema.safeParse(data);

// Custom validation functions
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const result = passwordSchema.safeParse(password);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(e => e.message)
  };
};

export const isValidName = (name: string): boolean => {
  return nameSchema.safeParse(name).success;
};

export const isValidCompanyName = (companyName: string): boolean => {
  return companyNameSchema.safeParse(companyName).success;
};
