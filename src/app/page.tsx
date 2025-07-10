'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { 
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Navigation items for demo
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
  { name: 'Devices', href: '/devices', icon: CpuChipIcon, current: false },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: false },
  { name: 'Users', href: '/users', icon: UserGroupIcon, current: false },
  { name: 'Settings', href: '/settings', icon: CogIcon, current: false },
  { name: 'Security', href: '/security', icon: ShieldCheckIcon, current: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={navigation} />
      
      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Welcome header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to IoT Platform
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your IoT devices, monitor analytics, and control your infrastructure from one unified platform.
              </p>
            </div>

            {/* Authentication Demo Section */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Authentication Status
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          Demo Mode
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Try Login
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          User Accounts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          3 Demo Users
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CpuChipIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          API Endpoints
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          8 Routes Active
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Demo Credentials
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use these credentials to test the authentication system with dummy API
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Admin Account
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> admin@iotplatform.com
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Password:</span> Admin123!
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Role:</span> Full platform access
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Company Account
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> manager@acmecorp.com
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Password:</span> Manager456!
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Role:</span> Company dashboard, billing
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Consumer Account
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> jane.doe@example.com
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Password:</span> Consumer789!
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Role:</span> Device monitoring only
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Dummy API Status
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All authentication endpoints are running with dummy data
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { name: 'Login', endpoint: '/api/auth/login', status: 'Active' },
                    { name: 'Register', endpoint: '/api/auth/register', status: 'Active' },
                    { name: 'Logout', endpoint: '/api/auth/logout', status: 'Active' },
                    { name: 'Refresh', endpoint: '/api/auth/refresh', status: 'Active' },
                    { name: 'Profile', endpoint: '/api/auth/profile', status: 'Active' },
                    { name: 'Forgot Password', endpoint: '/api/auth/forgot-password', status: 'Active' },
                    { name: 'Reset Password', endpoint: '/api/auth/reset-password', status: 'Active' },
                    { name: 'Change Password', endpoint: '/api/auth/change-password', status: 'Active' },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900 dark:text-white">{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
