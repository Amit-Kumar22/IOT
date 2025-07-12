import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  averageRevenuePerUser: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  churnRate: number;
  conversionRate: number;
  lifetimeValue: number;
}

interface RevenueByPlan {
  planId: string;
  planName: string;
  revenue: number;
  subscriptions: number;
  percentage: number;
}

interface RevenueAnalytics {
  metrics: RevenueMetrics;
  monthlyData: { month: string; revenue: number; subscriptions: number }[];
  revenueByPlan: RevenueByPlan[];
  revenueByRegion: { region: string; revenue: number; percentage: number }[];
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  type: 'subscription' | 'upgrade' | 'downgrade' | 'refund';
}

const BillingRevenueAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnalytics: RevenueAnalytics = {
        metrics: {
          totalRevenue: 487235.67,
          monthlyRevenue: 52430.89,
          yearlyRevenue: 584821.45,
          revenueGrowth: 12.5,
          averageRevenuePerUser: 89.45,
          totalSubscriptions: 5234,
          activeSubscriptions: 4876,
          churnRate: 3.2,
          conversionRate: 8.7,
          lifetimeValue: 1245.67,
        },
        monthlyData: [
          { month: 'Jan', revenue: 45230, subscriptions: 512 },
          { month: 'Feb', revenue: 48120, subscriptions: 578 },
          { month: 'Mar', revenue: 52340, subscriptions: 634 },
          { month: 'Apr', revenue: 49870, subscriptions: 601 },
          { month: 'May', revenue: 56780, subscriptions: 689 },
          { month: 'Jun', revenue: 52430, subscriptions: 657 },
          { month: 'Jul', revenue: 58920, subscriptions: 724 },
          { month: 'Aug', revenue: 61245, subscriptions: 756 },
          { month: 'Sep', revenue: 55670, subscriptions: 703 },
          { month: 'Oct', revenue: 62340, subscriptions: 789 },
          { month: 'Nov', revenue: 58930, subscriptions: 734 },
          { month: 'Dec', revenue: 65890, subscriptions: 812 },
        ],
        revenueByPlan: [
          { planId: '1', planName: 'Basic Plan', revenue: 125430, subscriptions: 1234, percentage: 25.7 },
          { planId: '2', planName: 'Professional Plan', revenue: 234670, subscriptions: 867, percentage: 48.2 },
          { planId: '3', planName: 'Enterprise Plan', revenue: 127135, subscriptions: 189, percentage: 26.1 },
        ],
        revenueByRegion: [
          { region: 'North America', revenue: 245670, percentage: 50.4 },
          { region: 'Europe', revenue: 156780, percentage: 32.2 },
          { region: 'Asia Pacific', revenue: 67890, percentage: 13.9 },
          { region: 'Other', revenue: 16895, percentage: 3.5 },
        ],
        recentTransactions: [
          {
            id: '1',
            userId: 'user1',
            userEmail: 'john@example.com',
            planName: 'Professional Plan',
            amount: 89.99,
            currency: 'USD',
            status: 'completed',
            timestamp: '2024-01-15T10:30:00Z',
            type: 'subscription',
          },
          {
            id: '2',
            userId: 'user2',
            userEmail: 'jane@example.com',
            planName: 'Enterprise Plan',
            amount: 249.99,
            currency: 'USD',
            status: 'completed',
            timestamp: '2024-01-15T09:15:00Z',
            type: 'upgrade',
          },
          {
            id: '3',
            userId: 'user3',
            userEmail: 'bob@example.com',
            planName: 'Basic Plan',
            amount: 29.99,
            currency: 'USD',
            status: 'pending',
            timestamp: '2024-01-15T08:45:00Z',
            type: 'subscription',
          },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const revenueChartData = {
    labels: analytics?.monthlyData.map(d => d.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: analytics?.monthlyData.map(d => d.revenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const subscriptionsChartData = {
    labels: analytics?.monthlyData.map(d => d.month) || [],
    datasets: [
      {
        label: 'New Subscriptions',
        data: analytics?.monthlyData.map(d => d.subscriptions) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const planRevenueChartData = {
    labels: analytics?.revenueByPlan.map(p => p.planName) || [],
    datasets: [
      {
        data: analytics?.revenueByPlan.map(p => p.revenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const regionRevenueChartData = {
    labels: analytics?.revenueByRegion.map(r => r.region) || [],
    datasets: [
      {
        data: analytics?.revenueByRegion.map(r => r.revenue) || [],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-1">Track billing performance and revenue trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.metrics.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">
                  +{analytics.metrics.revenueGrowth}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.metrics.monthlyRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">
                  +8.2%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.metrics.activeSubscriptions.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">
                  +12.5%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Revenue per User</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.metrics.averageRevenuePerUser)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">
                  +5.3%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <ChartBarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Subscriptions Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Subscriptions</h3>
          <div className="h-64">
            <Bar
              data={subscriptionsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
          <div className="h-64">
            <Doughnut
              data={planRevenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {analytics.revenueByPlan.map((plan) => (
              <div key={plan.planId} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{plan.planName}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                  <span className="text-gray-500">({plan.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Region */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Region</h3>
          <div className="h-64">
            <Doughnut
              data={regionRevenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {analytics.revenueByRegion.map((region) => (
              <div key={region.region} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{region.region}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(region.revenue)}</span>
                  <span className="text-gray-500">({region.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.churnRate}%</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">-0.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.conversionRate}%</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+1.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer Lifetime Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.metrics.lifetimeValue)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+8.9%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.metrics.totalSubscriptions.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+15.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.planName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{transaction.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingRevenueAnalytics;
