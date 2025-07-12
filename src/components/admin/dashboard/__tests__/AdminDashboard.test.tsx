import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminDashboard from '../AdminDashboard';

// Mock the store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
  },
  preloadedState: {
    auth: {
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
      },
      isAuthenticated: true,
    },
  },
});

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

describe('AdminDashboard', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  it('renders dashboard header correctly', () => {
    renderWithProvider(<AdminDashboard />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive system overview and management')).toBeInTheDocument();
  });

  it('displays KPI cards with metrics', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Devices')).toBeInTheDocument();
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });
  });

  it('renders charts correctly', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('displays system status indicators', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('shows recent activity feed', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('User Registration')).toBeInTheDocument();
      expect(screen.getByText('New Device Added')).toBeInTheDocument();
    });
  });

  it('displays quick actions panel', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
      expect(screen.getByText('System Backup')).toBeInTheDocument();
    });
  });

  it('shows alert notifications', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Alerts')).toBeInTheDocument();
    });
  });

  it('displays user session management', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });
  });

  it('shows performance metrics widgets', async () => {
    renderWithProvider(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    });
  });
});
