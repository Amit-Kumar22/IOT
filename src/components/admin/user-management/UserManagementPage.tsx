import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AdminUser } from '@/types/admin';
import { UserSearchFilters, UserBulkOperation, UserManagementPagination } from '@/types/userManagement';
import { EnhancedUserManagementTable } from './EnhancedUserManagementTable';
import UserSearchAndFilter from './UserSearchAndFilter';
import UserBulkActions from './UserBulkActions';
import { 
  UserGroupIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Mock data for demonstration
const generateMockUsers = (count: number = 50): AdminUser[] => {
  const roles = ['admin', 'company', 'consumer'] as const;
  const statuses = ['active', 'inactive', 'suspended', 'pending'] as const;
  const companies = ['TechCorp', 'GreenEnergy', 'SmartHome', 'PowerGrid', 'EcoSolutions'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    avatar: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
    companyInfo: roles[i % roles.length] === 'company' ? {
      companyName: companies[i % companies.length],
      industry: 'Energy',
      deviceCount: Math.floor(Math.random() * 20),
      department: 'Operations',
    } : undefined,
    consumerInfo: roles[i % roles.length] === 'consumer' ? {
      homeType: 'Apartment',
      deviceCount: Math.floor(Math.random() * 10),
      energyPlan: 'Standard',
      location: 'Downtown',
    } : undefined,
    billingPlan: 'basic',
    usage: {
      devicesConnected: Math.floor(Math.random() * 20),
      dataUsageMB: Math.floor(Math.random() * 1000),
      apiCalls: Math.floor(Math.random() * 10000),
      monthlySpend: Math.floor(Math.random() * 1000),
      lastBillingDate: new Date(),
      storageUsedMB: Math.floor(Math.random() * 500),
      bandwidthUsedMB: Math.floor(Math.random() * 2000),
    },
    permissions: ['read', 'write'],
    notes: `User ${i + 1} notes`,
    isVerified: Math.random() > 0.3,
    twoFactorEnabled: Math.random() > 0.5,
  }));
};

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<UserSearchFilters>({
    query: '',
    role: undefined,
    status: undefined,
    company: '',
    dateRange: undefined,
    lastActiveRange: undefined,
  });
  const [pagination, setPagination] = useState<UserManagementPagination>({
    page: 0,
    pageSize: 10,
    total: 0,
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Initialize mock data
  useEffect(() => {
    setLoading(true);
    const mockUsers = generateMockUsers(100);
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setPagination((prev: UserManagementPagination) => ({ ...prev, total: mockUsers.length }));
    setLoading(false);
  }, []);

  // Filter users based on current filters
  useEffect(() => {
    let filtered = [...users];

    // Apply search query
    if (currentFilters.query) {
      const query = currentFilters.query.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.companyInfo?.companyName?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (currentFilters.role && currentFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === currentFilters.role);
    }

    // Apply status filter
    if (currentFilters.status && currentFilters.status !== 'all') {
      filtered = filtered.filter(user => user.status === currentFilters.status);
    }

    // Apply company filter
    if (currentFilters.company) {
      const company = currentFilters.company.toLowerCase();
      filtered = filtered.filter(user => 
        user.companyInfo?.companyName?.toLowerCase().includes(company)
      );
    }

    // Apply date range filter
    if (currentFilters.dateRange) {
      const { start, end } = currentFilters.dateRange;
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        const afterStart = !start || userDate >= start;
        const beforeEnd = !end || userDate <= end;
        return afterStart && beforeEnd;
      });
    }

    // Apply last active range filter
    if (currentFilters.lastActiveRange) {
      const { start, end } = currentFilters.lastActiveRange;
      filtered = filtered.filter(user => {
        if (!user.lastLoginAt) return false;
        const userDate = new Date(user.lastLoginAt);
        const afterStart = !start || userDate >= start;
        const beforeEnd = !end || userDate <= end;
        return afterStart && beforeEnd;
      });
    }

    setFilteredUsers(filtered);
    setPagination((prev: UserManagementPagination) => ({ ...prev, total: filtered.length, page: 0 }));
  }, [users, currentFilters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: UserSearchFilters) => {
    setCurrentFilters(filters);
  }, []);

  // Handle clearing filters
  const handleClearFilters = useCallback(() => {
    setCurrentFilters({
      query: '',
      role: undefined,
      status: undefined,
      company: '',
      dateRange: undefined,
      lastActiveRange: undefined,
    });
  }, []);

  // Handle user selection
  const handleUserSelect = useCallback((user: AdminUser) => {
    console.log('User selected:', user);
    // TODO: Implement user detail modal
  }, []);

  const handleUserEdit = useCallback((user: AdminUser) => {
    console.log('Edit user:', user);
    // TODO: Implement user edit modal
  }, []);

  const handleUserDelete = useCallback((userId: string) => {
    console.log('Delete user:', userId);
    // TODO: Implement user deletion with confirmation
  }, []);

  const handleUserImpersonate = useCallback((userId: string) => {
    console.log('Impersonate user:', userId);
    // TODO: Implement user impersonation
  }, []);

  // Handle selection changes
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedUserIds(selectedIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUserIds([]);
  }, []);

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (operation: UserBulkOperation) => {
    setLoading(true);
    try {
      console.log('Bulk operation:', operation);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update users based on operation
      let updatedUsers = [...users];
      
      switch (operation.type) {
        case 'activate':
          updatedUsers = updatedUsers.map(user => 
            operation.userIds.includes(user.id) 
              ? { ...user, status: 'active' as const }
              : user
          );
          setNotification({ type: 'success', message: `${operation.userIds.length} users activated successfully.` });
          break;
          
        case 'deactivate':
          updatedUsers = updatedUsers.map(user => 
            operation.userIds.includes(user.id) 
              ? { ...user, status: 'inactive' as const }
              : user
          );
          setNotification({ type: 'success', message: `${operation.userIds.length} users deactivated successfully.` });
          break;
          
        case 'delete':
          updatedUsers = updatedUsers.filter(user => !operation.userIds.includes(user.id));
          setNotification({ type: 'success', message: `${operation.userIds.length} users deleted successfully.` });
          break;
          
        case 'changeRole':
          if (operation.params?.newRole) {
            updatedUsers = updatedUsers.map(user => 
              operation.userIds.includes(user.id) && operation.params?.newRole
                ? { ...user, role: operation.params.newRole }
                : user
            );
            setNotification({ type: 'success', message: `Role changed for ${operation.userIds.length} users.` });
          }
          break;
          
        case 'export':
          // TODO: Implement CSV export
          setNotification({ type: 'info', message: `Exporting ${operation.userIds.length} users...` });
          break;
          
        case 'assignCompany':
          if (operation.params?.companyId) {
            // TODO: Implement company assignment
            setNotification({ type: 'success', message: `Company assigned to ${operation.userIds.length} users.` });
          }
          break;
      }
      
      setUsers(updatedUsers);
      setSelectedUserIds([]);
      
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setNotification({ type: 'error', message: 'Bulk operation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [users]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev: UserManagementPagination) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination((prev: UserManagementPagination) => ({ ...prev, pageSize, page: 0 }));
  }, []);

  // Get paginated users
  const paginatedUsers = filteredUsers.slice(
    pagination.page * pagination.pageSize,
    (pagination.page + 1) * pagination.pageSize
  );

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and monitor all users in your IoT platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
            notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }`}>
            {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <ExclamationCircleIcon className="w-5 h-5 mr-2" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <UserSearchAndFilter
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          currentFilters={currentFilters}
          loading={loading}
        />

        {/* Bulk Actions */}
        <UserBulkActions
          selectedUserIds={selectedUserIds}
          onBulkOperation={handleBulkOperation}
          onClearSelection={handleClearSelection}
          loading={loading}
        />

        {/* Users Table */}
        <EnhancedUserManagementTable
          users={paginatedUsers}
          loading={loading}
          onUserSelect={handleUserSelect}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
          onUserImpersonate={handleUserImpersonate}
          selectedUsers={selectedUserIds}
          onSelectionChange={handleSelectionChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredUsers.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredUsers.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredUsers.filter(u => u.role === 'company').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Company Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {filteredUsers.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active This Week</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
