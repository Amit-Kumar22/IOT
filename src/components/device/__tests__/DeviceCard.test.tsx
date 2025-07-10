import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '@/lib/test-utils';
import { DeviceCard } from '../DeviceCard';

describe('DeviceCard Component', () => {
  const mockDevice = {
    id: 'device-1',
    name: 'Smart Light',
    type: 'light',
    status: 'online' as const,
    location: 'Living Room',
    battery: 85,
    signal: 95,
    lastSeen: '2024-01-15T10:30:00Z'
  };

  const mockOnToggle = jest.fn();
  const mockOnConfigure = jest.fn();
  const mockStore = createMockStore({
    auth: { user: null, isAuthenticated: false },
  });

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnConfigure.mockClear();
  });

  it('should render device information', () => {
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={mockDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
        />
      </Provider>
    );

    expect(screen.getByText('Smart Light')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === '📍 Living Room';
    })).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument(); // Battery
  });

  it('should display correct status icon for online device', () => {
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={mockDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
        />
      </Provider>
    );

    // Check for the green check circle icon (online status)
    const statusIcon = document.querySelector('.text-green-500');
    expect(statusIcon).toBeInTheDocument();
  });

  it('should call onToggle when toggle button clicked', () => {
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={mockDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
        />
      </Provider>
    );

    const toggleButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith(mockDevice.id);
  });

  it('should call onConfigure when configure button clicked', () => {
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={mockDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
        />
      </Provider>
    );

    const configButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configButton);

    expect(mockOnConfigure).toHaveBeenCalledWith(mockDevice.id);
  });

  it('should show start button for offline devices', () => {
    const offlineDevice = { ...mockDevice, status: 'offline' as const };
    
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={offlineDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
        />
      </Provider>
    );

    // Check for the gray X circle icon (offline status)
    const statusIcon = document.querySelector('.text-gray-400');
    expect(statusIcon).toBeInTheDocument();
    
    // Should show Start button instead of Pause
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should disable controls when showControls is false', () => {
    render(
      <Provider store={mockStore}>
        <DeviceCard 
          device={mockDevice} 
          onToggle={mockOnToggle}
          onConfigure={mockOnConfigure}
          showControls={false}
        />
      </Provider>
    );

    const toggleButton = screen.queryByRole('button', { name: /pause/i });
    const configButton = screen.queryByRole('button', { name: /configure/i });
    expect(toggleButton).not.toBeInTheDocument();
    expect(configButton).not.toBeInTheDocument();
  });
});
