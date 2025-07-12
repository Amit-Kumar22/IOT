import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeviceCard } from '../DeviceCard';
import { HomeDevice, DeviceAction, LightDevice, ThermostatDevice } from '@/types/consumer-devices';

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  classNames: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

describe('DeviceCard Controls', () => {
  const mockOnDeviceUpdate = jest.fn();
  
  beforeEach(() => {
    mockOnDeviceUpdate.mockClear();
  });
  
  const mockLightDevice: LightDevice = {
    id: 'light-1',
    name: 'Living Room Light',
    type: 'light',
    room: 'Living Room',
    isOnline: true,
    batteryLevel: 75,
    currentState: {
      isOn: false,
      brightness: 75,
      color: '#ff5733'
    },
    capabilities: [
      { type: 'toggle', currentValue: false },
      { type: 'dimmer', currentValue: 75, range: { min: 0, max: 100 } },
      { type: 'color', currentValue: '#ff5733' }
    ],
    schedules: [],
    energyUsage: 0.5
  };
  
  const mockThermostatDevice: ThermostatDevice = {
    id: 'thermostat-1',
    name: 'Main Thermostat',
    type: 'thermostat',
    room: 'Living Room',
    isOnline: true,
    currentState: {
      currentTemperature: 20,
      targetTemperature: 22,
      mode: 'heat',
      fanMode: 'auto',
      humidity: 45
    },
    capabilities: [
      { type: 'temperature', currentValue: 22, range: { min: 10, max: 30 } }
    ],
    schedules: []
  };
  
  describe('Basic Device Card Rendering', () => {
    it('renders device card correctly', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByText('Living Room Light')).toBeInTheDocument();
      expect(screen.getByText('Living Room')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /turn on/i })).toBeInTheDocument();
    });
    
    it('shows correct toggle button text based on device state', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByRole('button', { name: /turn on/i })).toBeInTheDocument();
    });
    
    it('shows correct toggle button text for on device', () => {
      const onDevice = { 
        ...mockLightDevice, 
        currentState: { ...mockLightDevice.currentState, isOn: true } 
      };
      render(<DeviceCard device={onDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByRole('button', { name: /turn off/i })).toBeInTheDocument();
    });
    
    it('calls onDeviceUpdate when toggle button is clicked', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      fireEvent.click(screen.getByRole('button', { name: /turn on/i }));
      
      expect(mockOnDeviceUpdate).toHaveBeenCalledWith('light-1', {
        type: 'toggle',
        deviceId: 'light-1'
      });
    });
    
    it('shows offline status correctly', () => {
      const offlineDevice = { ...mockLightDevice, isOnline: false };
      render(<DeviceCard device={offlineDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const toggleButton = screen.getByRole('button', { name: /turn on/i });
      expect(toggleButton).toBeDisabled();
    });
  });
  
  describe('Advanced Controls', () => {
    it('shows advanced controls when showAdvanced is true', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Should show the settings/cog button
      const settingsButton = screen.getByRole('button', { name: '' }); // Cog icon button
      expect(settingsButton).toBeInTheDocument();
    });
    
    it('expands advanced controls when settings button is clicked', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      const settingsButton = screen.getByRole('button', { name: '' }); // Cog icon button
      fireEvent.click(settingsButton);
      
      // Should show brightness control for light device
      expect(screen.getByText('Brightness')).toBeInTheDocument();
    });
    
    it('shows device-specific controls for light device', () => {
      const lightWithDimmer = {
        ...mockLightDevice,
        capabilities: [
          { type: 'dimmer' as const, currentValue: 75, range: { min: 0, max: 100 } }
        ]
      };
      
      render(<DeviceCard device={lightWithDimmer} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Click to expand
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Brightness')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
    
    it('shows device-specific controls for thermostat device', () => {
      render(<DeviceCard device={mockThermostatDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Click to expand
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Target Temperature')).toBeInTheDocument();
      expect(screen.getAllByText('22°F')[0]).toBeInTheDocument(); // Get first occurrence
    });
    
    it('handles thermostat temperature controls', () => {
      render(<DeviceCard device={mockThermostatDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Click to expand
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      const increaseButton = screen.getByText('+');
      fireEvent.click(increaseButton);
      
      expect(mockOnDeviceUpdate).toHaveBeenCalledWith('thermostat-1', {
        type: 'set',
        deviceId: 'thermostat-1',
        value: { targetTemperature: 23 }
      });
    });
  });
  
  describe('Device Status Display', () => {
    it('shows battery level when available', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Click to expand
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Battery Level')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
    
    it('shows energy usage when available', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} showAdvanced={true} />);
      
      // Click to expand
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Energy Usage')).toBeInTheDocument();
      expect(screen.getByText('0.5 kWh today')).toBeInTheDocument();
    });
    
    it('shows correct device status for light device', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByText('Off')).toBeInTheDocument(); // Since isOn is false
    });
    
    it('shows correct device status for thermostat device', () => {
      render(<DeviceCard device={mockThermostatDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByText('22°F')).toBeInTheDocument();
    });
  });
  
  describe('Loading and Error States', () => {
    it('shows loading state when isLoading is true', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} isLoading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    
    it('disables controls when device is offline', () => {
      const offlineDevice = { ...mockLightDevice, isOnline: false };
      render(<DeviceCard device={offlineDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const toggleButton = screen.getByRole('button', { name: /turn on/i });
      expect(toggleButton).toBeDisabled();
    });
    
    it('disables controls when loading', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} isLoading={true} />);
      
      const toggleButton = screen.getByRole('button', { name: /loading/i });
      expect(toggleButton).toBeDisabled();
    });
  });
  
  describe('Visual Indicators', () => {
    it('shows online status indicator', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      // Should show wifi icon (online status)
      expect(screen.queryByTitle('Offline')).not.toBeInTheDocument();
    });
    
    it('shows offline status indicator', () => {
      const offlineDevice = { ...mockLightDevice, isOnline: false };
      render(<DeviceCard device={offlineDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      // Should show offline indicator
      expect(screen.getByTitle('Offline')).toBeInTheDocument();
    });
    
    it('shows low battery warning', () => {
      const lowBatteryDevice = { ...mockLightDevice, batteryLevel: 15 };
      render(<DeviceCard device={lowBatteryDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByTitle('Low Battery')).toBeInTheDocument();
    });
  });
  
  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByRole('button', { name: /turn on/i })).toBeInTheDocument();
    });
    
    it('has proper focus management', () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const button = screen.getByRole('button', { name: /turn on/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });
  
  describe('Edge Cases', () => {
    it('handles device without optional properties', () => {
      const minimalDevice: HomeDevice = {
        id: 'minimal-1',
        name: 'Minimal Device',
        type: 'light',
        room: 'Test Room',
        isOnline: true,
        currentState: { isOn: false },
        capabilities: [],
        schedules: []
      };
      
      render(<DeviceCard device={minimalDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      expect(screen.getByText('Minimal Device')).toBeInTheDocument();
      expect(screen.getByText('Test Room')).toBeInTheDocument();
    });
    
    it('handles multiple rapid updates', async () => {
      render(<DeviceCard device={mockLightDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const toggleButton = screen.getByRole('button', { name: /turn on/i });
      
      // Simulate rapid clicks
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockOnDeviceUpdate).toHaveBeenCalledTimes(3);
      });
    });
  });
});
