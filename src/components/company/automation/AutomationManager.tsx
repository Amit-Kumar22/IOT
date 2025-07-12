'use client';

import React, { useState, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CogIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { AutomationRule, AutomationExecution, AutomationMetrics } from '@/types/automation';

interface AutomationManagerProps {
  rules: AutomationRule[];
  executions: AutomationExecution[];
  metrics: AutomationMetrics;
  onCreateRule: () => void;
  onEditRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onDuplicateRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onViewRule: (ruleId: string) => void;
  onViewMetrics: (ruleId: string) => void;
  onTestRule: (ruleId: string) => void;
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({
  rules,
  executions,
  metrics,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onDuplicateRule,
  onToggleRule,
  onViewRule,
  onViewMetrics,
  onTestRule
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'error'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'safety' | 'optimization' | 'maintenance' | 'quality' | 'custom'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'metrics'>('list');

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || rule.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Get rule statistics
  const getRuleStats = useCallback((ruleId: string) => {
    const ruleExecutions = executions.filter(exec => exec.ruleId === ruleId);
    const successCount = ruleExecutions.filter(exec => exec.status === 'completed').length;
    const failureCount = ruleExecutions.filter(exec => exec.status === 'failed').length;
    const avgDuration = ruleExecutions.length > 0 
      ? ruleExecutions.reduce((sum, exec) => sum + exec.metrics.duration, 0) / ruleExecutions.length 
      : 0;
    
    return {
      totalExecutions: ruleExecutions.length,
      successCount,
      failureCount,
      successRate: ruleExecutions.length > 0 ? (successCount / ruleExecutions.length) * 100 : 0,
      avgDuration
    };
  }, [executions]);

  const getStatusColor = (status: AutomationRule['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'testing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: AutomationRule['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: AutomationRule['category']) => {
    switch (category) {
      case 'safety': return ExclamationTriangleIcon;
      case 'optimization': return ChartBarIcon;
      case 'maintenance': return CogIcon;
      case 'quality': return CheckCircleIcon;
      default: return BoltIcon;
    }
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const toggleAllRules = () => {
    setSelectedRules(prev => 
      prev.length === filteredRules.length ? [] : filteredRules.map(rule => rule.id)
    );
  };

  const bulkToggleRules = (enabled: boolean) => {
    selectedRules.forEach(ruleId => {
      onToggleRule(ruleId, enabled);
    });
    setSelectedRules([]);
  };

  const bulkDeleteRules = () => {
    if (confirm(`Are you sure you want to delete ${selectedRules.length} rules?`)) {
      selectedRules.forEach(ruleId => {
        onDeleteRule(ruleId);
      });
      setSelectedRules([]);
    }
  };

  if (viewMode === 'metrics') {
    return (
      <div className="space-y-6">
        {/* Metrics Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Metrics</h2>
          <button
            onClick={() => setViewMode('list')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Rules
          </button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BoltIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Rules</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalRules}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <PlayIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Rules</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.activeRules}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((metrics.successfulExecutions / metrics.totalExecutions) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(metrics.averageExecutionTime / 1000).toFixed(2)}s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Used Nodes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Used Node Types</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {metrics.mostUsedNodes.map((node, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{node.nodeType}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(node.count / metrics.mostUsedNodes[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{node.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Frequency */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Common Errors</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {metrics.errorFrequency.map((error, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{error.error}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last: {error.lastOccurrence.toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{error.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Load */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Load</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">CPU Usage</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${metrics.systemLoad.cpuUsage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{metrics.systemLoad.cpuUsage}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Memory Usage</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${metrics.systemLoad.memoryUsage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{metrics.systemLoad.memoryUsage}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Connections</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.systemLoad.activeConnections}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Queued Tasks</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.systemLoad.queuedTasks}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Rules</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor your automation workflows
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('metrics')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>View Metrics</span>
          </button>
          <button
            onClick={onCreateRule}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
            <option value="testing">Testing</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="safety">Safety</option>
            <option value="optimization">Optimization</option>
            <option value="maintenance">Maintenance</option>
            <option value="quality">Quality</option>
            <option value="custom">Custom</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-l-lg text-sm ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-r-lg text-sm ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRules.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedRules.length} rule(s) selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => bulkToggleRules(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Enable All
              </button>
              <button
                onClick={() => bulkToggleRules(false)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Disable All
              </button>
              <button
                onClick={bulkDeleteRules}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                onChange={toggleAllRules}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {filteredRules.length} rule(s)
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRules.map((rule) => {
              const stats = getRuleStats(rule.id);
              const CategoryIcon = getCategoryIcon(rule.category);
              
              return (
                <div key={rule.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRules.includes(rule.id)}
                        onChange={() => toggleRuleSelection(rule.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <CategoryIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                            {rule.status.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                            {rule.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Nodes: {rule.nodes.length}</span>
                          <span>Executions: {stats.totalExecutions}</span>
                          <span>Success Rate: {stats.successRate.toFixed(1)}%</span>
                          <span>Avg Duration: {(stats.avgDuration / 1000).toFixed(2)}s</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Rule"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onViewMetrics(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Metrics"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onTestRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Test Rule"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit Rule"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Duplicate Rule"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleRule(rule.id, rule.status !== 'active')}
                        className={`p-2 ${
                          rule.status === 'active' 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title={rule.status === 'active' ? 'Disable Rule' : 'Enable Rule'}
                      >
                        {rule.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Delete Rule"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule) => {
            const stats = getRuleStats(rule.id);
            const CategoryIcon = getCategoryIcon(rule.category);
            
            return (
              <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="h-5 w-5 text-gray-400" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                        {rule.status.toUpperCase()}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(rule.id)}
                      onChange={() => toggleRuleSelection(rule.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{rule.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{rule.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Executions</span>
                      <span className="font-medium">{stats.totalExecutions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg Duration</span>
                      <span className="font-medium">{(stats.avgDuration / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Rule"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit Rule"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onTestRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Test Rule"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleRule(rule.id, rule.status !== 'active')}
                        className={`px-3 py-1 rounded text-sm ${
                          rule.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {rule.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No automation rules</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first automation rule.
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateRule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Automation Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
