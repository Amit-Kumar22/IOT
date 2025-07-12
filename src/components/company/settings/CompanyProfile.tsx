'use client';

import React, { useState, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CompanyProfile, CompanyAddress, CompanyContact, CompanySettings } from '@/types/settings';

interface CompanyProfileProps {
  onSave?: (profile: CompanyProfile) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

/**
 * Company Profile Settings Component
 * Allows editing of company information, contact details, and basic settings
 */
export default function CompanyProfileSettings({ onSave, onCancel, readOnly = false }: CompanyProfileProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  // Mock initial data
  const [profile, setProfile] = useState<CompanyProfile>({
    id: 'company_001',
    name: 'Industrial Solutions Corp',
    description: 'Leading provider of industrial IoT solutions and automation systems',
    industry: 'Manufacturing',
    website: 'https://industrialsolutions.com',
    logo: '',
    address: {
      street: '123 Industrial Blvd',
      city: 'Detroit',
      state: 'Michigan',
      zipCode: '48201',
      country: 'United States',
      timezone: 'America/Detroit'
    },
    contact: {
      primaryEmail: 'info@industrialsolutions.com',
      secondaryEmail: 'support@industrialsolutions.com',
      phone: '+1 (555) 123-4567',
      fax: '+1 (555) 123-4568',
      supportContact: 'support@industrialsolutions.com',
      technicalContact: 'tech@industrialsolutions.com'
    },
    settings: {
      language: 'en-US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      temperatureUnit: 'fahrenheit',
      measurementSystem: 'imperial',
      notifications: {
        email: {
          enabled: true,
          alerts: true,
          reports: true,
          maintenance: true,
          security: true
        },
        sms: {
          enabled: true,
          emergencyOnly: true,
          alerts: true
        },
        push: {
          enabled: true,
          alerts: true,
          maintenance: true
        },
        frequency: 'immediate'
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expirationDays: 90
        },
        mfa: {
          enabled: true,
          required: false,
          methods: ['app', 'sms']
        },
        sessionTimeout: 30,
        ipWhitelist: [],
        apiAccess: {
          enabled: true,
          rateLimit: 1000,
          allowedOrigins: ['https://industrialsolutions.com']
        }
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        logo: '',
        favicon: '',
        showPoweredBy: true
      }
    },
    metadata: {
      createdAt: new Date(Date.now() - 86400000 * 180), // 6 months ago
      updatedAt: new Date(Date.now() - 86400000 * 7), // 1 week ago
      version: '1.2.0'
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = useCallback((field: string, value: any) => {
    setProfile(prev => {
      const keys = field.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      return updated;
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedProfile = {
        ...profile,
        metadata: {
          ...profile.metadata,
          updatedAt: new Date()
        }
      };
      
      setProfile(updatedProfile);
      setHasChanges(false);
      setEditMode(false);
      
      if (onSave) {
        onSave(updatedProfile);
      }
      
      showToast({
        title: 'Profile Updated',
        message: 'Company profile has been updated successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Save Failed',
        message: 'Failed to save company profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [profile, hasChanges, onSave, showToast]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setHasChanges(false);
        setEditMode(false);
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      setEditMode(false);
      if (onCancel) {
        onCancel();
      }
    }
  }, [hasChanges, onCancel]);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file and get a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleInputChange('logo', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [handleInputChange]);

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon },
    { id: 'contact', name: 'Contact', icon: PhoneIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon },
    { id: 'branding', name: 'Branding', icon: CameraIcon }
  ];

  const industries = [
    'Manufacturing',
    'Energy & Utilities',
    'Oil & Gas',
    'Chemical',
    'Food & Beverage',
    'Pharmaceutical',
    'Automotive',
    'Aerospace',
    'Mining',
    'Water Treatment',
    'Other'
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Detroit',
    'America/Phoenix',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ko-KR', name: 'Korean' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'CHF', name: 'Swiss Franc (CHF)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Company Profile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your company information and settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!readOnly && (
                <>
                  {editMode ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2 inline" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSubmitting || !hasChanges}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                        <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </>
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <select
                    value={profile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={profile.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={profile.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={profile.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="State/Province"
                      value={profile.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="ZIP/Postal Code"
                      value={profile.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={profile.address.country}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <select
                      value={profile.address.timezone}
                      onChange={(e) => handleInputChange('address.timezone', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    value={profile.contact.primaryEmail}
                    onChange={(e) => handleInputChange('contact.primaryEmail', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Email
                  </label>
                  <input
                    type="email"
                    value={profile.contact.secondaryEmail || ''}
                    onChange={(e) => handleInputChange('contact.secondaryEmail', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={profile.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fax Number
                  </label>
                  <input
                    type="tel"
                    value={profile.contact.fax || ''}
                    onChange={(e) => handleInputChange('contact.fax', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Contact
                  </label>
                  <input
                    type="email"
                    value={profile.contact.supportContact || ''}
                    onChange={(e) => handleInputChange('contact.supportContact', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technical Contact
                  </label>
                  <input
                    type="email"
                    value={profile.contact.technicalContact || ''}
                    onChange={(e) => handleInputChange('contact.technicalContact', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={profile.settings.language}
                    onChange={(e) => handleInputChange('settings.language', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={profile.settings.currency}
                    onChange={(e) => handleInputChange('settings.currency', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select
                    value={profile.settings.dateFormat}
                    onChange={(e) => handleInputChange('settings.dateFormat', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Format
                  </label>
                  <select
                    value={profile.settings.timeFormat}
                    onChange={(e) => handleInputChange('settings.timeFormat', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature Unit
                  </label>
                  <select
                    value={profile.settings.temperatureUnit}
                    onChange={(e) => handleInputChange('settings.temperatureUnit', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Measurement System
                  </label>
                  <select
                    value={profile.settings.measurementSystem}
                    onChange={(e) => handleInputChange('settings.measurementSystem', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {profile.logo ? (
                      <img src={profile.logo} alt="Company Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {editMode && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={profile.settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('settings.branding.primaryColor', e.target.value)}
                      disabled={!editMode}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={profile.settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('settings.branding.primaryColor', e.target.value)}
                      disabled={!editMode}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={profile.settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('settings.branding.secondaryColor', e.target.value)}
                      disabled={!editMode}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={profile.settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('settings.branding.secondaryColor', e.target.value)}
                      disabled={!editMode}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={profile.settings.branding.accentColor}
                      onChange={(e) => handleInputChange('settings.branding.accentColor', e.target.value)}
                      disabled={!editMode}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={profile.settings.branding.accentColor}
                      onChange={(e) => handleInputChange('settings.branding.accentColor', e.target.value)}
                      disabled={!editMode}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="showPoweredBy"
                  checked={profile.settings.branding.showPoweredBy}
                  onChange={(e) => handleInputChange('settings.branding.showPoweredBy', e.target.checked)}
                  disabled={!editMode}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="showPoweredBy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show "Powered by" branding
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Profile Version: {profile.metadata.version}</span>
            </div>
            <div>
              Last Updated: {profile.metadata.updatedAt.toLocaleString()}
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center space-x-2 text-amber-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Unsaved Changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
