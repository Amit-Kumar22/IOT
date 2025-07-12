import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BillingPlan, BillingPlanFormData, BillingFeature, BillingLimits, BillingPlanMetadata, BillingPlanTemplate } from '../../../types/billingPlans';

interface BillingPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: BillingPlanFormData) => void;
  editingPlan?: BillingPlan;
  templates: BillingPlanTemplate[];
  loading?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const BillingPlanWizard: React.FC<BillingPlanWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPlan,
  templates,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BillingPlanFormData>({
    name: '',
    displayName: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [],
    limits: {
      maxUsers: 1,
      maxDevices: 5,
      maxDataStorage: 1,
      maxApiCalls: 1000,
      maxIntegrations: 1,
      supportLevel: 'basic',
      customBranding: false,
      sslCertificate: false,
      backupRetention: 7,
    },
    visibility: 'public',
    metadata: {
      popularPlan: false,
      recommendedFor: [],
      targetUserSize: '',
      setupTime: '',
      migrationComplexity: 'simple',
      tags: [],
      discountEligible: true,
      trialPeriod: 0,
    },
  });

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Plan name, pricing, and basic details',
      isCompleted: false,
      isActive: currentStep === 0,
    },
    {
      id: 'features',
      title: 'Features & Limits',
      description: 'Define what\'s included in this plan',
      isCompleted: false,
      isActive: currentStep === 1,
    },
    {
      id: 'metadata',
      title: 'Marketing & Metadata',
      description: 'Plan positioning and marketing details',
      isCompleted: false,
      isActive: currentStep === 2,
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review all details before creating',
      isCompleted: false,
      isActive: currentStep === 3,
    },
  ];

  const defaultFeatures: BillingFeature[] = [
    {
      id: 'users',
      name: 'User Accounts',
      description: 'Number of user accounts included',
      included: true,
      limit: formData.limits.maxUsers,
      unit: 'users',
      category: 'core',
    },
    {
      id: 'devices',
      name: 'Device Connections',
      description: 'Maximum connected devices',
      included: true,
      limit: formData.limits.maxDevices,
      unit: 'devices',
      category: 'core',
    },
    {
      id: 'storage',
      name: 'Data Storage',
      description: 'Cloud storage for device data',
      included: true,
      limit: formData.limits.maxDataStorage,
      unit: 'GB',
      category: 'core',
    },
    {
      id: 'api',
      name: 'API Calls',
      description: 'Monthly API call limit',
      included: true,
      limit: formData.limits.maxApiCalls,
      unit: 'calls/month',
      category: 'core',
    },
    {
      id: 'integrations',
      name: 'Third-party Integrations',
      description: 'External service integrations',
      included: true,
      limit: formData.limits.maxIntegrations,
      unit: 'integrations',
      category: 'core',
    },
    {
      id: 'support',
      name: 'Customer Support',
      description: 'Level of customer support included',
      included: true,
      category: 'core',
    },
    {
      id: 'branding',
      name: 'Custom Branding',
      description: 'Remove our branding, add yours',
      included: formData.limits.customBranding,
      category: 'premium',
    },
    {
      id: 'ssl',
      name: 'SSL Certificate',
      description: 'Enhanced security with SSL',
      included: formData.limits.sslCertificate,
      category: 'premium',
    },
    {
      id: 'backup',
      name: 'Data Backup',
      description: 'Automated data backup retention',
      included: true,
      limit: formData.limits.backupRetention,
      unit: 'days',
      category: 'core',
    },
  ];

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        displayName: editingPlan.displayName,
        description: editingPlan.description,
        price: editingPlan.price,
        currency: editingPlan.currency,
        billingCycle: editingPlan.billingCycle,
        features: editingPlan.features,
        limits: editingPlan.limits,
        visibility: editingPlan.visibility,
        metadata: editingPlan.metadata,
      });
    }
  }, [editingPlan]);

  const applyTemplate = (template: BillingPlanTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      displayName: template.name,
      price: template.basePrice,
      features: template.features as BillingFeature[],
      limits: { ...prev.limits, ...template.limits },
    }));
  };

  const updateFormData = (field: keyof BillingPlanFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLimits = (field: keyof BillingLimits, value: any) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [field]: value,
      },
    }));
  };

  const updateMetadata = (field: keyof BillingPlanMetadata, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const addFeature = () => {
    const newFeature: BillingFeature = {
      id: `custom-${Date.now()}`,
      name: '',
      description: '',
      included: true,
      category: 'core',
    };
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
  };

  const updateFeature = (index: number, field: keyof BillingFeature, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Sync limits with features
    const updatedFeatures = defaultFeatures.map(feature => {
      const existingFeature = formData.features.find(f => f.id === feature.id);
      return existingFeature || feature;
    });

    const finalFormData = {
      ...formData,
      features: updatedFeatures,
    };

    onSubmit(finalFormData);
  };

  const renderBasicStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Name (Internal)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., basic-monthly"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => updateFormData('displayName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Basic Plan"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what this plan includes..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateFormData('price', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => updateFormData('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Cycle
          </label>
          <select
            value={formData.billingCycle}
            onChange={(e) => updateFormData('billingCycle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visibility
        </label>
        <select
          value={formData.visibility}
          onChange={(e) => updateFormData('visibility', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">Public (Visible to all users)</option>
          <option value="private">Private (Admin only)</option>
          <option value="internal">Internal (Staff only)</option>
        </select>
      </div>

      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start from Template
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${template.basePrice}</p>
                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Users
              </label>
              <input
                type="number"
                value={formData.limits.maxUsers}
                onChange={(e) => updateLimits('maxUsers', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Devices
              </label>
              <input
                type="number"
                value={formData.limits.maxDevices}
                onChange={(e) => updateLimits('maxDevices', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Storage (GB)
              </label>
              <input
                type="number"
                value={formData.limits.maxDataStorage}
                onChange={(e) => updateLimits('maxDataStorage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Calls (Monthly)
              </label>
              <input
                type="number"
                value={formData.limits.maxApiCalls}
                onChange={(e) => updateLimits('maxApiCalls', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                step="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Integrations
              </label>
              <input
                type="number"
                value={formData.limits.maxIntegrations}
                onChange={(e) => updateLimits('maxIntegrations', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Retention (Days)
              </label>
              <input
                type="number"
                value={formData.limits.backupRetention}
                onChange={(e) => updateLimits('backupRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Features & Services</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Level
              </label>
              <select
                value={formData.limits.supportLevel}
                onChange={(e) => updateLimits('supportLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic (Email only)</option>
                <option value="standard">Standard (Email + Chat)</option>
                <option value="premium">Premium (Email + Chat + Phone)</option>
                <option value="enterprise">Enterprise (24/7 Dedicated)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="customBranding"
                checked={formData.limits.customBranding}
                onChange={(e) => updateLimits('customBranding', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="customBranding" className="text-sm font-medium text-gray-700">
                Custom Branding
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sslCertificate"
                checked={formData.limits.sslCertificate}
                onChange={(e) => updateLimits('sslCertificate', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sslCertificate" className="text-sm font-medium text-gray-700">
                SSL Certificate
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetadataStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target User Size
          </label>
          <input
            type="text"
            value={formData.metadata.targetUserSize}
            onChange={(e) => updateMetadata('targetUserSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Small businesses (1-10 employees)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setup Time
          </label>
          <input
            type="text"
            value={formData.metadata.setupTime}
            onChange={(e) => updateMetadata('setupTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 5-10 minutes"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Migration Complexity
          </label>
          <select
            value={formData.metadata.migrationComplexity}
            onChange={(e) => updateMetadata('migrationComplexity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple (Automatic)</option>
            <option value="moderate">Moderate (Some manual steps)</option>
            <option value="complex">Complex (Requires assistance)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trial Period (Days)
          </label>
          <input
            type="number"
            value={formData.metadata.trialPeriod}
            onChange={(e) => updateMetadata('trialPeriod', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recommended For
        </label>
        <textarea
          value={formData.metadata.recommendedFor.join(', ')}
          onChange={(e) => updateMetadata('recommendedFor', e.target.value.split(', ').filter(Boolean))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Small businesses, Startups, Individual users"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          value={formData.metadata.tags.join(', ')}
          onChange={(e) => updateMetadata('tags', e.target.value.split(', ').filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., popular, best-value, enterprise"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="popularPlan"
            checked={formData.metadata.popularPlan}
            onChange={(e) => updateMetadata('popularPlan', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="popularPlan" className="text-sm font-medium text-gray-700">
            Mark as Popular Plan
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="discountEligible"
            checked={formData.metadata.discountEligible}
            onChange={(e) => updateMetadata('discountEligible', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="discountEligible" className="text-sm font-medium text-gray-700">
            Discount Eligible
          </label>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Basic Information</h4>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name:</dt>
                <dd className="text-gray-900">{formData.displayName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Price:</dt>
                <dd className="text-gray-900">${formData.price}/{formData.billingCycle}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Visibility:</dt>
                <dd className="text-gray-900 capitalize">{formData.visibility}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Key Limits</h4>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Users:</dt>
                <dd className="text-gray-900">{formData.limits.maxUsers}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Devices:</dt>
                <dd className="text-gray-900">{formData.limits.maxDevices}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Storage:</dt>
                <dd className="text-gray-900">{formData.limits.maxDataStorage} GB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Support:</dt>
                <dd className="text-gray-900 capitalize">{formData.limits.supportLevel}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Ready to Create</h4>
            <p className="text-sm text-blue-700 mt-1">
              Review all the details above. Once created, you can still modify most settings later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingPlan ? 'Edit Billing Plan' : 'Create New Billing Plan'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Steps Sidebar */}
          <div className="w-64 bg-gray-50 py-6 px-4">
            <nav className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    step.isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto py-6 px-6">
              {currentStep === 0 && renderBasicStep()}
              {currentStep === 1 && renderFeaturesStep()}
              {currentStep === 2 && renderMetadataStep()}
              {currentStep === 3 && renderReviewStep()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  {currentStep === steps.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPlanWizard;
