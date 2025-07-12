/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '@/store/slices/authSlice';
import IntegrationSettings from '@/components/company/settings/IntegrationSettings';
import { useToast } from '@/components/providers/ToastProvider';

// Mock the toast provider
jest.mock('@/components/providers/ToastProvider', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn()
  }))
}));

// Mock Modal and ConfirmDialog
jest.mock('@/components/ui/Modal', () => {
  return function MockModal({ children, isOpen, title }: any) {
    return isOpen ? (
      <div data-testid="modal" role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    ) : null;
  };
});

jest.mock('@/components/ui/ConfirmDialog', () => {
  return function MockConfirmDialog({ isOpen, title, message, onConfirm }: any) {
    return isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null;
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

const mockShowToast = jest.fn();

describe('IntegrationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <IntegrationSettings {...props} />
      </Provider>
    );
  };

  it('renders loading state initially', () => {
    renderComponent();
    
    expect(screen.getByText('Integration Settings')).toBeInTheDocument();
  });

  it('renders all tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('API Endpoints')).toBeInTheDocument();
      expect(screen.getByText('Industrial Protocols')).toBeInTheDocument();
      expect(screen.getByText('Cloud Services')).toBeInTheDocument();
      expect(screen.getByText('Webhooks')).toBeInTheDocument();
    });
  });

  it('shows API endpoints tab by default', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('ERP System Integration')).toBeInTheDocument();
      expect(screen.getByText('Weather Service API')).toBeInTheDocument();
    });
  });

  it('can switch to protocols tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    expect(screen.getByText('Modbus TCP/IP')).toBeInTheDocument();
    expect(screen.getByText('MQTT Broker')).toBeInTheDocument();
    expect(screen.getByText('OPC UA Server')).toBeInTheDocument();
  });

  it('can switch to cloud services tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cloud Services'));
    });
    
    expect(screen.getByText('Cloud Services')).toBeInTheDocument();
    expect(screen.getByText('Cloud integration settings coming soon')).toBeInTheDocument();
  });

  it('can switch to webhooks tab', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Webhooks'));
    });
    
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    expect(screen.getByText('Webhook configuration coming soon')).toBeInTheDocument();
  });

  it('shows add endpoint button', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Add Endpoint')).toBeInTheDocument();
    });
  });

  it('shows save changes button', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('can test API connection', async () => {
    renderComponent();
    
    await waitFor(() => {
      const testButtons = screen.getAllByText('Test');
      fireEvent.click(testButtons[0]);
    });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Connection Test Successful',
        message: expect.stringContaining('is responding correctly'),
        type: 'success'
      });
    });
  });

  it('can test protocol connection', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      const testButtons = screen.getAllByText('Test');
      fireEvent.click(testButtons[0]);
    });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Protocol Test Successful',
        message: expect.stringContaining('connection established'),
        type: 'success'
      });
    });
  });

  it('shows testing state during connection test', async () => {
    renderComponent();
    
    await waitFor(() => {
      const testButtons = screen.getAllByText('Test');
      fireEvent.click(testButtons[0]);
    });
    
    expect(screen.getByText('Testing...')).toBeInTheDocument();
  });

  it('can toggle protocol enable/disable', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      const toggleSwitches = screen.getAllByRole('button');
      const protocolToggle = toggleSwitches.find(button => 
        button.querySelector('span') && button.getAttribute('class')?.includes('rounded-full')
      );
      
      if (protocolToggle) {
        fireEvent.click(protocolToggle);
      }
    });
  });

  it('can open add endpoint modal', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Endpoint'));
    });
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Add API Endpoint')).toBeInTheDocument();
  });

  it('can open add protocol modal', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Protocol'));
    });
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Add Protocol')).toBeInTheDocument();
  });

  it('can edit endpoint', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('text-gray-400')
      );
      
      if (editButton) {
        fireEvent.click(editButton);
      }
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('can delete endpoint', async () => {
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('hover:text-red-600')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
  });

  it('shows correct status icons', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Check for status icons (SVG elements)
      const statusIcons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg')
      );
      
      expect(statusIcons.length).toBeGreaterThan(0);
    });
  });

  it('displays connection information', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Last tested:/)).toBeInTheDocument();
      expect(screen.getByText(/Response time:/)).toBeInTheDocument();
    });
  });

  it('shows protocol icons', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      // Check that protocol items have icons
      const protocolItems = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg')
      );
      
      expect(protocolItems.length).toBeGreaterThan(0);
    });
  });

  it('shows device counts for protocols', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('12 devices')).toBeInTheDocument();
      expect(screen.getByText('45 devices')).toBeInTheDocument();
      expect(screen.getByText('8 devices')).toBeInTheDocument();
    });
  });

  it('handles form submission for new endpoint', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Endpoint'));
    });
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Enter name');
      const urlInput = screen.getByPlaceholderText('https://api.example.com');
      
      fireEvent.change(nameInput, { target: { value: 'Test API' } });
      fireEvent.change(urlInput, { target: { value: 'https://test.example.com' } });
      
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
    });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Added Successfully',
        message: 'Test API has been added',
        type: 'success'
      });
    });
  });

  it('handles form validation', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Endpoint'));
    });
    
    await waitFor(() => {
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
    });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error'
      });
    });
  });

  it('saves changes correctly', async () => {
    const onSave = jest.fn();
    renderComponent({ onSave });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      const toggleSwitches = screen.getAllByRole('button');
      const protocolToggle = toggleSwitches.find(button => 
        button.querySelector('span') && button.getAttribute('class')?.includes('rounded-full')
      );
      
      if (protocolToggle) {
        fireEvent.click(protocolToggle);
      }
    });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Settings Saved',
        message: 'Integration settings have been updated successfully',
        type: 'success'
      });
    });
  });

  it('shows unsaved changes indicator', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
    });
    
    await waitFor(() => {
      const toggleSwitches = screen.getAllByRole('button');
      const protocolToggle = toggleSwitches.find(button => 
        button.querySelector('span') && button.getAttribute('class')?.includes('rounded-full')
      );
      
      if (protocolToggle) {
        fireEvent.click(protocolToggle);
      }
    });
    
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('handles readonly mode', async () => {
    renderComponent({ readOnly: true });
    
    await waitFor(() => {
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
  });

  it('applies correct tab styling', async () => {
    renderComponent();
    
    await waitFor(() => {
      const apiTab = screen.getByRole('button', { name: /api endpoints/i });
      expect(apiTab).toHaveClass('border-blue-500', 'text-blue-600');
    });
  });

  it('maintains tab state when switching', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Industrial Protocols'));
      expect(screen.getByText('Modbus TCP/IP')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('API Endpoints'));
      expect(screen.getByText('ERP System Integration')).toBeInTheDocument();
    });
  });
});
