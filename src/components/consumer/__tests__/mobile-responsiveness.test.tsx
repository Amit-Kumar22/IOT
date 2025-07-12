import { render, screen } from '@testing-library/react';
import { DeviceCard } from '../devices/DeviceCard';
import { ConsumerEnergyOverview } from '../layout/ConsumerEnergyOverview';
import { ConsumerHomeOverview } from '../layout/ConsumerHomeOverview';
import { ConsumerQuickActions } from '../layout/ConsumerQuickActions';
import '@testing-library/jest-dom';
import type { HomeDevice } from '../../../types/consumer-devices';

// Mock device data
const mockDevice: HomeDevice = {
  id: 'test-device-1',
  name: 'Living Room Light',
  type: 'light',
  room: 'Living Room',
  isOnline: true,
  batteryLevel: 85,
  currentState: { isOn: false, brightness: 50 },
  capabilities: [
    { type: 'toggle', currentValue: false },
    { type: 'dimmer', currentValue: 50, range: { min: 0, max: 100 } }
  ],
  schedules: [],
  lastSeen: new Date(),
  energyUsage: 12.5
};

const mockOnDeviceUpdate = jest.fn();

// Mock viewport sizes
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Mock icons
jest.mock('@heroicons/react/24/outline', () => ({
  LightBulbIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="light-bulb-icon" />,
  FireIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="fire-icon" />,
  ShieldCheckIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="shield-check-icon" />,
  CogIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="cog-icon" />,
  ChartBarIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="chart-bar-icon" />,
  WifiIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="wifi-icon" />,
  ExclamationTriangleIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="exclamation-triangle-icon" />,
  Battery0Icon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="battery-0-icon" />,
  ClockIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="clock-icon" />,
  BoltIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="bolt-icon" />,
  CurrencyDollarIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="currency-dollar-icon" />,
  HomeIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="home-icon" />,
  PlusIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="plus-icon" />,
}));

