import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ServerIcon,
  CloudIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  WifiIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

interface SystemPerformance {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    cached: number;
    buffers: number;
  };
  disk: {
    used: number;
    total: number;
    readSpeed: number;
    writeSpeed: number;
    iops: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
    packetLoss: number;
    connections: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    deadlocks: number;
    cacheHitRate: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
  suggestions: string[];
}

interface OptimizationRecommendation {
  id: string;
  category: 'performance' | 'security' | 'cost' | 'scalability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  savings: {
    performance?: string;
    cost?: string;
    resources?: string;
  };
  implementation: string[];
}

interface BackgroundJob {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  startTime: string;
  endTime?: string;
  duration: number;
  progress: number;
  type: 'backup' | 'maintenance' | 'cleanup' | 'migration' | 'analytics';
  priority: 'low' | 'medium' | 'high';
}

const PerformanceOptimizationDashboard: React.FC = () => {
  const [performance, setPerformance] = useState<SystemPerformance | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'recommendations' | 'jobs'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPerformance: SystemPerformance = {
        cpu: {
          usage: 35.2,
          cores: 8,
          temperature: 62,
          load: [0.8, 1.2, 0.9, 1.5, 0.7, 1.1, 0.8, 1.3],
        },
        memory: {
          used: 6.4,
          total: 16.0,
          cached: 2.1,
          buffers: 0.8,
        },
        disk: {
          used: 234.5,
          total: 500.0,
          readSpeed: 145.6,
          writeSpeed: 89.3,
          iops: 2340,
        },
        network: {
          inbound: 45.6,
          outbound: 23.4,
          latency: 12.3,
          packetLoss: 0.01,
          connections: 1247,
        },
        database: {
          connections: 45,
          maxConnections: 100,
          queryTime: 23.4,
          deadlocks: 0,
          cacheHitRate: 94.7,
        },
      };

      const mockAlerts: PerformanceAlert[] = [
        {
          id: '1',
          type: 'memory',
          severity: 'high',
          title: 'High Memory Usage',
          description: 'Memory usage has exceeded 80% threshold',
          threshold: 80,
          currentValue: 85.2,
          timestamp: '2024-01-15T10:30:00Z',
          resolved: false,
          suggestions: [
            'Restart memory-intensive processes',
            'Clear application cache',
            'Increase memory allocation',
          ],
        },
        {
          id: '2',
          type: 'cpu',
          severity: 'medium',
          title: 'CPU Usage Spike',
          description: 'CPU usage peaked at 95% for 10 minutes',
          threshold: 90,
          currentValue: 95.8,
          timestamp: '2024-01-15T09:15:00Z',
          resolved: true,
          suggestions: [
            'Optimize query performance',
            'Scale horizontally',
            'Review background processes',
          ],
        },
        {
          id: '3',
          type: 'database',
          severity: 'low',
          title: 'Slow Query Detected',
          description: 'Average query time increased by 25%',
          threshold: 50,
          currentValue: 62.5,
          timestamp: '2024-01-15T08:45:00Z',
          resolved: false,
          suggestions: [
            'Add database indexes',
            'Optimize query structure',
            'Update table statistics',
          ],
        },
      ];

      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: '1',
          category: 'performance',
          priority: 'high',
          title: 'Implement Database Connection Pooling',
          description: 'Reduce database connection overhead by implementing connection pooling',
          impact: 'Improve database performance by 30-50%',
          effort: 'medium',
          savings: {
            performance: '30-50% faster queries',
            resources: '40% fewer database connections',
          },
          implementation: [
            'Configure connection pool size',
            'Set connection timeout values',
            'Monitor pool utilization',
            'Update application configuration',
          ],
        },
        {
          id: '2',
          category: 'cost',
          priority: 'medium',
          title: 'Optimize Cloud Storage Usage',
          description: 'Implement intelligent data tiering for cloud storage',
          impact: 'Reduce storage costs by 25-40%',
          effort: 'low',
          savings: {
            cost: '$500-800/month',
            resources: '25% less storage usage',
          },
          implementation: [
            'Analyze data access patterns',
            'Configure lifecycle policies',
            'Move old data to cheaper tiers',
            'Set up automated archiving',
          ],
        },
        {
          id: '3',
          category: 'scalability',
          priority: 'high',
          title: 'Implement Auto-Scaling',
          description: 'Set up automatic scaling based on demand',
          impact: 'Handle 5x traffic spikes automatically',
          effort: 'high',
          savings: {
            performance: '99.9% uptime during spikes',
            cost: 'Pay only for used resources',
          },
          implementation: [
            'Configure scaling policies',
            'Set up health checks',
            'Implement load balancing',
            'Test scaling scenarios',
          ],
        },
      ];

      const mockJobs: BackgroundJob[] = [
        {
          id: '1',
          name: 'Database Backup',
          status: 'running',
          startTime: '2024-01-15T12:00:00Z',
          duration: 45,
          progress: 65,
          type: 'backup',
          priority: 'high',
        },
        {
          id: '2',
          name: 'Cache Cleanup',
          status: 'completed',
          startTime: '2024-01-15T11:00:00Z',
          endTime: '2024-01-15T11:15:00Z',
          duration: 15,
          progress: 100,
          type: 'cleanup',
          priority: 'medium',
        },
        {
          id: '3',
          name: 'Analytics Processing',
          status: 'queued',
          startTime: '2024-01-15T13:00:00Z',
          duration: 0,
          progress: 0,
          type: 'analytics',
          priority: 'low',
        },
        {
          id: '4',
          name: 'System Maintenance',
          status: 'failed',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T10:30:00Z',
          duration: 30,
          progress: 45,
          type: 'maintenance',
          priority: 'medium',
        },
      ];

      setPerformance(mockPerformance);
      setAlerts(mockAlerts);
      setRecommendations(mockRecommendations);
      setBackgroundJobs(mockJobs);
    } catch (err) {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPerformanceData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Performance Data</h3>
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

  if (!performance) return null;

  const cpuChartData = {
    labels: performance.cpu.load.map((_, i) => `Core ${i + 1}`),
    datasets: [
      {
        label: 'CPU Load',
        data: performance.cpu.load,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const memoryChartData = {
    labels: ['Used', 'Cached', 'Buffers', 'Free'],
    datasets: [
      {
        data: [
          performance.memory.used,
          performance.memory.cached,
          performance.memory.buffers,
          performance.memory.total - performance.memory.used - performance.memory.cached - performance.memory.buffers,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Optimization</h1>
          <p className="text-gray-600 mt-1">Monitor and optimize system performance</p>
        </div>
        <div className="flex items-center space-x-4">
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

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'System Overview', icon: ChartBarIcon },
              { id: 'alerts', label: 'Performance Alerts', icon: ExclamationTriangleIcon },
              { id: 'recommendations', label: 'Optimization Tips', icon: BoltIcon },
              { id: 'jobs', label: 'Background Jobs', icon: Cog6ToothIcon },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Resource Usage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">CPU Usage</p>
                      <p className="text-2xl font-bold text-blue-900">{performance.cpu.usage}%</p>
                      <p className="text-xs text-blue-600">{performance.cpu.cores} cores</p>
                    </div>
                    <CpuChipIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Memory</p>
                      <p className="text-2xl font-bold text-green-900">
                        {((performance.memory.used / performance.memory.total) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-green-600">
                        {formatBytes(performance.memory.used * 1024 * 1024 * 1024)} / {formatBytes(performance.memory.total * 1024 * 1024 * 1024)}
                      </p>
                    </div>
                    <ServerIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Disk Usage</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {((performance.disk.used / performance.disk.total) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-yellow-600">
                        {formatBytes(performance.disk.used * 1024 * 1024 * 1024)} / {formatBytes(performance.disk.total * 1024 * 1024 * 1024)}
                      </p>
                    </div>
                    <CircleStackIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Network</p>
                      <p className="text-2xl font-bold text-purple-900">{performance.network.latency}ms</p>
                      <p className="text-xs text-purple-600">
                        {performance.network.connections} connections
                      </p>
                    </div>
                    <WifiIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Core Load</h3>
                  <div className="h-64">
                    <Bar
                      data={cpuChartData}
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
                            max: 2,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Distribution</h3>
                  <div className="h-64">
                    <Doughnut
                      data={memoryChartData}
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

              {/* Database Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{performance.database.connections}</div>
                    <div className="text-sm text-gray-600">Active Connections</div>
                    <div className="text-xs text-gray-500">of {performance.database.maxConnections} max</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{performance.database.queryTime}ms</div>
                    <div className="text-sm text-gray-600">Avg Query Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{performance.database.cacheHitRate}%</div>
                    <div className="text-sm text-gray-600">Cache Hit Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{performance.database.deadlocks}</div>
                    <div className="text-sm text-gray-600">Deadlocks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{performance.disk.iops}</div>
                    <div className="text-sm text-gray-600">IOPS</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
                <span className="text-sm text-gray-500">{alerts.filter(a => !a.resolved).length} active alerts</span>
              </div>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <span className="text-xs uppercase font-medium">{alert.severity}</span>
                        </div>
                        <p className="text-sm mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span>Current: {alert.currentValue}%</span>
                          <span>Threshold: {alert.threshold}%</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {alert.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                        {!alert.resolved && (
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
                <span className="text-sm text-gray-500">{recommendations.length} recommendations</span>
              </div>
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <div key={rec.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{rec.description}</p>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Impact:</span>
                            <p className="text-gray-600">{rec.impact}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Effort:</span>
                            <p className="text-gray-600 capitalize">{rec.effort}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Savings:</span>
                            <div className="text-gray-600">
                              {Object.entries(rec.savings).map(([key, value]) => (
                                <p key={key} className="text-xs">
                                  {key}: {value}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="font-medium text-gray-700">Implementation Steps:</span>
                          <ol className="text-sm text-gray-600 mt-1 space-y-1">
                            {rec.implementation.map((step, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600 font-medium">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Implement
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Background Jobs</h3>
                <span className="text-sm text-gray-500">{backgroundJobs.filter(j => j.status === 'running').length} running</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backgroundJobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {job.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {job.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{job.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.duration}m
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {job.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.status === 'running' ? (
                            <button className="text-red-600 hover:text-red-900">
                              Stop
                            </button>
                          ) : job.status === 'failed' ? (
                            <button className="text-blue-600 hover:text-blue-900">
                              Retry
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizationDashboard;
