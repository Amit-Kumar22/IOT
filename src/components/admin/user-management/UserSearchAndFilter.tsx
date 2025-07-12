import React, { useState, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { UserSearchFilters, UserRole, UserStatus } from '@/types/userManagement';

interface UserSearchAndFilterProps {
  onFiltersChange: (filters: UserSearchFilters) => void;
  onClearFilters: () => void;
  currentFilters: UserSearchFilters;
  loading?: boolean;
}

const UserSearchAndFilter: React.FC<UserSearchAndFilterProps> = ({
  onFiltersChange,
  onClearFilters,
  currentFilters,
  loading = false,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<UserSearchFilters>(currentFilters);

  const handleFilterChange = useCallback((key: keyof UserSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters: UserSearchFilters = {
      query: '',
      role: undefined,
      status: undefined,
      company: '',
      dateRange: undefined,
      lastActiveRange: undefined,
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = Object.values(localFilters).some(value => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null && v !== undefined);
    }
    return value !== '' && value !== undefined && value !== null;
  });

  const roleOptions: { value: UserRole; label: string; color: string }[] = [
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    { value: 'company', label: 'Company', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    { value: 'consumer', label: 'Consumer', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  ];

  const statusOptions: { value: UserStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FunnelIcon className="w-5 h-5 mr-2" />
          User Search & Filters
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
            Advanced
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Search Query */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={localFilters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={localFilters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value === '' ? undefined : e.target.value as UserRole | 'all')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="all">All</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value === '' ? undefined : e.target.value as UserStatus | 'all')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="all">All</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Company Filter */}
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Company name..."
                value={localFilters.company || ''}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Created Date Range Start */}
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                placeholder="Created after..."
                value={localFilters.dateRange?.start ? new Date(localFilters.dateRange.start).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const value = e.target.value ? new Date(e.target.value) : undefined;
                  handleFilterChange('dateRange', { 
                    start: value, 
                    end: localFilters.dateRange?.end 
                  });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Created Date Range End */}
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                placeholder="Created before..."
                value={localFilters.dateRange?.end ? new Date(localFilters.dateRange.end).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const value = e.target.value ? new Date(e.target.value) : undefined;
                  handleFilterChange('dateRange', { 
                    start: localFilters.dateRange?.start, 
                    end: value 
                  });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Active filters:</span>
            
            {localFilters.query && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                Search: {localFilters.query}
                <button
                  onClick={() => handleFilterChange('query', '')}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {localFilters.role && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                Role: {localFilters.role}
                <button
                  onClick={() => handleFilterChange('role', undefined)}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {localFilters.status && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">
                Status: {localFilters.status}
                <button
                  onClick={() => handleFilterChange('status', undefined)}
                  className="ml-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {localFilters.company && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs rounded-full">
                Company: {localFilters.company}
                <button
                  onClick={() => handleFilterChange('company', '')}
                  className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchAndFilter;
