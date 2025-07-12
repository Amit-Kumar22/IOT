/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '@/store/slices/authSlice';
import CompanySettings from '@/app/company/settings/page';
import { useToast } from '@/components/providers/ToastProvider';

// Mock the toast provider
jest.mock('@/components/providers/ToastProvider', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn()
  }))
}));

// Mock the settings components
jest.mock('@/components/company/settings/CompanyProfile', () => {
  return function MockCompanyProfile() {
    return <div data-testid="company-profile">Company Profile Component</div>;
  };
});

jest.mock('@/components/company/settings/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management Component</div>;
  };
});

jest.mock('@/components/company/settings/SystemSettings', () => {
  return function MockSystemSettings() {
    return <div data-testid="system-settings">System Settings Component</div>;
  };
});

jest.mock('@/components/company/settings/IntegrationSettings', () => {
  return function MockIntegrationSettings() {
    return <div data-testid="integration-settings">Integration Settings Component</div>;
  };
});

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

describe('CompanySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <CompanySettings />
      </Provider>
    );
  };

  it('renders settings page with header', () => {
    renderComponent();
    
    expect(screen.getByText('Company Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your industrial IoT platform')).toBeInTheDocument();
  });

  it('renders navigation menu with all sections', () => {
    renderComponent();
    
    const expectedSections = [
      'Company Profile',
      'User Management',
      'System Configuration',
      'Integrations',
      'Notifications',
      'Security & Access',
      'Support & Logs'
    ];

    expectedSections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });

  it('shows company profile by default', () => {
    renderComponent();
    
    expect(screen.getByTestId('company-profile')).toBeInTheDocument();
  });

  it('can navigate to user management section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('User Management'));
    
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('can navigate to system settings section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('System Configuration'));
    
    expect(screen.getByTestId('system-settings')).toBeInTheDocument();
  });

  it('can navigate to integration settings section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Integrations'));
    
    expect(screen.getByTestId('integration-settings')).toBeInTheDocument();
  });

  it('shows placeholder for notifications section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Notifications'));
    
    expect(screen.getByText('Notifications settings coming soon')).toBeInTheDocument();
  });

  it('shows placeholder for security section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Security & Access'));
    
    expect(screen.getByText('Security & Access settings coming soon')).toBeInTheDocument();
  });

  it('shows placeholder for support section', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Support & Logs'));
    
    expect(screen.getByText('Support & Logs settings coming soon')).toBeInTheDocument();
  });

  it('highlights active section in navigation', () => {
    renderComponent();
    
    const companyProfileButton = screen.getByRole('button', { name: /company profile/i });
    expect(companyProfileButton).toHaveClass('bg-blue-100', 'text-blue-700');
    
    fireEvent.click(screen.getByText('User Management'));
    
    const userManagementButton = screen.getByRole('button', { name: /user management/i });
    expect(userManagementButton).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(companyProfileButton).not.toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('has responsive grid layout', () => {
    renderComponent();
    
    const mainContainer = screen.getByRole('main') || document.querySelector('.grid');
    expect(mainContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
  });

  it('displays all navigation icons', () => {
    renderComponent();
    
    // Check that all navigation buttons have icons (SVG elements)
    const navButtons = screen.getAllByRole('button');
    const navButtonsWithIcons = navButtons.filter(button => 
      button.querySelector('svg')
    );
    
    expect(navButtonsWithIcons).toHaveLength(7); // 7 navigation sections
  });

  it('maintains state when switching between sections', () => {
    renderComponent();
    
    // Start with company profile
    expect(screen.getByTestId('company-profile')).toBeInTheDocument();
    
    // Switch to user management
    fireEvent.click(screen.getByText('User Management'));
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    
    // Switch back to company profile
    fireEvent.click(screen.getByText('Company Profile'));
    expect(screen.getByTestId('company-profile')).toBeInTheDocument();
  });

  it('applies correct styling to navigation items', () => {
    renderComponent();
    
    const navButtons = screen.getAllByRole('button');
    
    navButtons.forEach(button => {
      expect(button).toHaveClass('w-full', 'text-left', 'px-3', 'py-2', 'rounded-lg');
    });
  });

  it('handles keyboard navigation', () => {
    renderComponent();
    
    const firstNavButton = screen.getByRole('button', { name: /company profile/i });
    const secondNavButton = screen.getByRole('button', { name: /user management/i });
    
    firstNavButton.focus();
    expect(document.activeElement).toBe(firstNavButton);
    
    fireEvent.keyDown(firstNavButton, { key: 'Tab' });
    expect(document.activeElement).toBe(secondNavButton);
  });

  it('handles section switching with keyboard', () => {
    renderComponent();
    
    const userManagementButton = screen.getByRole('button', { name: /user management/i });
    
    fireEvent.keyDown(userManagementButton, { key: 'Enter' });
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    
    fireEvent.keyDown(userManagementButton, { key: ' ' });
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('renders correct number of navigation sections', () => {
    renderComponent();
    
    const navButtons = screen.getAllByRole('button');
    expect(navButtons).toHaveLength(7);
  });

  it('displays section content correctly', () => {
    renderComponent();
    
    // Test that only one section is visible at a time
    expect(screen.getByTestId('company-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
    expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('integration-settings')).not.toBeInTheDocument();
    
    // Switch to user management
    fireEvent.click(screen.getByText('User Management'));
    
    expect(screen.queryByTestId('company-profile')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('integration-settings')).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    renderComponent();
    
    const navButtons = screen.getAllByRole('button');
    
    navButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('shows proper loading state when components are loading', () => {
    renderComponent();
    
    // Components should render without loading states by default
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('company-profile')).toBeInTheDocument();
  });
});
