'use client';

import React, { useState } from 'react';
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
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import CompanyProfile from '@/components/company/settings/CompanyProfile';
import UserManagement from '@/components/company/settings/UserManagement';
import SystemSettings from '@/components/company/settings/SystemSettings';
import IntegrationSettings from '@/components/company/settings/IntegrationSettings';

/**
 * Company Settings Page - Main Settings Navigation
 * Centralized settings management for industrial IoT platform
 */
export default function CompanySettings() {
  const [activeSection, setActiveSection] = useState('company');

  const settingsSections = [
    { id: 'company', name: 'Company Profile', icon: BuildingOfficeIcon, component: CompanyProfile },
    { id: 'users', name: 'User Management', icon: UserIcon, component: UserManagement },
    { id: 'system', name: 'System Configuration', icon: CpuChipIcon, component: SystemSettings },
    { id: 'integration', name: 'Integrations', icon: GlobeAltIcon, component: IntegrationSettings },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, component: null },
    { id: 'security', name: 'Security & Access', icon: ShieldCheckIcon, component: null },
    { id: 'support', name: 'Support & Logs', icon: QuestionMarkCircleIcon, component: null }
  ];

  const renderContent = () => {
    const section = settingsSections.find(s => s.id === activeSection);
    
    if (!section) return null;

    if (section.component) {
      const Component = section.component;
      return <Component />;
    }

    // Placeholder for sections not yet implemented
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <section.icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {section.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {section.name} settings coming soon
          </p>
        </div>
      </div>
    );
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
    </div>
  );
}
