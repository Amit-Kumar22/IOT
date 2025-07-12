import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminLayout from '../layout';
import authSlice from '@/store/slices/authSlice';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserGroupIcon: () => <div data-testid="user-group-icon">UserGroupIcon</div>,
  CurrencyDollarIcon: () => <div data-testid="currency-icon">CurrencyDollarIcon</div>,
  ChartBarIcon: () => <div data-testid="chart-icon">ChartBarIcon</div>,
  CogIcon: () => <div data-testid="cog-icon">CogIcon</div>,
  Squares2X2Icon: () => <div data-testid="squares-icon">Squares2X2Icon</div>,
  XMarkIcon: () => <div data-testid="x-mark-icon">XMarkIcon</div>,
  Bars3Icon: () => <div data-testid="bars-icon">Bars3Icon</div>,
  UserIcon: () => <div data-testid="user-icon">UserIcon</div>,
  BellIcon: () => <div data-testid="bell-icon">BellIcon</div>,
  Cog6ToothIcon: () => <div data-testid="cog6tooth-icon">Cog6ToothIcon</div>,
}));

// Mock LogoutButton
jest.mock('@/components/layout/LogoutButton', () => ({
  LogoutButton: () => <div data-testid="logout-button">Logout</div>,
}));

// Create mock store
const createMockStore = (authState: any) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: authState,
    },
  });
};

describe('AdminLayout', () => {
  it('should render admin dashboard for admin user', () => {
    const mockStore = createMockStore({
      user: { id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin User', permissions: [] },
      isAuthenticated: true,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isLoading: false,
      error: null,
      loginAttempts: 0,
    });

    render(
      <Provider store={mockStore}>
        <AdminLayout>
          <div data-testid="admin-content">Admin Content</div>
        </AdminLayout>
      </Provider>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('should show access denied for non-admin user', () => {
    const mockStore = createMockStore({
      user: { id: '1', email: 'user@test.com', role: 'consumer', name: 'Regular User', permissions: [] },
      isAuthenticated: true,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isLoading: false,
      error: null,
      loginAttempts: 0,
    });

    render(
      <Provider store={mockStore}>
        <AdminLayout>
          <div data-testid="admin-content">Admin Content</div>
        </AdminLayout>
      </Provider>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this area.")).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('should render navigation items', () => {
    const mockStore = createMockStore({
      user: { id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin User', permissions: [] },
      isAuthenticated: true,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isLoading: false,
      error: null,
      loginAttempts: 0,
    });

    render(
      <Provider store={mockStore}>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </Provider>
    );

    expect(screen.getAllByText('Dashboard')).toHaveLength(2); // Mobile and desktop
    expect(screen.getAllByText('Users')).toHaveLength(2);
    expect(screen.getAllByText('Plans')).toHaveLength(2);
    expect(screen.getAllByText('Billing')).toHaveLength(2);
    expect(screen.getAllByText('Analytics')).toHaveLength(2);
    expect(screen.getAllByText('System')).toHaveLength(2);
  });
});
