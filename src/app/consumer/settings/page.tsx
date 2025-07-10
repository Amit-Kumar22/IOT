'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

/**
 * Consumer Settings Page - Home Account & Preferences
 * User-friendly settings interface for home users
 */
export default function ConsumerSettings() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: user?.name || 'John Smith',
    email: user?.email || 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, ST 12345',
    timezone: 'Eastern Standard Time',
    dateFormat: 'MM/DD/YYYY',
    temperatureUnit: 'Fahrenheit'
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    temperatureUnit: 'Fahrenheit',
    dateFormat: 'MM/DD/YYYY'
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: {
      deviceAlerts: true,
      energyReports: true,
      securityAlerts: true,
      automationUpdates: false,
      newsletter: true
    },
    push: {
      deviceAlerts: true,
      securityAlerts: true,
      automationTriggers: false,
      energyGoals: true
    },
    sms: {
      securityAlerts: true,
      criticalAlerts: true
    }
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    personalization: true,
    thirdPartyApps: false
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock user data
  const userData = {
    profile: {
      name: user?.name || 'John Smith',
      email: user?.email || 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, Anytown, ST 12345',
      timezone: 'Eastern Standard Time',
      dateFormat: 'MM/DD/YYYY',
      temperatureUnit: 'Fahrenheit'
    },
    notifications: {
      email: {
        deviceAlerts: true,
        energyReports: true,
        securityAlerts: true,
        automationUpdates: false,
        newsletter: true
      },
      push: {
        deviceAlerts: true,
        securityAlerts: true,
        automationTriggers: false,
        energyGoals: true
      },
      sms: {
        securityAlerts: true,
        criticalAlerts: true
      }
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      personalization: true,
      thirdPartyApps: false
    },
    devices: {
      connectedDevices: 18,
      registeredPhones: 2,
      trustedNetworks: 1
    }
  };

  const settingsSections = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'devices', name: 'Connected Devices', icon: DevicePhoneMobileIcon },
    { id: 'billing', name: 'Billing & Usage', icon: CreditCardIcon },
    { id: 'support', name: 'Help & Support', icon: QuestionMarkCircleIcon }
  ];

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form save
  const handleSave = () => {
    // Here you would typically call an API to save the data
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // You could also update the userData here or refetch from API
  };

  // Handle form cancel
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: userData.profile.name,
      email: userData.profile.email,
      phone: userData.profile.phone,
      address: userData.profile.address,
      timezone: userData.profile.timezone,
      dateFormat: userData.profile.dateFormat,
      temperatureUnit: userData.profile.temperatureUnit
    });
    setIsEditing(false);
  };

  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
          <button 
            onClick={() => {
              if (isEditing) {
                handleCancel();
              } else {
                setIsEditing(true);
              }
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={isEditing ? formData.name : userData.profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={isEditing ? formData.email : userData.profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={isEditing ? formData.phone : userData.profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
            <select
              value={isEditing ? formData.timezone : userData.profile.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            >
              <option>Eastern Standard Time</option>
              <option>Central Standard Time</option>
              <option>Mountain Standard Time</option>
              <option>Pacific Standard Time</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Address</label>
            <input
              type="text"
              value={isEditing ? formData.address : userData.profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature Unit</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose between Fahrenheit and Celsius</p>
            </div>
            <select 
              value={preferences.temperatureUnit}
              onChange={(e) => setPreferences(prev => ({ ...prev, temperatureUnit: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option>Fahrenheit</option>
              <option>Celsius</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Format</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">How dates are displayed</p>
            </div>
            <select 
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsSection = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Email Notifications</h3>
        
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <button
                onClick={() => setNotifications(prev => ({
                  ...prev,
                  email: { ...prev.email, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Push Notifications</h3>
        
        <div className="space-y-4">
          {Object.entries(notifications.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <button
                onClick={() => setNotifications(prev => ({
                  ...prev,
                  push: { ...prev.push, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PrivacySection = () => (
    <div className="space-y-6">
      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Security Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <input
                type="password"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button 
                type="button"
                onClick={() => {
                  // Handle password update
                  console.log('Updating password...');
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Privacy Settings</h3>
        
        <div className="space-y-4">
          {Object.entries(privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'dataSharing' && 'Allow sharing anonymized data for service improvement'}
                  {key === 'analytics' && 'Help improve our service with usage analytics'}
                  {key === 'personalization' && 'Use your data to personalize your experience'}
                  {key === 'thirdPartyApps' && 'Allow third-party apps to access your data'}
                </p>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DevicesSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Connected Devices</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userData.devices.connectedDevices}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Smart Devices</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userData.devices.registeredPhones}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Mobile Devices</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userData.devices.trustedNetworks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Trusted Networks</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Smart Devices</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">18 devices</span>
          </div>
        </button>
        
        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Active Sessions</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">2 sessions</span>
          </div>
        </button>
        
        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Network Settings</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Wi-Fi, Guest network</span>
          </div>
        </button>
      </div>
    </div>
  );

  const BillingSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Current Usage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">847.2 kWh</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">$101.66</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Bill</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">15%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Savings vs Last Month</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Billing Information</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Visa ending in 4567</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Expires 12/25</div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                Edit
              </button>
            </div>
          </div>
          
          <button className="w-full text-left p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500">
            <div className="text-center">
              <CreditCardIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Payment Method</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const SupportSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Help & Support</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">Help Center</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Browse guides and tutorials</div>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">Documentation</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Technical documentation</div>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <BellIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">Contact Support</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Get help from our team</div>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <GlobeAltIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">Community Forum</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Connect with other users</div>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">System Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">App Version</span>
            <span className="text-gray-900 dark:text-white">2.1.4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="text-gray-900 dark:text-white">November 15, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Account Created</span>
            <span className="text-gray-900 dark:text-white">January 12, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection />;
      case 'notifications': return <NotificationsSection />;
      case 'privacy': return <PrivacySection />;
      case 'devices': return <DevicesSection />;
      case 'billing': return <BillingSection />;
      case 'support': return <SupportSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-indigo-100 mt-1">Manage your account and preferences</p>
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
