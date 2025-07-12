import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
  ChartBarIcon,
  UserGroupIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ServerIcon,
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
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdminDashboardProps {}

interface DashboardMetrics {
  totalUsers: number;
  activeDevices: number;
  monthlyRevenue: number;
  systemHealth: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkActivity: number;
}

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'device_addition' | 'system_alert' | 'billing_event';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
  resolved: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeDevices: 0,
    monthlyRevenue: 0,
    systemHealth: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkActivity: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetrics({
          totalUsers: 1247,
          activeDevices: 8934,
          monthlyRevenue: 47250,
          systemHealth: 98.5,
          cpuUsage: 35.2,
          memoryUsage: 62.8,
          diskUsage: 45.3,
          networkActivity: 78.9,
        });

        setRecentActivity([
          {
            id: '1',
            type: 'user_registration',
            description: 'User Registration - john.doe@example.com',
            timestamp: '2024-01-15T10:30:00Z',
            severity: 'low',
          },
          {
            id: '2',
            type: 'device_addition',
            description: 'New Device Added - Smart Thermostat #ST-4521',
            timestamp: '2024-01-15T09:15:00Z',
            severity: 'low',
          },
          {
            id: '3',
            type: 'system_alert',
            description: 'High CPU usage detected on server cluster',
            timestamp: '2024-01-15T08:45:00Z',
            severity: 'high',
          },
          {
            id: '4',
            type: 'billing_event',
            description: 'Monthly billing cycle completed',
            timestamp: '2024-01-15T00:00:00Z',
            severity: 'medium',
          },
        ]);

        setSystemAlerts([
          {
            id: '1',
            title: 'Server Maintenance',
            message: 'Scheduled maintenance window starting at 2:00 AM',
            severity: 'info',
            timestamp: '2024-01-15T10:00:00Z',
            resolved: false,
          },
          {
            id: '2',
            title: 'High Memory Usage',
            message: 'Memory usage exceeds 80% threshold',
            severity: 'warning',
            timestamp: '2024-01-15T09:30:00Z',
            resolved: false,
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      title: 'Active Devices',
      value: metrics.activeDevices.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: CpuChipIcon,
      color: 'green',
    },
    {
      title: 'Monthly Revenue',
      value: `$${metrics.monthlyRevenue.toLocaleString()}`,
      change: '+15.3%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'purple',
    },
    {
      title: 'System Health',
      value: `${metrics.systemHealth}%`,
      change: '+0.5%',
      trend: 'up',
      icon: CheckCircleIcon,
      color: 'emerald',
    },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users',
        data: [1100, 1150, 1200, 1180, 1220, 1247],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Devices',
        data: [7800, 8100, 8300, 8500, 8700, 8934],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const deviceTypeData = {
    labels: ['Smart Thermostats', 'Security Cameras', 'Lighting Systems', 'Sensors', 'Other'],
    datasets: [
      {
        data: [2500, 1800, 1200, 2000, 1434],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [35000, 38000, 42000, 39000, 44000, 47250],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration':
        return UserGroupIcon;
      case 'device_addition':
        return CpuChipIcon;
      case 'system_alert':
        return ExclamationTriangleIcon;
      case 'billing_event':
        return CurrencyDollarIcon;
      default:
        return ClockIcon;
    }
  };

  const getAlertSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive system overview and management</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome back, {user?.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {card.trend === 'up' ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <div className="h-64">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
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

        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={deviceTypeData}
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
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        <div className="h-64">
          <Bar 
            data={revenueData}
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

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.cpuUsage}%</div>
            <div className="text-sm text-gray-600">CPU Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.memoryUsage}%</div>
            <div className="text-sm text-gray-600">Memory Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.diskUsage}%</div>
            <div className="text-sm text-gray-600">Disk Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${metrics.diskUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.networkActivity}%</div>
            <div className="text-sm text-gray-600">Network Activity</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${metrics.networkActivity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                    activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.severity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <button className="text-sm font-medium underline">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="w-8 h-8 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">Add User</div>
              <div className="text-sm text-gray-600">Create new user account</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <ServerIcon className="w-8 h-8 text-green-600 mb-2" />
              <div className="font-medium text-gray-900">System Backup</div>
              <div className="text-sm text-gray-600">Run system backup</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="w-8 h-8 text-purple-600 mb-2" />
              <div className="font-medium text-gray-900">View Reports</div>
              <div className="text-sm text-gray-600">Generate analytics</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Cog6ToothIcon className="w-8 h-8 text-gray-600 mb-2" />
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-600">System configuration</div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Background Jobs</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600">Processing</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache System</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  john.doe@example.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  192.168.1.100
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  New York, NY
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2h 15m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-red-600 hover:text-red-900">
                    Terminate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  jane.smith@example.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10.0.0.50
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Los Angeles, CA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  45m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-red-600 hover:text-red-900">
                    Terminate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
