'use client';

import { useAppSelector } from '@/hooks/redux';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  HomeIcon,
  BoltIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ConsumerLayoutProps {
  children: React.ReactNode;
}

const consumerNavigation = [
  {
    name: 'My Devices',
    href: '/consumer/devices',
    icon: HomeIcon,
    current: false,
  },
  {
    name: 'Energy',
    href: '/consumer/energy',
    icon: BoltIcon,
    current: false,
  },
  {
    name: 'Automation',
    href: '/consumer/automation',
    icon: ClockIcon,
    current: false,
  },
  {
    name: 'Settings',
    href: '/consumer/settings',
    icon: CogIcon,
    current: false,
  },
];

/**
 * Consumer layout component for home IoT management
 * Simple, user-friendly interface for everyday users
 */
export default function ConsumerLayout({ children }: ConsumerLayoutProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Redirect if not consumer user (this should be handled by middleware, but adding as safety)
  if (user && user.role !== 'consumer' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don&apos;t have permission to access the consumer dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={consumerNavigation} />
      
      <div className="lg:pl-72">
        <TopBar title="Home Dashboard" />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
