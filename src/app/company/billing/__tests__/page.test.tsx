import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyBilling from '../page';
import authSlice from '@/store/slices/authSlice';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/company/billing',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: authSlice,
  },
  preloadedState: {
    auth: {
      user: {
        id: '1',
        email: 'test@company.com',
        name: 'Test User',
        role: 'company' as const,
        companyId: 'test-company',
        permissions: ['billing:read', 'billing:write'],
        avatar: undefined,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-12-15T00:00:00Z',
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: false,
      },
      tokens: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer' as const,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionId: 'mock-session',
      lastActivity: new Date().toISOString(),
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ToastProvider>
        {component}
      </ToastProvider>
    </Provider>
  );
};

describe('CompanyBilling', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
    
    // Mock window.open for invoice actions
    Object.defineProperty(window, 'open', {
      writable: true,
      value: jest.fn(() => ({
        document: {
          write: jest.fn(),
          close: jest.fn(),
        },
        print: jest.fn(),
      })),
    });
  });

  describe('Initial Rendering', () => {
    test('renders billing dashboard with header', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /billing dashboard/i })).toBeInTheDocument();
      });
      
      expect(screen.getByText(/comprehensive billing management/i)).toBeInTheDocument();
    });

    test('shows loading state initially', () => {
      renderWithProviders(<CompanyBilling />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('renders quick stats cards', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/current month/i)).toBeInTheDocument();
        expect(screen.getByText(/active devices/i)).toBeInTheDocument();
        expect(screen.getByText(/data transfer/i)).toBeInTheDocument();
        expect(screen.getByText(/current plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('renders all tabs', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/overview/i)).toBeInTheDocument();
        expect(screen.getByText(/usage details/i)).toBeInTheDocument();
        expect(screen.getByText(/invoices/i)).toBeInTheDocument();
        expect(screen.getByText(/payment methods/i)).toBeInTheDocument();
        expect(screen.getByText(/plans & pricing/i)).toBeInTheDocument();
        expect(screen.getByText(/usage alerts/i)).toBeInTheDocument();
        expect(screen.getByText(/cost analytics/i)).toBeInTheDocument();
      });
    });

    test('switches between tabs', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/overview/i)).toBeInTheDocument();
      });

      // Click on Usage Details tab
      fireEvent.click(screen.getByText(/usage details/i));
      
      await waitFor(() => {
        expect(screen.getByText(/usage details for/i)).toBeInTheDocument();
      });

      // Click on Invoices tab
      fireEvent.click(screen.getByText(/invoices/i));
      
      await waitFor(() => {
        expect(screen.getByText(/recent invoices/i)).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab', () => {
    test('displays current bill information', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/current bill/i)).toBeInTheDocument();
        expect(screen.getByText(/\$12,847.50/)).toBeInTheDocument();
      });
    });

    test('shows usage summary', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/usage summary/i)).toBeInTheDocument();
      });
    });

    test('renders cost breakdown charts', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/monthly cost trend/i)).toBeInTheDocument();
        expect(screen.getByText(/cost by category/i)).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Usage Monitoring', () => {
    test('displays usage alerts when present', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/usage alerts/i)).toBeInTheDocument();
      });
    });

    test('shows usage percentages', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/69% of limit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Payment Processing', () => {
    test('handles payment processing', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByText(/pay now/i)).toBeInTheDocument();
      });

      const payButton = screen.getByText(/pay current bill/i);
      fireEvent.click(payButton);
      
      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Invoice Management', () => {
    test('switches to invoices tab and shows invoice list', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/invoices/i));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/recent invoices/i)).toBeInTheDocument();
        expect(screen.getByText(/INV-2024-012/)).toBeInTheDocument();
      });
    });

    test('handles invoice download', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/invoices/i));
      });
      
      await waitFor(() => {
        const downloadButtons = screen.getAllByText(/download/i);
        expect(downloadButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Plan Management', () => {
    test('shows plan comparison when switching to plans tab', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/plans & pricing/i));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/starter/i)).toBeInTheDocument();
        expect(screen.getByText(/professional/i)).toBeInTheDocument();
        expect(screen.getByText(/industrial pro/i)).toBeInTheDocument();
        expect(screen.getByText(/enterprise/i)).toBeInTheDocument();
      });
    });

    test('highlights current plan', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/plans & pricing/i));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/current plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Payment Methods', () => {
    test('shows payment methods tab', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/payment methods/i));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/payment methods/i)).toBeInTheDocument();
        expect(screen.getByText(/add payment method/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    test('handles billing data export', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        const exportButton = screen.getByText(/export data/i);
        fireEvent.click(exportButton);
      });
      
      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = jest.fn(() => 'mock-url');
      const mockRevokeObjectURL = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockClick = jest.fn();
      
      Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
      Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });
      Object.defineProperty(document, 'createElement', {
        value: jest.fn(() => ({
          href: '',
          download: '',
          click: mockClick,
        })),
      });
      Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
      Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });
    });
  });

  describe('Error Handling', () => {
    test('handles payment errors gracefully', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        const payButton = screen.getByText(/pay current bill/i);
        fireEvent.click(payButton);
      });
      
      // The component should handle errors without crashing
      await waitFor(() => {
        expect(screen.getByText(/pay current bill/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders properly on mobile', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /billing dashboard/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /billing dashboard/i })).toBeInTheDocument();
      });
      
      // Check for buttons
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      renderWithProviders(<CompanyBilling />);
      
      await waitFor(() => {
        const overviewTab = screen.getByText(/overview/i);
        overviewTab.focus();
        expect(document.activeElement).toBe(overviewTab);
      });
    });
  });
});
