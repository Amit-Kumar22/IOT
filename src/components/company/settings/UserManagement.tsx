'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  UserIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserPlusIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { UserProfile, UserRole, UserPermission, UserInvitation } from '@/types/settings';

interface UserManagementProps {
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

/**
 * User Management Component
 * Comprehensive user and role management interface
 */
export default function UserManagement({ onSave, readOnly = false }: UserManagementProps) {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // State for data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);

  // Initialize mock data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock permissions
      const mockPermissions: UserPermission[] = [
        { id: 'perm_001', name: 'System Admin', description: 'Full system administration access', category: 'system', action: 'admin', resource: '*' },
        { id: 'perm_002', name: 'Device Read', description: 'Read device information and status', category: 'devices', action: 'read', resource: 'devices' },
        { id: 'perm_003', name: 'Device Write', description: 'Modify device settings and configuration', category: 'devices', action: 'write', resource: 'devices' },
        { id: 'perm_004', name: 'Device Control', description: 'Execute device commands and controls', category: 'devices', action: 'execute', resource: 'devices' },
        { id: 'perm_005', name: 'Analytics Read', description: 'View analytics and reports', category: 'analytics', action: 'read', resource: 'analytics' },
        { id: 'perm_006', name: 'Analytics Write', description: 'Create and modify analytics dashboards', category: 'analytics', action: 'write', resource: 'analytics' },
        { id: 'perm_007', name: 'Control Read', description: 'View control interfaces and status', category: 'control', action: 'read', resource: 'control' },
        { id: 'perm_008', name: 'Control Execute', description: 'Execute control operations', category: 'control', action: 'execute', resource: 'control' },
        { id: 'perm_009', name: 'Automation Read', description: 'View automation rules and workflows', category: 'automation', action: 'read', resource: 'automation' },
        { id: 'perm_010', name: 'Automation Write', description: 'Create and modify automation rules', category: 'automation', action: 'write', resource: 'automation' },
        { id: 'perm_011', name: 'Billing Read', description: 'View billing and subscription information', category: 'billing', action: 'read', resource: 'billing' },
        { id: 'perm_012', name: 'Billing Admin', description: 'Manage billing and payment methods', category: 'billing', action: 'admin', resource: 'billing' }
      ];

      // Mock roles
      const mockRoles: UserRole[] = [
        {
          id: 'role_001',
          name: 'System Administrator',
          description: 'Full system access and administration capabilities',
          level: 100,
          permissions: [mockPermissions[0]],
          isDefault: false,
          isSystem: true,
          createdAt: new Date(Date.now() - 86400000 * 30),
          updatedAt: new Date(Date.now() - 86400000 * 5)
        },
        {
          id: 'role_002',
          name: 'Plant Manager',
          description: 'Full operational control and management access',
          level: 80,
          permissions: mockPermissions.slice(1, 11),
          isDefault: false,
          isSystem: false,
          createdAt: new Date(Date.now() - 86400000 * 25),
          updatedAt: new Date(Date.now() - 86400000 * 3)
        },
        {
          id: 'role_003',
          name: 'Operator',
          description: 'Standard operational access to devices and monitoring',
          level: 60,
          permissions: [mockPermissions[1], mockPermissions[4], mockPermissions[6], mockPermissions[8]],
          isDefault: true,
          isSystem: false,
          createdAt: new Date(Date.now() - 86400000 * 20),
          updatedAt: new Date(Date.now() - 86400000 * 2)
        },
        {
          id: 'role_004',
          name: 'Maintenance Technician',
          description: 'Device maintenance and configuration access',
          level: 70,
          permissions: [mockPermissions[1], mockPermissions[2], mockPermissions[3], mockPermissions[8], mockPermissions[9]],
          isDefault: false,
          isSystem: false,
          createdAt: new Date(Date.now() - 86400000 * 15),
          updatedAt: new Date(Date.now() - 86400000 * 1)
        },
        {
          id: 'role_005',
          name: 'Viewer',
          description: 'Read-only access to monitoring and analytics',
          level: 20,
          permissions: [mockPermissions[1], mockPermissions[4], mockPermissions[6], mockPermissions[8], mockPermissions[10]],
          isDefault: false,
          isSystem: false,
          createdAt: new Date(Date.now() - 86400000 * 10),
          updatedAt: new Date(Date.now() - 86400000 * 1)
        }
      ];

      // Mock users
      const mockUsers: UserProfile[] = [
        {
          id: 'user_001',
          email: 'admin@industrialsolutions.com',
          username: 'admin',
          firstName: 'John',
          lastName: 'Administrator',
          avatar: '',
          role: mockRoles[0],
          permissions: mockRoles[0].permissions,
          department: 'IT',
          title: 'System Administrator',
          phone: '+1 (555) 123-4567',
          status: 'active',
          lastLogin: new Date(Date.now() - 1800000), // 30 minutes ago
          createdAt: new Date(Date.now() - 86400000 * 90),
          updatedAt: new Date(Date.now() - 86400000 * 1),
          preferences: {
            language: 'en-US',
            timezone: 'America/Detroit',
            theme: 'dark',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            notifications: { email: true, push: true, sms: false },
            dashboard: { layout: 'grid', widgets: ['status', 'alerts', 'metrics'], refreshInterval: 30 }
          }
        },
        {
          id: 'user_002',
          email: 'manager@industrialsolutions.com',
          username: 'jsmith',
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: '',
          role: mockRoles[1],
          permissions: mockRoles[1].permissions,
          department: 'Operations',
          title: 'Plant Manager',
          phone: '+1 (555) 123-4568',
          status: 'active',
          lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
          createdAt: new Date(Date.now() - 86400000 * 60),
          updatedAt: new Date(Date.now() - 86400000 * 2),
          preferences: {
            language: 'en-US',
            timezone: 'America/Detroit',
            theme: 'light',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            notifications: { email: true, push: true, sms: true },
            dashboard: { layout: 'list', widgets: ['production', 'efficiency', 'alerts'], refreshInterval: 15 }
          }
        },
        {
          id: 'user_003',
          email: 'operator1@industrialsolutions.com',
          username: 'bwilson',
          firstName: 'Bob',
          lastName: 'Wilson',
          avatar: '',
          role: mockRoles[2],
          permissions: mockRoles[2].permissions,
          department: 'Production',
          title: 'Senior Operator',
          phone: '+1 (555) 123-4569',
          status: 'active',
          lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
          createdAt: new Date(Date.now() - 86400000 * 45),
          updatedAt: new Date(Date.now() - 86400000 * 5),
          preferences: {
            language: 'en-US',
            timezone: 'America/Detroit',
            theme: 'auto',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '24h',
            notifications: { email: true, push: false, sms: false },
            dashboard: { layout: 'grid', widgets: ['devices', 'status', 'production'], refreshInterval: 10 }
          }
        },
        {
          id: 'user_004',
          email: 'maintenance@industrialsolutions.com',
          username: 'mgarcia',
          firstName: 'Maria',
          lastName: 'Garcia',
          avatar: '',
          role: mockRoles[3],
          permissions: mockRoles[3].permissions,
          department: 'Maintenance',
          title: 'Maintenance Technician',
          phone: '+1 (555) 123-4570',
          status: 'active',
          lastLogin: new Date(Date.now() - 10800000), // 3 hours ago
          createdAt: new Date(Date.now() - 86400000 * 30),
          updatedAt: new Date(Date.now() - 86400000 * 1),
          preferences: {
            language: 'es-ES',
            timezone: 'America/Detroit',
            theme: 'light',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            notifications: { email: true, push: true, sms: true },
            dashboard: { layout: 'list', widgets: ['maintenance', 'alerts', 'schedule'], refreshInterval: 20 }
          }
        },
        {
          id: 'user_005',
          email: 'viewer@industrialsolutions.com',
          username: 'dlee',
          firstName: 'David',
          lastName: 'Lee',
          avatar: '',
          role: mockRoles[4],
          permissions: mockRoles[4].permissions,
          department: 'Quality',
          title: 'Quality Inspector',
          phone: '+1 (555) 123-4571',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 86400000 * 3), // 3 days ago
          createdAt: new Date(Date.now() - 86400000 * 15),
          updatedAt: new Date(Date.now() - 86400000 * 3),
          preferences: {
            language: 'en-US',
            timezone: 'America/Detroit',
            theme: 'light',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            notifications: { email: false, push: false, sms: false },
            dashboard: { layout: 'grid', widgets: ['quality', 'analytics'], refreshInterval: 60 }
          }
        }
      ];

