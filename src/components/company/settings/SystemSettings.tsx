'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  CogIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  KeyIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { SystemConfiguration } from '@/types/settings';

interface SystemSettingsProps {
  onSave?: (data: SystemConfiguration) => void;
  readOnly?: boolean;
}

/**
 * System Settings Component
 * Comprehensive system configuration interface
 */
export default function SystemSettings({ onSave, readOnly = false }: SystemSettingsProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    general: {
      systemName: 'IoT Platform',
      systemVersion: '1.0.0',
      environment: 'production',
      debugMode: false,
      maintenanceMode: false,
      maxUsers: 100,
      maxDevices: 1000,
      dataRetentionDays: 365,
      autoUpdateEnabled: true
    },
    performance: {
      maxConcurrentConnections: 1000,
      requestTimeout: 30,
      queryTimeout: 60,
      cacheSize: 512,
      cacheTTL: 3600,
      compressionEnabled: true,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        burstLimit: 200
      }
    },
    backup: {
      enabled: true,
      schedule: '0 2 * * *',
      retention: 30,
      location: 'local',
      encryption: true,
      compression: true,
      verificationEnabled: true,
      destinations: []
    },
    maintenance: {
      autoMaintenance: true,
      maintenanceWindow: {
        start: '02:00',
        end: '04:00',
        timezone: 'UTC',
        days: [0, 1, 2, 3, 4, 5, 6]
      },
      cleanupTasks: {
        logs: true,
        tempFiles: true,
        cache: true,
        oldBackups: true
      },
      updateSettings: {
        autoUpdate: false,
        updateWindow: '02:00-04:00',
        notificationDays: 7
      }
    },
    monitoring: {
      systemMetrics: true,
      deviceMetrics: true,
      performanceMetrics: true,
      errorTracking: true,
      healthChecks: {
        enabled: true,
        interval: 300,
        timeout: 30,
        endpoints: []
      },
      alerting: {
        enabled: true,
        thresholds: {
          cpu: 80,
          memory: 85,
          disk: 90,
          network: 95
        }
      }
    },
    alerts: {
      enabled: true,
      channels: [],
      rules: [],
      throttling: {
        enabled: true,
        maxPerHour: 10,
        maxPerDay: 50
      },
      escalation: {
        enabled: false,
        levels: []
      }
    },
    logging: {
      level: 'info',
      destinations: [],
      retention: {
        errorDays: 90,
        warnDays: 60,
        infoDays: 30,
        debugDays: 7
      },
      rotation: {
        enabled: true,
        maxFileSize: 100,
        maxFiles: 10
      },
      formatting: {
        timestamp: true,
        level: true,
        module: true,
        json: false
      }
    }
  });

  // Initialize system configuration
  useEffect(() => {
    const initializeConfig = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, this would load from API
      // For now, we'll use the default configuration
      setIsLoading(false);
    };

    initializeConfig();
  }, []);

  // Handle configuration changes
  const handleConfigChange = useCallback((section: keyof SystemConfiguration, field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsModified(true);
  }, []);

  // Handle nested configuration changes
  const handleNestedConfigChange = useCallback((section: keyof SystemConfiguration, parentField: string, field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value
        }
      }
    }));
    setIsModified(true);
  }, []);

  // Save configuration
  const handleSave = useCallback(async () => {
    if (!isModified) return;

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(systemConfig);
      }
      
      setIsModified(false);
      
      showToast({
        title: 'Settings Saved',
        message: 'System configuration has been updated successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Save Failed',
        message: 'Failed to save system configuration. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  }, [systemConfig, isModified, onSave, showToast]);

  // Test configuration
  const handleTest = useCallback(async (section: string) => {
    showToast({
      title: 'Testing Configuration',
      message: `Testing ${section} configuration...`,
      type: 'info'
    });

    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showToast({
      title: 'Test Successful',
      message: `${section} configuration is working correctly`,
      type: 'success'
    });
  }, [showToast]);

  // Reset configuration
  const handleReset = useCallback((section: keyof SystemConfiguration) => {
    if (confirm(`Are you sure you want to reset ${section} settings to default values?`)) {
      // Reset to default values for the section
      // This would typically load defaults from API
      showToast({
        title: 'Settings Reset',
        message: `${section} settings have been reset to default values`,
        type: 'info'
      });
      setIsModified(true);
    }
  }, [showToast]);

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Backup', icon: CloudArrowUpIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon }
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
                System Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isModified && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  Unsaved changes
                </span>
              )}
              {!readOnly && (
                <button
                  onClick={handleSave}
                  disabled={!isModified || isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  {isSaving ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'general' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  General Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={systemConfig.general.companyName}
                      onChange={(e) => handleConfigChange('general', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      System Name
                    </label>
                    <input
                      type="text"
                      value={systemConfig.general.systemName}
                      onChange={(e) => handleConfigChange('general', 'systemName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter system name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={systemConfig.general.description}
                      onChange={(e) => handleConfigChange('general', 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter system description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={systemConfig.general.timezone}
                      onChange={(e) => handleConfigChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select timezone</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      value={systemConfig.general.language}
                      onChange={(e) => handleConfigChange('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select language</option>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={systemConfig.general.sessionTimeout}
                      onChange={(e) => handleConfigChange('general', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Concurrent Sessions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={systemConfig.general.maxConcurrentSessions}
                      onChange={(e) => handleConfigChange('general', 'maxConcurrentSessions', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  UI Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableDarkMode"
                      checked={systemConfig.general.enableDarkMode}
                      onChange={(e) => handleConfigChange('general', 'enableDarkMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Dark Mode
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAnimations"
                      checked={systemConfig.general.enableAnimations}
                      onChange={(e) => handleConfigChange('general', 'enableAnimations', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAnimations" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Animations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableMaintenanceMode"
                      checked={systemConfig.general.enableMaintenanceMode}
                      onChange={(e) => handleConfigChange('general', 'enableMaintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableMaintenanceMode" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Maintenance Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Authentication & Access Control
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTwoFactor"
                      checked={systemConfig.security.enableTwoFactor}
                      onChange={(e) => handleConfigChange('security', 'enableTwoFactor', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAuditLog"
                      checked={systemConfig.security.enableAuditLog}
                      onChange={(e) => handleConfigChange('security', 'enableAuditLog', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAuditLog" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Audit Logging
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min Password Length
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="32"
                        value={systemConfig.security.minPasswordLength}
                        onChange={(e) => handleConfigChange('security', 'minPasswordLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={systemConfig.security.maxLoginAttempts}
                        onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Data Protection
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableEncryption"
                      checked={systemConfig.security.enableEncryption}
                      onChange={(e) => handleConfigChange('security', 'enableEncryption', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableEncryption" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Data Encryption
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCSRF"
                      checked={systemConfig.security.enableCSRF}
                      onChange={(e) => handleConfigChange('security', 'enableCSRF', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableCSRF" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable CSRF Protection
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Encryption Algorithm
                    </label>
                    <select
                      value={systemConfig.security.encryptionAlgorithm}
                      onChange={(e) => handleConfigChange('security', 'encryptionAlgorithm', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="AES-256">AES-256</option>
                      <option value="AES-128">AES-128</option>
                      <option value="ChaCha20">ChaCha20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <CircleStackIcon className="h-5 w-5 mr-2" />
                  Backup Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAutoBackup"
                      checked={systemConfig.backup.enableAutoBackup}
                      onChange={(e) => handleConfigChange('backup', 'enableAutoBackup', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAutoBackup" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Automatic Backups
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Backup Frequency
                      </label>
                      <select
                        value={systemConfig.backup.backupFrequency}
                        onChange={(e) => handleConfigChange('backup', 'backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Retention Period (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={systemConfig.backup.backupRetention}
                        onChange={(e) => handleConfigChange('backup', 'backupRetention', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Backup Location
                    </label>
                    <select
                      value={systemConfig.backup.backupLocation}
                      onChange={(e) => handleConfigChange('backup', 'backupLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="local">Local Storage</option>
                      <option value="s3">Amazon S3</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="azure">Azure Blob Storage</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Backup Status
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Backup</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {systemConfig.backup.lastBackup?.toLocaleDateString() || 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Backup</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {systemConfig.backup.nextBackup?.toLocaleDateString() || 'Not scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <span className="flex items-center space-x-1">
                      {getStatusIndicator('active')}
                      <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleTest('backup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Test Backup</span>
                </button>
                <button
                  onClick={() => handleReset('backup')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <CpuChipIcon className="h-5 w-5 mr-2" />
                  System Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCaching"
                      checked={systemConfig.performance.enableCaching}
                      onChange={(e) => handleConfigChange('performance', 'enableCaching', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableCaching" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Caching
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCompression"
                      checked={systemConfig.performance.enableCompression}
                      onChange={(e) => handleConfigChange('performance', 'enableCompression', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableCompression" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Compression
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cache Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="3600"
                        value={systemConfig.performance.cacheTimeout}
                        onChange={(e) => handleConfigChange('performance', 'cacheTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Concurrent Connections
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        value={systemConfig.performance.maxConcurrentConnections}
                        onChange={(e) => handleConfigChange('performance', 'maxConcurrentConnections', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <SignalIcon className="h-5 w-5 mr-2" />
                  Alert Thresholds
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CPU (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={systemConfig.performance.alertThresholds.cpu}
                      onChange={(e) => handleNestedConfigChange('performance', 'alertThresholds', 'cpu', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Memory (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={systemConfig.performance.alertThresholds.memory}
                      onChange={(e) => handleNestedConfigChange('performance', 'alertThresholds', 'memory', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Disk (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={systemConfig.performance.alertThresholds.disk}
                      onChange={(e) => handleNestedConfigChange('performance', 'alertThresholds', 'disk', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Network (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={systemConfig.performance.alertThresholds.network}
                      onChange={(e) => handleNestedConfigChange('performance', 'alertThresholds', 'network', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2" />
                  Notification Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableEmailNotifications"
                      checked={systemConfig.notifications.enableEmailNotifications}
                      onChange={(e) => handleConfigChange('notifications', 'enableEmailNotifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enablePushNotifications"
                      checked={systemConfig.notifications.enablePushNotifications}
                      onChange={(e) => handleConfigChange('notifications', 'enablePushNotifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enablePushNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Push Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableSystemAlerts"
                      checked={systemConfig.notifications.enableSystemAlerts}
                      onChange={(e) => handleConfigChange('notifications', 'enableSystemAlerts', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableSystemAlerts" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable System Alerts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableSecurityAlerts"
                      checked={systemConfig.notifications.enableSecurityAlerts}
                      onChange={(e) => handleConfigChange('notifications', 'enableSecurityAlerts', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableSecurityAlerts" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Security Alerts
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Email Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={systemConfig.notifications.emailConfig.smtp.host}
                      onChange={(e) => handleNestedConfigChange('notifications', 'emailConfig', 'smtp', { ...systemConfig.notifications.emailConfig.smtp, host: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={systemConfig.notifications.emailConfig.smtp.port}
                      onChange={(e) => handleNestedConfigChange('notifications', 'emailConfig', 'smtp', { ...systemConfig.notifications.emailConfig.smtp, port: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={systemConfig.notifications.emailConfig.from}
                      onChange={(e) => handleNestedConfigChange('notifications', 'emailConfig', 'from', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="noreply@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reply To
                    </label>
                    <input
                      type="email"
                      value={systemConfig.notifications.emailConfig.replyTo}
                      onChange={(e) => handleNestedConfigChange('notifications', 'emailConfig', 'replyTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="support@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                  Maintenance Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableHealthChecks"
                      checked={systemConfig.maintenance.enableHealthChecks}
                      onChange={(e) => handleConfigChange('maintenance', 'enableHealthChecks', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableHealthChecks" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Health Checks
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableLogRotation"
                      checked={systemConfig.maintenance.enableLogRotation}
                      onChange={(e) => handleConfigChange('maintenance', 'enableLogRotation', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableLogRotation" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Log Rotation
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAutoUpdates"
                      checked={systemConfig.maintenance.enableAutoUpdates}
                      onChange={(e) => handleConfigChange('maintenance', 'enableAutoUpdates', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAutoUpdates" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable Auto Updates
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Health Check Interval (seconds)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="3600"
                        value={systemConfig.maintenance.healthCheckInterval}
                        onChange={(e) => handleConfigChange('maintenance', 'healthCheckInterval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Log Retention (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={systemConfig.maintenance.logRetentionDays}
                        onChange={(e) => handleConfigChange('maintenance', 'logRetentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  System Monitoring
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableSystemMonitoring"
                      checked={systemConfig.maintenance.enableSystemMonitoring}
                      onChange={(e) => handleConfigChange('maintenance', 'enableSystemMonitoring', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableSystemMonitoring" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable System Monitoring
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monitoring Metrics
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['cpu', 'memory', 'disk', 'network'].map((metric) => (
                        <div key={metric} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`metric-${metric}`}
                            checked={systemConfig.maintenance.monitoringMetrics.includes(metric)}
                            onChange={(e) => {
                              const metrics = e.target.checked 
                                ? [...systemConfig.maintenance.monitoringMetrics, metric]
                                : systemConfig.maintenance.monitoringMetrics.filter(m => m !== metric);
                              handleConfigChange('maintenance', 'monitoringMetrics', metrics);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`metric-${metric}`} className="ml-2 block text-sm text-gray-900 dark:text-white capitalize">
                            {metric}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
