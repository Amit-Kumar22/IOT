/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '@/store/slices/authSlice';
import SystemSettings from '@/components/company/settings/SystemSettings';
import { useToast } from '@/components/providers/ToastProvider';

// Mock the toast provider
jest.mock('@/components/providers/ToastProvider', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn()
  }))
}));

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: authSlice
  },
  preloadedState: {
    auth: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin' as const,
        companyId: '1',
        permissions: ['read', 'write', 'admin'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: false
      },
      tokens: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer' as const
      },
      isAuthenticated: true,
      isLoading: false,
      error: null
    }
  }
});

const mockShowToast = jest.fn();

describe('SystemSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <SystemSettings {...props} />
      </Provider>
    );
  };

  it('renders loading state initially', () => {
    renderComponent();
    
    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });

  it('renders all tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Backup')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  it('shows general tab content by default', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('General Configuration')).toBeInTheDocument();
      expect(screen.getByText('UI Preferences')).toBeInTheDocument();
    });
  });

  it('can switch to security tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Security'));
    });
    
    expect(screen.getByText('Authentication & Access Control')).toBeInTheDocument();
    expect(screen.getByText('Data Protection')).toBeInTheDocument();
  });

  it('can switch to backup tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Backup'));
    });
    
    expect(screen.getByText('Backup Configuration')).toBeInTheDocument();
    expect(screen.getByText('Backup Status')).toBeInTheDocument();
  });

  it('can switch to performance tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Performance'));
    });
    
    expect(screen.getByText('System Performance')).toBeInTheDocument();
    expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
  });

  it('can switch to notifications tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Notifications'));
    });
    
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Configuration')).toBeInTheDocument();
  });

  it('can switch to maintenance tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Maintenance'));
    });
    
    expect(screen.getByText('Maintenance Settings')).toBeInTheDocument();
    expect(screen.getByText('System Monitoring')).toBeInTheDocument();
  });

  it('shows save button when modifications are made', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('shows unsaved changes indicator', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Make a change to trigger unsaved state
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'New IoT Platform' } });
    });
    
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('can save changes', async () => {
    const onSave = jest.fn();
    renderComponent({ onSave });
    
    await waitFor(() => {
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'New IoT Platform' } });
    });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Settings Saved',
        message: 'System configuration has been updated successfully',
        type: 'success'
      });
    });
  });

  it('handles input changes correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'Updated System Name' } });
      expect(systemNameInput).toHaveValue('Updated System Name');
    });
  });

  it('handles checkbox changes correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      const debugModeCheckbox = screen.getByRole('checkbox', { name: /enable dark mode/i });
      fireEvent.click(debugModeCheckbox);
      expect(debugModeCheckbox).toBeChecked();
    });
  });

  it('handles select changes correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      const timezoneSelect = screen.getByDisplayValue('UTC');
      fireEvent.change(timezoneSelect, { target: { value: 'America/New_York' } });
      expect(timezoneSelect).toHaveValue('America/New_York');
    });
  });

  it('shows loading state when saving', async () => {
    renderComponent();
    
    await waitFor(() => {
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'New IoT Platform' } });
    });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('disables save button when no changes', async () => {
    renderComponent();
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });
  });

  it('enables save button when changes are made', async () => {
    renderComponent();
    
    await waitFor(() => {
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'New IoT Platform' } });
    });
    
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).not.toBeDisabled();
  });

  it('shows correct tab icons', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Check that tabs have icons (SVG elements)
      const tabButtons = screen.getAllByRole('button');
      const tabsWithIcons = tabButtons.filter(button => 
        button.querySelector('svg') && button.textContent?.includes('General')
      );
      
      expect(tabsWithIcons.length).toBeGreaterThan(0);
    });
  });

  it('applies correct styling to active tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      const generalTab = screen.getByRole('button', { name: /general/i });
      expect(generalTab).toHaveClass('border-blue-500', 'text-blue-600');
    });
  });

  it('maintains form state when switching tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Change system name in general tab
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'Updated System' } });
      
      // Switch to security tab
      fireEvent.click(screen.getByText('Security'));
      
      // Switch back to general tab
      fireEvent.click(screen.getByText('General'));
      
      // Check that the change is still there
      expect(screen.getByDisplayValue('Updated System')).toBeInTheDocument();
    });
  });

  it('handles readonly mode correctly', async () => {
    renderComponent({ readOnly: true });
    
    await waitFor(() => {
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
  });

  it('shows proper error handling for save failures', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    renderComponent({ onSave });
    
    await waitFor(() => {
      const systemNameInput = screen.getByDisplayValue('IoT Platform');
      fireEvent.change(systemNameInput, { target: { value: 'New IoT Platform' } });
    });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Save Failed',
        message: 'Failed to save system configuration. Please try again.',
        type: 'error'
      });
    });
  });

  it('handles numeric input validation', async () => {
    renderComponent();
    
    await waitFor(() => {
      const sessionTimeoutInput = screen.getByDisplayValue('30');
      fireEvent.change(sessionTimeoutInput, { target: { value: '60' } });
      expect(sessionTimeoutInput).toHaveValue(60);
    });
  });

  it('handles nested configuration changes', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Performance'));
    });
    
    const cpuThresholdInput = screen.getByDisplayValue('80');
    fireEvent.change(cpuThresholdInput, { target: { value: '85' } });
    expect(cpuThresholdInput).toHaveValue(85);
  });

  it('provides proper accessibility attributes', async () => {
    renderComponent();
    
    await waitFor(() => {
      const tabButtons = screen.getAllByRole('button');
      tabButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
