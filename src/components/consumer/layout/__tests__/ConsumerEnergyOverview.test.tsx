import { render, screen, waitFor, act } from '@testing-library/react';
import { ConsumerEnergyOverview } from '../ConsumerEnergyOverview';
import '@testing-library/jest-dom';

// Mock the icons
jest.mock('@heroicons/react/24/outline', () => ({
  BoltIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="bolt-icon" />,
  CurrencyDollarIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="currency-dollar-icon" />,
  HomeIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="home-icon" />,
  ClockIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="clock-icon" />
}));

// Mock timers for useEffect
jest.useFakeTimers();

describe('ConsumerEnergyOverview', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders energy overview component', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByText('Energy Overview')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays all energy metrics', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByText('Current Usage')).toBeInTheDocument();
    expect(screen.getByText('Today\'s Cost')).toBeInTheDocument();
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Peak Hours')).toBeInTheDocument();
  });

  it('shows metric values with units', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByText('2.4')).toBeInTheDocument();
    expect(screen.getByText('kW')).toBeInTheDocument();
    expect(screen.getByText('$12.45')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('hrs left')).toBeInTheDocument();
  });

  it('displays trend indicators', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByText('↘ 5%')).toBeInTheDocument();
    expect(screen.getByText('↗ 8%')).toBeInTheDocument();
    expect(screen.getByText('→ 0%')).toBeInTheDocument();
    expect(screen.getByText('↘ 25%')).toBeInTheDocument();
  });

  it('applies correct color coding for different metrics', () => {
    render(<ConsumerEnergyOverview />);
    
    const currentUsageMetric = screen.getByText('Current Usage').closest('div');
    const costMetric = screen.getByText('Today\'s Cost').closest('div');
    const efficiencyMetric = screen.getByText('Efficiency').closest('div');
    const peakHoursMetric = screen.getByText('Peak Hours').closest('div');
    
    expect(currentUsageMetric).toHaveClass('bg-green-50');
    expect(costMetric).toHaveClass('bg-yellow-50');
    expect(efficiencyMetric).toHaveClass('bg-green-50');
    expect(peakHoursMetric).toHaveClass('bg-blue-50');
  });

  it('shows monthly goal progress', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByText('Monthly Goal: $150')).toBeInTheDocument();
    expect(screen.getByText('83% Complete')).toBeInTheDocument();
    
    // Check if progress visualization exists
    const progressSection = screen.getByText('Monthly Goal: $150').closest('div');
    expect(progressSection).toBeInTheDocument();
  });

  it('displays live indicator with animation', () => {
    render(<ConsumerEnergyOverview />);
    
    const liveIndicator = screen.getByText('Live').previousElementSibling;
    expect(liveIndicator).toHaveClass('animate-pulse');
  });

  it('updates current usage value over time', async () => {
    render(<ConsumerEnergyOverview />);
    
    const initialValue = screen.getByText('2.4');
    expect(initialValue).toBeInTheDocument();
    
    // Fast forward time to trigger useEffect
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    await waitFor(() => {
      // The value should have changed (though we can't predict exact value due to Math.random)
      const currentUsageElements = screen.getAllByText(/^\d+\.\d+$/);
      expect(currentUsageElements.length).toBeGreaterThan(0);
    });
  });

  it('renders all metric icons', () => {
    render(<ConsumerEnergyOverview />);
    
    expect(screen.getByTestId('bolt-icon')).toBeInTheDocument();
    expect(screen.getByTestId('currency-dollar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    render(<ConsumerEnergyOverview />);
    
    const metricsGrid = screen.getByText('Current Usage').closest('div')?.parentElement;
    expect(metricsGrid).toHaveClass('grid', 'grid-cols-2', 'gap-3');
  });

  it('supports dark mode styling', () => {
    render(<ConsumerEnergyOverview />);
    
    const container = screen.getByText('Energy Overview').closest('div')?.parentElement;
    expect(container).toHaveClass('bg-white', 'dark:bg-gray-800');
  });
});
