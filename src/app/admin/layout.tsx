'use client';

import { useAppSelector } from '@/hooks/redux';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Squares2X2Icon,
    current: false,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: 'Plans',
    href: '/admin/plans',
    icon: CurrencyDollarIcon,
    current: false,
  },
  {
    name: 'Billing',
    href: '/admin/billing',
    icon: CurrencyDollarIcon,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    current: false,
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: CogIcon,
    current: false,
  },
];

/**
 * Admin layout component for system administration pages
 * Includes admin-specific navigation and role-based access control
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Redirect if not admin (this should be handled by middleware, but adding as safety)
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don&apos;t have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={adminNavigation} />
      
      <div className="lg:pl-72">
        <TopBar title="Admin Panel" />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
