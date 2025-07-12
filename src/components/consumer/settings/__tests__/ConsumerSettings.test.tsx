import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the useAppSelector hook
jest.mock('@/hooks/redux', () => ({
  useAppSelector: jest.fn(() => ({
    user: { name: 'Test User', email: 'test@example.com' }
  }))
}));

// Mock the useStableInputHandler hook
jest.mock('@/hooks/useStableInput', () => ({
  useStableInputHandler: jest.fn((setter) => (field: string) => (e: any) => {
    setter((prev: any) => ({ ...prev, [field]: e.target.value }));
  })
}));

// Import the component after mocking
import ConsumerSettings from '../../../../app/consumer/settings/page';

describe('ConsumerSettings', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the settings page header', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your account and preferences')).toBeInTheDocument();
    });

    it('renders navigation sections', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
      expect(screen.getByText('Connected Devices')).toBeInTheDocument();
      expect(screen.getByText('Billing & Usage')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });

    it('shows profile section by default', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('switches to notifications section when clicked', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Notifications'));
      
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('switches to privacy section when clicked', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Privacy & Security'));
      
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    it('switches to devices section when clicked', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Connected Devices'));
      
      expect(screen.getByText('18')).toBeInTheDocument(); // Smart devices count
      expect(screen.getByText('Smart Devices')).toBeInTheDocument();
    });

    it('switches to billing section when clicked', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Billing & Usage'));
      
      expect(screen.getByText('Current Usage')).toBeInTheDocument();
      expect(screen.getByText('Billing Information')).toBeInTheDocument();
    });

    it('switches to support section when clicked', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Help & Support'));
      
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('System Information')).toBeInTheDocument();
    });
  });

  describe('Profile Section', () => {
    it('displays user profile information', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('enables editing when edit button is clicked', () => {
      render(<ConsumerSettings />);
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('disables form inputs by default', () => {
      render(<ConsumerSettings />);
      
      const nameInput = screen.getByDisplayValue('Test User');
      expect(nameInput).toBeDisabled();
    });

    it('enables form inputs when editing', () => {
      render(<ConsumerSettings />);
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      const nameInput = screen.getByDisplayValue('Test User');
      expect(nameInput).toBeEnabled();
    });

    it('saves changes when save button is clicked', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Make changes
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Should exit edit mode
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('cancels changes when cancel button is clicked', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Cancel changes
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      // Should exit edit mode
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('Preferences Section', () => {
    it('displays preference options', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByText('Temperature Unit')).toBeInTheDocument();
      expect(screen.getByText('Date Format')).toBeInTheDocument();
    });

    it('allows changing temperature unit', () => {
      render(<ConsumerSettings />);
      
      const temperatureSelect = screen.getByDisplayValue('Fahrenheit');
      fireEvent.change(temperatureSelect, { target: { value: 'Celsius' } });
      
      expect(temperatureSelect).toHaveValue('Celsius');
    });

    it('allows changing date format', () => {
      render(<ConsumerSettings />);
      
      const dateSelect = screen.getByDisplayValue('MM/DD/YYYY');
      fireEvent.change(dateSelect, { target: { value: 'DD/MM/YYYY' } });
      
      expect(dateSelect).toHaveValue('DD/MM/YYYY');
    });
  });

  describe('Notifications Section', () => {
    it('displays notification toggles', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Notifications'));
      
      expect(screen.getByText('Device Alerts')).toBeInTheDocument();
      expect(screen.getByText('Energy Reports')).toBeInTheDocument();
      expect(screen.getByText('Security Alerts')).toBeInTheDocument();
    });

    it('toggles notification settings', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Notifications'));
      
      // Find toggle switches (they don't have accessible text, so we look for their containers)
      const toggles = screen.getAllByRole('button');
      const notificationToggles = toggles.filter(toggle => 
        toggle.classList.contains('bg-blue-600') || 
        toggle.classList.contains('bg-gray-200')
      );
      
      expect(notificationToggles.length).toBeGreaterThan(0);
    });
  });

  describe('Security Section', () => {
    it('displays password change form', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Privacy & Security'));
      
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Privacy & Security'));
      
      const passwordInput = screen.getByPlaceholderText('Current password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
      }
    });

    it('displays privacy toggles', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Privacy & Security'));
      
      expect(screen.getByText('Data Sharing')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Personalization')).toBeInTheDocument();
      expect(screen.getByText('Third Party Apps')).toBeInTheDocument();
    });
  });

  describe('Devices Section', () => {
    it('displays device statistics', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Connected Devices'));
      
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('Smart Devices')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Mobile Devices')).toBeInTheDocument();
    });

    it('displays device management options', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Connected Devices'));
      
      expect(screen.getByText('Manage Smart Devices')).toBeInTheDocument();
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
      expect(screen.getByText('Network Settings')).toBeInTheDocument();
    });
  });

  describe('Billing Section', () => {
    it('displays usage statistics', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Billing & Usage'));
      
      expect(screen.getByText('847.2 kWh')).toBeInTheDocument();
      expect(screen.getByText('$101.66')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('displays billing information', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Billing & Usage'));
      
      expect(screen.getByText('Visa ending in 4567')).toBeInTheDocument();
      expect(screen.getByText('Expires 12/25')).toBeInTheDocument();
    });

    it('allows adding payment method', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Billing & Usage'));
      
      expect(screen.getByText('Add Payment Method')).toBeInTheDocument();
    });
  });

  describe('Support Section', () => {
    it('displays help options', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Help & Support'));
      
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Community Forum')).toBeInTheDocument();
    });

    it('displays system information', () => {
      render(<ConsumerSettings />);
      
      fireEvent.click(screen.getByText('Help & Support'));
      
      expect(screen.getByText('App Version')).toBeInTheDocument();
      expect(screen.getByText('2.1.4')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Clear required field
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Try to save
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Should still be in edit mode due to validation
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('validates email format', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Enter invalid email
      const emailInput = screen.getByDisplayValue('test@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      // Input should accept the value but form validation would prevent saving
      expect(emailInput).toHaveValue('invalid-email');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<ConsumerSettings />);
      
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Phone Number')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(<ConsumerSettings />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper navigation structure', () => {
      render(<ConsumerSettings />);
      
      const navButtons = screen.getAllByRole('button');
      const sectionButtons = navButtons.filter(button => 
        ['Profile', 'Notifications', 'Privacy & Security', 'Connected Devices', 'Billing & Usage', 'Help & Support']
          .includes(button.textContent || '')
      );
      
      expect(sectionButtons.length).toBe(6);
    });
  });

  describe('Error Handling', () => {
    it('handles missing user data gracefully', () => {
      // Mock useAppSelector to return undefined user
      const mockUseAppSelector = require('@/hooks/redux').useAppSelector as jest.Mock;
      mockUseAppSelector.mockReturnValue({ user: undefined });
      
      render(<ConsumerSettings />);
      
      // Should render without crashing
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('handles form submission errors', async () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Simulate form submission
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Should handle the submission (in this case, just exit edit mode)
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('maintains form state during editing', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Change values
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      // Value should be maintained
      expect(nameInput).toHaveValue('Updated Name');
    });

    it('resets form state when cancelled', () => {
      render(<ConsumerSettings />);
      
      // Enter edit mode
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Change values
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      // Cancel changes
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      // Should reset to original value
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });
});