      // Mock invitations
      const mockInvitations: UserInvitation[] = [
        {
          id: 'inv_001',
          email: 'newuser@industrialsolutions.com',
          role: 'role_003',
          invitedBy: 'user_001',
          invitedAt: new Date(Date.now() - 86400000 * 2),
          expiresAt: new Date(Date.now() + 86400000 * 5),
          status: 'pending',
          token: 'token_001'
        },
        {
          id: 'inv_002',
          email: 'contractor@externalsolutions.com',
          role: 'role_005',
          invitedBy: 'user_002',
          invitedAt: new Date(Date.now() - 86400000 * 5),
          expiresAt: new Date(Date.now() + 86400000 * 2),
          status: 'pending',
          token: 'token_002'
        },
        {
          id: 'inv_003',
          email: 'expired@industrialsolutions.com',
          role: 'role_003',
          invitedBy: 'user_001',
          invitedAt: new Date(Date.now() - 86400000 * 10),
          expiresAt: new Date(Date.now() - 86400000 * 3),
          status: 'expired',
          token: 'token_003'
        }
      ];

      setPermissions(mockPermissions);
      setRoles(mockRoles);
      setUsers(mockUsers);
      setInvitations(mockInvitations);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // User action handlers
  const handleInviteUser = useCallback((email: string, roleId: string) => {
    const newInvitation: UserInvitation = {
      id: `inv_${Date.now()}`,
      email,
      role: roleId,
      invitedBy: currentUser?.id || 'user_001',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days
      status: 'pending',
      token: `token_${Date.now()}`
    };

    setInvitations(prev => [...prev, newInvitation]);
    setShowInviteModal(false);
    
    showToast({
      title: 'Invitation Sent',
      message: `Invitation sent to ${email}`,
      type: 'success'
    });
  }, [currentUser?.id, showToast]);

