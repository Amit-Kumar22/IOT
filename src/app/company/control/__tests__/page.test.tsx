import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyControlPage from '../page';
import { ToastProvider } from '@/components/providers/ToastProvider';
import authSlice from '@/store/slices/authSlice';
import { UserRole } from '@/types/auth';

// Mock the SCADAPanel component
jest.mock('@/components/company/control/SCADAPanel', () => ({
  SCADAPanel: ({ diagram, onCommand, onAlarmAcknowledge, onEmergencyStop }: any) => (
    <div data-testid="scada-panel">
      <div data-testid="diagram-name">{diagram.name}</div>
      <button 
        data-testid="test-command" 
        onClick={() => onCommand('test-device', 'test-param', 'test-value')}
      >
        Test Command
      </button>
      <button 
        data-testid="test-alarm-ack" 
        onClick={() => onAlarmAcknowledge('test-alarm')}
      >
        Acknowledge Alarm
      </button>
      <button 
        data-testid="test-emergency-stop" 
        onClick={() => onEmergencyStop()}
      >
        Emergency Stop
      </button>
    </div>
  )
}));

// Mock the toast provider
jest.mock('@/components/providers/ToastProvider', () => ({
  ToastProvider: ({ children }: any) => children,
  useToast: () => ({
    showToast: jest.fn()
  })
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PowerIcon: () => <div data-testid="power-icon" />,
  StopIcon: () => <div data-testid="stop-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  ShieldExclamationIcon: () => <div data-testid="shield-icon" />,
  CogIcon: () => <div data-testid="cog-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  PlayIcon: () => <div data-testid="play-icon" />,
  PauseIcon: () => <div data-testid="pause-icon" />,
  ArrowPathIcon: () => <div data-testid="refresh-icon" />
}));

describe('CompanyControlPage', () => {
  const mockStore = configureStore({
    reducer: {
      auth: authSlice
    },
    preloadedState: {
      auth: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          role: 'company' as UserRole,
          permissions: ['operator', 'supervisor'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true,
          twoFactorEnabled: false
        },
        tokens: {
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt: Date.now() + 3600000,
          tokenType: 'Bearer' as const
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionId: 'test-session',
        lastActivity: new Date().toISOString()
      }
    }
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        <ToastProvider>
          {component}
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the control page with loading state initially', () => {
    renderWithProvider(<CompanyControlPage />);
    
    expect(screen.getByText('Process Control')).toBeInTheDocument();
    expect(screen.getByText('SCADA interface for industrial process monitoring and control')).toBeInTheDocument();
  });

  it('shows quick status cards after loading', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Running Devices')).toBeInTheDocument();
      expect(screen.getByText('Active Alarms')).toBeInTheDocument();
      expect(screen.getByText('System Uptime')).toBeInTheDocument();
      expect(screen.getByText('Energy Usage')).toBeInTheDocument();
    });
  });

  it('displays system status indicator', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });
  });

  it('renders edit mode toggle button', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit Mode');
      expect(editButton).toBeInTheDocument();
    });
  });

  it('toggles edit mode when button is clicked', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit Mode');
      fireEvent.click(editButton);
      expect(screen.getByText('Exit Edit')).toBeInTheDocument();
    });
  });

  it('renders SCADA panel with process diagram', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('scada-panel')).toBeInTheDocument();
      expect(screen.getByTestId('diagram-name')).toHaveTextContent('Production Line Control');
    });
  });

  it('handles control commands through SCADA panel', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      const commandButton = screen.getByTestId('test-command');
      fireEvent.click(commandButton);
      // Command should be executed without errors
    });
  });

  it('handles alarm acknowledgment', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      const alarmButton = screen.getByTestId('test-alarm-ack');
      fireEvent.click(alarmButton);
      // Alarm acknowledgment should be processed
    });
  });

  it('handles emergency stop activation', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      const emergencyButton = screen.getByTestId('test-emergency-stop');
      fireEvent.click(emergencyButton);
      // Emergency stop should be activated
    });
  });

  it('displays system information panel', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('System Information')).toBeInTheDocument();
      expect(screen.getByText('Production Status')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('Recent Actions')).toBeInTheDocument();
    });
  });

  it('shows production statistics', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Current Rate:')).toBeInTheDocument();
      expect(screen.getByText('45 units/min')).toBeInTheDocument();
      expect(screen.getByText('Total Today:')).toBeInTheDocument();
      expect(screen.getByText('1,247 units')).toBeInTheDocument();
      expect(screen.getByText('Efficiency:')).toBeInTheDocument();
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });
  });

  it('shows system health metrics', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('CPU Usage:')).toBeInTheDocument();
      expect(screen.getByText('23%')).toBeInTheDocument();
      expect(screen.getByText('Memory:')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('Network:')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
    });
  });

  it('displays recent actions log', async () => {
    renderWithProvider(<CompanyControlPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Actions')).toBeInTheDocument();
      expect(screen.getByText('Motor speed adjusted to 75%')).toBeInTheDocument();
      expect(screen.getByText('Temperature alarm acknowledged')).toBeInTheDocument();
      expect(screen.getByText('System status check completed')).toBeInTheDocument();
    });
  });

  it('handles loading state correctly', () => {
    renderWithProvider(<CompanyControlPage />);
    
    // Should show loading skeletons initially
    const loadingElements = screen.getAllByText('Process Control');
    expect(loadingElements).toHaveLength(1);
  });

  it('renders without crashing when user is not authenticated', () => {
    const unauthenticatedStore = configureStore({
      reducer: {
        auth: authSlice
      },
      preloadedState: {
        auth: {
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionId: undefined,
          lastActivity: undefined
        }
      }
    });

    render(
      <Provider store={unauthenticatedStore}>
        <ToastProvider>
          <CompanyControlPage />
        </ToastProvider>
      </Provider>
    );

    expect(screen.getByText('Process Control')).toBeInTheDocument();
  });
});
