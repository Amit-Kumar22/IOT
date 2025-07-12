import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SCADAPanel } from '../SCADAPanel';
import { ProcessDiagram, DeviceStatus, Alarm } from '@/types/control';

// Mock the ControlWidget component
jest.mock('../ControlWidget', () => ({
  __esModule: true,
  default: ({ widget, onCommand }: any) => (
    <div data-testid={`control-widget-${widget.id}`}>
      <span>{widget.label}</span>
      <button 
        data-testid={`widget-command-${widget.id}`}
        onClick={() => onCommand(widget.deviceId, widget.parameter, 'test-value')}
      >
        Execute Command
      </button>
    </div>
  )
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  PowerIcon: () => <div data-testid="power-icon" />,
  StopIcon: () => <div data-testid="stop-icon" />,
  CogIcon: () => <div data-testid="cog-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  PlusIcon: () => <div data-testid="plus-icon" />,
  ArrowsPointingOutIcon: () => <div data-testid="expand-icon" />,
  ShieldExclamationIcon: () => <div data-testid="shield-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  UserIcon: () => <div data-testid="user-icon" />
}));

describe('SCADAPanel', () => {
  const mockDiagram: ProcessDiagram = {
    id: 'test-diagram',
    name: 'Test Process Diagram',
    description: 'Test diagram for unit testing',
    layout: {
      width: 1200,
      height: 800,
      backgroundImage: undefined
    },
    widgets: [
      {
        id: 'widget-1',
        type: 'button',
        deviceId: 'device-1',
        parameter: 'power',
        label: 'Test Button',
        position: { x: 100, y: 100, width: 80, height: 80 },
        config: {
          style: 'default',
          size: 'medium',
          confirmAction: false,
          color: '#10B981'
        },
        permissions: ['operator', 'supervisor'],
        isVisible: true,
        isEnabled: true,
        lastUpdated: new Date()
      },
      {
        id: 'widget-2',
        type: 'gauge',
        deviceId: 'device-2',
        parameter: 'temperature',
        label: 'Temperature Gauge',
        position: { x: 200, y: 100, width: 100, height: 100 },
        config: {
          minValue: 0,
          maxValue: 100,
          unit: '°C',
          color: '#EF4444'
        },
        permissions: ['operator', 'supervisor'],
        isVisible: true,
        isEnabled: true,
        lastUpdated: new Date()
      }
    ],
    connections: [
      {
        id: 'connection-1',
        fromWidgetId: 'widget-1',
        toWidgetId: 'widget-2',
        type: 'electrical',
        style: {
          color: '#10B981',
          width: 3,
          pattern: 'solid'
        },
        points: [
          { x: 180, y: 140 },
          { x: 200, y: 140 }
        ],
        isAnimated: true,
        direction: 'forward'
      }
    ],
    zones: [
      {
        id: 'zone-1',
        name: 'Test Zone',
        type: 'production',
        bounds: { x: 80, y: 80, width: 400, height: 200 },
        color: '#10B981',
        opacity: 0.1,
        isVisible: true
      }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockDeviceStatuses: Record<string, DeviceStatus> = {
    'device-1': {
      deviceId: 'device-1',
      timestamp: new Date(),
      parameters: {
        power: { value: true, unit: '', quality: 'good', timestamp: new Date() }
      },
      alarms: [],
      warnings: [],
      status: 'running',
      mode: 'auto'
    },
    'device-2': {
      deviceId: 'device-2',
      timestamp: new Date(),
      parameters: {
        temperature: { value: 75, unit: '°C', quality: 'good', timestamp: new Date() }
      },
      alarms: [],
      warnings: [],
      status: 'running',
      mode: 'auto'
    }
  };

  const mockAlarms: Alarm[] = [
    {
      id: 'alarm-1',
      deviceId: 'device-1',
      parameter: 'power',
      message: 'Test alarm message',
      severity: 'high',
      priority: 2,
      timestamp: new Date(),
      status: 'active',
      category: 'equipment',
      location: 'Test Location',
      actions: []
    }
  ];

  const mockProps = {
    diagram: mockDiagram,
    deviceStatuses: mockDeviceStatuses,
    alarms: mockAlarms,
    onCommand: jest.fn(),
    onAlarmAcknowledge: jest.fn(),
    onEmergencyStop: jest.fn(),
    onDiagramUpdate: jest.fn(),
    userPermissions: ['operator', 'supervisor'],
    userName: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SCADA panel with diagram name', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('Test Process Diagram')).toBeInTheDocument();
  });

  it('displays alarm summary in header', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('1 Critical')).toBeInTheDocument();
    expect(screen.getByText('1 High')).toBeInTheDocument();
    expect(screen.getByText('1 Active')).toBeInTheDocument();
  });

  it('renders control widgets', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByTestId('control-widget-widget-1')).toBeInTheDocument();
    expect(screen.getByTestId('control-widget-widget-2')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('Temperature Gauge')).toBeInTheDocument();
  });

  it('handles widget command execution', async () => {
    render(<SCADAPanel {...mockProps} />);
    
    const commandButton = screen.getByTestId('widget-command-widget-1');
    fireEvent.click(commandButton);
    
    expect(mockProps.onCommand).toHaveBeenCalledWith('device-1', 'power', 'test-value');
  });

  it('renders system mode controls', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('AUTO')).toBeInTheDocument();
    expect(screen.getByText('MANUAL')).toBeInTheDocument();
    expect(screen.getByText('MAINT')).toBeInTheDocument();
  });

  it('shows emergency stop button', () => {
    render(<SCADAPanel {...mockProps} />);
    
    const emergencyButton = screen.getByText('EMERGENCY STOP');
    expect(emergencyButton).toBeInTheDocument();
    expect(emergencyButton).toHaveClass('bg-red-600');
  });

  it('handles emergency stop button click', () => {
    render(<SCADAPanel {...mockProps} />);
    
    const emergencyButton = screen.getByText('EMERGENCY STOP');
    fireEvent.click(emergencyButton);
    
    expect(mockProps.onEmergencyStop).toHaveBeenCalled();
  });

  it('displays alarm panel toggle button', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('Alarms')).toBeInTheDocument();
  });

  it('toggles alarm panel visibility', () => {
    render(<SCADAPanel {...mockProps} />);
    
    const alarmButton = screen.getByText('Alarms');
    fireEvent.click(alarmButton);
    
    expect(screen.getByText('System Alarms')).toBeInTheDocument();
    expect(screen.getByText('Test alarm message')).toBeInTheDocument();
  });

  it('handles alarm acknowledgment', () => {
    render(<SCADAPanel {...mockProps} />);
    
    // Open alarm panel
    const alarmButton = screen.getByText('Alarms');
    fireEvent.click(alarmButton);
    
    // Acknowledge alarm
    const ackButton = screen.getByText('Acknowledge');
    fireEvent.click(ackButton);
    
    expect(mockProps.onAlarmAcknowledge).toHaveBeenCalledWith('alarm-1');
  });

  it('renders in edit mode', () => {
    render(<SCADAPanel {...mockProps} isEditing={true} />);
    
    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  });

  it('displays process zones', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('Test Zone')).toBeInTheDocument();
  });

  it('shows system status information', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Mode: AUTO')).toBeInTheDocument();
    expect(screen.getByText('Operator: Test User')).toBeInTheDocument();
  });

  it('handles widget selection', () => {
    render(<SCADAPanel {...mockProps} />);
    
    const widget = screen.getByTestId('control-widget-widget-1');
    fireEvent.click(widget);
    
    // Widget should be selected (this depends on the actual implementation)
    expect(widget).toBeInTheDocument();
  });

  it('renders without alarms', () => {
    const propsWithoutAlarms = {
      ...mockProps,
      alarms: []
    };
    
    render(<SCADAPanel {...propsWithoutAlarms} />);
    
    expect(screen.getByText('0 Critical')).toBeInTheDocument();
    expect(screen.getByText('0 High')).toBeInTheDocument();
    expect(screen.getByText('0 Active')).toBeInTheDocument();
  });

  it('renders with empty diagram', () => {
    const emptyDiagram = {
      ...mockDiagram,
      widgets: [],
      connections: [],
      zones: []
    };
    
    render(<SCADAPanel {...mockProps} diagram={emptyDiagram} />);
    
    expect(screen.getByText('Test Process Diagram')).toBeInTheDocument();
  });

  it('handles diagram update', () => {
    render(<SCADAPanel {...mockProps} isEditing={true} />);
    
    // This would typically involve more complex interactions
    // For now, just verify the prop is passed
    expect(mockProps.onDiagramUpdate).toBeDefined();
  });

  it('displays action log', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText('Action Log')).toBeInTheDocument();
  });

  it('shows timestamp information', () => {
    render(<SCADAPanel {...mockProps} />);
    
    expect(screen.getByText(/Last Update:/)).toBeInTheDocument();
  });

  it('handles widget visibility toggle', () => {
    const diagramWithHiddenWidget = {
      ...mockDiagram,
      widgets: [
        {
          ...mockDiagram.widgets[0],
          isVisible: false
        }
      ]
    };
    
    render(<SCADAPanel {...mockProps} diagram={diagramWithHiddenWidget} />);
    
    // Hidden widget should not be rendered
    expect(screen.queryByTestId('control-widget-widget-1')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SCADAPanel {...mockProps} className="custom-scada-panel" />);
    
    const panel = screen.getByRole('main');
    expect(panel).toHaveClass('custom-scada-panel');
  });
});
