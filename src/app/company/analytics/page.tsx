'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Company Analytics Page - Industrial IoT Data Analytics
 * Advanced analytics dashboard for industrial device monitoring and KPI tracking
 */
export default function CompanyAnalytics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetrics, setSelectedMetrics] = useState(['uptime', 'performance', 'energy']);
  const [viewType, setViewType] = useState('overview');
  const [selectedSites, setSelectedSites] = useState(['all']);
  const [isExporting, setIsExporting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Handle data export functionality
  const handleExportData = async (format: 'csv' | 'pdf' | 'excel') => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = {
      timeRange,
      selectedMetrics,
      kpis: analyticsData.kpis,
      sites: analyticsData.sites,
      overview: analyticsData.overview
    };
    
    console.log(`Exporting analytics data as ${format}:`, data);
    alert(`Analytics report exported as ${format.toUpperCase()} successfully!`);
    
    setIsExporting(false);
  };

  // Handle metric selection toggle
  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  // Handle site selection for filtering
  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev => {
      if (siteId === 'all') {
        return prev.includes('all') ? [] : ['all'];
      }
      
      const newSelection = prev.includes(siteId)
        ? prev.filter(s => s !== siteId)
        : [...prev.filter(s => s !== 'all'), siteId];
      
      return newSelection;
    });
  };

  // Handle alert dismissal
  const handleDismissAlert = (alertId: number) => {
    console.log(`Dismissing alert ${alertId}`);
    alert(`Alert ${alertId} has been dismissed`);
  };

  // Handle KPI target update
  const handleUpdateTarget = (kpiId: string, newTarget: number) => {
    console.log(`Updating KPI ${kpiId} target to ${newTarget}`);
    alert(`KPI target updated to ${newTarget}`);
  };

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
    console.log(`Auto-refresh ${!autoRefresh ? 'enabled' : 'disabled'}`);
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    console.log('Refreshing analytics data...');
    alert('Analytics data refreshed successfully!');
  };

  // Mock industrial analytics data
  const analyticsData = {
    overview: {
      totalDevices: 247,
      activeDevices: 231,
      uptime: 94.2,
      efficiency: 87.8,
      energyConsumption: 2847.5, // kWh
      costSavings: 18.3, // %
      alerts: 12,
      criticalIssues: 2
    },
    kpis: [
      {
        id: 'oee',
        name: 'Overall Equipment Effectiveness',
        value: 87.8,
        unit: '%',
        target: 90,
        trend: { value: 2.1, positive: true },
        category: 'performance',
        color: 'bg-blue-500'
      },
      {
        id: 'mtbf',
        name: 'Mean Time Between Failures',
        value: 342,
        unit: 'hours',
        target: 300,
        trend: { value: 15.2, positive: true },
        category: 'reliability',
        color: 'bg-green-500'
      },
      {
        id: 'mttr',
        name: 'Mean Time To Repair',
        value: 1.2,
        unit: 'hours',
        target: 2.0,
        trend: { value: 0.3, positive: false },
        category: 'maintenance',
        color: 'bg-yellow-500'
      },
      {
        id: 'energy_efficiency',
        name: 'Energy Efficiency',
        value: 92.4,
        unit: '%',
        target: 85,
        trend: { value: 3.7, positive: true },
        category: 'energy',
        color: 'bg-purple-500'
      }
    ],
    sites: [
      {
        id: 'manufacturing-floor-a',
        name: 'Manufacturing Floor A',
        devices: 89,
        uptime: 96.2,
        efficiency: 91.3,
        alerts: 3,
        status: 'optimal'
      },
      {
        id: 'warehouse-b',
        name: 'Warehouse B',
        devices: 67,
        uptime: 93.8,
        efficiency: 85.7,
        alerts: 5,
        status: 'good'
      },
      {
        id: 'assembly-line-c',
        name: 'Assembly Line C',
        devices: 91,
        uptime: 91.5,
        efficiency: 88.2,
        alerts: 4,
        status: 'warning'
      }
    ],
    deviceCategories: [
      { name: 'Production Equipment', count: 145, uptime: 94.8, efficiency: 89.2 },
      { name: 'Environmental Sensors', count: 56, uptime: 98.1, efficiency: 95.4 },
      { name: 'Security Systems', count: 32, uptime: 99.2, efficiency: 97.8 },
      { name: 'Energy Monitoring', count: 14, uptime: 96.7, efficiency: 92.1 }
    ],
    trends: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        uptime: 90 + Math.random() * 8,
        performance: 80 + Math.random() * 15,
        energy: 85 + Math.random() * 10,
        alerts: Math.floor(Math.random() * 5)
      })),
      daily: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        uptime: 88 + Math.random() * 10,
        performance: 82 + Math.random() * 12,
        energy: 86 + Math.random() * 8,
        incidents: Math.floor(Math.random() * 3)
      }))
    },
    alerts: [
      {
        id: 1,
        severity: 'critical',
        type: 'equipment_failure',
        device: 'Conveyor Belt #3',
        site: 'Manufacturing Floor A',
        message: 'Motor overheating detected',
        timestamp: '2 minutes ago',
        impact: 'Production line stopped'
      },
      {
        id: 2,
        severity: 'warning',
        type: 'performance_degradation',
        device: 'Robotic Arm #7',
        site: 'Assembly Line C',
        message: 'Performance below threshold',
        timestamp: '15 minutes ago',
        impact: 'Reduced throughput'
      },
      {
        id: 3,
        severity: 'info',
        type: 'maintenance_due',
        device: 'Air Compressor #2',
        site: 'Warehouse B',
        message: 'Scheduled maintenance required',
        timestamp: '1 hour ago',
        impact: 'No immediate impact'
      }
    ]
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    target, 
    trend, 
    icon: Icon,
    color,
    kpiId,
    onTargetUpdate
  }: {
    title: string;
    value: number;
    unit: string;
    target?: number;
    trend?: { value: number; positive: boolean };
    icon: React.ComponentType<any>;
    color: string;
    kpiId?: string;
    onTargetUpdate?: (kpiId: string, newTarget: number) => void;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-100')} ${color.replace('bg-', 'text-')}`}>
          <Icon className="h-6 w-6" />
        </div>
        {target && (
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              {target}{unit}
              {kpiId && onTargetUpdate && (
                <button
                  onClick={() => {
                    const newTarget = prompt(`Update target for ${title}:`, target.toString());
                    if (newTarget && !isNaN(Number(newTarget))) {
                      onTargetUpdate(kpiId, Number(newTarget));
                    }
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className="flex items-baseline mt-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
        
        {trend && (
          <div className="flex items-center mt-2">
            {trend.positive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
        
        {target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress to target</span>
              <span>{Math.round((value / target) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div 
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const TrendChart = () => {
    const data = timeRange === '24h' ? analyticsData.trends.hourly : analyticsData.trends.daily;
    const maxValue = Math.max(...data.map(d => Math.max(d.uptime, d.performance, d.energy)));
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Performance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Energy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-1">
            {data.map((point, index) => {
              const uptimeHeight = (point.uptime / maxValue) * 100;
              const performanceHeight = (point.performance / maxValue) * 100;
              const energyHeight = (point.energy / maxValue) * 100;
              
              const label = timeRange === '24h' && 'hour' in point 
                ? `${point.hour}:00` 
                : 'day' in point 
                ? `Day ${point.day}` 
                : `Point ${index + 1}`;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                  <div className="w-full flex flex-col space-y-1">
                    <div
                      className="w-full bg-blue-500 rounded-t opacity-80"
                      style={{ height: `${uptimeHeight}%` }}
                      title={`Uptime: ${point.uptime.toFixed(1)}%`}
                    ></div>
                    <div
                      className="w-full bg-green-500 opacity-80"
                      style={{ height: `${performanceHeight}%` }}
                      title={`Performance: ${point.performance.toFixed(1)}%`}
                    ></div>
                    <div
                      className="w-full bg-purple-500 rounded-b opacity-80"
                      style={{ height: `${energyHeight}%` }}
                      title={`Energy: ${point.energy.toFixed(1)}%`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SitePerformance = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Site Performance</h3>
          <button
            onClick={() => window.alert('Opening site comparison view...')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Compare Sites
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {analyticsData.sites.map((site) => (
            <div key={site.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{site.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{site.devices} devices</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    site.status === 'optimal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    site.status === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {site.status.toUpperCase()}
                  </div>
                  <button
                    onClick={() => window.alert(`Opening detailed view for ${site.name}...`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{site.uptime}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Efficiency</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{site.efficiency}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active Alerts</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    <button
                      onClick={() => window.alert(`Showing ${site.alerts} alerts for ${site.name}`)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {site.alerts}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.alert(`Generating report for ${site.name}...`)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => window.alert(`Opening control panel for ${site.name}...`)}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    Control Panel
                  </button>
                </div>
                <button
                  onClick={() => handleSiteToggle(site.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    selectedSites.includes(site.id) 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {selectedSites.includes(site.id) ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RecentAlerts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Alerts</h3>
          <button
            onClick={() => window.alert('Opening alert management panel...')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Manage All
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {analyticsData.alerts.map((alertItem) => (
            <div key={alertItem.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                alertItem.severity === 'critical' ? 'bg-red-500' :
                alertItem.severity === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alertItem.device}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{alertItem.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{alertItem.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{alertItem.site}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">• {alertItem.impact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.alert('Opening device details...')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDismissAlert(alertItem.id)}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Industrial IoT performance metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={handleAutoRefreshToggle}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                </button>
                <button
                  onClick={handleManualRefresh}
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div className="relative">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Export</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={() => handleExportData('csv')}
                        disabled={isExporting}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <span>Export as CSV</span>
                        {isExporting && <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
                      </button>
                      <button
                        onClick={() => handleExportData('excel')}
                        disabled={isExporting}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <span>Export as Excel</span>
                        {isExporting && <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
                      </button>
                      <button
                        onClick={() => handleExportData('pdf')}
                        disabled={isExporting}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                      >
                        <span>Export as PDF</span>
                        {isExporting && <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.uptime}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.efficiency}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.activeDevices}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.alerts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.kpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            title={kpi.name}
            value={kpi.value}
            unit={kpi.unit}
            target={kpi.target}
            trend={kpi.trend}
            icon={ChartBarIcon}
            color={kpi.color}
            kpiId={kpi.id}
            onTargetUpdate={handleUpdateTarget}
          />
        ))}
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart />
        <SitePerformance />
      </div>

      {/* Device Categories and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Device Categories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.deviceCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{category.count} devices</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{category.uptime}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <RecentAlerts />
      </div>
    </div>
  );
}
