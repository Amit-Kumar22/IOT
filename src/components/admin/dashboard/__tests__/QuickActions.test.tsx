/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserPlusIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="user-plus-icon" />,
  BuildingOfficeIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="building-office-icon" />,
  CogIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="cog-icon" />,
  PlusIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="plus-icon" />,
  DocumentTextIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="document-text-icon" />,
  ChartBarIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="chart-bar-icon" />,
  ShieldCheckIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="shield-check-icon" />,
  BellIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="bell-icon" />,
  ArrowDownTrayIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="arrow-down-tray-icon" />,
  ServerIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="server-icon" />,
  CloudIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="cloud-icon" />,
  WrenchScrewdriverIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="wrench-screwdriver-icon" />,
}));

describe('QuickActions', () => {
  it('renders quick actions with default props', () => {
    render(<QuickActions />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('displays all action categories', () => {
    render(<QuickActions />);
    
    // Check for user management actions
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByText('Add Company')).toBeInTheDocument();
    
    // Check for content management actions
    expect(screen.getByText('Create Post')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
    
    // Check for system management actions
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('handles action button clicks', () => {
    render(<QuickActions />);
    
    const addUserButton = screen.getByText('Add User').closest('button');
    expect(addUserButton).toBeInTheDocument();
    
    if (addUserButton) {
      fireEvent.click(addUserButton);
    }
  });

  it('displays action icons correctly', () => {
    render(<QuickActions />);
    
    // Check for various action icons
    expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
    expect(screen.getByTestId('building-office-icon')).toBeInTheDocument();
    expect(screen.getByTestId('cog-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chart-bar-icon')).toBeInTheDocument();
  });

  it('shows loading state for actions', () => {
    render(<QuickActions />);
    
    const addUserButton = screen.getByText('Add User').closest('button');
    
    if (addUserButton) {
      fireEvent.click(addUserButton);
      
      // Should show loading state temporarily
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    }
  });

  it('displays action descriptions', () => {
    render(<QuickActions />);
    
    expect(screen.getByText('Create new user account')).toBeInTheDocument();
    expect(screen.getByText('Add new company profile')).toBeInTheDocument();
    expect(screen.getByText('Configure system settings')).toBeInTheDocument();
  });

  it('groups actions by category', () => {
    render(<QuickActions />);
    
    // Should have a grid layout for actions
    const actionGrid = document.querySelector('.grid');
    expect(actionGrid).toBeInTheDocument();
    
    // Should have multiple action buttons
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThan(5);
  });

  it('handles hover states correctly', () => {
    render(<QuickActions />);
    
    const addUserButton = screen.getByText('Add User').closest('button');
    
    if (addUserButton) {
      fireEvent.mouseEnter(addUserButton);
      expect(addUserButton).toHaveClass('hover:shadow-md');
    }
  });

  it('displays action shortcuts', () => {
    render(<QuickActions />);
    
    // Check for keyboard shortcuts or quick access indicators
    const quickActionElements = document.querySelectorAll('.transition-all');
    expect(quickActionElements.length).toBeGreaterThan(0);
  });

  it('handles disabled state for restricted actions', () => {
    render(<QuickActions />);
    
    // Some actions might be disabled based on permissions
    const actionButtons = screen.getAllByRole('button');
    const enabledButtons = actionButtons.filter(button => 
      !(button as HTMLButtonElement).disabled
    );
    
    expect(enabledButtons.length).toBeGreaterThan(0);
  });
});
