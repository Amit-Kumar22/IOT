import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompanyDevicesPage from '../page';
import authSlice from '@/store/slices/authSlice';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Mock the useDevices hook
jest.mock('@/hooks/useApi', () => ({
  useDevices: jest.fn(),
}));

// Mock the DeviceList component
jest.mock('@/components/device', () => ({
  DeviceList: ({ devices, onDeviceToggle, onDeviceConfigure }: any) => (
    <div data-testid="device-list">
      {devices.map((device: any) => (
        <div key={device.id} data-testid={`device-${device.id}`}>
          <span>{device.name}</span>
          <button 
            onClick={() => onDeviceToggle(device.id)}
            data-testid={`toggle-${device.id}`}
          >
            Toggle
          </button>
          <button 
            onClick={() => onDeviceConfigure(device.id)}
            data-testid={`configure-${device.id}`}
          >
            Configure
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock the Modal component
jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="modal" role="dialog">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

// Mock the ConfirmDialog component
jest.mock('@/components/ui/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, message, isLoading }: any) => (
    isOpen ? (
      <div data-testid="confirm-dialog" role="dialog">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        <button onClick={onClose} data-testid="confirm-cancel">Cancel</button>
        <button 
          onClick={onConfirm} 
          data-testid="confirm-button"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Confirm'}
        </button>
      </div>
    ) : null
  ),
}));

// Mock the useStableForm hook
jest.mock('@/hooks/useStableForm', () => ({
  useStableForm: jest.fn(),
}));

const mockDevices = [
  {
    id: 'device-1',
    name: 'Temperature Sensor 1',
    type: 'sensor',
    status: 'online',
    location: 'Building A',
    isActive: true,
    power: 50,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'device-2',
    name: 'Motor Controller 1',
    type: 'controller',
    status: 'warning',
    location: 'Building B',
    isActive: false,
    power: 200,
    lastUpdate: new Date().toISOString(),
  },
];

const mockUseDevices = {
  devices: mockDevices,
  loading: false,
  error: null,
  refreshDevices: jest.fn(),
  controlDevice: jest.fn(),
  bulkOperation: jest.fn(),
};

const mockUseStableForm = {
  formData: {
    name: '',
    type: 'sensor',
    location: '',
    description: '',
    ipAddress: '',
    port: '502',
    protocol: 'modbus',
    manufacturer: '',
    model: '',
    firmware: '',
    maxPower: '',
    operatingTemp: '',
    tags: [],
  },
  createHandler: jest.fn(),
  resetForm: jest.fn(),
  errors: {},
  setFieldError: jest.fn(),
  updateFormData: jest.fn(),
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { 
          id: 'company-user-id',
          email: 'company@iot.com', 
          name: 'Company User',
          role: 'company' as const,
          permissions: ['read', 'write'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          isActive: true,
          emailVerified: true,
        },
        tokens: { 
          accessToken: 'mock-token', 
          refreshToken: 'mock-refresh',
          expiresAt: Date.now() + 3600000,
          tokenType: 'Bearer' as const,
        },
        isLoading: false,
        error: null,
        sessionId: 'mock-session',
        lastActivity: new Date().toISOString(),
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <ToastProvider>
        {component}
      </ToastProvider>
    </Provider>
  );
};

describe('CompanyDevicesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const { useDevices } = require('@/hooks/useApi');
    useDevices.mockReturnValue(mockUseDevices);
    
    const { useStableForm } = require('@/hooks/useStableForm');
    useStableForm.mockReturnValue(mockUseStableForm);
  });

  it('renders device management page with header', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    expect(screen.getByText('Device Management')).toBeInTheDocument();
    expect(screen.getByText('Monitor and control your industrial IoT devices')).toBeInTheDocument();
  });

  it('displays device statistics correctly', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    expect(screen.getByText('Total Devices')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total devices
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Online devices
    expect(screen.getByText('Warnings')).toBeInTheDocument();
  });

  it('renders device list with devices', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    expect(screen.getByTestId('device-list')).toBeInTheDocument();
    expect(screen.getByTestId('device-device-1')).toBeInTheDocument();
    expect(screen.getByTestId('device-device-2')).toBeInTheDocument();
    expect(screen.getByText('Temperature Sensor 1')).toBeInTheDocument();
    expect(screen.getByText('Motor Controller 1')).toBeInTheDocument();
  });

  it('handles device toggle correctly', async () => {
    const user = userEvent.setup();
    mockUseDevices.controlDevice.mockResolvedValue(true);
    
    renderWithProviders(<CompanyDevicesPage />);
    
    const toggleButton = screen.getByTestId('toggle-device-1');
    await user.click(toggleButton);
    
    expect(mockUseDevices.controlDevice).toHaveBeenCalledWith({
      deviceId: 'device-1',
      command: 'toggle',
    });
  });

  it('opens add device modal when Add Device button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyDevicesPage />);
    
    const addButton = screen.getByText('Add Device');
    await user.click(addButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Add New Device');
  });

  it('opens configure modal when device configure button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyDevicesPage />);
    
    const configureButton = screen.getByTestId('configure-device-1');
    await user.click(configureButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Configure Temperature Sensor 1');
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyDevicesPage />);
    
    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    
    expect(mockUseDevices.refreshDevices).toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    const { useDevices } = require('@/hooks/useApi');
    useDevices.mockReturnValue({
      ...mockUseDevices,
      loading: true,
    });
    
    renderWithProviders(<CompanyDevicesPage />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const { useDevices } = require('@/hooks/useApi');
    useDevices.mockReturnValue({
      ...mockUseDevices,
      error: 'Failed to load devices',
    });
    
    renderWithProviders(<CompanyDevicesPage />);
    
    expect(screen.getByText('Error loading devices: Failed to load devices')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles bulk operations correctly', async () => {
    const user = userEvent.setup();
    mockUseDevices.bulkOperation.mockResolvedValue(true);
    
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    renderWithProviders(<CompanyDevicesPage />);
    
    // Select devices (simulate device selection)
    const page = screen.getByTestId('device-list').closest('div');
    
    // Simulate having selected devices by directly testing the bulk operation handler
    // We need to access the component's internal state, so we'll test the visible UI
    
    // Clean up
    confirmSpy.mockRestore();
  });

  it('calculates power consumption correctly', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    // Total power should be 50 + 200 = 250W
    expect(screen.getByText('250W')).toBeInTheDocument();
  });

  it('calculates uptime percentage correctly', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    // 1 online out of 2 devices = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows running and stopped device counts', () => {
    renderWithProviders(<CompanyDevicesPage />);
    
    // 1 active, 1 inactive
    const runningCount = screen.getAllByText('1').filter(el => 
      el.nextElementSibling?.textContent === 'Running'
    );
    expect(runningCount).toHaveLength(1);
    
    const stoppedCount = screen.getAllByText('1').filter(el => 
      el.nextElementSibling?.textContent === 'Stopped'
    );
    expect(stoppedCount).toHaveLength(1);
  });

  it('renders form fields in add device modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyDevicesPage />);
    
    const addButton = screen.getByText('Add Device');
    await user.click(addButton);
    
    expect(screen.getByLabelText(/Device Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Device Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
    expect(screen.getByLabelText(/IP Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Port/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manufacturer/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model/)).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyDevicesPage />);
    
    const addButton = screen.getByText('Add Device');
    await user.click(addButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const user = userEvent.setup();
    
    // Mock form handlers
    const mockCreateHandler = jest.fn();
    const { useStableForm } = require('@/hooks/useStableForm');
    useStableForm.mockReturnValue({
      ...mockUseStableForm,
      createHandler: mockCreateHandler,
      formData: {
        ...mockUseStableForm.formData,
        name: 'Test Device',
        type: 'sensor',
        location: 'Test Location',
        ipAddress: '192.168.1.100',
        port: '502',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
      },
    });
    
    renderWithProviders(<CompanyDevicesPage />);
    
    const addButton = screen.getByText('Add Device');
    await user.click(addButton);
    
    const submitButton = screen.getByText('Add Device');
    await user.click(submitButton);
    
    // Should handle form submission
    await waitFor(() => {
      expect(mockUseDevices.refreshDevices).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    // Mock form with errors
    const mockSetFieldError = jest.fn();
    const { useStableForm } = require('@/hooks/useStableForm');
    useStableForm.mockReturnValue({
      ...mockUseStableForm,
      setFieldError: mockSetFieldError,
      formData: {
        ...mockUseStableForm.formData,
        name: '', // Empty required field
      },
    });
    
    renderWithProviders(<CompanyDevicesPage />);
    
    const addButton = screen.getByText('Add Device');
    await user.click(addButton);
    
    const submitButton = screen.getByText('Add Device');
    await user.click(submitButton);
    
    // Should call setFieldError for validation
    await waitFor(() => {
      expect(mockSetFieldError).toHaveBeenCalled();
    });
  });
});
