'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
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
  FunnelIcon,
  BellIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ServerIcon,
  CloudIcon,
  SignalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface BillingData {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalCost: number;
    deviceCount: number;
    dataTransfer: number;
    apiCalls: number;
    storageUsed: number;
  };
  usage: {
    devices: { current: number; limit: number; cost: number };
    dataTransfer: { current: number; limit: number; cost: number };
    apiCalls: { current: number; limit: number; cost: number };
    storage: { current: number; limit: number; cost: number };
  };
  plan: {
    name: string;
    price: number;
    period: string;
    features: string[];
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    downloadUrl?: string;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
  }>;
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'bank' | 'ach';
    last4: string;
    brand?: string;
    isDefault: boolean;
    status: 'active' | 'expired' | 'inactive';
    expiryDate?: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'usage' | 'payment' | 'billing';
    message: string;
    severity: 'low' | 'medium' | 'high';
    date: string;
  }>;
  costAnalysis: {
    monthlyTrend: Array<{
      month: string;
      amount: number;
      devices: number;
      dataTransfer: number;
      apiCalls: number;
      storage: number;
    }>;
    predictions: Array<{
      month: string;
      predictedCost: number;
      confidence: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      percentage: number;
      amount: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
}

interface UsageAlert {
  id: string;
  type: 'threshold' | 'overage' | 'anomaly';
  resource: string;
  threshold: number;
  current: number;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  unit?: string;
}

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: {
    devices: number;
    dataTransfer: number;
    apiCalls: number;
    storage: number;
  };
  isCurrent: boolean;
  isPopular?: boolean;
}

/**
 * Company Billing Dashboard - Comprehensive Billing Management
 * Advanced billing system for industrial IoT platform with detailed analytics
 */
