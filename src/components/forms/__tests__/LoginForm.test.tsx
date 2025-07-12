/**
 * Unit Tests for LoginForm Component
 * 
 * Tests cover:
 * - Component rendering
 * - Form validation
 * - User interactions
 * - Error handling
 * - Accessibility features
 * - Loading states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Mock the custom hooks
jest.mock('@/hooks/auth', () => ({
  useLoginForm: jest.fn(),
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
}));

const mockUseLoginForm = require('@/hooks/auth').useLoginForm as jest.Mock;

describe('LoginForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  const defaultFormData = {
    email: '',
    password: '',
    rememberMe: false,
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
    mockUseLoginForm.mockReturnValue(defaultMockReturn);
  });

  describe('Rendering', () => {
    it('renders the login form correctly', () => {
      render(<LoginForm />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account to continue/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember me for 30 days/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders footer links correctly', () => {
      render(<LoginForm />);
      
      expect(screen.getByRole('link', { name: /forgot your password/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<LoginForm className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Form Validation', () => {
    it('displays email validation error', () => {
      const mockFormErrors = { email: 'Please enter a valid email address' };
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<LoginForm />);
      
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('displays password validation error', () => {
      const mockFormErrors = { password: 'Password is required' };
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<LoginForm />);
      
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('displays global error message', () => {
      const mockError = 'Invalid credentials';
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      render(<LoginForm />);
      
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles email input change', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'email',
            value: 'test@example.com',
          }),
        })
      );
    });

    it('handles password input change', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'password',
            value: 'password123',
          }),
        })
      );
    });

    it('handles remember me checkbox change', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me for 30 days/i });
      await user.click(rememberMeCheckbox);
      
      expect(mockHandleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'rememberMe',
            checked: true,
          }),
        })
      );
    });

    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls handleSubmit on form submission', async () => {
      const user = userEvent.setup();
      mockHandleSubmit.mockResolvedValue({ success: true, user: { id: 1 } });
      
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
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
      
      render(<LoginForm onSuccess={mockOnSuccess} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
      });
    });

    it('calls onError callback on failed submission', async () => {
      const user = userEvent.setup();
      const mockError = 'Invalid credentials';
      mockHandleSubmit.mockResolvedValue({ success: false, error: mockError });
      
      render(<LoginForm onError={mockOnError} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during submission', () => {
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<LoginForm />);
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('disables form elements during loading', () => {
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<LoginForm />);
      
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('sets aria-invalid to true for fields with errors', () => {
      const mockFormErrors = { email: 'Invalid email' };
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error messages with form fields', () => {
      const mockFormErrors = { email: 'Invalid email' };
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const errorMessage = screen.getByText(/invalid email/i);
      
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(errorMessage.closest('div')).toHaveAttribute('id', 'email-error');
    });

    it('has proper form structure and labeling', () => {
      render(<LoginForm />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('novalidate');
      
      // Check that all form elements have proper labels
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me for 30 days/i)).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('focuses on first error field when validation fails', async () => {
      const mockFormErrors = { email: 'Invalid email', password: 'Required' };
      mockUseLoginForm.mockReturnValue({
        ...defaultMockReturn,
        formErrors: mockFormErrors,
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      
      // Simulate form submission attempt
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(emailInput).toHaveFocus();
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders with responsive classes', () => {
      const { container } = render(<LoginForm />);
      
      // Check for responsive container classes
      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });
  });
});
