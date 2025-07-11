'use client';

import { useAppDispatch } from '@/hooks/redux';
import { useLogoutMutation } from '@/store/api/authApi';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface LogoutButtonProps {
  variant?: 'button' | 'menu' | 'icon';
  className?: string;
}

/**
 * Logout button component
 * Handles user logout with proper API call and state management
 */
export function LogoutButton({ variant = 'button', className = '' }: LogoutButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      dispatch(logout());
      router.push('/');
    }
  };

  const baseClasses = 'flex items-center space-x-2 transition-colors';
  
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${baseClasses} p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50 ${className}`}
        title="Sign out"
      >
        {isLoggingOut ? (
          <div className="h-5 w-5 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        ) : (
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        )}
      </button>
    );
  }

  if (variant === 'menu') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${baseClasses} w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 ${className}`}
      >
        {isLoggingOut ? (
          <>
            <div className="h-4 w-4 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Sign out</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${baseClasses} px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium ${className}`}
    >
      {isLoggingOut ? (
        <>
          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span>Sign out</span>
        </>
      )}
    </button>
  );
}
