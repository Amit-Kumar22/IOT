'use client';

import { useAppSelector } from '@/hooks/redux';
import { LogoutButton } from './LogoutButton';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  BellIcon, 
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface TopBarProps {
  title: string;
}

/**
 * Top navigation bar component
 * Shows page title and user info with logout functionality
 */
export function TopBar({ title }: TopBarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleProfile = () => {
    const profilePath = user?.role === 'admin' ? '/admin/profile' : 
                       user?.role === 'company' ? '/company/settings' : 
                       '/consumer/settings';
    router.push(profilePath);
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        
        <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />
            
            {user && (
              <div className="flex items-center gap-x-3">
                {/* User Info */}
                <div className="flex items-center gap-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  
                  <div className="hidden lg:flex lg:flex-col lg:items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={handleProfile}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    title="Profile & Settings"
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                  </button>
                  
                  <LogoutButton variant="icon" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
