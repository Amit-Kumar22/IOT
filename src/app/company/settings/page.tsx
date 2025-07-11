'use client';

import React, { useState, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import { useStableInputHandler, useStableObjectHandler } from '@/hooks/useStableInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

/**
 * Company Settings Page - Industrial System Configuration
 * Advanced settings for industrial IoT platform management
 */
export default function CompanySettings() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('company');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'addUser' | 'editUser' | 'deleteUser'>('addUser');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User form state
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'Operator',
    department: '',
    password: '',
    confirmPassword: ''
  });

  // Create stable handlers
  const createUserHandler = useStableInputHandler(setUserFormData);
  const createFormHandler = useStableObjectHandler(setFormData);

  // Mock company data
  const [companyData, setCompanyData] = useState({
    profile: {
      companyName: 'TechManufacturing Corp',
      industry: 'Manufacturing',
      address: '1234 Industrial Blvd, Manufacturing City, MC 12345',
      phone: '+1 (555) 987-6543',
      email: 'admin@techmanufacturing.com',
      website: 'www.techmanufacturing.com',
      establishedYear: '1985',
      employeeCount: '500-1000',
      timezone: 'Eastern Standard Time',
      currency: 'USD',
      language: 'English'
    },
    users: [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@techmanufacturing.com',
        role: 'Administrator',
        department: 'IT Operations',
        lastLogin: '2024-12-10 14:30:00',
        status: 'active'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techmanufacturing.com',
        role: 'Supervisor',
        department: 'Production',
        lastLogin: '2024-12-10 13:45:00',
        status: 'active'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@techmanufacturing.com',
        role: 'Operator',
        department: 'Floor Operations',
        lastLogin: '2024-12-10 12:15:00',
        status: 'active'
      },
      {
        id: 4,
        name: 'Lisa Brown',
        email: 'lisa.brown@techmanufacturing.com',
        role: 'Maintenance',
        department: 'Maintenance',
        lastLogin: '2024-12-09 16:20:00',
        status: 'inactive'
      }
    ],
    notifications: {
      email: {
        deviceFailures: true,
        maintenanceAlerts: true,
        securityEvents: true,
        systemUpdates: false,
        performanceReports: true,
        complianceAlerts: true
      },
      sms: {
        criticalAlerts: true,
        emergencyShutdowns: true,
        securityBreaches: true
      },
      dashboard: {
        realTimeAlerts: true,
        soundNotifications: false,
        popupAlerts: true
      }
    },
    security: {
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expireAfterDays: 90
      },
      sessionSettings: {
        sessionTimeout: 30, // minutes
        maxConcurrentSessions: 5,
        requireMFA: true
      },
      accessControl: {
        auditLogging: true,
        failedLoginLockout: true,
        ipWhitelist: false,
        sslRequired: true
      }
    },
    system: {
      network: {
        primaryServer: '192.168.1.100',
        backupServer: '192.168.1.101',
        databaseServer: '192.168.1.102',
        apiEndpoint: 'https://api.techmanufacturing.com',
        mqttBroker: 'mqtt.techmanufacturing.com:8883'
      },
      maintenance: {
        autoBackup: true,
        backupFrequency: 'Daily at 2:00 AM',
        logRetentionDays: 90,
        autoUpdates: false,
        healthChecks: true
      },
      integration: {
        scadaSystem: 'Connected',
        erpSystem: 'SAP - Connected',
        mesSystem: 'Wonderware - Connected',
        cloudsync: 'Enabled'
      }
    }
  });

  const settingsSections = [
    { id: 'company', name: 'Company Profile', icon: BuildingOfficeIcon },
    { id: 'users', name: 'User Management', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security & Access', icon: ShieldCheckIcon },
    { id: 'system', name: 'System Configuration', icon: CpuChipIcon },
    { id: 'integration', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'support', name: 'Support & Logs', icon: QuestionMarkCircleIcon }
  ];

  // Real functionality methods
  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      showToast({ title: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      showToast({ title: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: companyData.users.length + 1,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        department: userFormData.department,
        lastLogin: new Date().toISOString(),
        status: 'active'
      };

      setCompanyData(prev => ({
        ...prev,
        users: [...prev.users, newUser]
      }));

      setUserFormData({
        name: '',
        email: '',
        role: 'Operator',
        department: '',
        password: '',
        confirmPassword: ''
      });

      setShowModal(false);
      showToast({ title: 'User created successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to create user', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userId: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompanyData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId 
            ? { ...user, ...userFormData }
            : user
        )
      }));

      setShowModal(false);
      setSelectedUser(null);
      showToast({ title: 'User updated successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update user', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompanyData(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      }));

      setShowConfirmDialog(false);
      setSelectedUser(null);
      showToast({ title: 'User deleted successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to delete user', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCompanyData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId 
            ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
            : user
        )
      }));

      const user = companyData.users.find(u => u.id === userId);
      const newStatus = user?.status === 'active' ? 'inactive' : 'active';
      showToast({ title: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to toggle user status', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordPolicyChange = async (field: string, value: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCompanyData(prev => ({
        ...prev,
        security: {
          ...prev.security,
          passwordPolicy: {
            ...prev.security.passwordPolicy,
            [field]: value
          }
        }
      }));

      showToast({ title: 'Password policy updated', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update password policy', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySettingChange = async (section: string, field: string, value: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCompanyData(prev => ({
        ...prev,
        security: {
          ...prev.security,
          [section]: {
            ...prev.security[section as keyof typeof prev.security],
            [field]: value
          }
        }
      }));

      showToast({ title: 'Security setting updated', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update security setting', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemSettingChange = async (section: string, field: string, value: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCompanyData(prev => ({
        ...prev,
        system: {
          ...prev.system,
          [section]: {
            ...prev.system[section as keyof typeof prev.system],
            [field]: value
          }
        }
      }));

      showToast({ title: 'System setting updated', type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update system setting', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const openUserModal = (type: 'addUser' | 'editUser', user?: any) => {
    setModalType(type);
    if (user) {
      setSelectedUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        password: '',
        confirmPassword: ''
      });
    } else {
      setUserFormData({
        name: '',
        email: '',
        role: 'Operator',
        department: '',
        password: '',
        confirmPassword: ''
      });
    }
    setShowModal(true);
  };

  const confirmDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleEdit = (section: string) => {
    setIsEditing((prev: any) => ({ ...prev, [section]: !prev[section] }));
    if (!isEditing[section]) {
      // Initialize form data with current values when starting to edit
      setFormData((prev: any) => ({ ...prev, [section]: { ...companyData.profile } }));
    }
  };

  // Create stable handlers for all form inputs
  const handleInputChange = useCallback((section: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  // Create individual stable handlers for company form
  const handleCompanyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('company', 'companyName', e.target.value);
  }, [handleInputChange]);

  const handleIndustryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('company', 'industry', e.target.value);
  }, [handleInputChange]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('company', 'address', e.target.value);
  }, [handleInputChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('company', 'phone', e.target.value);
  }, [handleInputChange]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('company', 'email', e.target.value);
  }, [handleInputChange]);

  // Create stable handlers for password policy
  const handleMinLengthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordPolicyChange('minLength', parseInt(e.target.value));
  }, []);

  const handleExpireDaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordPolicyChange('expireAfterDays', parseInt(e.target.value));
  }, []);

  const handleSessionTimeoutChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSecuritySettingChange('sessionSettings', 'sessionTimeout', parseInt(e.target.value));
  }, []);

  const handleBackupFrequencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSystemSettingChange('maintenance', 'backupFrequency', e.target.value);
  }, []);

  const handleLogRetentionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSystemSettingChange('maintenance', 'logRetentionDays', parseInt(e.target.value.split(' ')[0]));
  }, []);

  // Create stable handler factory for network settings
  const createNetworkHandler = useCallback((key: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSystemSettingChange('network', key, e.target.value);
    };
  }, []);

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the actual company data
      setCompanyData((prev: any) => ({
        ...prev,
        profile: { ...prev.profile, ...formData[section] }
      }));
      
      setIsEditing((prev: any) => ({ ...prev, [section]: false }));
      showToast({ title: `${section} updated successfully`, type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update settings', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (section: string) => {
    setIsEditing((prev: any) => ({ ...prev, [section]: false }));
    setFormData((prev: any) => ({ ...prev, [section]: undefined }));
  };

  const CompanySection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company Information</h3>
          <button 
            onClick={() => toggleEdit('company')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{isEditing.company ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
            <input
              type="text"
              value={isEditing.company ? (formData.company?.companyName || companyData.profile.companyName) : companyData.profile.companyName}
              onChange={handleCompanyNameChange}
              disabled={!isEditing.company}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
            <select
              value={isEditing.company ? (formData.company?.industry || companyData.profile.industry) : companyData.profile.industry}
              onChange={handleIndustryChange}
              disabled={!isEditing.company}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            >
              <option>Manufacturing</option>
              <option>Energy & Utilities</option>
              <option>Oil & Gas</option>
              <option>Pharmaceuticals</option>
              <option>Food & Beverage</option>
              <option>Automotive</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <input
              type="text"
              value={isEditing.company ? (formData.company?.address || companyData.profile.address) : companyData.profile.address}
              onChange={handleAddressChange}
              disabled={!isEditing.company}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={isEditing.company ? (formData.company?.phone || companyData.profile.phone) : companyData.profile.phone}
              onChange={handlePhoneChange}
              disabled={!isEditing.company}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={isEditing.company ? (formData.company?.email || companyData.profile.email) : companyData.profile.email}
              onChange={handleEmailChange}
              disabled={!isEditing.company}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        {isEditing.company && (
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => handleCancel('company')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSave('company')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const UsersSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Management</h3>
          <button 
            onClick={() => openUserModal('addUser')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
          >
            <UserPlusIcon className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {companyData.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.role}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        disabled={isLoading}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          user.status === 'active' 
                            ? 'text-green-800 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' 
                            : 'text-gray-800 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openUserModal('editUser', user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => confirmDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="space-y-6">
      {/* Password Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Password Policy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              value={companyData.security.passwordPolicy.minLength}
              onChange={handleMinLengthChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Expiry (days)
            </label>
            <input
              type="number"
              value={companyData.security.passwordPolicy.expireAfterDays}
              onChange={handleExpireDaysChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {[
            { key: 'requireUppercase', label: 'Require uppercase letters' },
            { key: 'requireLowercase', label: 'Require lowercase letters' },
            { key: 'requireNumbers', label: 'Require numbers' },
            { key: 'requireSpecialChars', label: 'Require special characters' }
          ].map((policy) => (
            <div key={policy.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {policy.label}
              </label>
              <button
                onClick={() => handlePasswordPolicyChange(policy.key, !companyData.security.passwordPolicy[policy.key as keyof typeof companyData.security.passwordPolicy])}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  companyData.security.passwordPolicy[policy.key as keyof typeof companyData.security.passwordPolicy] 
                    ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    companyData.security.passwordPolicy[policy.key as keyof typeof companyData.security.passwordPolicy] 
                      ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Session & Access Control</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatic logout after inactivity</p>
            </div>
            <select 
              value={companyData.security.sessionSettings.sessionTimeout}
              onChange={handleSessionTimeoutChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          
          {[
            { key: 'requireMFA', label: 'Require Multi-Factor Authentication', desc: 'Additional security for all logins' },
            { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user actions and system events' },
            { key: 'failedLoginLockout', label: 'Failed Login Lockout', desc: 'Lock accounts after failed attempts' },
            { key: 'sslRequired', label: 'Require SSL/TLS', desc: 'Force encrypted connections' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{setting.label}</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.desc}</p>
              </div>
              <button
                onClick={() => {
                  const section = setting.key === 'requireMFA' ? 'sessionSettings' : 'accessControl';
                  const currentValue = section === 'sessionSettings' 
                    ? companyData.security.sessionSettings[setting.key as keyof typeof companyData.security.sessionSettings]
                    : companyData.security.accessControl[setting.key as keyof typeof companyData.security.accessControl];
                  handleSecuritySettingChange(section, setting.key, !currentValue);
                }}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  companyData.security.sessionSettings[setting.key as keyof typeof companyData.security.sessionSettings] ||
                  companyData.security.accessControl[setting.key as keyof typeof companyData.security.accessControl]
                    ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    companyData.security.sessionSettings[setting.key as keyof typeof companyData.security.sessionSettings] ||
                    companyData.security.accessControl[setting.key as keyof typeof companyData.security.accessControl]
                      ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SystemSection = React.memo(() => {
    // Create memoized network handlers
    const networkHandlers = React.useMemo(() => {
      const handlers: { [key: string]: (e: React.ChangeEvent<HTMLInputElement>) => void } = {};
      Object.keys(companyData.system.network).forEach(key => {
        handlers[key] = (e: React.ChangeEvent<HTMLInputElement>) => {
          handleSystemSettingChange('network', key, e.target.value);
        };
      });
      return handlers;
    }, []);

    return (
    <div className="space-y-6">
      {/* Network Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Network Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(companyData.system.network).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
              <input
                type="text"
                value={value}
                onChange={networkHandlers[key]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">System Maintenance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup Frequency</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatic system backups</p>
            </div>
            <select 
              value={companyData.system.maintenance.backupFrequency}
              onChange={handleBackupFrequencyChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option>Hourly</option>
              <option>Daily at 2:00 AM</option>
              <option>Weekly</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Log Retention</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep system logs</p>
            </div>
            <select 
              value={`${companyData.system.maintenance.logRetentionDays} days`}
              onChange={handleLogRetentionChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
              <option>1 year</option>
            </select>
          </div>
          
          {[
            { key: 'autoBackup', label: 'Automatic Backups', desc: 'Enable scheduled system backups' },
            { key: 'autoUpdates', label: 'Automatic Updates', desc: 'Install security updates automatically' },
            { key: 'healthChecks', label: 'Health Monitoring', desc: 'Continuous system health monitoring' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{setting.label}</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.desc}</p>
              </div>
              <button
                onClick={() => handleSystemSettingChange('maintenance', setting.key, !companyData.system.maintenance[setting.key as keyof typeof companyData.system.maintenance])}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  companyData.system.maintenance[setting.key as keyof typeof companyData.system.maintenance]
                    ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    companyData.system.maintenance[setting.key as keyof typeof companyData.system.maintenance]
                      ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">System Integrations</h3>
        
        <div className="space-y-4">
          {Object.entries(companyData.system.integration).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className={`text-sm ${
                  value.includes('Connected') || value === 'Enabled' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {value}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                value.includes('Connected') || value === 'Enabled' 
                  ? 'bg-green-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'company': return <CompanySection />;
      case 'users': return <UsersSection />;
      case 'notifications': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>Notifications settings coming soon...</p></div>;
      case 'security': return <SecuritySection />;
      case 'system': return <SystemSection />;
      case 'integration': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>Integration settings coming soon...</p></div>;
      case 'support': return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><p>Support and logs coming soon...</p></div>;
      default: return <CompanySection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Company Settings</h1>
        <p className="text-gray-300 mt-1">Configure your industrial IoT platform</p>
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

      {/* Add/Edit User Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === 'addUser' ? 'Add New User' : 'Edit User'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={createUserHandler('name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={createUserHandler('email')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={userFormData.role}
                  onChange={createUserHandler('role')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Operator">Operator</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={userFormData.department}
                  onChange={createUserHandler('department')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter department"
                />
              </div>

              {modalType === 'addUser' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={userFormData.password}
                      onChange={createUserHandler('password')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={userFormData.confirmPassword}
                      onChange={createUserHandler('confirmPassword')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Confirm password"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => modalType === 'addUser' ? handleCreateUser() : handleEditUser(selectedUser?.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{modalType === 'addUser' ? 'Create User' : 'Update User'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={() => handleDeleteUser(selectedUser?.id)}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          type="danger"
          confirmText="Delete User"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
