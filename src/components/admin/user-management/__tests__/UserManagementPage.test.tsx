import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserManagementPage from '../UserManagementPage';

// Mock the store with minimal setup
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false, isLoading: false, error: null }) => state,
  },
  preloadedState: {
    auth: {
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
  },
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistance: jest.fn(() => '2 days ago'),
}));

describe('UserManagementPage', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user management page with header', () => {
    renderWithProvider(<UserManagementPage />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage and monitor all users in your IoT platform')).toBeInTheDocument();
  });

  it('renders search and filter component', () => {
    renderWithProvider(<UserManagementPage />);
    
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    expect(screen.getByText('User Search & Filters')).toBeInTheDocument();
  });

  it('renders user table with mock data', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
  });

  it('handles user search', async () => {
    renderWithProvider(<UserManagementPage />);
    
    const searchInput = screen.getAllByPlaceholderText('Search users...')[0];
    fireEvent.change(searchInput, { target: { value: 'User 1' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('User 1');
    });
  });

  it('handles role filter', async () => {
    renderWithProvider(<UserManagementPage />);
    
    const roleSelect = screen.getByDisplayValue('All Roles');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    
    await waitFor(() => {
      expect(roleSelect).toHaveValue('admin');
    });
  });

  it('shows bulk actions when users are selected', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Select the first checkbox (header checkbox)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    });
  });

  it('displays user statistics', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Company Users')).toBeInTheDocument();
      expect(screen.getByText('Active This Week')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('10 per page')).toBeInTheDocument();
    });

    // Test page size change
    const pageSizeSelect = screen.getByDisplayValue('10 per page');
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    
    await waitFor(() => {
      expect(pageSizeSelect).toHaveValue('20');
    });
  });
});

describe('UserManagementPage - Bulk Operations', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  it('handles bulk user activation', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Select a user
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First user checkbox
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    });

    // Click activate button
    const activateButton = screen.getByText('Activate Users');
    fireEvent.click(activateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/users activated successfully/)).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog for delete operation', async () => {
    renderWithProvider(<UserManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Select a user
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText('Delete Users');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Bulk Action')).toBeInTheDocument();
    });
  });

  it('handles filter clearing', async () => {
    renderWithProvider(<UserManagementPage />);
    
    // Apply a filter
    const searchInput = screen.getAllByPlaceholderText('Search users...')[0];
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });
});
