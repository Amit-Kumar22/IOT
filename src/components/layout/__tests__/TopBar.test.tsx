import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import { TopBar } from '../TopBar';
import authSlice from '@/store/slices/authSlice';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the LogoutButton component
jest.mock('../LogoutButton', () => ({
  LogoutButton: ({ variant }: { variant: string }) => (
    <button data-testid="logout-button" aria-label="Logout">
      {variant === 'icon' ? '🚪' : 'Logout'}
    </button>
  ),
}));

const mockPush = jest.fn();

// Create a mock store helper
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { 
          id: 'test-user-id',
          email: 'test@company.com', 
          name: 'Test User',
          role: 'company' as const,
          permissions: ['read', 'write'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          isActive: true,
          emailVerified: true,
        },
        tokens: { 
          accessToken: 'mock-token', 
          refreshToken: 'mock-refresh',
          expiresAt: Date.now() + 3600000,
          tokenType: 'Bearer' as const,
        },
        isLoading: false,
        error: null,
        sessionId: 'mock-session',
        lastActivity: new Date().toISOString(),
        ...initialState,
      },
    },
  });
};

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('TopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it('renders title correctly', () => {
    renderWithStore(<TopBar title="Test Dashboard" />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  it('renders user information for authenticated user', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    expect(screen.getByText('test@company.com')).toBeInTheDocument();
    expect(screen.getByText('company')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const notificationButton = screen.getByRole('button', { name: 'View notifications' });
    expect(notificationButton).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
  });

  it('renders profile settings button', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const profileButton = screen.getByRole('button', { name: 'Profile & Settings' });
    expect(profileButton).toBeInTheDocument();
  });

  it('navigates to correct profile path for admin user', async () => {
    const user = userEvent.setup();
    renderWithStore(
      <TopBar title="Dashboard" />,
      { user: { 
        id: 'admin-id',
        email: 'admin@iot.com', 
        name: 'Admin User',
        role: 'admin' as const,
        permissions: ['all'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
        emailVerified: true,
      } }
    );

    const profileButton = screen.getByRole('button', { name: 'Profile & Settings' });
    await user.click(profileButton);

    expect(mockPush).toHaveBeenCalledWith('/admin/profile');
  });

  it('navigates to correct profile path for company user', async () => {
    const user = userEvent.setup();
    renderWithStore(<TopBar title="Dashboard" />);

    const profileButton = screen.getByRole('button', { name: 'Profile & Settings' });
    await user.click(profileButton);

    expect(mockPush).toHaveBeenCalledWith('/company/settings');
  });

  it('navigates to correct profile path for consumer user', async () => {
    const user = userEvent.setup();
    renderWithStore(
      <TopBar title="Dashboard" />,
      { user: { 
        id: 'consumer-id',
        email: 'consumer@iot.com', 
        name: 'Consumer User',
        role: 'consumer' as const,
        permissions: ['read'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
        emailVerified: true,
      } }
    );

    const profileButton = screen.getByRole('button', { name: 'Profile & Settings' });
    await user.click(profileButton);

    expect(mockPush).toHaveBeenCalledWith('/consumer/settings');
  });

  it('handles null user gracefully', () => {
    renderWithStore(
      <TopBar title="Dashboard" />,
      { user: null }
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View notifications' })).toBeInTheDocument();
    expect(screen.queryByText('test@company.com')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithStore(<TopBar title="Dashboard" />);

    const topBarDiv = container.firstChild as HTMLElement;
    expect(topBarDiv).toHaveClass(
      'sticky',
      'top-0',
      'z-40',
      'flex',
      'h-16',
      'items-center',
      'border-b',
      'border-gray-200',
      'dark:border-gray-700',
      'bg-white',
      'dark:bg-gray-900'
    );
  });

  it('renders user icon in profile section', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const userIconContainer = screen.getByText('test@company.com').closest('div')?.parentElement;
    expect(userIconContainer).toHaveClass('flex', 'items-center');
  });

  it('shows role with correct capitalization', () => {
    renderWithStore(
      <TopBar title="Dashboard" />,
      { user: { 
        id: 'admin-id',
        email: 'admin@iot.com', 
        name: 'Admin User',
        role: 'admin' as const,
        permissions: ['all'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
        emailVerified: true,
      } }
    );
    
    expect(screen.getByText('admin')).toHaveClass('capitalize');
  });

  it('has correct responsive classes for user info', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const userInfoDiv = screen.getByText('test@company.com').closest('div');
    expect(userInfoDiv).toHaveClass('hidden', 'lg:flex', 'lg:flex-col', 'lg:items-start');
  });

  it('notification button has correct accessibility', () => {
    renderWithStore(<TopBar title="Dashboard" />);
    
    const notificationButton = screen.getByRole('button', { name: 'View notifications' });
    expect(notificationButton).toHaveAttribute('type', 'button');
  });
});
