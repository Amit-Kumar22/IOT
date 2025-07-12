import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyLayout from '../layout';
import authSlice from '@/store/slices/authSlice';

// Mock the layout components
jest.mock('@/components/layout/Sidebar', () => ({
  Sidebar: ({ navigation }: { navigation: any[] }) => (
    <div data-testid="sidebar">
      {navigation.map((item) => (
        <div key={item.name} data-testid={`nav-${item.name.toLowerCase()}`}>
          {item.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/layout/TopBar', () => ({
  TopBar: ({ title }: { title: string }) => (
    <div data-testid="topbar">{title}</div>
  ),
}));

// Create a mock store helper
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { email: 'test@company.com', role: 'company' },
        token: 'mock-token',
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

describe('CompanyLayout', () => {
  const mockChildren = <div data-testid="children">Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders layout with correct structure for company user', () => {
    renderWithStore(<CompanyLayout>{mockChildren}</CompanyLayout>);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithStore(<CompanyLayout>{mockChildren}</CompanyLayout>);

    const expectedNavItems = [
      'nav-devices',
      'nav-analytics',
      'nav-control',
      'nav-automation',
      'nav-users',
      'nav-settings',
      'nav-billing',
    ];

    expectedNavItems.forEach((navItem) => {
      expect(screen.getByTestId(navItem)).toBeInTheDocument();
    });
  });

  it('renders access denied for non-company user', () => {
    renderWithStore(
      <CompanyLayout>{mockChildren}</CompanyLayout>,
      { user: { email: 'test@consumer.com', role: 'consumer' } }
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access the company dashboard.")).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('topbar')).not.toBeInTheDocument();
  });

  it('allows access for admin user', () => {
    renderWithStore(
      <CompanyLayout>{mockChildren}</CompanyLayout>,
      { user: { email: 'admin@iot.com', role: 'admin' } }
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('handles null user gracefully', () => {
    renderWithStore(
      <CompanyLayout>{mockChildren}</CompanyLayout>,
      { user: null }
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithStore(<CompanyLayout>{mockChildren}</CompanyLayout>);

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');

    const mainContentDiv = rootDiv.querySelector('.lg\\:pl-72');
    expect(mainContentDiv).toBeInTheDocument();
  });

  it('renders main content with correct padding', () => {
    const { container } = renderWithStore(<CompanyLayout>{mockChildren}</CompanyLayout>);

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('py-10');

    const contentDiv = mainElement?.querySelector('div');
    expect(contentDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });
});
