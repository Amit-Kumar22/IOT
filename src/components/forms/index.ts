/**
 * Forms Module Exports
 * 
 * Centralized exports for all form components
 */

// Authentication Forms
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';

// Type Exports
export type { LoginFormProps } from './LoginForm';
export type { RegisterFormProps } from './RegisterForm';

// Re-export validation types for convenience
export type {
  LoginFormData,
  RegisterFormData,
  PasswordResetRequestData,
  PasswordResetData,
  ChangePasswordData,
  UpdateProfileData,
  TwoFactorSetupData,
  LoginWith2FAData,
  ApiKeyGenerationData,
  SessionManagementData,
} from '@/lib/validations';
