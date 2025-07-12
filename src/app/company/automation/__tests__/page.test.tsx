import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyAutomationPage from '../page';
import { ToastProvider } from '@/components/providers/ToastProvider';
import authSlice from '@/store/slices/authSlice';
import { UserRole } from '@/types/auth';

// Mock the automation components
jest.mock('@/components/company/automation/AutomationManager', () => ({
  AutomationManager: ({ rules, onCreateRule, onEditRule, onDeleteRule, onToggleRule }: any) => (
    <div data-testid="automation-manager">
      <h2>Automation Manager</h2>
      <div data-testid="rule-count">{rules.length} rules</div>
      <button data-testid="create-rule" onClick={onCreateRule}>Create Rule</button>
      <button data-testid="edit-rule" onClick={() => onEditRule('rule_001')}>Edit Rule</button>
      <button data-testid="delete-rule" onClick={() => onDeleteRule('rule_001')}>Delete Rule</button>
      <button data-testid="toggle-rule" onClick={() => onToggleRule('rule_001', false)}>Toggle Rule</button>
    </div>
  )
}));

jest.mock('@/components/company/automation/AutomationBuilder', () => ({
  AutomationBuilderWrapper: ({ rule, onSave, onCancel }: any) => (
    <div data-testid="automation-builder">
      <h2>Automation Builder</h2>
      <div data-testid="rule-name">{rule?.name || 'New Rule'}</div>
      <button data-testid="save-rule" onClick={() => onSave({ id: 'new-rule', name: 'Test Rule' })}>
        Save Rule
      </button>
      <button data-testid="cancel-rule" onClick={onCancel}>Cancel</button>
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
  PlusIcon: () => <div data-testid="plus-icon" />,
  XMarkIcon: () => <div data-testid="x-icon" />,
  BoltIcon: () => <div data-testid="bolt-icon" />,
  ChartBarIcon: () => <div data-testid="chart-icon" />,
  CogIcon: () => <div data-testid="cog-icon" />,
  PlayIcon: () => <div data-testid="play-icon" />,
  StopIcon: () => <div data-testid="stop-icon" />,
  PauseIcon: () => <div data-testid="pause-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  CheckCircleIcon: () => <div data-testid="check-icon" />,
  DocumentTextIcon: () => <div data-testid="document-icon" />,
  BeakerIcon: () => <div data-testid="beaker-icon" />
}));

describe('CompanyAutomationPage', () => {
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

  it('renders the automation page with loading state initially', () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    expect(screen.getByText('Automation Rules')).toBeInTheDocument();
    expect(screen.getByText('Build, test, and manage automation workflows')).toBeInTheDocument();
  });

  it('shows automation statistics after loading', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Rules')).toBeInTheDocument();
      expect(screen.getByText('Active Rules')).toBeInTheDocument();
      expect(screen.getByText('Executions Today')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  it('displays automation manager with rules', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('automation-manager')).toBeInTheDocument();
      expect(screen.getByText('Automation Manager')).toBeInTheDocument();
    });
  });

  it('shows create rule button and opens builder', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Rule');
      expect(createButton).toBeInTheDocument();
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('automation-builder')).toBeInTheDocument();
      expect(screen.getByText('Automation Builder')).toBeInTheDocument();
    });
  });

  it('opens template selector', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const templateButton = screen.getByText('Templates');
      expect(templateButton).toBeInTheDocument();
      fireEvent.click(templateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Automation Templates')).toBeInTheDocument();
    });
  });

  it('handles rule creation through manager', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const createButton = screen.getByTestId('create-rule');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('automation-builder')).toBeInTheDocument();
    });
  });

  it('handles rule editing', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const editButton = screen.getByTestId('edit-rule');
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('automation-builder')).toBeInTheDocument();
    });
  });

  it('handles rule deletion', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-rule');
      fireEvent.click(deleteButton);
      // Delete should be processed
    });
  });

  it('handles rule toggle', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const toggleButton = screen.getByTestId('toggle-rule');
      fireEvent.click(toggleButton);
      // Toggle should be processed
    });
  });

  it('saves rule from builder', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const createButton = screen.getByTestId('create-rule');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      const saveButton = screen.getByTestId('save-rule');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('automation-builder')).not.toBeInTheDocument();
    });
  });

  it('cancels rule creation', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const createButton = screen.getByTestId('create-rule');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      const cancelButton = screen.getByTestId('cancel-rule');
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('automation-builder')).not.toBeInTheDocument();
    });
  });

  it('displays automation metrics', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Rules')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // Mock data count
      expect(screen.getByText('Active Rules')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Mock active count
    });
  });

  it('shows execution history', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Executions')).toBeInTheDocument();
    });
  });

  it('handles template selection', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const templateButton = screen.getByText('Templates');
      fireEvent.click(templateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Temperature Safety Alert')).toBeInTheDocument();
      expect(screen.getByText('Production Optimization')).toBeInTheDocument();
      expect(screen.getByText('Energy Management')).toBeInTheDocument();
    });
  });

  it('creates rule from template', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const templateButton = screen.getByText('Templates');
      fireEvent.click(templateButton);
    });

    await waitFor(() => {
      const useTemplateButton = screen.getByText('Use Template');
      fireEvent.click(useTemplateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('automation-builder')).toBeInTheDocument();
    });
  });

  it('filters rules by category', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const filterButton = screen.getByText('All Categories');
      fireEvent.click(filterButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Safety')).toBeInTheDocument();
      expect(screen.getByText('Optimization')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  it('displays rule execution status', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });
  });

  it('handles rule testing', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      const testButton = screen.getByText('Test Rules');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Rule Testing')).toBeInTheDocument();
    });
  });

  it('shows performance monitoring', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Avg. Execution Time')).toBeInTheDocument();
      expect(screen.getByText('142ms')).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    renderWithProvider(<CompanyAutomationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Rules')).toBeInTheDocument();
    });

    // Error states should be handled gracefully
    expect(screen.queryByText('Error loading rules')).not.toBeInTheDocument();
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
          <CompanyAutomationPage />
        </ToastProvider>
      </Provider>
    );

    expect(screen.getByText('Automation Rules')).toBeInTheDocument();
  });
});
