/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertNotificationCenter } from '@/components/admin/dashboard/AlertNotificationCenter';

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistance: jest.fn(() => '2 hours ago'),
  format: jest.fn(() => '2024-01-01 10:00:00')
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  BellIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="bell-icon" />,
  ExclamationTriangleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="exclamation-triangle-icon" />,
  InformationCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="information-circle-icon" />,
  CheckCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-circle-icon" />,
  XCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="x-circle-icon" />,
  FunnelIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="funnel-icon" />,
  ArrowPathIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-path-icon" />,
  EyeSlashIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="eye-slash-icon" />,
  TrashIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="trash-icon" />,
}));

describe('AlertNotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders alert notification center with default props', () => {
    render(<AlertNotificationCenter />);
    
    expect(screen.getByText('Alert Center')).toBeInTheDocument();
  });

  it('displays alert count correctly', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText(/alerts/i)).toBeInTheDocument();
    });
  });

  it('shows different severity levels', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      // Check for different severity badges
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  it('displays alert timestamps', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  it('handles filter button clicks', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      const filterButton = screen.getByTestId('funnel-icon').closest('button');
      expect(filterButton).toBeInTheDocument();
      
      if (filterButton) {
        fireEvent.click(filterButton);
      }
    });
  });

  it('handles refresh button clicks', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      const refreshButton = screen.getByTestId('arrow-path-icon').closest('button');
      expect(refreshButton).toBeInTheDocument();
      
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('shows loading state initially', () => {
    render(<AlertNotificationCenter />);
    
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays alert categories correctly', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('handles alert dismissal', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      const dismissButton = screen.getByTestId('eye-slash-icon').closest('button');
      expect(dismissButton).toBeInTheDocument();
      
      if (dismissButton) {
        fireEvent.click(dismissButton);
      }
    });
  });

  it('handles alert deletion', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTestId('trash-icon').closest('button');
      expect(deleteButton).toBeInTheDocument();
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });
  });

  it('displays alert messages correctly', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed login attempts/i)).toBeInTheDocument();
      expect(screen.getByText(/High CPU usage/i)).toBeInTheDocument();
      expect(screen.getByText(/Low disk space/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no alerts', async () => {
    // Mock empty alerts
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ alerts: [] })
      })
    ) as jest.Mock;

    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText(/No alerts/i)).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });

  it('handles alert resolution', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      const resolveButton = screen.getByTestId('check-circle-icon').closest('button');
      expect(resolveButton).toBeInTheDocument();
      
      if (resolveButton) {
        fireEvent.click(resolveButton);
      }
    });
  });

  it('displays alert priority indicators', async () => {
    render(<AlertNotificationCenter />);
    
    await waitFor(() => {
      // Check for priority color coding
      const highPriorityElements = document.querySelectorAll('.border-red-200');
      const mediumPriorityElements = document.querySelectorAll('.border-yellow-200');
      const lowPriorityElements = document.querySelectorAll('.border-blue-200');
      
      expect(highPriorityElements.length).toBeGreaterThan(0);
      expect(mediumPriorityElements.length).toBeGreaterThan(0);
      expect(lowPriorityElements.length).toBeGreaterThan(0);
    });
  });

  it('handles alert limit prop', async () => {
    render(<AlertNotificationCenter maxAlerts={3} />);
    
    await waitFor(() => {
      const alertItems = document.querySelectorAll('.space-y-3 > div');
      expect(alertItems.length).toBeLessThanOrEqual(3);
    });
  });
});
