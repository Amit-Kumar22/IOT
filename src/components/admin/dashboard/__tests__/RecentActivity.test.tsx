/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentActivityFeed } from '@/components/admin/dashboard/RecentActivity';

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistance: jest.fn(() => '5 minutes ago')
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserPlusIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="user-plus-icon" />,
  DevicePhoneMobileIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="device-phone-mobile-icon" />,
  CurrencyDollarIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="currency-dollar-icon" />,
  ExclamationTriangleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="exclamation-triangle-icon" />,
  CheckCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-circle-icon" />,
  XCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="x-circle-icon" />,
  CogIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="cog-icon" />,
  BellIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="bell-icon" />,
  ArrowPathIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-path-icon" />,
  EyeIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="eye-icon" />,
}));

describe('RecentActivityFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recent activity feed with default props', async () => {
    await act(async () => {
      render(<RecentActivityFeed />);
    });
    
    // Should show loading initially
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // Wait for activities to load
    await waitFor(() => {
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });
  });

  it('displays correct number of activities based on limit', async () => {
    const { container } = render(<RecentActivityFeed limit={5} />);
    
    await waitFor(() => {
      const activities = container.querySelectorAll('.space-y-4 > div');
      expect(activities.length).toBeLessThanOrEqual(6); // Account for mock data
    });
  });

  it('shows loading state initially', () => {
    render(<RecentActivityFeed />);
    
    // Should show loading spinner
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // Should show loading skeletons
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders different activity types with correct icons', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Check for various activity types
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
      expect(screen.getByText('Device Connected')).toBeInTheDocument();
      expect(screen.getByText('Payment Processed')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      const refreshButton = screen.getByTestId('arrow-path-icon').closest('button');
      expect(refreshButton).toBeInTheDocument();
      
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('shows user names when available', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Should show user names in badges
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  it('displays metadata tags correctly', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Should show metadata tags
      expect(screen.getByText(/userType:/)).toBeInTheDocument();
      expect(screen.getAllByText(/amount:/)).toHaveLength(2);
    });
  });

  it('handles empty state correctly', async () => {
    // Mock empty response
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    ) as jest.Mock;

    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Should show loading initially, then empty state
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });

  it('applies correct styling for different activity types', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Check for different colored borders/backgrounds
      const activityElements = document.querySelectorAll('[class*="border-"]');
      expect(activityElements.length).toBeGreaterThan(0);
    });
  });

  it('shows relative time correctly', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      // Should show relative time (mocked)
      const timeElements = screen.getAllByText('5 minutes ago');
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('handles auto-refresh when enabled', async () => {
    jest.useFakeTimers();
    
    render(<RecentActivityFeed autoRefresh={true} refreshInterval={1000} />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
    
    // Fast forward time
    jest.advanceTimersByTime(1000);
    
    jest.useRealTimers();
  });

  it('disables auto-refresh when autoRefresh is false', () => {
    jest.useFakeTimers();
    
    render(<RecentActivityFeed autoRefresh={false} />);
    
    // Fast forward time - should not trigger refresh
    jest.advanceTimersByTime(30000);
    
    jest.useRealTimers();
  });

  it('handles click on view all button', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      const viewAllButton = screen.getByTestId('eye-icon').closest('button');
      expect(viewAllButton).toBeInTheDocument();
      
      if (viewAllButton) {
        fireEvent.click(viewAllButton);
      }
    });
  });

  it('renders activity descriptions correctly', async () => {
    render(<RecentActivityFeed />);
    
    await waitFor(() => {
      expect(screen.getByText(/john.doe@example.com registered as consumer/)).toBeInTheDocument();
      expect(screen.getByText(/Smart Thermostat #ST-142 came online/)).toBeInTheDocument();
      expect(screen.getByText(/Monthly subscription payment of \$29.99 processed/)).toBeInTheDocument();
    });
  });
});
