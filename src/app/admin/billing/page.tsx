'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface BillingAccount {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: 'credit_card' | 'bank_transfer' | 'invoice';
    last4?: string;
    brand?: string;
    expiryDate?: string;
    bankName?: string;
    accountNumber?: string;
  };
  subscription: {
    planId: string;
    planName: string;
    status: 'active' | 'past_due' | 'cancelled' | 'suspended';
    billingCycle: 'monthly' | 'yearly';
    amount: number;
    currency: string;
    nextBillingDate: string;
    autoRenew: boolean;
  };
  totalSpent: number;
  accountBalance: number;
  invoiceCount: number;
  createdAt: string;
  lastPaymentDate: string;
  status: 'active' | 'suspended' | 'delinquent' | 'closed';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  accountId: string;
  companyName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  taxAmount: number;
  totalAmount: number;
  paidAt?: string;
  notes?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  accountId: string;
  companyName: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  processedAt: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Admin Billing Management Page
 * Comprehensive billing system with subscription tracking, payment management, and invoice generation
 */
export default function AdminBillingPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'accounts' | 'invoices' | 'payments' | 'analytics'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'invoice' | 'payment'>('create');
  const [selectedItem, setSelectedItem] = useState<BillingAccount | Invoice | Payment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const [billingAccounts, setBillingAccounts] = useState<BillingAccount[]>([
    {
      id: '1',
      companyName: 'TechCorp Industries',
      contactEmail: 'billing@techcorp.com',
      contactPhone: '+1 (555) 123-4567',
      billingAddress: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      paymentMethod: {
        type: 'credit_card',
        last4: '4242',
        brand: 'Visa',
        expiryDate: '12/25'
      },
      subscription: {
        planId: 'enterprise',
        planName: 'Enterprise Plan',
        status: 'active',
        billingCycle: 'monthly',
        amount: 299.99,
        currency: 'USD',
        nextBillingDate: '2024-12-15',
        autoRenew: true
      },
      totalSpent: 3599.88,
      accountBalance: 0,
      invoiceCount: 12,
      createdAt: '2024-01-15',
      lastPaymentDate: '2024-11-15',
      status: 'active'
    },
    {
      id: '2',
      companyName: 'SmartHome Solutions',
      contactEmail: 'accounts@smarthome.com',
      contactPhone: '+1 (555) 987-6543',
      billingAddress: {
        street: '456 Innovation Dr',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      paymentMethod: {
        type: 'bank_transfer',
        bankName: 'Chase Bank',
        accountNumber: '****1234'
      },
      subscription: {
        planId: 'professional',
        planName: 'Professional Plan',
        status: 'active',
        billingCycle: 'yearly',
        amount: 999.99,
        currency: 'USD',
        nextBillingDate: '2024-12-30',
        autoRenew: true
      },
      totalSpent: 1999.98,
      accountBalance: 0,
      invoiceCount: 2,
      createdAt: '2024-01-01',
      lastPaymentDate: '2024-01-01',
      status: 'active'
    },
    {
      id: '3',
      companyName: 'Manufacturing Co',
      contactEmail: 'finance@manufacturing.com',
      contactPhone: '+1 (555) 456-7890',
      billingAddress: {
        street: '789 Industrial Blvd',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48201',
        country: 'USA'
      },
      paymentMethod: {
        type: 'invoice'
      },
      subscription: {
        planId: 'basic',
        planName: 'Basic Plan',
        status: 'past_due',
        billingCycle: 'monthly',
        amount: 99.99,
        currency: 'USD',
        nextBillingDate: '2024-11-30',
        autoRenew: false
      },
      totalSpent: 699.93,
      accountBalance: 199.98,
      invoiceCount: 8,
      createdAt: '2024-03-01',
      lastPaymentDate: '2024-10-01',
      status: 'delinquent'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      accountId: '1',
      companyName: 'TechCorp Industries',
      issueDate: '2024-11-01',
      dueDate: '2024-11-15',
      amount: 299.99,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'Credit Card',
      items: [
        {
          description: 'Enterprise Plan - November 2024',
          quantity: 1,
          unitPrice: 299.99,
          total: 299.99
        }
      ],
      taxAmount: 24.00,
      totalAmount: 323.99,
      paidAt: '2024-11-03',
      notes: 'Payment processed successfully'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      accountId: '2',
      companyName: 'SmartHome Solutions',
      issueDate: '2024-12-01',
      dueDate: '2024-12-30',
      amount: 999.99,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      items: [
        {
          description: 'Professional Plan - Annual Subscription',
          quantity: 1,
          unitPrice: 999.99,
          total: 999.99
        }
      ],
      taxAmount: 80.00,
      totalAmount: 1079.99,
      paidAt: '2024-12-02'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      accountId: '3',
      companyName: 'Manufacturing Co',
      issueDate: '2024-11-01',
      dueDate: '2024-11-15',
      amount: 99.99,
      currency: 'USD',
      status: 'overdue',
      paymentMethod: 'Invoice',
      items: [
        {
          description: 'Basic Plan - November 2024',
          quantity: 1,
          unitPrice: 99.99,
          total: 99.99
        }
      ],
      taxAmount: 8.00,
      totalAmount: 107.99,
      notes: 'Payment past due - follow up required'
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      invoiceId: '1',
      accountId: '1',
      companyName: 'TechCorp Industries',
      amount: 323.99,
      currency: 'USD',
      method: 'credit_card',
      status: 'completed',
      transactionId: 'txn_1234567890',
      processedAt: '2024-11-03 10:30:00',
      description: 'Monthly subscription payment'
    },
    {
      id: '2',
      invoiceId: '2',
      accountId: '2',
      companyName: 'SmartHome Solutions',
      amount: 1079.99,
      currency: 'USD',
      method: 'bank_transfer',
      status: 'completed',
      transactionId: 'txn_0987654321',
      processedAt: '2024-12-02 14:15:00',
      description: 'Annual subscription payment'
    },
    {
      id: '3',
      invoiceId: '3',
      accountId: '3',
      companyName: 'Manufacturing Co',
      amount: 107.99,
      currency: 'USD',
      method: 'check',
      status: 'pending',
      transactionId: 'txn_1122334455',
      processedAt: '2024-11-20 09:00:00',
      description: 'Monthly subscription payment - check processing'
    }
  ]);

  const analytics = {
    totalRevenue: 25678.90,
    monthlyRevenue: 2345.67,
    totalAccounts: billingAccounts.length,
    activeSubscriptions: billingAccounts.filter(acc => acc.subscription.status === 'active').length,
    overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
    pendingPayments: payments.filter(pay => pay.status === 'pending').length,
    averageMonthlyRevenue: 2234.56,
    churnRate: 2.5,
    lifetimeValue: 8945.67
  };

  // Filter and search functions
  const filteredAccounts = billingAccounts.filter(account => {
    const matchesSearch = account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Modal handlers
  const handleCreateAccount = () => {
    setModalType('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditAccount = (account: BillingAccount) => {
    setModalType('edit');
    setSelectedItem(account);
    setShowModal(true);
  };

  const handleViewDetails = (item: BillingAccount | Invoice | Payment) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleGenerateInvoice = (account: BillingAccount) => {
    setModalType('invoice');
    setSelectedItem(account);
    setShowModal(true);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setModalType('payment');
    setSelectedItem(invoice);
    setShowModal(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'accounts') {
        setBillingAccounts(prev => prev.filter(acc => acc.id !== itemToDelete));
        showToast({ title: 'Billing account deleted successfully', type: 'success' });
      } else if (activeTab === 'invoices') {
        setInvoices(prev => prev.filter(inv => inv.id !== itemToDelete));
        showToast({ title: 'Invoice deleted successfully', type: 'success' });
      } else if (activeTab === 'payments') {
        setPayments(prev => prev.filter(pay => pay.id !== itemToDelete));
        showToast({ title: 'Payment record deleted successfully', type: 'success' });
      }
      
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      showToast({ title: 'Failed to delete item', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      showToast({ title: 'Please select items to perform bulk action', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (action) {
        case 'suspend':
          setBillingAccounts(prev => prev.map(acc => 
            selectedItems.includes(acc.id) ? { ...acc, status: 'suspended' } : acc
          ));
          showToast({ title: `${selectedItems.length} accounts suspended`, type: 'success' });
          break;
        case 'activate':
          setBillingAccounts(prev => prev.map(acc => 
            selectedItems.includes(acc.id) ? { ...acc, status: 'active' } : acc
          ));
          showToast({ title: `${selectedItems.length} accounts activated`, type: 'success' });
          break;
        case 'send_reminder':
          showToast({ title: `Payment reminders sent to ${selectedItems.length} accounts`, type: 'success' });
          break;
        case 'export':
          showToast({ title: `Exported ${selectedItems.length} items`, type: 'info' });
          break;
      }
      
      setSelectedItems([]);
    } catch (error) {
      showToast({ title: 'Bulk action failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'paid': case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'overdue': case 'past_due': case 'delinquent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'suspended': case 'cancelled': case 'failed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'paid': case 'completed': return CheckCircleIcon;
      case 'pending': return ClockIcon;
      case 'overdue': case 'past_due': case 'delinquent': return ExclamationTriangleIcon;
      case 'suspended': case 'cancelled': case 'failed': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const tabConfig = [
    { id: 'accounts', name: 'Billing Accounts', icon: BuildingOfficeIcon, count: billingAccounts.length },
    { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon, count: invoices.length },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon, count: payments.length },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, count: null }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Billing Management</h1>
        <p className="text-green-100 mt-1">Manage subscriptions, invoices, and payments</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <ReceiptPercentIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${analytics.monthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.activeSubscriptions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overdueInvoices}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.count !== null && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab !== 'analytics' && (
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'accounts' && (
                    <>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="delinquent">Delinquent</option>
                      <option value="closed">Closed</option>
                    </>
                  )}
                  {activeTab === 'invoices' && (
                    <>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                  {activeTab === 'payments' && (
                    <>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </>
                  )}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {selectedItems.length > 0 && (
                  <div className="flex space-x-2">
                    {activeTab === 'accounts' && (
                      <>
                        <button
                          onClick={() => handleBulkAction('suspend')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          <span>Suspend</span>
                        </button>
                        <button
                          onClick={() => handleBulkAction('activate')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Activate</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleBulkAction('send_reminder')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>Send Reminder</span>
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Export</span>
                </button>
                
                {activeTab === 'accounts' && (
                  <button
                    onClick={handleCreateAccount}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Account</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredAccounts.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredAccounts.map(acc => acc.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Next Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAccounts.map((account) => {
                    const StatusIcon = getStatusIcon(account.status);
                    return (
                      <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(account.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, account.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== account.id));
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {account.companyName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {account.contactEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.subscription.planName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ${account.subscription.amount} / {account.subscription.billingCycle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${account.accountBalance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(account.subscription.nextBillingDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(account)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleGenerateInvoice(account)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(account.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredInvoices.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredInvoices.map(inv => inv.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => {
                    const StatusIcon = getStatusIcon(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, invoice.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== invoice.id));
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {invoice.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${invoice.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(invoice)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRecordPayment(invoice)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400"
                            >
                              <CreditCardIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(invoice.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredPayments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredPayments.map(pay => pay.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(payment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, payment.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== payment.id));
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.transactionId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.method.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payment.processedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(payment)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(payment.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Revenue</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${analytics.averageMonthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${analytics.lifetimeValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.churnRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.totalAccounts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {analytics.activeSubscriptions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {analytics.pendingPayments}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alert Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Overdue Invoices</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {analytics.overdueInvoices}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {payments.filter(p => p.status === 'failed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Suspended Accounts</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {billingAccounts.filter(a => a.status === 'suspended').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          payment.status === 'completed' ? 'bg-green-500' : 
                          payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.companyName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            modalType === 'create' ? 'Create Billing Account' :
            modalType === 'edit' ? 'Edit Billing Account' :
            modalType === 'view' ? 'View Details' :
            modalType === 'invoice' ? 'Generate Invoice' :
            'Record Payment'
          }
          size="lg"
        >
          <div className="space-y-4">
            {modalType === 'create' || modalType === 'edit' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue={modalType === 'edit' ? (selectedItem as BillingAccount)?.companyName : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue={modalType === 'edit' ? (selectedItem as BillingAccount)?.contactEmail : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue={modalType === 'edit' ? (selectedItem as BillingAccount)?.contactPhone : ''}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      showToast({ title: `Account ${modalType === 'create' ? 'created' : 'updated'} successfully`, type: 'success' });
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {modalType === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed view functionality would be implemented here with comprehensive information display.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          type="danger"
          confirmText="Delete"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
