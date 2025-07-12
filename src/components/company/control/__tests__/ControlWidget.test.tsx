import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ControlWidget from '../ControlWidget';
import { ControlWidget as ControlWidgetType, DeviceStatus } from '@/types/control';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PowerIcon: () => <div data-testid="power-icon" />,
  StopIcon: () => <div data-testid="stop-icon" />,
  PlayIcon: () => <div data-testid="play-icon" />,
  PauseIcon: () => <div data-testid="pause-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  LockClosedIcon: () => <div data-testid="lock-closed-icon" />,
  LockOpenIcon: () => <div data-testid="lock-open-icon" />,
  ArrowUpIcon: () => <div data-testid="arrow-up-icon" />,
  ArrowDownIcon: () => <div data-testid="arrow-down-icon" />,
  CheckCircleIcon: () => <div data-testid="check-icon" />,
  XCircleIcon: () => <div data-testid="x-icon" />,
  CogIcon: () => <div data-testid="cog-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  BoltIcon: () => <div data-testid="bolt-icon" />
}));

describe('ControlWidget', () => {
  const mockDeviceStatus: DeviceStatus = {
    deviceId: 'test-device',
    timestamp: new Date(),
    parameters: {
      power: { value: true, unit: '', quality: 'good', timestamp: new Date() },
      speed: { value: 75, unit: '%', quality: 'good', timestamp: new Date() },
      temperature: { value: 85, unit: '°C', quality: 'good', timestamp: new Date() },
      pressure: { value: 8.5, unit: 'bar', quality: 'good', timestamp: new Date() }
    },
    alarms: [],
    warnings: [],
    status: 'running',
    mode: 'auto'
  };

  const mockOnCommand = jest.fn();
  const mockOnWidgetUpdate = jest.fn();
  const mockOnWidgetRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Widget', () => {
    const buttonWidget: ControlWidgetType = {
      id: 'button-widget',
      type: 'button',
      deviceId: 'test-device',
      parameter: 'power',
      label: 'Power Button',
      position: { x: 100, y: 100, width: 80, height: 80 },
      config: {
        style: 'default',
        size: 'medium',
        confirmAction: false,
        color: '#10B981'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders button widget correctly', () => {
      render(
        <ControlWidget
          widget={buttonWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Power Button')).toBeInTheDocument();
      expect(screen.getByText('ON')).toBeInTheDocument();
    });

    it('executes command when button is clicked', () => {
      render(
        <ControlWidget
          widget={buttonWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnCommand).toHaveBeenCalledWith('test-device', 'power', false);
    });

    it('shows confirmation dialog when confirmAction is true', () => {
      const confirmWidget = {
        ...buttonWidget,
        config: { ...buttonWidget.config, confirmAction: true }
      };

      render(
        <ControlWidget
          widget={confirmWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('disables button when user lacks permissions', () => {
      render(
        <ControlWidget
          widget={buttonWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['viewer']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Slider Widget', () => {
    const sliderWidget: ControlWidgetType = {
      id: 'slider-widget',
      type: 'slider',
      deviceId: 'test-device',
      parameter: 'speed',
      label: 'Speed Control',
      position: { x: 100, y: 100, width: 100, height: 120 },
      config: {
        minValue: 0,
        maxValue: 100,
        unit: '%',
        step: 5,
        color: '#3B82F6'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders slider widget correctly', () => {
      render(
        <ControlWidget
          widget={sliderWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Speed Control')).toBeInTheDocument();
      expect(screen.getByText('75.0')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('executes command when slider value changes', () => {
      render(
        <ControlWidget
          widget={sliderWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '80' } });

      expect(mockOnCommand).toHaveBeenCalledWith('test-device', 'speed', 80);
    });

    it('respects min and max values', () => {
      render(
        <ControlWidget
          widget={sliderWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '5');
    });
  });

  describe('Gauge Widget', () => {
    const gaugeWidget: ControlWidgetType = {
      id: 'gauge-widget',
      type: 'gauge',
      deviceId: 'test-device',
      parameter: 'temperature',
      label: 'Temperature',
      position: { x: 100, y: 100, width: 100, height: 100 },
      config: {
        minValue: 0,
        maxValue: 100,
        unit: '°C',
        color: '#EF4444'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders gauge widget correctly', () => {
      render(
        <ControlWidget
          widget={gaugeWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('85.0 °C')).toBeInTheDocument();
    });

    it('displays gauge visual elements', () => {
      render(
        <ControlWidget
          widget={gaugeWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const svg = screen.getByTestId('gauge-svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Indicator Widget', () => {
    const indicatorWidget: ControlWidgetType = {
      id: 'indicator-widget',
      type: 'indicator',
      deviceId: 'test-device',
      parameter: 'power',
      label: 'Power Status',
      position: { x: 100, y: 100, width: 80, height: 80 },
      config: {
        color: '#10B981',
        size: 'medium'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders indicator widget correctly', () => {
      render(
        <ControlWidget
          widget={indicatorWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Power Status')).toBeInTheDocument();
      expect(screen.getByText('ON')).toBeInTheDocument();
    });

    it('shows correct indicator state', () => {
      render(
        <ControlWidget
          widget={indicatorWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const indicator = screen.getByTestId('indicator-light');
      expect(indicator).toHaveClass('bg-green-500');
    });
  });

  describe('Switch Widget', () => {
    const switchWidget: ControlWidgetType = {
      id: 'switch-widget',
      type: 'switch',
      deviceId: 'test-device',
      parameter: 'power',
      label: 'Power Switch',
      position: { x: 100, y: 100, width: 80, height: 80 },
      config: {
        color: '#10B981'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders switch widget correctly', () => {
      render(
        <ControlWidget
          widget={switchWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Power Switch')).toBeInTheDocument();
    });

    it('executes command when switch is toggled', () => {
      render(
        <ControlWidget
          widget={switchWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const switchElement = screen.getByRole('button');
      fireEvent.click(switchElement);

      expect(mockOnCommand).toHaveBeenCalledWith('test-device', 'power', false);
    });
  });

  describe('Text Widget', () => {
    const textWidget: ControlWidgetType = {
      id: 'text-widget',
      type: 'text',
      deviceId: 'test-device',
      parameter: 'speed',
      label: 'Speed Display',
      position: { x: 100, y: 100, width: 120, height: 80 },
      config: {
        format: '${currentValue} ${unit}',
        color: '#8B5CF6'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders text widget correctly', () => {
      render(
        <ControlWidget
          widget={textWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('Speed Display')).toBeInTheDocument();
      expect(screen.getByText('75 %')).toBeInTheDocument();
    });
  });

  describe('Alarm Widget', () => {
    const alarmWidget: ControlWidgetType = {
      id: 'alarm-widget',
      type: 'alarm',
      deviceId: 'test-device',
      parameter: 'power',
      label: 'System Alarm',
      position: { x: 100, y: 100, width: 80, height: 80 },
      config: {
        color: '#EF4444',
        size: 'medium'
      },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('renders alarm widget correctly', () => {
      render(
        <ControlWidget
          widget={alarmWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByText('System Alarm')).toBeInTheDocument();
    });

    it('shows alarm state based on device status', () => {
      const deviceWithAlarm = {
        ...mockDeviceStatus,
        alarms: ['alarm-1']
      };

      render(
        <ControlWidget
          widget={alarmWidget}
          deviceStatus={deviceWithAlarm}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const alarmIndicator = screen.getByTestId('alarm-indicator');
      expect(alarmIndicator).toHaveClass('bg-red-500');
    });
  });

  describe('Widget Status and Quality', () => {
    it('displays poor quality indicator', () => {
      const poorQualityStatus = {
        ...mockDeviceStatus,
        parameters: {
          ...mockDeviceStatus.parameters,
          power: { ...mockDeviceStatus.parameters.power, quality: 'bad' as const }
        }
      };

      const widget: ControlWidgetType = {
        id: 'test-widget',
        type: 'button',
        deviceId: 'test-device',
        parameter: 'power',
        label: 'Test Widget',
        position: { x: 100, y: 100, width: 80, height: 80 },
        config: { color: '#10B981' },
        permissions: ['operator'],
        isVisible: true,
        isEnabled: true,
        lastUpdated: new Date()
      };

      render(
        <ControlWidget
          widget={widget}
          deviceStatus={poorQualityStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      expect(screen.getByTestId('quality-indicator')).toHaveClass('border-red-500');
    });

    it('shows disabled state when widget is disabled', () => {
      const disabledWidget: ControlWidgetType = {
        id: 'disabled-widget',
        type: 'button',
        deviceId: 'test-device',
        parameter: 'power',
        label: 'Disabled Widget',
        position: { x: 100, y: 100, width: 80, height: 80 },
        config: { color: '#10B981' },
        permissions: ['operator'],
        isVisible: true,
        isEnabled: false,
        lastUpdated: new Date()
      };

      render(
        <ControlWidget
          widget={disabledWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows read-only state', () => {
      const readOnlyWidget: ControlWidgetType = {
        id: 'readonly-widget',
        type: 'button',
        deviceId: 'test-device',
        parameter: 'power',
        label: 'Read Only Widget',
        position: { x: 100, y: 100, width: 80, height: 80 },
        config: { 
          color: '#10B981',
          readOnly: true
        },
        permissions: ['operator'],
        isVisible: true,
        isEnabled: true,
        lastUpdated: new Date()
      };

      render(
        <ControlWidget
          widget={readOnlyWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          userPermissions={['operator']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    const editableWidget: ControlWidgetType = {
      id: 'editable-widget',
      type: 'button',
      deviceId: 'test-device',
      parameter: 'power',
      label: 'Editable Widget',
      position: { x: 100, y: 100, width: 80, height: 80 },
      config: { color: '#10B981' },
      permissions: ['operator'],
      isVisible: true,
      isEnabled: true,
      lastUpdated: new Date()
    };

    it('shows edit controls when in edit mode', () => {
      render(
        <ControlWidget
          widget={editableWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          onWidgetUpdate={mockOnWidgetUpdate}
          onWidgetRemove={mockOnWidgetRemove}
          userPermissions={['operator']}
          isEditing={true}
        />
      );

      expect(screen.getByTestId('edit-controls')).toBeInTheDocument();
      expect(screen.getByTestId('remove-widget')).toBeInTheDocument();
    });

    it('calls onWidgetRemove when remove button is clicked', () => {
      render(
        <ControlWidget
          widget={editableWidget}
          deviceStatus={mockDeviceStatus}
          onCommand={mockOnCommand}
          onWidgetUpdate={mockOnWidgetUpdate}
          onWidgetRemove={mockOnWidgetRemove}
          userPermissions={['operator']}
          isEditing={true}
        />
      );

      const removeButton = screen.getByTestId('remove-widget');
      fireEvent.click(removeButton);

      expect(mockOnWidgetRemove).toHaveBeenCalledWith('editable-widget');
    });
  });
});
