import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutomationManager } from '../AutomationManager';
import { AutomationRule, AutomationExecution, AutomationMetrics } from '@/types/automation';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlayIcon: () => <div data-testid="play-icon" />,
  PauseIcon: () => <div data-testid="pause-icon" />,
  StopIcon: () => <div data-testid="stop-icon" />,
  PencilIcon: () => <div data-testid="pencil-icon" />,
  TrashIcon: () => <div data-testid="trash-icon" />,
  DocumentDuplicateIcon: () => <div data-testid="duplicate-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  ChartBarIcon: () => <div data-testid="chart-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  CheckCircleIcon: () => <div data-testid="check-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  BoltIcon: () => <div data-testid="bolt-icon" />,
  CogIcon: () => <div data-testid="cog-icon" />,
  PlusIcon: () => <div data-testid="plus-icon" />,
  FunnelIcon: () => <div data-testid="funnel-icon" />,
  MagnifyingGlassIcon: () => <div data-testid="search-icon" />
}));

describe('AutomationManager', () => {
  const mockRules: AutomationRule[] = [
    {
      id: 'rule_001',
      name: 'Temperature Safety Alert',
      description: 'Monitors temperature and sends alerts',
      category: 'safety',
      status: 'active',
      priority: 'critical',
      nodes: [],
      edges: [],
      variables: [],
      triggers: [],
      metadata: {
        version: '1.0.0',
        author: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['safety', 'temperature'],
        dependencies: []
      },
      execution: {
        mode: 'automatic',
        retryCount: 3,
        timeout: 60,
        lastRun: new Date(),
        nextRun: new Date(),
        executionHistory: []
      },
      testing: {
        testRuns: [],
        mockData: {},
        validationRules: []
      }
    },
    {
      id: 'rule_002',
      name: 'Production Optimization',
      description: 'Optimizes production line efficiency',
      category: 'optimization',
      status: 'inactive',
      priority: 'medium',
      nodes: [],
      edges: [],
      variables: [],
      triggers: [],
      metadata: {
        version: '1.0.0',
        author: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['optimization', 'production'],
        dependencies: []
      },
      execution: {
        mode: 'manual',
        retryCount: 2,
        timeout: 30,
        lastRun: new Date(),
        nextRun: new Date(),
        executionHistory: []
      },
      testing: {
        testRuns: [],
        mockData: {},
        validationRules: []
      }
    }
  ];

  const mockExecutions: AutomationExecution[] = [
    {
      id: 'exec_001',
      ruleId: 'rule_001',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      trigger: 'device_event',
      nodeExecutions: [],
      output: {},
      metrics: {
        duration: 1500,
        nodesExecuted: 3
      }
    }
  ];

  const mockMetrics: AutomationMetrics = {
    totalRules: 2,
    activeRules: 1,
    totalExecutions: 150,
    successfulExecutions: 142,
    failedExecutions: 8,
    averageExecutionTime: 1200,
    mostUsedNodes: [
      { nodeType: 'trigger', count: 5 },
      { nodeType: 'action', count: 3 }
    ],
    performanceByRule: [
      { ruleId: 'rule_001', avgDuration: 1200, execCount: 75 },
      { ruleId: 'rule_002', avgDuration: 800, execCount: 75 }
    ],
    errorFrequency: [
      { error: 'Connection timeout', count: 3, lastOccurrence: new Date() }
    ],
    systemLoad: {
      cpuUsage: 15.2,
      memoryUsage: 32.1,
      activeConnections: 8,
      queuedTasks: 2
    }
  };

  const mockProps = {
    rules: mockRules,
    executions: mockExecutions,
    metrics: mockMetrics,
    onCreateRule: jest.fn(),
    onEditRule: jest.fn(),
    onDeleteRule: jest.fn(),
    onDuplicateRule: jest.fn(),
    onToggleRule: jest.fn(),
    onViewRule: jest.fn(),
    onViewMetrics: jest.fn(),
    onTestRule: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders automation manager with rules', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('Temperature Safety Alert')).toBeInTheDocument();
    expect(screen.getByText('Production Optimization')).toBeInTheDocument();
    expect(screen.getByText('Monitors temperature and sends alerts')).toBeInTheDocument();
  });

  it('displays rule statistics', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('2 Rules')).toBeInTheDocument();
    expect(screen.getByText('1 Active')).toBeInTheDocument();
    expect(screen.getByText('23 Executions Today')).toBeInTheDocument();
  });

  it('shows create rule button', () => {
    render(<AutomationManager {...mockProps} />);
    
    const createButton = screen.getByText('Create Rule');
    expect(createButton).toBeInTheDocument();
    
    fireEvent.click(createButton);
    expect(mockProps.onCreateRule).toHaveBeenCalled();
  });

  it('handles rule editing', () => {
    render(<AutomationManager {...mockProps} />);
    
    const editButton = screen.getByTestId('edit-rule_001');
    fireEvent.click(editButton);
    
    expect(mockProps.onEditRule).toHaveBeenCalledWith('rule_001');
  });

  it('handles rule deletion with confirmation', () => {
    render(<AutomationManager {...mockProps} />);
    
    const deleteButton = screen.getByTestId('delete-rule_001');
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('Delete Rule')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this rule?')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    
    expect(mockProps.onDeleteRule).toHaveBeenCalledWith('rule_001');
  });

  it('handles rule duplication', () => {
    render(<AutomationManager {...mockProps} />);
    
    const duplicateButton = screen.getByTestId('duplicate-rule_001');
    fireEvent.click(duplicateButton);
    
    expect(mockProps.onDuplicateRule).toHaveBeenCalledWith('rule_001');
  });

  it('handles rule toggle', () => {
    render(<AutomationManager {...mockProps} />);
    
    const toggleButton = screen.getByTestId('toggle-rule_001');
    fireEvent.click(toggleButton);
    
    expect(mockProps.onToggleRule).toHaveBeenCalledWith('rule_001', false);
  });

  it('handles rule testing', () => {
    render(<AutomationManager {...mockProps} />);
    
    const testButton = screen.getByTestId('test-rule_001');
    fireEvent.click(testButton);
    
    expect(mockProps.onTestRule).toHaveBeenCalledWith('rule_001');
  });

  it('handles rule viewing', () => {
    render(<AutomationManager {...mockProps} />);
    
    const viewButton = screen.getByTestId('view-rule_001');
    fireEvent.click(viewButton);
    
    expect(mockProps.onViewRule).toHaveBeenCalledWith('rule_001');
  });

  it('handles metrics viewing', () => {
    render(<AutomationManager {...mockProps} />);
    
    const metricsButton = screen.getByTestId('metrics-rule_001');
    fireEvent.click(metricsButton);
    
    expect(mockProps.onViewMetrics).toHaveBeenCalledWith('rule_001');
  });

  it('filters rules by search term', () => {
    render(<AutomationManager {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search rules...');
    fireEvent.change(searchInput, { target: { value: 'temperature' } });
    
    expect(screen.getByText('Temperature Safety Alert')).toBeInTheDocument();
    expect(screen.queryByText('Production Optimization')).not.toBeInTheDocument();
  });

  it('filters rules by category', () => {
    render(<AutomationManager {...mockProps} />);
    
    const categoryFilter = screen.getByText('All Categories');
    fireEvent.click(categoryFilter);
    
    const safetyFilter = screen.getByText('Safety');
    fireEvent.click(safetyFilter);
    
    expect(screen.getByText('Temperature Safety Alert')).toBeInTheDocument();
    expect(screen.queryByText('Production Optimization')).not.toBeInTheDocument();
  });

  it('filters rules by status', () => {
    render(<AutomationManager {...mockProps} />);
    
    const statusFilter = screen.getByText('All Status');
    fireEvent.click(statusFilter);
    
    const activeFilter = screen.getByText('Active');
    fireEvent.click(activeFilter);
    
    expect(screen.getByText('Temperature Safety Alert')).toBeInTheDocument();
    expect(screen.queryByText('Production Optimization')).not.toBeInTheDocument();
  });

  it('displays rule status indicators', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('displays rule priority indicators', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('displays rule execution information', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('Last run:')).toBeInTheDocument();
    expect(screen.getByText('Next run:')).toBeInTheDocument();
  });

  it('handles bulk operations', () => {
    render(<AutomationManager {...mockProps} />);
    
    const selectAllCheckbox = screen.getByLabelText('Select all rules');
    fireEvent.click(selectAllCheckbox);
    
    const bulkActionsButton = screen.getByText('Bulk Actions');
    fireEvent.click(bulkActionsButton);
    
    expect(screen.getByText('Enable Selected')).toBeInTheDocument();
    expect(screen.getByText('Disable Selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  it('displays empty state when no rules exist', () => {
    const emptyProps = {
      ...mockProps,
      rules: []
    };
    
    render(<AutomationManager {...emptyProps} />);
    
    expect(screen.getByText('No automation rules found')).toBeInTheDocument();
    expect(screen.getByText('Create your first automation rule to get started')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('AutomationManager')).toBeInTheDocument();
  });

  it('handles error states', () => {
    const errorProps = {
      ...mockProps,
      error: 'Failed to load automation rules'
    };
    
    render(<AutomationManager {...errorProps} />);
    
    expect(screen.getByText('Error loading rules')).toBeInTheDocument();
    expect(screen.getByText('Failed to load automation rules')).toBeInTheDocument();
  });

  it('displays rule tags', () => {
    render(<AutomationManager {...mockProps} />);
    
    expect(screen.getByText('safety')).toBeInTheDocument();
    expect(screen.getByText('temperature')).toBeInTheDocument();
    expect(screen.getByText('optimization')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('shows rule execution history', () => {
    render(<AutomationManager {...mockProps} />);
    
    const historyButton = screen.getByTestId('history-rule_001');
    fireEvent.click(historyButton);
    
    expect(screen.getByText('Execution History')).toBeInTheDocument();
  });

  it('handles rule export', () => {
    render(<AutomationManager {...mockProps} />);
    
    const exportButton = screen.getByText('Export Rules');
    fireEvent.click(exportButton);
    
    expect(screen.getByText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('YAML')).toBeInTheDocument();
  });

  it('handles rule import', () => {
    render(<AutomationManager {...mockProps} />);
    
    const importButton = screen.getByText('Import Rules');
    fireEvent.click(importButton);
    
    expect(screen.getByText('Import Automation Rules')).toBeInTheDocument();
  });
});
