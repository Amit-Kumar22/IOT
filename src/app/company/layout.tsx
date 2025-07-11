'use client';

import { useAppSelector } from '@/hooks/redux';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  CpuChipIcon,
  ChartBarIcon,
  CogIcon,
  CommandLineIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const companyNavigation = [
  {
    name: 'Devices',
    href: '/company/devices',
    icon: CpuChipIcon,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/company/analytics',
    icon: ChartBarIcon,
    current: false,
  },
  {
    name: 'Control',
    href: '/company/control',
    icon: CommandLineIcon,
    current: false,
  },
  {
    name: 'Automation',
    href: '/company/automation',
    icon: ClockIcon,
    current: false,
  },
  {
    name: 'Users',
    href: '/company/users',
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: 'Settings',
    href: '/company/settings',
    icon: CogIcon,
    current: false,
  },
  {
    name: 'Billing',
    href: '/company/billing',
    icon: CurrencyDollarIcon,
    current: false,
  },
];

/**
 * Company layout component for industrial IoT management
 * Includes company-specific navigation and features
 */
export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Redirect if not company user (this should be handled by middleware, but adding as safety)
  if (user && user.role !== 'company' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don&apos;t have permission to access the company dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={companyNavigation} />
      
      <div className="lg:pl-72">
        <TopBar title="Company Dashboard" />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
