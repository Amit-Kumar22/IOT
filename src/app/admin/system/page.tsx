'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Cog6ToothIcon,
  ServerIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  BellIcon,
  CloudIcon,
  KeyIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  StopIcon,
  InformationCircleIcon,
  CpuChipIcon,
  CircleStackIcon,
  WifiIcon,
  LockClosedIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface SystemConfiguration {
  general: {
    systemName: string;
    description: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      passwordExpiry: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
    encryptionEnabled: boolean;
    auditLogging: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    useSSL: boolean;
    useTLS: boolean;
    fromAddress: string;
    fromName: string;
  };
  notifications: {
    systemAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    webhookUrl: string;
    slackWebhook: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    connectionPool: number;
    queryTimeout: number;
    backupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
  };
  api: {
    rateLimit: number;
    corsEnabled: boolean;
    corsOrigins: string[];
    apiKeyRequired: boolean;
    logRequests: boolean;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  storage: {
    provider: 'local' | 'aws' | 'azure' | 'gcp';
    maxFileSize: number;
    allowedTypes: string[];
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    cdnUrl: string;
  };
}

interface SystemService {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  port?: number;
  uptime: string;
  lastRestart: string;
  autoStart: boolean;
  critical: boolean;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  retentionDays: number;
  location: string;
}

/**
 * Admin System Configuration Page
 * Comprehensive system administration interface for platform configuration and management
 */
export default function AdminSystemPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'notifications' | 'database' | 'api' | 'storage' | 'services' | 'backup' | 'logs'>('general');
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'service' | 'backup' | 'import' | 'export'>('service');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string; data: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock system configuration
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    general: {
      systemName: 'IoT Platform',
      description: 'Enterprise IoT Device Management Platform',
      timezone: 'UTC',
      language: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      maintenanceMode: false,
      debugMode: false
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiry: 90
      },
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      twoFactorRequired: false,
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      encryptionEnabled: true,
      auditLogging: true
    },
    email: {
      smtpHost: 'smtp.company.com',
      smtpPort: 587,
      smtpUsername: 'noreply@iotplatform.com',
      smtpPassword: '••••••••',
      useSSL: false,
      useTLS: true,
      fromAddress: 'noreply@iotplatform.com',
      fromName: 'IoT Platform'
    },
    notifications: {
      systemAlerts: true,
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      webhookUrl: 'https://api.company.com/webhooks/iot',
      slackWebhook: 'https://hooks.slack.com/services/...'
    },
    database: {
      host: 'db.iotplatform.internal',
      port: 5432,
      name: 'iot_platform',
      username: 'iot_admin',
      connectionPool: 20,
      queryTimeout: 30,
      backupEnabled: true,
      backupFrequency: 'daily',
      retentionDays: 30
    },
    api: {
      rateLimit: 1000,
      corsEnabled: true,
      corsOrigins: ['https://iotplatform.com', 'https://app.iotplatform.com'],
      apiKeyRequired: true,
      logRequests: true,
      cacheEnabled: true,
      cacheTTL: 300
    },
    storage: {
      provider: 'aws',
      maxFileSize: 50,
      allowedTypes: ['jpg', 'png', 'pdf', 'csv', 'json'],
      compressionEnabled: true,
      cdnEnabled: true,
      cdnUrl: 'https://cdn.iotplatform.com'
    }
  });

  const [systemServices, setSystemServices] = useState<SystemService[]>([
    {
      id: '1',
      name: 'Web Server',
      description: 'Main application web server',
      status: 'running',
      port: 80,
      uptime: '15 days 6 hours',
      lastRestart: '2024-11-25 14:30:00',
      autoStart: true,
      critical: true
    },
    {
      id: '2',
      name: 'API Service',
      description: 'REST API backend service',
      status: 'running',
      port: 8080,
      uptime: '15 days 6 hours',
      lastRestart: '2024-11-25 14:30:00',
      autoStart: true,
      critical: true
    },
    {
      id: '3',
      name: 'Database Service',
      description: 'PostgreSQL database server',
      status: 'running',
      port: 5432,
      uptime: '30 days 12 hours',
      lastRestart: '2024-11-10 09:00:00',
      autoStart: true,
      critical: true
    },
    {
      id: '4',
      name: 'Message Queue',
      description: 'Redis message queue service',
      status: 'running',
      port: 6379,
      uptime: '15 days 6 hours',
      lastRestart: '2024-11-25 14:30:00',
      autoStart: true,
      critical: false
    },
    {
      id: '5',
      name: 'Background Jobs',
      description: 'Background task processor',
      status: 'stopped',
      uptime: '0 minutes',
      lastRestart: '2024-12-10 08:00:00',
      autoStart: false,
      critical: false
    }
  ]);

  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([
    {
      id: '1',
      name: 'Daily Database Backup',
      type: 'full',
      frequency: 'daily',
      time: '02:00',
      enabled: true,
      lastRun: '2024-12-10 02:00:00',
      nextRun: '2024-12-11 02:00:00',
      retentionDays: 30,
      location: '/backups/database'
    },
    {
      id: '2',
      name: 'Weekly System Backup',
      type: 'full',
      frequency: 'weekly',
      time: '01:00',
      enabled: true,
      lastRun: '2024-12-08 01:00:00',
      nextRun: '2024-12-15 01:00:00',
      retentionDays: 90,
      location: '/backups/system'
    },
    {
      id: '3',
      name: 'Monthly Archive',
      type: 'full',
      frequency: 'monthly',
      time: '00:00',
      enabled: false,
      lastRun: '2024-11-01 00:00:00',
      nextRun: '2025-01-01 00:00:00',
      retentionDays: 365,
      location: '/backups/archive'
    }
  ]);

  const handleConfigUpdate = async (section: string, data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemConfig(prev => ({
        ...prev,
        [section]: { ...prev[section as keyof SystemConfiguration], ...data }
      }));
      
      setIsEditing(prev => ({ ...prev, [section]: false }));
      showToast({ title: `${section} configuration updated successfully`, type: 'success' });
    } catch (error) {
      showToast({ title: 'Failed to update configuration', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSystemServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              status: action === 'start' ? 'running' : action === 'stop' ? 'stopped' : 'running',
              lastRestart: action === 'restart' ? new Date().toISOString() : service.lastRestart,
              uptime: action === 'start' || action === 'restart' ? '0 minutes' : service.uptime
            }
          : service
      ));
      
      showToast({ title: `Service ${action}ed successfully`, type: 'success' });
    } catch (error) {
      showToast({ title: `Failed to ${action} service`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupAction = async (backupId: string, action: 'run' | 'enable' | 'disable' | 'delete') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (action === 'delete') {
        setBackupSchedules(prev => prev.filter(backup => backup.id !== backupId));
        showToast({ title: 'Backup schedule deleted', type: 'success' });
      } else if (action === 'run') {
        setBackupSchedules(prev => prev.map(backup => 
          backup.id === backupId 
            ? { ...backup, lastRun: new Date().toISOString() }
            : backup
        ));
        showToast({ title: 'Backup started successfully', type: 'success' });
      } else {
        setBackupSchedules(prev => prev.map(backup => 
          backup.id === backupId 
            ? { ...backup, enabled: action === 'enable' }
            : backup
        ));
        showToast({ title: `Backup schedule ${action}d`, type: 'success' });
      }
    } catch (error) {
      showToast({ title: `Failed to ${action} backup`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemMaintenance = async (action: 'enable' | 'disable') => {
    setConfirmAction({ action: 'maintenance', data: { enable: action === 'enable' } });
    setShowConfirmDialog(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (confirmAction.action === 'maintenance') {
        setSystemConfig(prev => ({
          ...prev,
          general: { ...prev.general, maintenanceMode: confirmAction.data.enable }
        }));
        showToast({ 
          title: `Maintenance mode ${confirmAction.data.enable ? 'enabled' : 'disabled'}`, 
          type: 'success' 
        });
      }
      
      setShowConfirmDialog(false);
      setConfirmAction(null);
    } catch (error) {
      showToast({ title: 'Action failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'stopped': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'starting': case 'stopping': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return CheckCircleIcon;
      case 'stopped': return XMarkIcon;
      case 'error': return ExclamationTriangleIcon;
      case 'starting': case 'stopping': return ArrowPathIcon;
      default: return InformationCircleIcon;
    }
  };

  const tabConfig = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'database', name: 'Database', icon: CircleStackIcon },
    { id: 'api', name: 'API', icon: GlobeAltIcon },
    { id: 'storage', name: 'Storage', icon: CloudIcon },
    { id: 'services', name: 'Services', icon: ServerIcon },
    { id: 'backup', name: 'Backup', icon: DocumentArrowDownIcon },
    { id: 'logs', name: 'Logs', icon: DocumentTextIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg shadow-lg text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">System Configuration</h1>
            <p className="text-gray-100 mt-1">Platform administration and system management</p>
          </div>
          <div className="flex items-center space-x-3">
            {systemConfig.general.maintenanceMode && (
              <div className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">
                Maintenance Mode
              </div>
            )}
            <button
              onClick={() => systemConfig.general.maintenanceMode ? 
                handleSystemMaintenance('disable') : 
                handleSystemMaintenance('enable')
              }
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                systemConfig.general.maintenanceMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <WrenchScrewdriverIcon className="h-4 w-4" />
              <span>{systemConfig.general.maintenanceMode ? 'Disable' : 'Enable'} Maintenance</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <p className="text-2xl font-bold text-green-600">Operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">23.4%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <CircleStackIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">67.8%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <WifiIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Network Load</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">45.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
                <button
                  onClick={() => setIsEditing(prev => ({ ...prev, general: !prev.general }))}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isEditing.general ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={systemConfig.general.systemName}
                    disabled={!isEditing.general}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, systemName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={systemConfig.general.timezone}
                    disabled={!isEditing.general}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={systemConfig.general.language}
                    disabled={!isEditing.general}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, language: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={systemConfig.general.currency}
                    disabled={!isEditing.general}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={systemConfig.general.description}
                  disabled={!isEditing.general}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    general: { ...prev.general, description: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Debug Mode</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable detailed logging and debugging</p>
                  </div>
                  <button
                    onClick={() => setSystemConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, debugMode: !prev.general.debugMode }
                    }))}
                    disabled={!isEditing.general}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      systemConfig.general.debugMode ? 'bg-gray-600' : 'bg-gray-200 dark:bg-gray-600'
                    } ${!isEditing.general ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemConfig.general.debugMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isEditing.general && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(prev => ({ ...prev, general: false }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfigUpdate('general', systemConfig.general)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Services</h3>
                <button
                  onClick={() => {
                    setModalType('service');
                    setSelectedItem(null);
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Port
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uptime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Auto Start
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {systemServices.map((service) => {
                      const StatusIcon = getServiceStatusIcon(service.status);
                      return (
                        <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {service.critical && (
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceStatusColor(service.status)}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {service.port || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {service.uptime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.autoStart ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {service.status === 'running' ? (
                                <button
                                  onClick={() => handleServiceAction(service.id, 'stop')}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400"
                                >
                                  <StopIcon className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleServiceAction(service.id, 'start')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400"
                                >
                                  <PlayIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleServiceAction(service.id, 'restart')}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup Management</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setModalType('backup');
                      setSelectedItem(null);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Schedule</span>
                  </button>
                  <button
                    onClick={() => showToast({ title: 'Manual backup started', type: 'info' })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Run Backup</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Next Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {backupSchedules.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {backup.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {backup.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="capitalize">{backup.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="capitalize">{backup.frequency}</span> at {backup.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(backup.lastRun).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(backup.nextRun).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            backup.enabled 
                              ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                              : 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
                          }`}>
                            {backup.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleBackupAction(backup.id, 'run')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              <PlayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBackupAction(backup.id, backup.enabled ? 'disable' : 'enable')}
                              className={backup.enabled ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400' : 'text-green-600 hover:text-green-900 dark:text-green-400'}
                            >
                              {backup.enabled ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleBackupAction(backup.id, 'delete')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
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
          )}

          {/* Other configuration tabs would be implemented similarly */}
          {activeTab !== 'general' && activeTab !== 'services' && activeTab !== 'backup' && (
            <div className="text-center py-12">
              <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {tabConfig.find(tab => tab.id === activeTab)?.name} Configuration
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Configuration interface for {activeTab} settings would be implemented here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'service' ? 'Service Configuration' :
            modalType === 'backup' ? 'Backup Schedule' :
            modalType === 'import' ? 'Import Configuration' :
            'Export Configuration'
          }
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {modalType === 'service' ? 'Service configuration form would be implemented here.' :
               modalType === 'backup' ? 'Backup schedule configuration form would be implemented here.' :
               'Configuration import/export interface would be implemented here.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast({ title: `${modalType} action completed`, type: 'success' });
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={executeConfirmAction}
          title="System Maintenance"
          message={
            confirmAction?.data?.enable 
              ? "Are you sure you want to enable maintenance mode? This will prevent users from accessing the system."
              : "Are you sure you want to disable maintenance mode? This will restore normal system access."
          }
          type="warning"
          confirmText={confirmAction?.data?.enable ? 'Enable Maintenance' : 'Disable Maintenance'}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