export default function CompanyBilling() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<{ [key: string]: boolean }>({});
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [usageAlerts, setUsageAlerts] = useState<UsageAlert[]>([]);
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  // Enhanced mock billing data
  const [billingData, setBillingData] = useState<BillingData>({
    currentPeriod: {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      totalCost: 12847.50,
      deviceCount: 347,
      dataTransfer: 47.8,
      apiCalls: 2450000,
      storageUsed: 2.8
    },
    usage: {
      devices: { current: 347, limit: 500, cost: 8750.00 },
      dataTransfer: { current: 47.8, limit: 100, cost: 2100.00 },
      apiCalls: { current: 2450000, limit: 5000000, cost: 0 },
      storage: { current: 2.8, limit: 5.0, cost: 980.00 }
    },
    plan: {
      name: 'Industrial Pro',
      price: 1999.00,
      period: 'monthly',
      features: [
        'Up to 500 devices',
        '100GB data transfer',
        '5M API calls',
        '5TB storage',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'SLA guarantee'
      ]
    },
    invoices: [
      {
        id: 'INV-2024-012',
        date: '2024-12-01',
        amount: 12847.50,
        status: 'pending',
        dueDate: '2024-12-25',
        downloadUrl: '/invoices/INV-2024-012.pdf',
        items: [
          { description: 'Device connections (347 devices)', quantity: 347, rate: 25.00, amount: 8675.00 },
          { description: 'Data transfer (47.8 GB)', quantity: 47.8, rate: 43.93, amount: 2100.00 },
          { description: 'Storage (2.8 TB)', quantity: 2.8, rate: 350.00, amount: 980.00 },
          { description: 'Analytics processing', quantity: 1, rate: 1092.50, amount: 1092.50 }
        ]
      },
      {
        id: 'INV-2024-011',
        date: '2024-11-01',
        amount: 11800.00,
        status: 'paid',
        dueDate: '2024-11-25',
        downloadUrl: '/invoices/INV-2024-011.pdf',
        items: [
          { description: 'Device connections (332 devices)', quantity: 332, rate: 25.00, amount: 8300.00 },
          { description: 'Data transfer (42.1 GB)', quantity: 42.1, rate: 43.93, amount: 1849.00 },
          { description: 'Storage (2.6 TB)', quantity: 2.6, rate: 350.00, amount: 910.00 },
          { description: 'Analytics processing', quantity: 1, rate: 741.00, amount: 741.00 }
        ]
      },
      {
        id: 'INV-2024-010',
        date: '2024-10-01',
        amount: 12100.00,
        status: 'paid',
        dueDate: '2024-10-25',
        downloadUrl: '/invoices/INV-2024-010.pdf',
        items: [
          { description: 'Device connections (340 devices)', quantity: 340, rate: 25.00, amount: 8500.00 },
          { description: 'Data transfer (45.2 GB)', quantity: 45.2, rate: 43.93, amount: 1985.00 },
          { description: 'Storage (2.7 TB)', quantity: 2.7, rate: 350.00, amount: 945.00 },
          { description: 'Analytics processing', quantity: 1, rate: 670.00, amount: 670.00 }
        ]
      }
    ],
    paymentMethods: [
      {
        id: 'card_1',
        type: 'card',
        last4: '4532',
        brand: 'Visa',
        isDefault: true,
        status: 'active',
        expiryDate: '12/26'
      },
      {
        id: 'card_2',
        type: 'card',
        last4: '0005',
        brand: 'Mastercard',
        isDefault: false,
        status: 'active',
        expiryDate: '08/25'
      },
      {
        id: 'bank_1',
        type: 'bank',
        last4: '8901',
        brand: 'First National Bank',
        isDefault: false,
        status: 'active'
      }
    ],
    alerts: [
      {
        id: 'alert_1',
        type: 'usage',
        message: 'Device usage at 69% of limit',
        severity: 'medium',
        date: '2024-12-15'
      },
      {
        id: 'alert_2',
        type: 'billing',
        message: 'Invoice INV-2024-012 due in 10 days',
        severity: 'high',
        date: '2024-12-15'
      }
    ],
    costAnalysis: {
      monthlyTrend: [
        { month: 'Jul', amount: 10420, devices: 298, dataTransfer: 38.2, apiCalls: 1850000, storage: 2.3 },
        { month: 'Aug', amount: 11420, devices: 315, dataTransfer: 41.5, apiCalls: 2100000, storage: 2.4 },
        { month: 'Sep', amount: 10950, devices: 325, dataTransfer: 39.8, apiCalls: 1950000, storage: 2.5 },
        { month: 'Oct', amount: 12100, devices: 340, dataTransfer: 45.2, apiCalls: 2300000, storage: 2.7 },
        { month: 'Nov', amount: 11800, devices: 332, dataTransfer: 42.1, apiCalls: 2150000, storage: 2.6 },
        { month: 'Dec', amount: 12847, devices: 347, dataTransfer: 47.8, apiCalls: 2450000, storage: 2.8 }
      ],
      predictions: [
        { month: 'Jan', predictedCost: 13200, confidence: 85 },
        { month: 'Feb', predictedCost: 13800, confidence: 78 },
        { month: 'Mar', predictedCost: 14100, confidence: 72 }
      ],
      categoryBreakdown: [
        { category: 'Device Connections', percentage: 67.5, amount: 8675, trend: 'up' },
        { category: 'Data Transfer', percentage: 16.3, amount: 2100, trend: 'stable' },
        { category: 'Analytics Processing', percentage: 8.5, amount: 1092, trend: 'up' },
        { category: 'Storage', percentage: 7.6, amount: 980, trend: 'stable' }
      ]
    }
  });

  // Available plans
  const availablePlans: BillingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 299,
      period: 'monthly',
      features: [
        { name: 'Device connections', included: true, limit: 25, unit: 'devices' },
        { name: 'Data transfer', included: true, limit: 10, unit: 'GB' },
        { name: 'API calls', included: true, limit: 100000, unit: 'calls' },
        { name: 'Storage', included: true, limit: 50, unit: 'GB' },
        { name: 'Basic analytics', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false }
      ],
      limits: {
        devices: 25,
        dataTransfer: 10,
        apiCalls: 100000,
        storage: 50
      },
      isCurrent: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 799,
      period: 'monthly',
      features: [
        { name: 'Device connections', included: true, limit: 100, unit: 'devices' },
        { name: 'Data transfer', included: true, limit: 50, unit: 'GB' },
        { name: 'API calls', included: true, limit: 1000000, unit: 'calls' },
        { name: 'Storage', included: true, limit: 200, unit: 'GB' },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom integrations', included: false },
        { name: 'SLA guarantee', included: false }
      ],
      limits: {
        devices: 100,
        dataTransfer: 50,
        apiCalls: 1000000,
        storage: 200
      },
      isCurrent: false
    },
    {
      id: 'industrial',
      name: 'Industrial Pro',
      price: 1999,
      period: 'monthly',
      features: [
        { name: 'Device connections', included: true, limit: 500, unit: 'devices' },
        { name: 'Data transfer', included: true, limit: 100, unit: 'GB' },
        { name: 'API calls', included: true, limit: 5000000, unit: 'calls' },
        { name: 'Storage', included: true, limit: 5000, unit: 'GB' },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'SLA guarantee', included: true }
      ],
      limits: {
        devices: 500,
        dataTransfer: 100,
        apiCalls: 5000000,
        storage: 5000
      },
      isCurrent: true,
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999,
      period: 'monthly',
      features: [
        { name: 'Device connections', included: true, limit: -1, unit: 'unlimited' },
        { name: 'Data transfer', included: true, limit: -1, unit: 'unlimited' },
        { name: 'API calls', included: true, limit: -1, unit: 'unlimited' },
        { name: 'Storage', included: true, limit: -1, unit: 'unlimited' },
        { name: 'Advanced analytics', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'SLA guarantee', included: true }
      ],
      limits: {
        devices: -1,
        dataTransfer: -1,
        apiCalls: -1,
        storage: -1
      },
      isCurrent: false
    }
  ];

  useEffect(() => {
    const initializeBilling = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize usage alerts
      const alerts: UsageAlert[] = [];
      Object.entries(billingData.usage).forEach(([key, usage]) => {
        const percentage = (usage.current / usage.limit) * 100;
        if (percentage >= 80) {
          alerts.push({
            id: `alert_${key}`,
            type: percentage >= 90 ? 'overage' : 'threshold',
            resource: key,
            threshold: usage.limit * 0.8,
            current: usage.current,
            message: `${key} usage at ${percentage.toFixed(1)}% of limit`,
            severity: percentage >= 90 ? 'critical' : 'warning',
            timestamp: new Date().toISOString()
          });
        }
      });
      setUsageAlerts(alerts);
      setIsLoading(false);
    };

    initializeBilling();
  }, [billingData.usage]);

  // Enhanced handler functions
  const handlePayNow = async (invoiceId?: string) => {
    setIsPaymentProcessing(true);
    const invoice = invoiceId || billingData.invoices.find(inv => inv.status === 'pending')?.id;
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast({
        title: 'Payment Successful',
        message: `Invoice ${invoice} has been paid successfully`,
        type: 'success'
      });
      
      // Update invoice status
      setBillingData(prev => ({
        ...prev,
        invoices: prev.invoices.map(inv =>
          inv.id === invoice ? { ...inv, status: 'paid' as const } : inv
        )
      }));
    } catch (error) {
      showToast({
        title: 'Payment Failed',
        message: 'Payment processing failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsPaymentProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      showToast({
        title: 'Download Started',
        message: `Downloading invoice ${invoiceId}...`,
        type: 'info'
      });
      
      // Simulate PDF generation and download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock PDF download
      const element = document.createElement('a');
      element.href = `data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKEludm9pY2UgJHtpbnZvaWNlSWR9KQovQ3JlYXRvciAoSW9UIFBsYXRmb3JtKQovUHJvZHVjZXIgKEludm9pY2UgR2VuZXJhdG9yKQovQ3JlYXRpb25EYXRlIChEOjIwMjQxMjE1KQo+PgplbmRvYmoKdHJhaWxlcgo8PAovU2l6ZSAxCi9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo5CiUlRU9G`;
      element.download = `${invoiceId}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showToast({
        title: 'Download Complete',
        message: `Invoice ${invoiceId} has been downloaded`,
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Download Failed',
        message: 'Failed to download invoice. Please try again.',
        type: 'error'
      });
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    const invoice = billingData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoiceId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .invoice-details { margin: 20px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>IoT Platform Invoice</h1>
              <p>Invoice ID: ${invoice.id}</p>
              <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
              <p>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div class="invoice-details">
              <h3>Bill To:</h3>
              <p>${user?.name || 'Company Name'}</p>
              <p>IoT Platform User</p>
              <p>Company ID: ${user?.companyId || 'N/A'}</p>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.rate.toFixed(2)}</td>
                    <td>$${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <p>Total: $${invoice.amount.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleEmailInvoice = (invoiceId: string) => {
    showToast({
      title: 'Email Sent',
      message: `Invoice ${invoiceId} has been emailed to ${user?.email}`,
      type: 'success'
    });
  };

  const handleUpgradePlan = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId);
    if (!plan) return;

    showToast({
      title: 'Plan Upgrade',
      message: `Upgrading to ${plan.name} plan...`,
      type: 'info'
    });

    // Simulate plan upgrade
    setTimeout(() => {
      setBillingData(prev => ({
        ...prev,
        plan: {
          name: plan.name,
          price: plan.price,
          period: plan.period,
          features: plan.features.filter(f => f.included).map(f => f.name)
        }
      }));

      showToast({
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${plan.name} plan`,
        type: 'success'
      });
    }, 2000);
  };

  const handleAddPaymentMethod = () => {
    showToast({
      title: 'Payment Method',
      message: 'Payment method management coming soon',
      type: 'info'
    });
  };

  const handleSetDefaultPayment = (paymentId: string) => {
    setBillingData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === paymentId
      }))
    }));

    showToast({
      title: 'Payment Method Updated',
      message: 'Default payment method has been updated',
      type: 'success'
    });
  };

  const handleRemovePaymentMethod = (paymentId: string) => {
    setBillingData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(method => method.id !== paymentId)
    }));

    showToast({
      title: 'Payment Method Removed',
      message: 'Payment method has been removed',
      type: 'success'
    });
  };

  const handleExportBillingData = () => {
    const csvData = [
      ['Invoice ID', 'Date', 'Amount', 'Status', 'Due Date'],
      ...billingData.invoices.map(inv => [
        inv.id,
        new Date(inv.date).toLocaleDateString(),
        inv.amount.toString(),
        inv.status,
        new Date(inv.dueDate).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `billing-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Export Complete',
      message: 'Billing data has been exported to CSV',
      type: 'success'
    });
  };

  const handleSetupUsageAlert = (resource: string, threshold: number) => {
    showToast({
      title: 'Usage Alert Set',
      message: `Alert set for ${resource} at ${threshold}%`,
      type: 'success'
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setShowInvoiceDetails(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
  };

  const toggleInvoiceDetails = (invoiceId: string) => {
    setShowInvoiceDetails(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPredictionConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'usage', name: 'Usage Details', icon: ServerIcon },
    { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon },
    { id: 'payment', name: 'Payment Methods', icon: CreditCardIcon },
    { id: 'plans', name: 'Plans & Pricing', icon: CurrencyDollarIcon },
    { id: 'alerts', name: 'Usage Alerts', icon: BellIcon },
    { id: 'analytics', name: 'Cost Analytics', icon: ChartBarIcon }
  ];

  const chartColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing Dashboard</h1>
            <p className="text-blue-100 mt-1">Comprehensive billing management and cost analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportBillingData}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Month</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(billingData.currentPeriod.totalCost)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Due {new Date(billingData.currentPeriod.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Devices</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {billingData.currentPeriod.deviceCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getUsagePercentage(billingData.usage.devices.current, billingData.usage.devices.limit)}% of limit
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CloudIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Transfer</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {billingData.currentPeriod.dataTransfer} GB
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getUsagePercentage(billingData.usage.dataTransfer.current, billingData.usage.dataTransfer.limit)}% of limit
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {billingData.plan.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(billingData.plan.price)}/{billingData.plan.period}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Alerts */}
      {usageAlerts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="ml-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Usage Alerts ({usageAlerts.length})
            </h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            {usageAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between py-1">
                <span>{alert.message}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6">
          <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Bill and Usage Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Bill</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        billingData.invoices.find(inv => inv.status === 'pending') ? 
                        getStatusColor('pending') : getStatusColor('paid')
                      }`}>
                        {billingData.invoices.find(inv => inv.status === 'pending')?.status || 'Current'}
                      </span>
                    </div>
                    
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatCurrency(billingData.currentPeriod.totalCost)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Period: {new Date(billingData.currentPeriod.startDate).toLocaleDateString()} - {new Date(billingData.currentPeriod.endDate).toLocaleDateString()}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Cost Breakdown</h4>
                      {billingData.costAnalysis.categoryBreakdown.map((category, index) => (
                        <div key={category.category} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: chartColors[index] }}
                            ></div>
                            <span className="text-gray-600 dark:text-gray-400">{category.category}</span>
                            {getTrendIcon(category.trend)}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(category.amount)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Usage Summary */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage Summary</h3>
                    <div className="space-y-4">
                      {Object.entries(billingData.usage).map(([key, usage]) => {
                        const percentage = getUsagePercentage(usage.current, usage.limit);
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {usage.limit === -1 ? 'Unlimited' : 
                                  `${usage.current.toLocaleString()}/${usage.limit.toLocaleString()}`}
                              </span>
                            </div>
                            {usage.limit !== -1 && (
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getUsageBarColor(percentage)}`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Cost: {formatCurrency(usage.cost)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handlePayNow()}
                        disabled={isPaymentProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                      >
                        {isPaymentProcessing ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CreditCardIcon className="h-4 w-4" />
                        )}
                        <span>Pay Current Bill</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('alerts')}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <BellIcon className="h-4 w-4" />
                        <span>Setup Alerts</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Cost Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={billingData.costAnalysis.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Cost']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={billingData.costAnalysis.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                          label={({ category, percentage }) => `${category} ${percentage}%`}
                        >
                          {billingData.costAnalysis.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
