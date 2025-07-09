import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - IoT Platform',
  description: 'Sign in to your IoT Platform account',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Authentication layout component
 * Minimal layout for login/register pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            IoT Platform
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
