/**
 * Main Layout Component with Sidebar Navigation
 * Used across protected pages (dashboard, devices, analytics, etc.)
 */

'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import {
  HomeIcon,
  CpuChipIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation?: NavigationItem[];
  userRole?: 'admin' | 'company' | 'consumer';
}

// Default navigation for general users
const DEFAULT_NAVIGATION: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'Devices', href: '/devices', icon: CpuChipIcon, current: false },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: false },
  { name: 'Profile', href: '/profile', icon: UserIcon, current: false },
  { name: 'Settings', href: '/settings', icon: CogIcon, current: false },
];

// Admin-specific navigation
const ADMIN_NAVIGATION: NavigationItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheckIcon, current: false },
  { name: 'User Management', href: '/admin/users', icon: UserIcon, current: false },
  { name: 'Company Management', href: '/admin/companies', icon: BuildingOfficeIcon, current: false },
  { name: 'System Analytics', href: '/admin/analytics', icon: ChartBarIcon, current: false },
  { name: 'Device Management', href: '/admin/devices', icon: CpuChipIcon, current: false },
  { name: 'System Settings', href: '/admin/settings', icon: CogIcon, current: false },
];

// Company-specific navigation
const COMPANY_NAVIGATION: NavigationItem[] = [
  { name: 'Company Dashboard', href: '/company', icon: BuildingOfficeIcon, current: false },
  { name: 'My Devices', href: '/company/devices', icon: CpuChipIcon, current: false },
  { name: 'Analytics', href: '/company/analytics', icon: ChartBarIcon, current: false },
  { name: 'Billing', href: '/company/billing', icon: BanknotesIcon, current: false },
  { name: 'Team Management', href: '/company/team', icon: UserIcon, current: false },
  { name: 'Settings', href: '/company/settings', icon: CogIcon, current: false },
];

// Consumer-specific navigation
const CONSUMER_NAVIGATION: NavigationItem[] = [
  { name: 'My Dashboard', href: '/consumer', icon: HomeIcon, current: false },
  { name: 'My Devices', href: '/consumer/devices', icon: CpuChipIcon, current: false },
  { name: 'Analytics', href: '/consumer/analytics', icon: ChartBarIcon, current: false },
  { name: 'Profile', href: '/consumer/profile', icon: UserIcon, current: false },
  { name: 'Settings', href: '/consumer/settings', icon: CogIcon, current: false },
];

export function DashboardLayout({ 
  children, 
  navigation, 
  userRole = 'consumer' 
}: DashboardLayoutProps) {
  // Determine navigation based on user role
  const getNavigationByRole = (): NavigationItem[] => {
    if (navigation) return navigation;
    
    switch (userRole) {
      case 'admin':
        return ADMIN_NAVIGATION;
      case 'company':
        return COMPANY_NAVIGATION;
      case 'consumer':
        return CONSUMER_NAVIGATION;
      default:
        return DEFAULT_NAVIGATION;
    }
  };

  const currentNavigation = getNavigationByRole();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={currentNavigation} />
      
      {/* Main content area */}
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