  const handleEditUser = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast({
        title: 'User Deleted',
        message: 'User has been deleted successfully',
        type: 'success'
      });
    }
  }, [users, showToast]);

  const handleToggleUserStatus = useCallback((userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as any }
        : user
    ));
  }, []);

  const handleRevokeInvitation = useCallback((invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: 'revoked' as any }
        : inv
    ));
    
    showToast({
      title: 'Invitation Revoked',
      message: 'Invitation has been revoked',
      type: 'success'
    });
  }, [showToast]);

  const handleResendInvitation = useCallback((invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { 
            ...inv, 
            invitedAt: new Date(),
            expiresAt: new Date(Date.now() + 86400000 * 7),
            status: 'pending' as any 
          }
        : inv
    ));
    
    showToast({
      title: 'Invitation Resent',
      message: 'Invitation has been resent',
      type: 'success'
    });
  }, [showToast]);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'users', name: 'Users', icon: UserIcon, count: users.length },
    { id: 'roles', name: 'Roles', icon: ShieldCheckIcon, count: roles.length },
    { id: 'invitations', name: 'Invitations', icon: UserPlusIcon, count: invitations.filter(inv => inv.status === 'pending').length },
    { id: 'permissions', name: 'Permissions', icon: KeyIcon, count: permissions.length }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!readOnly && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Invite User</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'users' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.role.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Level {user.role.level}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.department}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{user.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit user"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                title="Edit user"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`${
                                  user.status === 'active' 
                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                }`}
                                title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                              >
                                {user.status === 'active' ? (
                                  <XCircleIcon className="h-4 w-4" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete user"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-6">
            <div className="grid gap-6">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Level {role.level}
                        </span>
                        {role.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Default
                          </span>
                        )}
                        {role.isSystem && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {role.permissions.length} permissions
                        </span>
                      </div>
                    </div>
                    {!readOnly && !role.isSystem && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedRole(role)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 5).map((permission) => (
                        <span
                          key={permission.id}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {permission.name}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="p-6">
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const invitedByUser = users.find(u => u.id === invitation.invitedBy);
                const role = roles.find(r => r.id === invitation.role);
                
                return (
                  <div key={invitation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invitation.status)}`}>
                            {invitation.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>Role: {role?.name || 'Unknown'}</p>
                          <p>Invited by: {invitedByUser?.firstName} {invitedByUser?.lastName}</p>
                          <p>Invited: {invitation.invitedAt.toLocaleDateString()}</p>
                          <p>Expires: {invitation.expiresAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      {!readOnly && invitation.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="p-6">
            <div className="grid gap-4">
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  if (!acc[permission.category]) {
                    acc[permission.category] = [];
                  }
                  acc[permission.category].push(permission);
                  return acc;
                }, {} as Record<string, UserPermission[]>)
              ).map(([category, perms]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 capitalize">
                    {category} Permissions
                  </h3>
                  <div className="grid gap-2">
                    {perms.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {permission.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {permission.description}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {permission.action}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {permission.resource}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invite New User
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get('email') as string;
                const role = formData.get('role') as string;
                handleInviteUser(email, role);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a role</option>
                      {roles.filter(role => !role.isSystem).map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
