/**
 * Unit Tests for RegisterForm Component
 * 
 * Tests cover:
 * - Multi-step form navigation
 * - Role selection
 * - Form validation
 * - Password strength indicator
 * - User interactions
 * - Error handling
 * - Accessibility features
 * - Loading states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

// Mock the custom hooks
jest.mock('@/hooks/auth', () => ({
  useRegisterForm: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Building: () => <div data-testid="building-icon">Building</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
}));

// Mock validation functions
jest.mock('@/lib/validations', () => ({
  ...jest.requireActual('@/lib/validations'),
  isValidPassword: jest.fn(),
}));

const mockUseRegisterForm = require('@/hooks/auth').useRegisterForm as jest.Mock;
const mockIsValidPassword = require('@/lib/validations').isValidPassword as jest.Mock;

describe('RegisterForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  const defaultFormData = {
    name: '',
    email: '',
    role: 'consumer' as const,
    companyName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  const defaultMockReturn = {
    formData: defaultFormData,
    formErrors: {},
    isLoading: false,
    error: null,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRegisterForm.mockReturnValue(defaultMockReturn);
    mockIsValidPassword.mockReturnValue({
      isValid: false,
      errors: ['Password too short'],
    });
  });

  describe('Rendering', () => {
    it('renders the registration form correctly', () => {
      render(<RegisterForm />);
      
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/join our iot platform to get started/i)).toBeInTheDocument();
      expect(screen.getByText(/account/i)).toBeInTheDocument(); // Step indicator
    });

    it('renders step 1 (Account) by default', () => {
      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<RegisterForm className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Step Navigation', () => {
    it('shows step indicator with correct progression', () => {
      render(<RegisterForm />);
      
      const stepNumbers = screen.getAllByText(/[123]/);
      expect(stepNumbers).toHaveLength(3);
      
      // Check step titles
      expect(screen.getByText(/account/i)).toBeInTheDocument();
      expect(screen.getByText(/role/i)).toBeInTheDocument();
      expect(screen.getByText(/security/i)).toBeInTheDocument();
    });

    it('navigates to next step when Next button is clicked', async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com' },
      });
      
      render(<RegisterForm />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Should show role selection step
      expect(screen.getByText(/account type/i)).toBeInTheDocument();
    });

    it('shows Previous button on steps after first', async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com' },
      });
      
      render(<RegisterForm />);
      
      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    it('navigates back to previous step when Previous button is clicked', async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com' },
      });
      
      render(<RegisterForm />);
      
      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Navigate back to step 1
      const previousButton = screen.getByRole('button', { name: /previous/i });
      await user.click(previousButton);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
  });

  describe('Step 1 - Account Information', () => {
    it('handles name input change', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'name',
            value: 'John Doe',
          }),
        })
      );
    });

    it('handles email input change', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'john@example.com');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'email',
            value: 'john@example.com',
          }),
        })
      );
    });

    it('displays validation errors for name and email', () => {
      const mockFormErrors = {
        name: 'Name is required',
        email: 'Please enter a valid email address',
      };
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  describe('Step 2 - Role Selection', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com' },
      });
      
      render(<RegisterForm />);
      
      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
    });

    it('displays role selection options', () => {
      expect(screen.getByText(/account type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/consumer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    });

    it('handles role selection change', async () => {
      const user = userEvent.setup();
      
      const companyRadio = screen.getByLabelText(/company/i);
      await user.click(companyRadio);
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'role',
            value: 'company',
          }),
        })
      );
    });

    it('shows company name field when company role is selected', () => {
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, role: 'company' },
      });
      
      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });

    it('displays role validation error', () => {
      const mockFormErrors = { role: 'Please select a role' };
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/please select a role/i)).toBeInTheDocument();
    });
  });

  describe('Step 3 - Security', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com', role: 'consumer' },
      });
      
      render(<RegisterForm />);
      
      // Navigate to step 3
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
    });

    it('displays password fields and terms checkbox', () => {
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('shows password strength indicator', () => {
      mockIsValidPassword.mockReturnValue({
        isValid: false,
        errors: ['Password too short'],
      });
      
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, password: 'weak' },
      });
      
      render(<RegisterForm />);
      
      expect(screen.getByText(/password strength/i)).toBeInTheDocument();
    });

    it('handles password input change', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'MyPassword123!');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'password',
            value: 'MyPassword123!',
          }),
        })
      );
    });

    it('handles confirm password input change', async () => {
      const user = userEvent.setup();
      
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      await user.type(confirmPasswordInput, 'MyPassword123!');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'confirmPassword',
            value: 'MyPassword123!',
          }),
        })
      );
    });

    it('handles terms acceptance change', async () => {
      const user = userEvent.setup();
      
      const termsCheckbox = screen.getByRole('checkbox');
      await user.click(termsCheckbox);
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'acceptTerms',
            checked: true,
          }),
        })
      );
    });

    it('shows Create Account button on final step', () => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe('Password Strength Indicator', () => {
    it('shows password requirements', () => {
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, password: 'test' },
      });
      
      render(<RegisterForm />);
      
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
      expect(screen.getByText(/one special character/i)).toBeInTheDocument();
    });

    it('shows progress for password strength', () => {
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, password: 'TestPass123!' },
      });
      
      render(<RegisterForm />);
      
      expect(screen.getByText(/password strength/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('displays validation errors', () => {
      const mockFormErrors = {
        password: 'Password is too weak',
        confirmPassword: 'Passwords do not match',
        acceptTerms: 'You must accept the terms',
      };
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
    });

    it('displays global error message', () => {
      const mockError = 'Registration failed';
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls handleSubmit on form submission', async () => {
      const user = userEvent.setup();
      mockHandleSubmit.mockResolvedValue({ success: true, user: { id: 1 } });
      
      render(<RegisterForm />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'submit',
        })
      );
    });

    it('calls onSuccess callback on successful submission', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 1, email: 'test@example.com' };
      mockHandleSubmit.mockResolvedValue({ success: true, user: mockUser });
      
      render(<RegisterForm onSuccess={mockOnSuccess} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
      });
    });

    it('calls onError callback on failed submission', async () => {
      const user = userEvent.setup();
      const mockError = 'Registration failed';
      mockHandleSubmit.mockResolvedValue({ success: false, error: mockError });
      
      render(<RegisterForm onError={mockOnError} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock form data for all steps completed
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: {
          ...defaultFormData,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'consumer',
          password: 'Test123!',
          confirmPassword: 'Test123!',
          acceptTerms: true,
        },
        isLoading: true,
      });

      render(<RegisterForm />);
      
      // Navigate to step 2 (Role selection)
      let nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Navigate to step 3 (Security/Final step)
      nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Now we should see the loading state
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    it('disables submit button during loading', async () => {
      const user = userEvent.setup();
      
      // Mock form data for all steps completed
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: {
          ...defaultFormData,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'consumer',
          password: 'Test123!',
          confirmPassword: 'Test123!',
          acceptTerms: true,
        },
        isLoading: true,
      });

      render(<RegisterForm />);
      
      // Navigate to step 2 (Role selection)
      let nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Navigate to step 3 (Security/Final step)
      nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Now we should see the disabled submit button
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<RegisterForm />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
    });

    it('sets aria-invalid to true for fields with errors', () => {
      const mockFormErrors = { name: 'Name is required' };
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<RegisterForm />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('has proper form structure', () => {
      render(<RegisterForm />);
      
      // Look for form element directly instead of by role
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('novalidate');
    });
  });

  describe('Footer Links', () => {
    it('renders sign in link', () => {
      render(<RegisterForm />);
      
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders terms and privacy policy links', async () => {
      const user = userEvent.setup();
      mockUseRegisterForm.mockReturnValue({
        ...defaultMockReturn,
        formData: { ...defaultFormData, name: 'John Doe', email: 'john@example.com', role: 'consumer' },
      });
      
      render(<RegisterForm />);
      
      // Navigate to step 3
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });
});
