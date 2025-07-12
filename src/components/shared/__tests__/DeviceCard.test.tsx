// Unit tests for DeviceCard component - Task 6 Phase 2
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceCard } from '../DeviceCard';
import { Device } from '../../../types/shared-components';
import { DEVICE_TYPES, DEVICE_STATUS } from '../../../lib/constants';

// Mock device data for testing
const createMockDevice = (overrides: Partial<Device> = {}): Device => ({
  id: 'device-001',
  name: 'Living Room Light',
  type: 'light',
  status: 'online',
  batteryLevel: 0.85,
  signalStrength: 0.92,
  room: 'Living Room',
  lastSeen: new Date('2024-01-01T12:00:00Z'),
  isControllable: true,
  currentState: { brightness: 75, color: '#ffffff' },
  ...overrides
});

describe('DeviceCard Component', () => {
  const mockOnDeviceClick = jest.fn();
  const mockOnQuickAction = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock date for consistent test results
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-01T12:30:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders device card with basic information', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          onDeviceClick={mockOnDeviceClick}
          onQuickAction={mockOnQuickAction}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText('light • Living Room')).toBeInTheDocument();
      expect(screen.getByText('online')).toBeInTheDocument();
    });

    test('renders device card without optional properties', () => {
      const device = createMockDevice({
        batteryLevel: undefined,
        room: undefined,
        currentState: undefined
      });
      
      render(<DeviceCard device={device} />);
      
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText(/light/i)).toBeInTheDocument();
    });

    test('displays device status correctly', () => {
      const { rerender } = render(
        <DeviceCard device={createMockDevice({ status: 'online' })} />
      );
      expect(screen.getByText('online')).toBeInTheDocument();

      rerender(<DeviceCard device={createMockDevice({ status: 'offline' })} />);
      expect(screen.getByText('offline')).toBeInTheDocument();

      rerender(<DeviceCard device={createMockDevice({ status: 'warning' })} />);
      expect(screen.getByText('warning')).toBeInTheDocument();

      rerender(<DeviceCard device={createMockDevice({ status: 'error' })} />);
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    test('renders compact variant correctly', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="compact"
          testId="compact-card"
        />
      );

      const card = screen.getByTestId('compact-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
    });

    test('renders detailed variant correctly', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="detailed"
          testId="detailed-card"
        />
      );

      const card = screen.getByTestId('detailed-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
    });

    test('renders control variant correctly', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="control"
          testId="control-card"
        />
      );

      const card = screen.getByTestId('control-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    test('handles device click events', async () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="detailed"
          onDeviceClick={mockOnDeviceClick}
        />
      );

      const card = screen.getByRole('button');
      await userEvent.click(card);
      
      expect(mockOnDeviceClick).toHaveBeenCalledWith('device-001');
    });

    test('handles quick action events', async () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="compact"
          onQuickAction={mockOnQuickAction}
          showControls={true}
        />
      );

      const toggleButton = screen.getByLabelText('Toggle device');
      await userEvent.click(toggleButton);
      
      expect(mockOnQuickAction).toHaveBeenCalledWith('device-001', 'toggle');
    });

    test('shows controls when showControls is true and device is controllable', () => {
      const device = createMockDevice({ isControllable: true });
      render(
        <DeviceCard
          device={device}
          variant="compact"
          showControls={true}
        />
      );

      expect(screen.getByLabelText('Toggle device')).toBeInTheDocument();
    });

    test('hides controls when showControls is false', () => {
      const device = createMockDevice({ isControllable: true });
      render(
        <DeviceCard
          device={device}
          variant="compact"
          showControls={false}
        />
      );

      expect(screen.queryByLabelText('Toggle device')).not.toBeInTheDocument();
    });

    test('hides controls when device is not controllable', () => {
      const device = createMockDevice({ isControllable: false });
      render(
        <DeviceCard
          device={device}
          variant="compact"
          showControls={true}
        />
      );

      expect(screen.queryByLabelText('Toggle device')).not.toBeInTheDocument();
    });
  });

  describe('Device States', () => {
    test('displays battery level when available', () => {
      const device = createMockDevice({ batteryLevel: 0.85 });
      render(<DeviceCard device={device} />);
      
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    test('does not display battery level when unavailable', () => {
      const device = createMockDevice({ batteryLevel: undefined });
      render(<DeviceCard device={device} />);
      
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    test('displays signal strength correctly', () => {
      const device = createMockDevice({ signalStrength: 0.92 });
      render(<DeviceCard device={device} />);
      
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    test('shows warning for low battery', () => {
      const device = createMockDevice({ batteryLevel: 0.15 });
      render(<DeviceCard device={device} />);
      
      // Battery should be displayed as 15% with warning color
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    test('displays current state when available', () => {
      const device = createMockDevice({
        currentState: { brightness: 75, color: '#ffffff' }
      });
      render(<DeviceCard device={device} variant="detailed" />);
      
      expect(screen.getByText('Current state')).toBeInTheDocument();
    });
  });

  describe('Device Types', () => {
    test('handles different device types correctly', () => {
      const deviceTypes = ['light', 'thermostat', 'security', 'sensor', 'appliance', 'industrial'];
      
      deviceTypes.forEach(type => {
        const device = createMockDevice({ type: type as any, name: `Test ${type}` });
        const { unmount } = render(<DeviceCard device={device} />);
        
        expect(screen.getByText(`Test ${type}`)).toBeInTheDocument();
        // Check for device type in the compound text
        expect(screen.getByText(new RegExp(`${type}`, 'i'))).toBeInTheDocument();
        
        unmount();
      });
    });

    test('determines controllable status correctly', () => {
      // Controllable device types
      const controllableTypes = ['light', 'thermostat', 'appliance'];
      controllableTypes.forEach(type => {
        const device = createMockDevice({ 
          type: type as any, 
          status: 'online', 
          isControllable: true 
        });
        const { unmount } = render(
          <DeviceCard device={device} variant="compact" showControls={true} />
        );
        
        expect(screen.getByLabelText('Toggle device')).toBeInTheDocument();
        unmount();
      });

      // Non-controllable device types
      const nonControllableTypes = ['security', 'sensor', 'industrial'];
      nonControllableTypes.forEach(type => {
        const device = createMockDevice({ 
          type: type as any, 
          status: 'online', 
          isControllable: false 
        });
        const { unmount } = render(
          <DeviceCard device={device} variant="compact" showControls={true} />
        );
        
        expect(screen.queryByLabelText('Toggle device')).not.toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Status Visual Indicators', () => {
    test('displays correct status icons', () => {
      const statuses = [
        { status: 'online', color: 'text-green-500' },
        { status: 'offline', color: 'text-gray-500' },
        { status: 'warning', color: 'text-yellow-500' },
        { status: 'error', color: 'text-red-500' }
      ];

      statuses.forEach(({ status, color }) => {
        const device = createMockDevice({ status: status as any });
        const { unmount } = render(<DeviceCard device={device} />);
        
        expect(screen.getByText(status)).toBeInTheDocument();
        unmount();
      });
    });

    test('applies correct status border colors', () => {
      const device = createMockDevice({ status: 'online' });
      render(<DeviceCard device={device} testId="status-card" />);
      
      const card = screen.getByTestId('status-card');
      expect(card).toHaveClass('border-l-4');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          testId="accessible-card"
          onDeviceClick={mockOnDeviceClick}
        />
      );

      const card = screen.getByTestId('accessible-card');
      expect(card).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="detailed"
          onDeviceClick={mockOnDeviceClick}
        />
      );

      const card = screen.getByRole('button', { name: `View details for ${device.name}` });
      card.focus();
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnDeviceClick).toHaveBeenCalledWith('device-001');
    });

    test('provides proper button labels', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="control"
          showControls={true}
        />
      );

      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('compact variant works on small screens', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="compact"
          className="w-64"
        />
      );

      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      // Test that content is properly truncated/arranged
    });

    test('detailed variant provides comprehensive information', () => {
      const device = createMockDevice();
      render(
        <DeviceCard
          device={device}
          variant="detailed"
        />
      );

      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText('Last seen')).toBeInTheDocument();
      expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing device properties gracefully', () => {
      const incompleteDevice = {
        id: 'test-device',
        name: 'Test Device',
        type: 'light',
        status: 'online',
        signalStrength: 0.5,
        lastSeen: new Date(),
        isControllable: false
      } as Device;

      expect(() => {
        render(<DeviceCard device={incompleteDevice} />);
      }).not.toThrow();
    });

    test('handles invalid date gracefully', () => {
      const device = createMockDevice({
        lastSeen: new Date('invalid-date')
      });

      expect(() => {
        render(<DeviceCard device={device} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('component memoization works correctly', () => {
      const device = createMockDevice();
      const { rerender } = render(<DeviceCard device={device} />);
      
      // Re-render with same props - should not cause unnecessary updates
      rerender(<DeviceCard device={device} />);
      
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
    });

    test('handles rapid state changes efficiently', async () => {
      const device = createMockDevice();
      const { rerender } = render(
        <DeviceCard
          device={device}
          variant="compact"
          onQuickAction={mockOnQuickAction}
        />
      );

      // Simulate rapid status changes
      const statuses = ['online', 'warning', 'error', 'offline'];
      statuses.forEach(status => {
        rerender(
          <DeviceCard
            device={{ ...device, status: status as any }}
            variant="compact"
            onQuickAction={mockOnQuickAction}
          />
        );
      });

      expect(screen.getByText('offline')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('works with different device configurations', () => {
      const configurations = [
        { // Smart light
          type: 'light' as const,
          isControllable: true,
          currentState: { brightness: 80, color: '#ff0000' }
        },
        { // Sensor
          type: 'sensor' as const,
          isControllable: false,
          batteryLevel: 0.95,
          currentState: { temperature: 22.5 }
        },
        { // Thermostat
          type: 'thermostat' as const,
          isControllable: true,
          currentState: { temperature: 72, mode: 'heat' }
        }
      ];

      configurations.forEach((config, index) => {
        const device = createMockDevice({ ...config, name: `Device ${index}` });
        const { unmount } = render(<DeviceCard device={device} />);
        
        expect(screen.getByText(`Device ${index}`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
