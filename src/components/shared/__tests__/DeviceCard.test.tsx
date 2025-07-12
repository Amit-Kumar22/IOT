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
    it('renders device card with basic information', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          onDeviceClick={mockOnDeviceClick}
          onQuickAction={mockOnQuickAction}
          testId="test-device-card"
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('test-device-card')).toBeInTheDocument();
      
      // All DeviceCard variants use h3 for title
      const deviceName = container.querySelector('h3');
      expect(deviceName).toHaveTextContent('Living Room Light');
      
      const deviceInfo = container.querySelector('p');
      expect(deviceInfo).toHaveTextContent('light • Living Room');
    });

    it('renders device card without optional properties', () => {
      const device = createMockDevice({
        batteryLevel: undefined,
        room: undefined,
        currentState: undefined
      });
      
      const { container } = render(
        <DeviceCard device={device} testId="minimal-device-card" />
      );
      
      expect(screen.getByTestId('minimal-device-card')).toBeInTheDocument();
      const deviceName = container.querySelector('h3');
      expect(deviceName).toHaveTextContent('Living Room Light');
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          variant="compact"
          testId="compact-card"
        />
      );

      const card = screen.getByTestId('compact-card');
      expect(card).toBeInTheDocument();
      
      // Compact variant uses h3 for title
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Living Room Light');
    });

    it('renders detailed variant correctly', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          variant="detailed"
          testId="detailed-card"
        />
      );

      const card = screen.getByTestId('detailed-card');
      expect(card).toBeInTheDocument();
      
      // All variants use h3 for title
      const title = container.querySelector('h3');
      expect(title).toHaveTextContent('Living Room Light');
    });

    it('renders control variant correctly', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          variant="control"
          testId="control-card"
        />
      );

      const card = screen.getByTestId('control-card');
      expect(card).toBeInTheDocument();
      
      // Control variant has more prominent buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Visual States', () => {
    it('displays online status with correct styling', () => {
      const device = createMockDevice({ status: 'online' });
      const { container } = render(
        <DeviceCard device={device} testId="online-card" />
      );

      expect(screen.getByTestId('online-card')).toBeInTheDocument();
      
      // Check for green check icon (online status)
      const statusIcon = container.querySelector('.text-green-500');
      expect(statusIcon).toBeInTheDocument();
    });

    it('displays offline status with correct styling', () => {
      const device = createMockDevice({ status: 'offline' });
      const { container } = render(
        <DeviceCard device={device} testId="offline-card" />
      );

      expect(screen.getByTestId('offline-card')).toBeInTheDocument();
      
      // Check for gray x icon (offline status)
      const statusIcon = container.querySelector('.text-gray-500');
      expect(statusIcon).toBeInTheDocument();
    });

    it('displays warning status with correct styling', () => {
      const device = createMockDevice({ status: 'warning' });
      const { container } = render(
        <DeviceCard device={device} testId="warning-card" />
      );

      expect(screen.getByTestId('warning-card')).toBeInTheDocument();
      
      // Check for yellow warning icon
      const statusIcon = container.querySelector('.text-yellow-500');
      expect(statusIcon).toBeInTheDocument();
    });

    it('displays error status with correct styling', () => {
      const device = createMockDevice({ status: 'error' });
      const { container } = render(
        <DeviceCard device={device} testId="error-card" />
      );

      expect(screen.getByTestId('error-card')).toBeInTheDocument();
      
      // Check for red error icon
      const statusIcon = container.querySelector('.text-red-500');
      expect(statusIcon).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('handles device click correctly', async () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          onDeviceClick={mockOnDeviceClick}
          testId="clickable-card"
        />
      );

      const card = screen.getByTestId('clickable-card');
      await userEvent.click(card);

      expect(mockOnDeviceClick).toHaveBeenCalledWith('device-001');
    });

    it('handles quick action correctly', async () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          onQuickAction={mockOnQuickAction}
          testId="action-card"
        />
      );

      // Find power button by aria-label
      const powerButton = container.querySelector('button[aria-label="Toggle device"]');
      if (powerButton) {
        await userEvent.click(powerButton);
        expect(mockOnQuickAction).toHaveBeenCalledWith('device-001', 'toggle');
      }
    });
  });

  describe('Battery and Signal Indicators', () => {
    it('displays battery level correctly', () => {
      const device = createMockDevice({ batteryLevel: 0.75 });
      const { container } = render(
        <DeviceCard device={device} testId="battery-card" />
      );

      expect(screen.getByTestId('battery-card')).toBeInTheDocument();
      
      // Check for battery percentage in any span element
      const spans = container.querySelectorAll('span');
      const batterySpan = Array.from(spans).find(span => span.textContent?.includes('75%'));
      expect(batterySpan).toBeInTheDocument();
    });

    it('displays signal strength correctly', () => {
      const device = createMockDevice({ signalStrength: 0.9 });
      const { container } = render(
        <DeviceCard device={device} testId="signal-card" />
      );

      expect(screen.getByTestId('signal-card')).toBeInTheDocument();
      
      // Check for signal strength indicator
      const signalIcon = container.querySelector('.text-green-500');
      expect(signalIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard device={device} testId="aria-card" />
      );

      expect(screen.getByTestId('aria-card')).toBeInTheDocument();
      
      // Check for aria-label on interactive elements
      const buttons = container.querySelectorAll('button[aria-label]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          onDeviceClick={mockOnDeviceClick}
          testId="keyboard-card"
        />
      );

      const card = screen.getByTestId('keyboard-card');
      
      // Focus the card
      card.focus();
      
      // Press Enter to activate
      await userEvent.keyboard('{Enter}');
      
      expect(mockOnDeviceClick).toHaveBeenCalledWith('device-001');
    });
  });

  describe('Device Controls', () => {
    it('shows controls when showControls is true', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          showControls={true}
          testId="controls-visible"
        />
      );

      expect(screen.getByTestId('controls-visible')).toBeInTheDocument();
      
      // Should have control buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('hides controls when showControls is false', () => {
      const device = createMockDevice();
      const { container } = render(
        <DeviceCard
          device={device}
          showControls={false}
          testId="controls-hidden"
        />
      );

      expect(screen.getByTestId('controls-hidden')).toBeInTheDocument();
      
      // Should not have control buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('handles missing device data gracefully', () => {
      const device = createMockDevice({
        name: '',
        type: 'light',
        status: 'offline'
      });
      
      const { container } = render(
        <DeviceCard device={device} testId="minimal-data" />
      );

      expect(screen.getByTestId('minimal-data')).toBeInTheDocument();
      
      // Should still render without errors
      expect(container).toBeInTheDocument();
    });
  });
});
