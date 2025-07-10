'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  CreditCardIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

/**
 * Company Billing Page - Enterprise Billing Management
 * Comprehensive billing system for industrial IoT platform
 */
export default function CompanyBilling() {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<{ [key: string]: boolean }>({});
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Handle payment processing
  const handlePayNow = async () => {
    setIsPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Processing payment for current bill...');
    alert('Payment processed successfully! Your bill has been paid.');
    
    setIsPaymentProcessing(false);
  };

  // Handle invoice download
  const handleDownloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice: ${invoiceId}`);
    alert(`Invoice ${invoiceId} download initiated`);
  };

  // Handle viewing invoice details
  const handleViewInvoice = (invoiceId: string) => {
    setShowInvoiceDetails(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
  };

  // Handle plan upgrade
  const handleUpgradePlan = () => {
    console.log('Opening plan upgrade interface...');
    alert('Plan upgrade wizard opening...');
  };

  // Handle billing settings
  const handleBillingSettings = () => {
    console.log('Opening billing settings...');
    alert('Billing settings panel opening...');
  };

  // Mock billing data
  const billingData = {
    currentBill: {
      amount: 12450.00,
      dueDate: '2024-12-25',
      period: 'December 2024',
      status: 'unpaid',
      breakdown: {
        deviceConnections: 8750.00,
        dataStorage: 2100.00,
        analyticsProcessing: 980.00,
        supportServices: 620.00
      }
    },
    usage: {
      devices: {
        connected: 347,
        limit: 500,
        overage: 0,
        cost: 8750.00
      },
      dataStorage: {
        used: 2.8, // TB
        limit: 5.0,
        overage: 0,
        cost: 2100.00
      },
      apiCalls: {
        made: 2450000,
        limit: 5000000,
        overage: 0,
        cost: 0
      },
      analytics: {
        hours: 156,
        cost: 980.00
      }
    },
    invoices: [
      {
        id: 'INV-2024-012',
        date: '2024-12-01',
        amount: 12450.00,
        status: 'unpaid',
        dueDate: '2024-12-25',
        period: 'December 2024'
      },
      {
        id: 'INV-2024-011',
        date: '2024-11-01',
        amount: 11800.00,
        status: 'paid',
        dueDate: '2024-11-25',
        period: 'November 2024'
      },
      {
        id: 'INV-2024-010',
        date: '2024-10-01',
        amount: 12100.00,
        status: 'paid',
        dueDate: '2024-10-25',
        period: 'October 2024'
      },
      {
        id: 'INV-2024-009',
        date: '2024-09-01',
        amount: 10950.00,
        status: 'paid',
        dueDate: '2024-09-25',
        period: 'September 2024'
      },
      {
        id: 'INV-2024-008',
        date: '2024-08-01',
        amount: 11420.00,
        status: 'paid',
        dueDate: '2024-08-25',
        period: 'August 2024'
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'Credit Card',
        lastFour: '4532',
        expiry: '12/26',
        isDefault: true,
        status: 'active'
      },
      {
        id: 2,
        type: 'Bank Transfer',
        lastFour: '8901',
        bank: 'First National Bank',
        isDefault: false,
        status: 'active'
      }
    ],
    costAnalysis: {
      monthlyTrend: [
        { month: 'Aug', amount: 11420 },
        { month: 'Sep', amount: 10950 },
        { month: 'Oct', amount: 12100 },
        { month: 'Nov', amount: 11800 },
        { month: 'Dec', amount: 12450 }
      ],
      categoryBreakdown: [
        { category: 'Device Connections', percentage: 70.2, amount: 8750 },
        { category: 'Data Storage', percentage: 16.9, amount: 2100 },
        { category: 'Analytics Processing', percentage: 7.9, amount: 980 },
        { category: 'Support Services', percentage: 5.0, amount: 620 }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'unpaid': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const toggleInvoiceDetails = (invoiceId: string) => {
    setShowInvoiceDetails(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-green-100 mt-1">Enterprise billing management and cost analysis</p>
      </div>

      {/* Current Bill Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Bill</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(billingData.currentBill.status)}`}>
                {billingData.currentBill.status}
              </span>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(billingData.currentBill.amount)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Due {new Date(billingData.currentBill.dueDate).toLocaleDateString()} • {billingData.currentBill.period}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Cost Breakdown</h3>
              {Object.entries(billingData.currentBill.breakdown).map(([key, amount]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePayNow}
                disabled={isPaymentProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                {isPaymentProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay Now</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage This Month</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Devices</span>
                  <span className="text-gray-900 dark:text-white">{billingData.usage.devices.connected}/{billingData.usage.devices.limit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(billingData.usage.devices.connected / billingData.usage.devices.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Data Storage</span>
                  <span className="text-gray-900 dark:text-white">{billingData.usage.dataStorage.used}TB/{billingData.usage.dataStorage.limit}TB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(billingData.usage.dataStorage.used / billingData.usage.dataStorage.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">API Calls</span>
                  <span className="text-gray-900 dark:text-white">{(billingData.usage.apiCalls.made / 1000000).toFixed(1)}M/{(billingData.usage.apiCalls.limit / 1000000)}M</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(billingData.usage.apiCalls.made / billingData.usage.apiCalls.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h3>
              <button 
                onClick={handleBillingSettings}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
              >
                Add New
              </button>
            </div>
            
            <div className="space-y-3">
              {billingData.paymentMethods.map((method) => (
                <div key={method.id} className={`p-3 border rounded-lg ${method.isDefault ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.type} ••••{method.lastFour}
                        </div>
                        {method.expiry && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Expires {method.expiry}
                          </div>
                        )}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Cost Trend</h3>
          <div className="h-64 flex items-end space-x-2">
            {billingData.costAnalysis.monthlyTrend.map((data, index) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-600 rounded-t"
                  style={{ height: `${(data.amount / 13000) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.month}</span>
                <span className="text-xs text-gray-900 dark:text-white font-medium">
                  {formatCurrency(data.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost by Category</h3>
          <div className="space-y-4">
            {billingData.costAnalysis.categoryBreakdown.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{category.category}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.percentage}% • {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice History</h3>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="current">Current Year</option>
                <option value="last6">Last 6 Months</option>
                <option value="last12">Last 12 Months</option>
                <option value="all">All Time</option>
              </select>
              <button 
                onClick={() => alert('Exporting billing data...')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Period
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {billingData.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {invoice.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          title="View invoice details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                          title="Download invoice"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
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
}
