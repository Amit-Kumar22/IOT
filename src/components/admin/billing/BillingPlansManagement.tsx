import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CpuChipIcon,
  ServerIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BillingPlan, BillingPlanFilter, BillingPlanTemplate } from '../../../types/billingPlans';
import BillingPlanWizard from './BillingPlanWizard';

interface BillingPlansManagementProps {}

const BillingPlansManagement: React.FC<BillingPlansManagementProps> = () => {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [templates, setTemplates] = useState<BillingPlanTemplate[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<BillingPlan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BillingPlanFilter>({
    status: undefined,
    visibility: undefined,
    billingCycle: undefined,
    priceRange: undefined,
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchPlans();
    fetchTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plans, searchTerm, filters]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPlans: BillingPlan[] = [
        {
          id: '1',
          name: 'basic-monthly',
          displayName: 'Basic Plan',
          description: 'Perfect for small businesses getting started with IoT',
          price: 29.99,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            {
              id: 'users',
              name: 'User Accounts',
              description: 'Number of user accounts included',
              included: true,
              limit: 5,
              unit: 'users',
              category: 'core',
            },
            {
              id: 'devices',
              name: 'Device Connections',
              description: 'Maximum connected devices',
              included: true,
              limit: 25,
              unit: 'devices',
              category: 'core',
            },
            {
              id: 'storage',
              name: 'Data Storage',
              description: 'Cloud storage for device data',
              included: true,
              limit: 5,
              unit: 'GB',
              category: 'core',
            },
          ],
          limits: {
            maxUsers: 5,
            maxDevices: 25,
            maxDataStorage: 5,
            maxApiCalls: 10000,
            maxIntegrations: 2,
            supportLevel: 'basic',
            customBranding: false,
            sslCertificate: false,
            backupRetention: 7,
          },
          status: 'active',
          visibility: 'public',
          metadata: {
            popularPlan: false,
            recommendedFor: ['Small businesses', 'Startups'],
            targetUserSize: '1-5 employees',
            setupTime: '5-10 minutes',
            migrationComplexity: 'simple',
            tags: ['starter', 'affordable'],
            discountEligible: true,
            trialPeriod: 14,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          version: 1,
        },
        {
          id: '2',
          name: 'professional-monthly',
          displayName: 'Professional Plan',
          description: 'Advanced features for growing businesses',
          price: 89.99,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            {
              id: 'users',
              name: 'User Accounts',
              description: 'Number of user accounts included',
              included: true,
              limit: 25,
              unit: 'users',
              category: 'core',
            },
            {
              id: 'devices',
              name: 'Device Connections',
              description: 'Maximum connected devices',
              included: true,
              limit: 100,
              unit: 'devices',
              category: 'core',
            },
            {
              id: 'storage',
              name: 'Data Storage',
              description: 'Cloud storage for device data',
              included: true,
              limit: 25,
              unit: 'GB',
              category: 'core',
            },
            {
              id: 'branding',
              name: 'Custom Branding',
              description: 'Remove our branding, add yours',
              included: true,
              category: 'premium',
            },
          ],
          limits: {
            maxUsers: 25,
            maxDevices: 100,
            maxDataStorage: 25,
            maxApiCalls: 50000,
            maxIntegrations: 10,
            supportLevel: 'standard',
            customBranding: true,
            sslCertificate: true,
            backupRetention: 30,
          },
          status: 'active',
          visibility: 'public',
          metadata: {
            popularPlan: true,
            recommendedFor: ['Growing businesses', 'Medium teams'],
            targetUserSize: '10-25 employees',
            setupTime: '10-15 minutes',
            migrationComplexity: 'simple',
            tags: ['popular', 'best-value'],
            discountEligible: true,
            trialPeriod: 30,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          version: 2,
        },
        {
          id: '3',
          name: 'enterprise-monthly',
          displayName: 'Enterprise Plan',
          description: 'Full-featured plan for large organizations',
          price: 249.99,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            {
              id: 'users',
              name: 'User Accounts',
              description: 'Number of user accounts included',
              included: true,
              unlimited: true,
              category: 'core',
            },
            {
              id: 'devices',
              name: 'Device Connections',
              description: 'Maximum connected devices',
              included: true,
              unlimited: true,
              category: 'core',
            },
            {
              id: 'storage',
              name: 'Data Storage',
              description: 'Cloud storage for device data',
              included: true,
              limit: 500,
              unit: 'GB',
              category: 'core',
            },
            {
              id: 'branding',
              name: 'Custom Branding',
              description: 'Remove our branding, add yours',
              included: true,
              category: 'premium',
            },
            {
              id: 'sso',
              name: 'Single Sign-On',
              description: 'Enterprise SSO integration',
              included: true,
              category: 'enterprise',
            },
          ],
          limits: {
            maxUsers: 999999,
            maxDevices: 999999,
            maxDataStorage: 500,
            maxApiCalls: 1000000,
            maxIntegrations: 999999,
            supportLevel: 'enterprise',
            customBranding: true,
            sslCertificate: true,
            backupRetention: 365,
          },
          status: 'active',
          visibility: 'public',
          metadata: {
            popularPlan: false,
            recommendedFor: ['Large enterprises', 'Fortune 500'],
            targetUserSize: '100+ employees',
            setupTime: '1-2 hours',
            migrationComplexity: 'complex',
            tags: ['enterprise', 'unlimited', 'premium'],
            discountEligible: false,
            trialPeriod: 30,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          version: 1,
        },
      ];

      setPlans(mockPlans);
    } catch (err) {
      setError('Failed to load billing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const mockTemplates: BillingPlanTemplate[] = [
        {
          id: 'starter',
          name: 'Starter Template',
          category: 'starter',
          basePrice: 19.99,
          features: [],
          limits: {
            maxUsers: 3,
            maxDevices: 10,
            maxDataStorage: 2,
            maxApiCalls: 5000,
            maxIntegrations: 1,
            supportLevel: 'basic',
            customBranding: false,
            sslCertificate: false,
            backupRetention: 7,
          },
          isTemplate: true,
        },
        {
          id: 'professional',
          name: 'Professional Template',
          category: 'professional',
          basePrice: 79.99,
          features: [],
          limits: {
            maxUsers: 20,
            maxDevices: 75,
            maxDataStorage: 20,
            maxApiCalls: 40000,
            maxIntegrations: 8,
            supportLevel: 'standard',
            customBranding: true,
            sslCertificate: true,
            backupRetention: 30,
          },
          isTemplate: true,
        },
      ];

      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...plans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(plan => plan.status === filters.status);
    }

    // Visibility filter
    if (filters.visibility) {
      filtered = filtered.filter(plan => plan.visibility === filters.visibility);
    }

    // Billing cycle filter
    if (filters.billingCycle) {
      filtered = filtered.filter(plan => plan.billingCycle === filters.billingCycle);
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(plan =>
        plan.price >= filters.priceRange!.min && plan.price <= filters.priceRange!.max
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.displayName;
          bValue = b.displayName;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.displayName;
          bValue = b.displayName;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPlans(filtered);
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlan: BillingPlan = {
        id: Date.now().toString(),
        ...planData,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      setPlans(prev => [...prev, newPlan]);
      setShowWizard(false);
      setEditingPlan(undefined);
    } catch (err) {
      setError('Failed to create plan');
    }
  };

  const handleEditPlan = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setShowWizard(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setPlans(prev => prev.filter(p => p.id !== planId));
      } catch (err) {
        setError('Failed to delete plan');
      }
    }
  };

  const handleDuplicatePlan = (plan: BillingPlan) => {
    const duplicatedPlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name}-copy`,
      displayName: `${plan.displayName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    setPlans(prev => [...prev, duplicatedPlan]);
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      setPlans(prev => prev.map(plan =>
        plan.id === planId
          ? { ...plan, status: plan.status === 'active' ? 'inactive' : 'active' }
          : plan
      ));
    } catch (err) {
      setError('Failed to update plan status');
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPlans.size === filteredPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(filteredPlans.map(p => p.id)));
    }
  };

  const getStatusColor = (status: BillingPlan['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: BillingPlan['visibility']) => {
    switch (visibility) {
      case 'public':
        return 'bg-blue-100 text-blue-800';
      case 'private':
        return 'bg-yellow-100 text-yellow-800';
      case 'internal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Plans</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select
                value={filters.visibility || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value as any || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
              <select
                value={filters.billingCycle || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, billingCycle: e.target.value as any || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cycles</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      min: parseFloat(e.target.value) || 0,
                      max: prev.priceRange?.max || 999999
                    }
                  }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      min: prev.priceRange?.min || 0,
                      max: parseFloat(e.target.value) || 999999
                    }
                  }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPlans.has(plan.id)}
                    onChange={() => handleSelectPlan(plan.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{plan.displayName}</span>
                      {plan.metadata.popularPlan && (
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{plan.name}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      // Toggle dropdown menu
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{plan.billingCycle}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(plan.visibility)}`}>
                  {plan.visibility}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Users</span>
                  </div>
                  <span className="font-medium">
                    {plan.limits.maxUsers === 999999 ? 'Unlimited' : plan.limits.maxUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Devices</span>
                  </div>
                  <span className="font-medium">
                    {plan.limits.maxDevices === 999999 ? 'Unlimited' : plan.limits.maxDevices}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <ServerIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Storage</span>
                  </div>
                  <span className="font-medium">{plan.limits.maxDataStorage} GB</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDuplicatePlan(plan)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {plan.status === 'active' ? (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  )}
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || Object.values(filters).some(Boolean)
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first billing plan'}
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Plan
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedPlans.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedPlans.size} plan{selectedPlans.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => {
                // Bulk activate
                setPlans(prev => prev.map(plan =>
                  selectedPlans.has(plan.id) ? { ...plan, status: 'active' } : plan
                ));
                setSelectedPlans(new Set());
              }}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Activate
            </button>
            <button
              onClick={() => {
                // Bulk deactivate
                setPlans(prev => prev.map(plan =>
                  selectedPlans.has(plan.id) ? { ...plan, status: 'inactive' } : plan
                ));
                setSelectedPlans(new Set());
              }}
              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Deactivate
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedPlans.size} plan(s)?`)) {
                  setPlans(prev => prev.filter(plan => !selectedPlans.has(plan.id)));
                  setSelectedPlans(new Set());
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedPlans(new Set())}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Wizard Modal */}
      <BillingPlanWizard
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false);
          setEditingPlan(undefined);
        }}
        onSubmit={handleCreatePlan}
        editingPlan={editingPlan}
        templates={templates}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPlansManagement;
