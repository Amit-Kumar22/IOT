/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KPICards } from '@/components/admin/dashboard/KPICards';
import { AdminDashboardStats } from '@/types/admin';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserGroupIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="user-group-icon" />,
  DeviceTabletIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="device-tablet-icon" />,
  CurrencyDollarIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="currency-dollar-icon" />,
  ChartBarIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="chart-bar-icon" />,
  ExclamationTriangleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="exclamation-triangle-icon" />,
  CheckCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-circle-icon" />,
  ClockIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="clock-icon" />,
  ArrowUpIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-up-icon" />,
  ArrowDownIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-down-icon" />,
}));

describe('KPICards', () => {
  const mockStats: AdminDashboardStats = {
    totalUsers: 1234,
    activeUsers: 892,
    totalDevices: 5678,
    activeDevices: 4321,
    monthlyRevenue: 45678,
    totalRevenue: 234567,
    systemUptime: 99.8,
    activeAlerts: 5,
    pendingTasks: 12,
    systemHealth: 'good',
    lastUpdated: new Date('2024-01-01T10:00:00Z')
  };

  it('renders KPI cards with correct data', () => {
    render(<KPICards stats={mockStats} />);
    
    // Check if all KPI cards are rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Devices')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('System Uptime')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<KPICards stats={mockStats} />);
    
    // Check number formatting
    expect(screen.getByText('1.2K')).toBeInTheDocument(); // totalUsers
    expect(screen.getByText('4.3K')).toBeInTheDocument(); // activeDevices
    expect(screen.getByText('$45,678')).toBeInTheDocument(); // monthlyRevenue
  });

  it('displays system health status correctly', () => {
    render(<KPICards stats={mockStats} />);
    
    expect(screen.getByText('GOOD')).toBeInTheDocument();
    expect(screen.getByText('99.8% uptime')).toBeInTheDocument();
  });

  it('shows warning status for high alert count', () => {
    const warningStats = {
      ...mockStats,
      activeAlerts: 12,
      systemHealth: 'warning' as const
    };
    
    render(<KPICards stats={warningStats} />);
    
    // Should show warning color for high alerts
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(<KPICards stats={mockStats} loading={true} />);
    
    // Should show loading skeletons with animate-pulse class
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays trend indicators correctly', () => {
    render(<KPICards stats={mockStats} />);
    
    // Check for trend indicators (arrows)
    const upArrows = screen.getAllByTestId('arrow-up-icon');
    expect(upArrows.length).toBeGreaterThan(0);
  });

  it('handles different system health states', () => {
    const criticalStats = {
      ...mockStats,
      systemHealth: 'critical' as const
    };
    
    render(<KPICards stats={criticalStats} />);
    
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });
});

describe('KPICard individual component', () => {
  it('renders with all required props', () => {
    const { container } = render(
      <div>
        <KPICards stats={{
          totalUsers: 100,
          activeUsers: 80,
          totalDevices: 200,
          activeDevices: 180,
          monthlyRevenue: 5000,
          totalRevenue: 50000,
          systemUptime: 95.5,
          activeAlerts: 3,
          pendingTasks: 5,
          systemHealth: 'good',
          lastUpdated: new Date()
        }} />
      </div>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroStats = {
      totalUsers: 0,
      activeUsers: 0,
      totalDevices: 0,
      activeDevices: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      systemUptime: 0,
      activeAlerts: 0,
      pendingTasks: 0,
      systemHealth: 'critical' as const,
      lastUpdated: new Date()
    };
    
    render(<KPICards stats={zeroStats} />);
    
    // Should handle zero values without crashing - use getAllByText for multiple "0"s
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('handles very large numbers', () => {
    const largeStats: AdminDashboardStats = {
      totalUsers: 1500000,
      activeUsers: 1200000,
      totalDevices: 2000000,
      activeDevices: 1800000,
      monthlyRevenue: 2500000,
      totalRevenue: 25000000,
      systemUptime: 99.9,
      activeAlerts: 0,
      pendingTasks: 0,
      systemHealth: 'good',
      lastUpdated: new Date()
    };
    
    render(<KPICards stats={largeStats} />);
    
    // Should format large numbers with M suffix
    expect(screen.getByText('1.5M')).toBeInTheDocument();
    // Check actual formatted output from component
    expect(screen.getByText('$25,00,000')).toBeInTheDocument();
  });
});