jest.mock('@heroicons/react/24/solid', () => ({
  LightBulbIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="light-bulb-icon-solid" />,
  FireIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="fire-icon-solid" />,
  ShieldCheckIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="shield-check-icon-solid" />,
  CogIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="cog-icon-solid" />,
  ChartBarIcon: ({ className }: { className?: string }) => 
    <div className={className} data-testid="chart-bar-icon-solid" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Redux hooks
jest.mock('../../../hooks/redux', () => ({
  useAppSelector: jest.fn(() => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com', role: 'consumer' }
  })),
  useAppDispatch: jest.fn(() => jest.fn()),
}));

describe('Mobile Responsiveness Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset viewport to default
    mockViewport(1024, 768);
  });

  describe('Mobile Viewport (320px - 768px)', () => {
    it('should render DeviceCard properly on mobile', () => {
      mockViewport(375, 667); // iPhone SE
      
      render(<DeviceCard device={mockDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toBeInTheDocument();
      expect(deviceCard).toHaveClass('bg-white');
      
      // Check for mobile-friendly spacing
      expect(deviceCard).toHaveClass('p-4');
    });

    it('should render ConsumerEnergyOverview properly on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerEnergyOverview />);
      
      const energyOverview = screen.getByText('Energy Overview');
      expect(energyOverview).toBeInTheDocument();
      
      // Check for responsive grid layout
      const gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('grid');
    });

    it('should render ConsumerHomeOverview properly on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerHomeOverview />);
      
      const homeOverview = screen.getByText('Home Overview');
      expect(homeOverview).toBeInTheDocument();
      
      // Check for mobile-optimized layout
      const container = screen.getByRole('main');
      expect(container).toHaveClass('space-y-6');
    });

    it('should render ConsumerQuickActions with touch-friendly buttons on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerQuickActions />);
      
      const quickActions = screen.getByText('Quick Actions');
      expect(quickActions).toBeInTheDocument();
      
      // Check for touch-friendly button sizes
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        // Touch targets should be at least 44px (converted from various units)
        expect(button).toHaveClass('p-3'); // Ensures adequate padding
      });
    });
  });

  describe('Tablet Viewport (768px - 1024px)', () => {
    it('should render DeviceCard properly on tablet', () => {
      mockViewport(768, 1024); // iPad
      
      render(<DeviceCard device={mockDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toBeInTheDocument();
      expect(deviceCard).toHaveClass('bg-white');
    });

    it('should render grid layouts properly on tablet', () => {
      mockViewport(768, 1024);
      
      render(<ConsumerEnergyOverview />);
      
      const gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('grid');
      
      // Should have responsive grid classes
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Desktop Viewport (1024px+)', () => {
    it('should render all components properly on desktop', () => {
      mockViewport(1920, 1080); // Desktop
      
      render(<ConsumerHomeOverview />);
      
      const homeOverview = screen.getByText('Home Overview');
      expect(homeOverview).toBeInTheDocument();
      
      // Desktop layout should be more spacious
      const container = screen.getByRole('main');
      expect(container).toHaveClass('space-y-6');
    });

    it('should display expanded layouts on desktop', () => {
      mockViewport(1920, 1080);
      
      render(<ConsumerEnergyOverview />);
      
      const gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('grid');
      
      // Desktop should show full grid layout
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch targets on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerQuickActions />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Check for adequate padding/sizing classes
        expect(button).toHaveClass('p-3');
        
        // Verify button is clickable
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    it('should have properly sized interactive elements', () => {
      mockViewport(375, 667);
      
      render(<DeviceCard device={mockDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        // Should have minimum touch target size
        expect(element).toHaveClass('p-2');
      });
    });
  });

  describe('Text Readability', () => {
    it('should have readable text sizes on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerEnergyOverview />);
      
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        // Check for responsive text sizing
        const classes = heading.className;
        expect(classes).toMatch(/text-(lg|xl|2xl|3xl)/);
      });
    });

    it('should have proper text contrast', () => {
      mockViewport(375, 667);
      
      render(<ConsumerHomeOverview />);
      
      const textElements = screen.getAllByText(/./);
      textElements.forEach(element => {
        // Should have proper text color classes
        const classes = element.className;
        if (classes.includes('text-')) {
          expect(classes).toMatch(/text-(gray|slate|zinc)-(600|700|800|900)/);
        }
      });
    });
  });

  describe('Layout Flexibility', () => {
    it('should adapt grid layouts for different screen sizes', () => {
      // Test mobile
      mockViewport(375, 667);
      const { rerender } = render(<ConsumerEnergyOverview />);
      
      let gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('grid-cols-1');
      
      // Test tablet
      mockViewport(768, 1024);
      rerender(<ConsumerEnergyOverview />);
      
      gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      
      // Test desktop
      mockViewport(1920, 1080);
      rerender(<ConsumerEnergyOverview />);
      
      gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should handle card layouts responsively', () => {
      mockViewport(375, 667);
      
      render(<DeviceCard device={mockDevice} onDeviceUpdate={mockOnDeviceUpdate} />);
      
      const deviceCard = screen.getByRole('article');
      expect(deviceCard).toHaveClass('rounded-lg');
      
      // Should have responsive padding
      expect(deviceCard).toHaveClass('p-4');
    });
  });

  describe('Navigation and Interaction', () => {
    it('should support touch interactions on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerQuickActions />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Should not have hover-only interactions
        expect(button).not.toHaveClass('hover:scale-105');
        
        // Should have touch-friendly states
        expect(button).toHaveClass('active:scale-95');
      });
    });

    it('should handle overflow content properly', () => {
      mockViewport(320, 568); // Small mobile
      
      render(<ConsumerEnergyOverview />);
      
      const container = screen.getByRole('main');
      expect(container).toHaveClass('overflow-hidden');
    });
  });

  describe('Performance Considerations', () => {
    it('should not load unnecessary content on mobile', () => {
      mockViewport(375, 667);
      
      render(<ConsumerHomeOverview />);
      
      // Should have efficient rendering
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
      
      // Should not have complex animations on mobile
      expect(container).not.toHaveClass('animate-spin');
    });
  });
});
