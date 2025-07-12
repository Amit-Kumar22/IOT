import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyAnalytics from '../page';
import authSlice from '@/store/slices/authSlice';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Mock the Modal component
jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="modal" role="dialog">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

// Mock the ConfirmDialog component
jest.mock('@/components/ui/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, message }: any) => (
    isOpen ? (
      <div data-testid="confirm-dialog" role="dialog">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        <button onClick={onClose} data-testid="confirm-cancel">Cancel</button>
        <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
      </div>
    ) : null
  ),
}));

// Mock chart components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
  Bar: ({ dataKey }: any) => <div data-testid={`bar-${dataKey}`} />,
  Cell: () => <div data-testid="cell" />,
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { 
          id: 'company-user-id',
          email: 'company@iot.com', 
          name: 'Company User',
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

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <ToastProvider>
        {component}
      </ToastProvider>
    </Provider>
  );
};

describe('CompanyAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics dashboard with main sections', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    expect(screen.getByText('Industrial Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time insights and performance metrics')).toBeInTheDocument();
  });

  it('displays KPI cards with correct values', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    expect(screen.getByText('Operational Efficiency')).toBeInTheDocument();
    expect(screen.getByText('87.5%')).toBeInTheDocument();
    expect(screen.getByText('System Downtime')).toBeInTheDocument();
    expect(screen.getByText('2.3%')).toBeInTheDocument();
    expect(screen.getByText('Production Throughput')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
    expect(screen.getByText('96.2%')).toBeInTheDocument();
  });

  it('displays site overview cards', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    expect(screen.getByText('Manufacturing Plant A')).toBeInTheDocument();
    expect(screen.getByText('Warehouse B')).toBeInTheDocument();
    expect(screen.getByText('Distribution Center')).toBeInTheDocument();
    expect(screen.getByText('45 devices')).toBeInTheDocument();
    expect(screen.getByText('32 devices')).toBeInTheDocument();
    expect(screen.getByText('28 devices')).toBeInTheDocument();
  });

  it('changes time range when option is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const timeRangeSelect = screen.getByDisplayValue('24h');
    await user.selectOptions(timeRangeSelect, '7d');
    
    expect(timeRangeSelect).toHaveValue('7d');
  });

  it('toggles filter panel when filter button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);
    
    expect(screen.getByText('Filter Options')).toBeInTheDocument();
    
    await user.click(filterButton);
    expect(screen.queryByText('Filter Options')).not.toBeInTheDocument();
  });

  it('opens report modal when Generate Report button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const reportButton = screen.getByText('Generate Report');
    await user.click(reportButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Generate Analytics Report');
  });

  it('opens KPI modal when Configure KPIs button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const kpiButton = screen.getByText('Configure KPIs');
    await user.click(kpiButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Configure KPIs');
  });

  it('toggles auto-refresh when switch is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const autoRefreshToggle = screen.getByRole('checkbox');
    expect(autoRefreshToggle).toBeChecked();
    
    await user.click(autoRefreshToggle);
    expect(autoRefreshToggle).not.toBeChecked();
  });

  it('exports data when export button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  it('displays alerts with correct information', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    expect(screen.getByText('System Alerts')).toBeInTheDocument();
    expect(screen.getByText('High CPU usage on Device #127')).toBeInTheDocument();
    expect(screen.getByText('Connection lost to Sensor #45')).toBeInTheDocument();
    expect(screen.getByText('Scheduled maintenance reminder')).toBeInTheDocument();
  });

  it('handles alert click to open detail modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const alertButton = screen.getByText('High CPU usage on Device #127');
    await user.click(alertButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Alert Details');
  });

  it('handles site click to open site detail modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const siteButton = screen.getByText('Manufacturing Plant A');
    await user.click(siteButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Site Details: Manufacturing Plant A');
  });

  it('renders trend charts when chart view is selected', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('updates metrics selection when checkboxes are toggled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);
    
    const performanceCheckbox = screen.getByLabelText('Performance');
    await user.click(performanceCheckbox);
    
    // Performance metric should be deselected
    expect(performanceCheckbox).not.toBeChecked();
  });

  it('handles view type change correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const viewSelect = screen.getByDisplayValue('overview');
    await user.selectOptions(viewSelect, 'detailed');
    
    expect(viewSelect).toHaveValue('detailed');
  });

  it('displays correct efficiency status indicators', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    // Check for efficiency badges
    expect(screen.getByText('89.2%')).toBeInTheDocument();
    expect(screen.getByText('91.8%')).toBeInTheDocument();
    expect(screen.getByText('93.1%')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);
    
    // Should trigger data refresh
    expect(refreshButton).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const reportButton = screen.getByText('Generate Report');
    await user.click(reportButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('displays control panel when control button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const controlButton = screen.getByText('Control Panel');
    await user.click(controlButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Analytics Control Panel');
  });

  it('handles metric configuration in control panel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const controlButton = screen.getByText('Control Panel');
    await user.click(controlButton);
    
    // Check for metric configuration options
    expect(screen.getByText('Metric Configuration')).toBeInTheDocument();
    expect(screen.getByText('Threshold Settings')).toBeInTheDocument();
    expect(screen.getByText('Alert Configuration')).toBeInTheDocument();
  });

  it('validates report generation form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const reportButton = screen.getByText('Generate Report');
    await user.click(reportButton);
    
    const generateButton = screen.getByText('Generate Report');
    await user.click(generateButton);
    
    // Should show validation or processing state
    expect(screen.getByText('Generating report...')).toBeInTheDocument();
  });

  it('handles site filtering correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);
    
    const siteCheckbox = screen.getByLabelText('Manufacturing Plant A');
    await user.click(siteCheckbox);
    
    // Should filter by selected site
    expect(siteCheckbox).toBeChecked();
  });

  it('displays correct alert counts by type', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    // Check alert statistics
    expect(screen.getByText('3')).toBeInTheDocument(); // Total alerts
    expect(screen.getByText('System Alerts')).toBeInTheDocument();
  });

  it('handles KPI threshold configuration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyAnalytics />);
    
    const kpiButton = screen.getByText('Configure KPIs');
    await user.click(kpiButton);
    
    // Check for KPI configuration elements
    expect(screen.getByText('Operational Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Target: 90%')).toBeInTheDocument();
  });

  it('renders performance metrics with correct trends', () => {
    renderWithProviders(<CompanyAnalytics />);
    
    // Check for trend indicators
    const trendIcons = screen.getAllByTestId(/trend-/);
    expect(trendIcons.length).toBeGreaterThan(0);
  });
});
