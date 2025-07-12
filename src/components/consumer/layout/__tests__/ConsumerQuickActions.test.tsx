import { render, screen, fireEvent } from '@testing-library/react';
import { ConsumerQuickActions } from '../ConsumerQuickActions';
import '@testing-library/jest-dom';

// Mock the icons
jest.mock('@heroicons/react/24/outline', () => ({
  LightBulbIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="light-bulb-icon" />,
  PowerIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="power-icon" />,
  HomeIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="home-icon" />,
  ShieldCheckIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="shield-check-icon" />,
  BoltIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="bolt-icon" />
}));

jest.mock('@heroicons/react/24/solid', () => ({
  LightBulbIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="light-bulb-icon-solid" />,
  PowerIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="power-icon-solid" />,
  HomeIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="home-icon-solid" />,
  ShieldCheckIcon: ({ className }: { className: string }) => 
    <div className={className} data-testid="shield-check-icon-solid" />
}));

describe('ConsumerQuickActions', () => {
  it('renders quick actions component', () => {
    render(<ConsumerQuickActions />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByTestId('bolt-icon')).toBeInTheDocument();
  });

  it('renders all quick action buttons', () => {
    render(<ConsumerQuickActions />);
    
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Climate')).toBeInTheDocument();
    expect(screen.getByText('All Devices')).toBeInTheDocument();
  });

  it('displays action descriptions', () => {
    render(<ConsumerQuickActions />);
    
    expect(screen.getByText('Main lights')).toBeInTheDocument();
    expect(screen.getByText('Armed')).toBeInTheDocument();
    expect(screen.getByText('72°F')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('toggles action state when clicked', () => {
    render(<ConsumerQuickActions />);
    
    const climateButton = screen.getByText('Climate').closest('button');
    expect(climateButton).toHaveClass('bg-gray-50');
    
    fireEvent.click(climateButton!);
    
    expect(climateButton).toHaveClass('bg-indigo-50');
  });

  it('applies correct styling for active and inactive states', () => {
    render(<ConsumerQuickActions />);
    
    const activeButton = screen.getByText('Living Room').closest('button');
    const inactiveButton = screen.getByText('Climate').closest('button');
    
    expect(activeButton).toHaveClass('bg-indigo-50');
    expect(inactiveButton).toHaveClass('bg-gray-50');
  });

  it('has proper accessibility attributes', () => {
    render(<ConsumerQuickActions />);
    
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-indigo-500');
    });
  });

  it('has touch-friendly button sizes', () => {
    render(<ConsumerQuickActions />);
    
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[80px]');
    });
  });

  it('supports keyboard navigation', () => {
    render(<ConsumerQuickActions />);
    
    const firstButton = screen.getByText('Living Room').closest('button');
    
    firstButton?.focus();
    expect(firstButton).toHaveFocus();
    
    // Living Room starts as active (indigo), so after click it should become inactive (gray)
    fireEvent.click(firstButton!);
    expect(firstButton).toHaveClass('bg-gray-50');
  });
});
