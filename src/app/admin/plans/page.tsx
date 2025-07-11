'use client';

import React, { useState, useEffect } from 'react';
import { useStableForm } from '@/hooks/useStableForm';
import { useToast } from '@/components/providers/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UsersIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limitations: {
    devices: number;
    storage: number; // in GB
    apiCalls: number;
    support: string;
  };
  isPopular: boolean;
  isActive: boolean;
  subscribers: number;
  createdAt: string;
  updatedAt: string;
}

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limitations: {
    devices: number;
    storage: number;
    apiCalls: number;
    support: string;
  };
  isPopular: boolean;
  isActive: boolean;
}

/**
 * Admin Plans Management Page
 * Complete CRUD operations for subscription plans management
 */
export default function AdminPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'subscribers'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newFeature, setNewFeature] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected plan for operations
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form data
  const initialFormData: PlanFormData = {
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [],
    limitations: {
      devices: 0,
      storage: 0,
      apiCalls: 0,
      support: 'email'
    },
    isPopular: false,
    isActive: true
  };

  // Use stable form hook
  const {
    formData,
    createHandler,
    createValueHandler,
    resetForm,
    errors: formErrors,
    setFieldError,
    updateFormData
  } = useStableForm(initialFormData);

  // Mock data - In real app, this would come from API
  const mockPlans: Plan[] = [
    {
      id: '1',
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 10 devices',
        '1GB cloud storage',
        'Basic analytics',
        'Email support',
        'Mobile app access'
      ],
      limitations: {
        devices: 10,
        storage: 1,
        apiCalls: 1000,
        support: 'email'
      },
      isPopular: false,
      isActive: true,
      subscribers: 156,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T14:30:00Z'
    },
    {
      id: '2',
      name: 'Professional',
      description: 'Great for growing businesses and teams',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 50 devices',
        '10GB cloud storage',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom dashboards',
        'Team collaboration'
      ],
      limitations: {
        devices: 50,
        storage: 10,
        apiCalls: 10000,
        support: 'priority'
      },
      isPopular: true,
      isActive: true,
      subscribers: 342,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T14:30:00Z'
    },
    {
      id: '3',
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      price: 99.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited devices',
        '100GB cloud storage',
        'Enterprise analytics',
        '24/7 phone support',
        'Full API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise deployment'
      ],
      limitations: {
        devices: -1, // unlimited
        storage: 100,
        apiCalls: 100000,
        support: 'dedicated'
      },
      isPopular: false,
      isActive: true,
      subscribers: 89,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T14:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadPlans = async () => {
      setLoading(true);
      try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlans(mockPlans);
      } catch (error) {
        showToast({
          title: 'Error',
          message: 'Failed to load plans',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [showToast]);

  // Filter and sort plans
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'subscribers':
        aValue = a.subscribers;
        bValue = b.subscribers;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Form validation
  const validateForm = (data: PlanFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.name.trim()) {
      errors.name = 'Plan name is required';
    }
    
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (data.price < 0) {
      errors.price = 'Price must be positive';
    }
    
    if (data.limitations.devices < 0 && data.limitations.devices !== -1) {
      errors.devices = 'Device limit must be positive or -1 for unlimited';
    }
    
    if (data.limitations.storage <= 0) {
      errors.storage = 'Storage limit must be positive';
    }
    
    if (data.limitations.apiCalls <= 0) {
      errors.apiCalls = 'API calls limit must be positive';
    }
    
    if (data.features.length === 0) {
      errors.features = 'At least one feature is required';
    }
    
    return errors;
  };

  // Stable form handlers using our hook
  const handleLimitationChange = React.useCallback((field: string, value: any) => {
    updateFormData({
      limitations: {
        ...formData.limitations,
        [field]: value
      }
    });
  }, [formData.limitations, updateFormData]);

  const addFeature = React.useCallback(() => {
    if (newFeature.trim()) {
      updateFormData({
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  }, [newFeature, formData.features, updateFormData]);

  const removeFeature = React.useCallback((index: number) => {
    updateFormData({
      features: formData.features.filter((_, i) => i !== index)
    });
  }, [formData.features, updateFormData]);

  const handleCustomReset = React.useCallback(() => {
    resetForm();
    setNewFeature('');
  }, [resetForm]);

  // Create stable handlers for search and sort
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'price' | 'subscribers');
  }, []);

  const handleNewFeatureChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFeature(e.target.value);
  }, []);

  const handleAddPlan = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      // Set multiple errors at once - use any for validation errors
      Object.entries(errors).forEach(([field, error]) => {
        setFieldError(field as any, error);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlan: Plan = {
        id: Date.now().toString(),
        ...formData,
        subscribers: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setPlans(prev => [newPlan, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
      
      showToast({
        title: 'Success',
        message: 'Plan created successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to create plan',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      // Set multiple errors at once
      Object.entries(errors).forEach(([field, error]) => {
        setFieldError(field as any, error);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, ...formData, updatedAt: new Date().toISOString() }
          : plan
      ));
      
      setIsEditModalOpen(false);
      setSelectedPlan(null);
      resetForm();
      
      showToast({
        title: 'Success',
        message: 'Plan updated successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update plan',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id));
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
      
      showToast({
        title: 'Success',
        message: 'Plan deleted successfully',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to delete plan',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlans(prev => prev.map(p => 
        p.id === plan.id 
          ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() }
          : p
      ));
      
      showToast({
        title: 'Success',
        message: `Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully`,
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update plan status',
        type: 'error'
      });
    }
  };

  const handleTogglePopular = async (plan: Plan) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlans(prev => prev.map(p => 
        p.id === plan.id 
          ? { ...p, isPopular: !p.isPopular, updatedAt: new Date().toISOString() }
          : p
      ));
      
      showToast({
        title: 'Success',
        message: `Plan ${plan.isPopular ? 'unmarked' : 'marked'} as popular`,
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update plan popularity',
        type: 'error'
      });
    }
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    updateFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: [...plan.features],
      limitations: { ...plan.limitations },
      isPopular: plan.isPopular,
      isActive: plan.isActive
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const PlanForm = () => (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plan Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={createHandler('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter plan name"
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price *
          </label>
          <div className="flex">
            <select
              value={formData.currency}
              onChange={createHandler('currency')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={createHandler('price')}
              className={`flex-1 px-3 py-2 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="0.00"
            />
          </div>
          {formErrors.price && (
            <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Billing Interval
          </label>
          <select
            value={formData.interval}
            onChange={createHandler('interval')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={createHandler('isPopular')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular Plan</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={createHandler('isActive')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={createHandler('description')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter plan description"
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
        )}
      </div>

      {/* Limitations */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plan Limitations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Devices (-1 for unlimited)
            </label>
            <input
              type="number"
              value={formData.limitations.devices}
              onChange={(e) => handleLimitationChange('devices', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                formErrors.devices ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Number of devices"
            />
            {formErrors.devices && (
              <p className="mt-1 text-sm text-red-600">{formErrors.devices}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Storage (GB)
            </label>
            <input
              type="number"
              min="1"
              value={formData.limitations.storage}
              onChange={(e) => handleLimitationChange('storage', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                formErrors.storage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Storage in GB"
            />
            {formErrors.storage && (
              <p className="mt-1 text-sm text-red-600">{formErrors.storage}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Calls per Month
            </label>
            <input
              type="number"
              min="1"
              value={formData.limitations.apiCalls}
              onChange={(e) => handleLimitationChange('apiCalls', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                formErrors.apiCalls ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="API calls limit"
            />
            {formErrors.apiCalls && (
              <p className="mt-1 text-sm text-red-600">{formErrors.apiCalls}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Support Level
            </label>
            <select
              value={formData.limitations.support}
              onChange={(e) => handleLimitationChange('support', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="email">Email Support</option>
              <option value="priority">Priority Support</option>
              <option value="dedicated">Dedicated Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plan Features</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={handleNewFeatureChange}
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Add a feature"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          {formData.features.length > 0 && (
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {formErrors.features && (
            <p className="mt-1 text-sm text-red-600">{formErrors.features}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={selectedPlan ? handleEditPlan : handleAddPlan}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : (
            selectedPlan ? 'Update Plan' : 'Create Plan'
          )}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-3" />
              Plans Management
            </h1>
            <p className="text-green-100 mt-1">Manage subscription plans and pricing</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Plans</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{plans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Plans</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {plans.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subscribers</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {plans.reduce((sum, plan) => sum + plan.subscribers, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Popular Plans</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {plans.filter(p => p.isPopular).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="subscribers">Sort by Subscribers</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
              plan.isPopular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {plan.isPopular && (
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    /{plan.interval}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CpuChipIcon className="h-4 w-4 mr-2" />
                  {plan.limitations.devices === -1 ? 'Unlimited' : plan.limitations.devices} devices
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CloudIcon className="h-4 w-4 mr-2" />
                  {plan.limitations.storage}GB storage
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  {plan.limitations.support} support
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  {plan.subscribers} subscribers
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openViewModal(plan)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => openDeleteDialog(plan)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    plan.isActive 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleTogglePopular(plan)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    plan.isPopular 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}
                >
                  {plan.isPopular ? 'Unmark Popular' : 'Mark Popular'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Plan"
        size="xl"
      >
        <PlanForm />
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
          resetForm();
        }}
        title="Edit Plan"
        size="xl"
      >
        <PlanForm />
      </Modal>

      {/* View Plan Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPlan(null);
        }}
        title="Plan Details"
        size="lg"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPlan.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  ${selectedPlan.price}/{selectedPlan.interval}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedPlan.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {selectedPlan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscribers</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPlan.subscribers}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <p className="text-sm text-gray-900 dark:text-white">{selectedPlan.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Limitations</label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Devices:</span> {selectedPlan.limitations.devices === -1 ? 'Unlimited' : selectedPlan.limitations.devices}
                </div>
                <div>
                  <span className="font-medium">Storage:</span> {selectedPlan.limitations.storage}GB
                </div>
                <div>
                  <span className="font-medium">API Calls:</span> {selectedPlan.limitations.apiCalls.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Support:</span> {selectedPlan.limitations.support}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
              <div className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Plan Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleDeletePlan}
        title="Delete Plan"
        message={`Are you sure you want to delete the "${selectedPlan?.name}" plan? This action cannot be undone and will affect ${selectedPlan?.subscribers} subscribers.`}
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
