'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { KPICards } from '@/components/admin/dashboard/KPICards';
import { RecentActivityFeed } from '@/components/admin/dashboard/RecentActivity';
import { SystemStatus } from '@/components/admin/dashboard/SystemStatus';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { AlertNotificationCenter } from '@/components/admin/dashboard/AlertNotificationCenter';
import { AdminDashboardStats } from '@/types/admin';

// Note: This can't be export const metadata since we're using 'use client'
// You'll need to set this in layout.tsx or use next/head

/**
 * Enhanced Admin Dashboard
 * Shows comprehensive system overview with real-time metrics
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    systemUptime: 0,
    activeAlerts: 0,
    pendingTasks: 0,
    systemHealth: 'good',
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - In real app, this would come from API
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
          lastUpdated: new Date()
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (actionId: string) => {
    console.log(`Quick action executed: ${actionId}`);
    // Handle quick action logic here
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive system overview and management controls
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {stats.systemHealth === 'good' ? '✅' : 
               stats.systemHealth === 'warning' ? '⚠️' : '❌'}
            </div>
            <div className="text-sm text-blue-100">
              System {stats.systemHealth}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards stats={stats} loading={loading} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Activity & Status */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Activity */}
          <RecentActivityFeed limit={8} />
          
          {/* System Status */}
          <SystemStatus />
        </div>

        {/* Right Column - Actions & Alerts */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions onActionClick={handleQuickAction} />
          
          {/* Alert Center */}
          <AlertNotificationCenter maxAlerts={6} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Last updated: {stats.lastUpdated.toLocaleString()}
          </div>
          <div className="flex items-center space-x-4">
            <span>Dashboard v2.0</span>
            <span>•</span>
            <span>Auto-refresh: ON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
