'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CpuChipIcon,
  KeyIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  ClockIcon,
  ServerIcon,
  WifiIcon,
  CircleStackIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

/**
 * Admin Profile Page - System Administrator Profile & Settings
 * Administrative interface for system configuration and personal settings
 */
export default function AdminProfile() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<any>({});

  // Mock admin data
  const adminData = {
    profile: {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@iotplatform.com',
      role: 'System Administrator',
      phone: '+1 (555) 000-0000',
      department: 'IT Operations',
      employeeId: 'ADM-001',
      permissions: ['full_access', 'user_management', 'system_config'],
      lastLogin: '2024-12-10 14:30:00',
      accountCreated: '2024-01-01 09:00:00'
    },
    system: {
      serverStatus: 'operational',
      databaseStatus: 'healthy',
      apiStatus: 'online',
      lastBackup: '2024-12-10 02:00:00',
      systemUptime: '99.9%',
      totalUsers: 1234,
      activeConnections: 567,
      storageUsed: '45.2 GB',
      memoryUsage: '68%',
      cpuUsage: '23%'
    },
    security: {
      twoFactorEnabled: true,
      sessionTimeout: 60,
      passwordLastChanged: '2024-11-15 10:00:00',
      securityLevel: 'high',
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      auditLogEnabled: true,
      encryptionEnabled: true
    },
    notifications: {
      systemAlerts: true,
      userActivities: true,
      securityEvents: true,
      backupReports: true,
      performanceWarnings: true,
      maintenanceSchedule: true
    }
  };

  const settingsSections = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'system', name: 'System Overview', icon: ServerIcon },
    { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'System Settings', icon: CogIcon }
  ];

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleEdit = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: !prev[section] }));
    if (!isEditing[section]) {
      // Initialize form data when starting to edit
      setFormData((prev: any) => ({ ...prev, [section]: { ...adminData.profile } }));
    }
  };

  const handleSave = (section: string) => {
    console.log(`Saving ${section} data:`, formData[section]);
    setIsEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleCancel = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    setFormData((prev: any) => ({ ...prev, [section]: undefined }));
  };

  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Administrator Profile</h3>
          <button 
            onClick={() => toggleEdit('profile')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{isEditing.profile ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={isEditing.profile ? (formData.profile?.name || adminData.profile.name) : adminData.profile.name}
              onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
              disabled={!isEditing.profile}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={isEditing.profile ? (formData.profile?.email || adminData.profile.email) : adminData.profile.email}
              onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
              disabled={!isEditing.profile}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={isEditing.profile ? (formData.profile?.phone || adminData.profile.phone) : adminData.profile.phone}
              onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              disabled={!isEditing.profile}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <input
              type="text"
              value={isEditing.profile ? (formData.profile?.department || adminData.profile.department) : adminData.profile.department}
              onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
              disabled={!isEditing.profile}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID</label>
            <input
              type="text"
              value={adminData.profile.employeeId}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <input
              type="text"
              value={adminData.profile.role}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        {isEditing.profile && (
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => handleCancel('profile')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSave('profile')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Login</label>
            <input
              type="text"
              value={new Date(adminData.profile.lastLogin).toLocaleString()}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Created</label>
            <input
              type="text"
              value={new Date(adminData.profile.accountCreated).toLocaleString()}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const SystemSection = () => (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {adminData.system.systemUptime}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {adminData.system.totalUsers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {adminData.system.activeConnections}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Connections</div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Service Status</h3>
        
        <div className="space-y-4">
          {[
            { name: 'Server Status', status: adminData.system.serverStatus },
            { name: 'Database Status', status: adminData.system.databaseStatus },
            { name: 'API Status', status: adminData.system.apiStatus }
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white">
                {service.name}
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                service.status === 'operational' || service.status === 'healthy' || service.status === 'online'
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  service.status === 'operational' || service.status === 'healthy' || service.status === 'online'
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <span className="capitalize">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="space-y-6">
      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Security Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Additional security for your account</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                adminData.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  adminData.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatic logout after inactivity</p>
            </div>
            <select 
              value={adminData.security.sessionTimeout}
              onChange={(e) => {
                console.log('Session timeout changed:', e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Last Changed</label>
            <input
              type="text"
              value={new Date(adminData.security.passwordLastChanged).toLocaleString()}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection />;
      case 'system': return <SystemSection />;
      case 'security': return <SecuritySection />;
      case 'users': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>User management coming soon...</p></div>;
      case 'notifications': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>Notification settings coming soon...</p></div>;
      case 'analytics': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>Analytics dashboard coming soon...</p></div>;
      case 'settings': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>System settings coming soon...</p></div>;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Administrator Profile</h1>
        <p className="text-red-100 mt-1">System administration and profile management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <nav className="space-y-1 p-4">
              {settingsSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
