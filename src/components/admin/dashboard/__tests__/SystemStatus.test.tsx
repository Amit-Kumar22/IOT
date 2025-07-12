/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemStatus } from '@/components/admin/dashboard/SystemStatus';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CheckCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-circle-icon" />,
  ExclamationTriangleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="exclamation-triangle-icon" />,
  XCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="x-circle-icon" />,
  ArrowPathIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-path-icon" />,
  ServerIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="server-icon" />,
  CloudIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="cloud-icon" />,
  CircleStackIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="circle-stack-icon" />,
  WifiIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="wifi-icon" />,
  ShieldCheckIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="shield-check-icon" />,
  CpuChipIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="cpu-chip-icon" />,
}));

describe('SystemStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders system status with default props', () => {
    render(<SystemStatus />);
    
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('System Metrics')).toBeInTheDocument();
    expect(screen.getByText('Service Status')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<SystemStatus />);
    
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays CPU usage correctly', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });
  });

  it('displays memory usage correctly', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    });
  });

  it('displays disk usage correctly', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Disk Usage')).toBeInTheDocument();
    });
  });

  it('shows service status indicators', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('API Server')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Cache')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      const refreshButton = screen.getByTestId('arrow-path-icon').closest('button');
      expect(refreshButton).toBeInTheDocument();
      
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('displays progress bars for metrics', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      const progressBars = document.querySelectorAll('.w-full.bg-gray-200');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  it('shows warning status for high resource usage', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      // Should show warning indicators for high usage
      const warningElements = document.querySelectorAll('.text-yellow-600');
      expect(warningElements.length).toBeGreaterThan(0);
    });
  });

  it('displays last updated timestamp', async () => {
    render(<SystemStatus />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    });
  });
});
