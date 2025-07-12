import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeviceCard } from '../DeviceCard';
import { HomeDevice } from '@/types/consumer-devices';

// Simple mock device for testing
const mockDevice: HomeDevice = {
  id: 'test-light-1',
  name: 'Test Light',
  type: 'light',
  room: 'Living Room',
  isOnline: true,
  currentState: {
    isOn: true,
    brightness: 75
  },
  capabilities: [
    {
      type: 'toggle',
      currentValue: true
    }
  ],
  schedules: [],
  metadata: {
    manufacturer: 'Test Corp',
    model: 'TC-Light-1',
    firmwareVersion: '1.0.0'
  }
};

const mockOnDeviceUpdate = jest.fn();

describe('DeviceCard', () => {
  it('renders device card with correct information', () => {
    render(
      <DeviceCard
        device={mockDevice}
        onDeviceUpdate={mockOnDeviceUpdate}
      />
    );

    expect(screen.getByText('Test Light')).toBeInTheDocument();
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('renders toggle button', () => {
    render(
      <DeviceCard
        device={mockDevice}
        onDeviceUpdate={mockOnDeviceUpdate}
      />
    );

    expect(screen.getByRole('button', { name: /turn off/i })).toBeInTheDocument();
  });
});
