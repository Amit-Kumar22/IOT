'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useToast } from '@/components/providers/ToastProvider';
import {
  PlusIcon,
  XMarkIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { AutomationManager } from '@/components/company/automation/AutomationManager';
import { AutomationBuilderWrapper } from '@/components/company/automation/AutomationBuilder';
import { 
  AutomationRule, 
  AutomationExecution, 
  AutomationMetrics,
  AutomationTemplate
} from '@/types/automation';

/**
 * Company Automation Page
 * Visual automation rule builder and management interface
 */
export default function CompanyAutomationPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeRules, setActiveRules] = useState<Set<string>>(new Set());

  // Mock data initialization
  useEffect(() => {
    const initializeAutomationData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock automation rules
      const mockRules: AutomationRule[] = [
        {
          id: 'rule_001',
          name: 'Temperature Safety Alert',
          description: 'Automatically sends alerts when furnace temperature exceeds safety limits',
          category: 'safety',
          status: 'active',
          priority: 'critical',
          nodes: [
            {
              id: 'trigger_001',
              type: 'trigger',
              label: 'Temperature Sensor',
              description: 'Monitors furnace temperature',
              position: { x: 100, y: 100 },
              data: {
                config: { deviceId: 'furnace_01', parameter: 'temperature', condition: 'greater_than', value: 800 },
                inputs: [],
                outputs: [{ id: 'out1', name: 'trigger', type: 'event' }]
              },
              isVisible: true,
              isEnabled: true,
              lastUpdated: new Date()
            },
            {
              id: 'action_001',
              type: 'action',
              label: 'Send Emergency Alert',
              description: 'Sends emergency notification',
              position: { x: 300, y: 100 },
              data: {
                config: { type: 'email', recipients: ['safety@company.com'], priority: 'critical' },
                inputs: [{ id: 'in1', name: 'trigger', type: 'event' }],
                outputs: []
              },
              isVisible: true,
              isEnabled: true,
              lastUpdated: new Date()
            }
          ],
          edges: [
            {
              id: 'edge_001',
              source: 'trigger_001',
              target: 'action_001',
              sourceHandle: 'out1',
              targetHandle: 'in1',
              type: 'default',
              animated: true
            }
          ],
          variables: [],
          triggers: [],
          metadata: {
            version: '1.0.0',
            author: user?.email || 'admin',
            createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
            updatedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
            tags: ['safety', 'temperature', 'alerts'],
            dependencies: []
          },
          execution: {
            mode: 'automatic',
            retryCount: 3,
            timeout: 60,
            lastRun: new Date(Date.now() - 3600000), // 1 hour ago
            nextRun: new Date(Date.now() + 3600000), // 1 hour from now
            executionHistory: []
          },
          testing: {
            testRuns: [],
            mockData: {},
            validationRules: []
          }
        },
        {
          id: 'rule_002',
          name: 'Production Line Optimization',
          description: 'Optimizes conveyor speed based on production demand and energy costs',
          category: 'optimization',
          status: 'active',
          priority: 'medium',
          nodes: [
            {
              id: 'trigger_002',
              type: 'trigger',
              label: 'Production Rate Monitor',
              position: { x: 50, y: 150 },
              data: { config: {}, inputs: [], outputs: [] },
              isVisible: true,
              isEnabled: true,
              lastUpdated: new Date()
            },
            {
              id: 'condition_001',
              type: 'condition',
              label: 'Check Peak Hours',
              position: { x: 250, y: 150 },
              data: { config: {}, inputs: [], outputs: [] },
              isVisible: true,
              isEnabled: true,
              lastUpdated: new Date()
            },
            {
              id: 'action_002',
              type: 'action',
              label: 'Adjust Speed',
              position: { x: 450, y: 150 },
              data: { config: {}, inputs: [], outputs: [] },
              isVisible: true,
              isEnabled: true,
              lastUpdated: new Date()
            }
          ],
          edges: [],
          variables: [],
          triggers: [],
          metadata: {
            version: '1.2.0',
            author: user?.email || 'admin',
            createdAt: new Date(Date.now() - 86400000 * 10),
            updatedAt: new Date(Date.now() - 86400000 * 2),
            tags: ['optimization', 'production', 'energy'],
            dependencies: []
          },
          execution: {
            mode: 'automatic',
            retryCount: 2,
            timeout: 120,
            executionHistory: []
          },
          testing: {
            testRuns: [],
            mockData: {},
            validationRules: []
          }
        },
        {
          id: 'rule_003',
          name: 'Predictive Maintenance',
          description: 'Schedules maintenance based on vibration and temperature patterns',
          category: 'maintenance',
          status: 'inactive',
          priority: 'high',
          nodes: [],
          edges: [],
          variables: [],
          triggers: [],
          metadata: {
            version: '0.8.0',
            author: user?.email || 'admin',
            createdAt: new Date(Date.now() - 86400000 * 15),
            updatedAt: new Date(Date.now() - 86400000 * 7),
            tags: ['maintenance', 'predictive', 'ml'],
            dependencies: []
          },
          execution: {
            mode: 'manual',
            retryCount: 1,
            timeout: 300,
            executionHistory: []
          },
          testing: {
            testRuns: [],
            mockData: {},
            validationRules: []
          }
        }
      ];

      // Mock execution history
      const mockExecutions: AutomationExecution[] = [
        {
          id: 'exec_001',
          ruleId: 'rule_001',
          startTime: new Date(Date.now() - 1800000), // 30 minutes ago
          endTime: new Date(Date.now() - 1799000),
          status: 'completed',
          trigger: 'temperature_threshold',
          nodeExecutions: [],
          metrics: { duration: 1000, nodesExecuted: 2 }
        },
        {
          id: 'exec_002',
          ruleId: 'rule_002',
          startTime: new Date(Date.now() - 7200000), // 2 hours ago
          endTime: new Date(Date.now() - 7195000),
          status: 'completed',
          trigger: 'schedule',
          nodeExecutions: [],
          metrics: { duration: 5000, nodesExecuted: 3 }
        },
        {
          id: 'exec_003',
          ruleId: 'rule_001',
          startTime: new Date(Date.now() - 10800000), // 3 hours ago
          status: 'failed',
          trigger: 'temperature_threshold',
          nodeExecutions: [],
          error: 'Network timeout',
          metrics: { duration: 30000, nodesExecuted: 1 }
        }
      ];

      // Mock metrics
      const mockMetrics: AutomationMetrics = {
        totalRules: mockRules.length,
        activeRules: mockRules.filter(r => r.status === 'active').length,
        totalExecutions: 156,
        successfulExecutions: 142,
        failedExecutions: 14,
        averageExecutionTime: 3500,
        mostUsedNodes: [
          { nodeType: 'trigger', count: 45 },
          { nodeType: 'action', count: 38 },
          { nodeType: 'condition', count: 32 },
          { nodeType: 'timer', count: 18 },
          { nodeType: 'notification', count: 15 }
        ],
        performanceByRule: [
          { ruleId: 'rule_001', avgDuration: 1200, execCount: 89 },
          { ruleId: 'rule_002', avgDuration: 4500, execCount: 45 },
          { ruleId: 'rule_003', avgDuration: 2100, execCount: 22 }
        ],
        errorFrequency: [
          { error: 'Network timeout', count: 8, lastOccurrence: new Date(Date.now() - 3600000) },
          { error: 'Device not responding', count: 4, lastOccurrence: new Date(Date.now() - 7200000) },
          { error: 'Invalid parameter', count: 2, lastOccurrence: new Date(Date.now() - 86400000) }
        ],
        systemLoad: {
          cpuUsage: 23,
          memoryUsage: 67,
          activeConnections: 12,
          queuedTasks: 3
        }
      };

      // Mock templates
      const mockTemplates: AutomationTemplate[] = [
        {
          id: 'template_001',
          name: 'Temperature Monitoring',
          description: 'Basic temperature monitoring with alert notifications',
          category: 'Safety',
          difficulty: 'beginner',
          tags: ['temperature', 'safety', 'alerts'],
          template: {
            name: 'Temperature Monitor',
            description: 'Monitors device temperature and sends alerts',
            category: 'safety',
            priority: 'high'
          },
          preview: '',
          documentation: 'This template creates a basic temperature monitoring rule...',
          examples: []
        },
        {
          id: 'template_002',
          name: 'Production Efficiency',
          description: 'Optimize production line efficiency based on demand',
          category: 'Optimization',
          difficulty: 'intermediate',
          tags: ['production', 'efficiency', 'optimization'],
          template: {
            name: 'Production Optimizer',
            description: 'Adjusts production parameters for optimal efficiency',
            category: 'optimization',
            priority: 'medium'
          },
          preview: '',
          documentation: 'This template optimizes production line parameters...',
          examples: []
        },
        {
          id: 'template_003',
          name: 'Predictive Maintenance',
          description: 'AI-powered predictive maintenance scheduling',
          category: 'Maintenance',
          difficulty: 'advanced',
          tags: ['maintenance', 'ai', 'predictive'],
          template: {
            name: 'Predictive Maintenance',
            description: 'Uses ML models to predict maintenance needs',
            category: 'maintenance',
            priority: 'high'
          },
          preview: '',
          documentation: 'This advanced template uses machine learning...',
          examples: []
        }
      ];

      setRules(mockRules);
      setExecutions(mockExecutions);
      setMetrics(mockMetrics);
      setTemplates(mockTemplates);
      setActiveRules(new Set(mockRules.filter(r => r.status === 'active').map(r => r.id)));
      setIsLoading(false);
    };

    initializeAutomationData();
  }, [user?.email]);

  // Rule management handlers
  const handleCreateRule = useCallback(() => {
    setEditingRule(null);
    setShowBuilder(true);
  }, []);

  const handleEditRule = useCallback((ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule(rule);
      setShowBuilder(true);
    }
  }, [rules]);

  const handleDeleteRule = useCallback((ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setRules(prev => prev.filter(r => r.id !== ruleId));
      setActiveRules(prev => {
        const newSet = new Set(prev);
        newSet.delete(ruleId);
        return newSet;
      });
      showToast({
        title: 'Rule Deleted',
        message: 'Automation rule has been deleted successfully',
        type: 'success'
      });
    }
  }, [showToast]);

  const handleDuplicateRule = useCallback((ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const duplicatedRule: AutomationRule = {
        ...rule,
        id: `rule_${Date.now()}`,
        name: `${rule.name} (Copy)`,
        status: 'inactive',
        metadata: {
          ...rule.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      setRules(prev => [...prev, duplicatedRule]);
      showToast({
        title: 'Rule Duplicated',
        message: 'Automation rule has been duplicated successfully',
        type: 'success'
      });
    }
  }, [rules, showToast]);

  const handleToggleRule = useCallback((ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: enabled ? 'active' : 'inactive' }
        : rule
    ));
    
    setActiveRules(prev => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.add(ruleId);
      } else {
        newSet.delete(ruleId);
      }
      return newSet;
    });

    showToast({
      title: enabled ? 'Rule Enabled' : 'Rule Disabled',
      message: `Automation rule has been ${enabled ? 'enabled' : 'disabled'}`,
      type: 'success'
    });
  }, [showToast]);

  const handleViewRule = useCallback((ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule(rule);
      setShowBuilder(true);
    }
  }, [rules]);

  const handleViewMetrics = useCallback((ruleId: string) => {
    // In a real implementation, this would show detailed metrics for the specific rule
    showToast({
      title: 'Metrics View',
      message: 'Detailed metrics view would be implemented here',
      type: 'info'
    });
  }, [showToast]);

  const handleTestRule = useCallback((ruleId: string) => {
    showToast({
      title: 'Testing Rule',
      message: 'Running test execution for automation rule...',
      type: 'info'
    });

    // Simulate test execution
    setTimeout(() => {
      showToast({
        title: 'Test Completed',
        message: 'Automation rule test executed successfully',
        type: 'success'
      });
    }, 3000);
  }, [showToast]);

  const handleSaveRule = useCallback((rule: AutomationRule) => {
    if (editingRule) {
      // Update existing rule
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      showToast({
        title: 'Rule Updated',
        message: 'Automation rule has been updated successfully',
        type: 'success'
      });
    } else {
      // Create new rule
      setRules(prev => [...prev, rule]);
      showToast({
        title: 'Rule Created',
        message: 'New automation rule has been created successfully',
        type: 'success'
      });
    }
    setShowBuilder(false);
    setEditingRule(null);
  }, [editingRule, showToast]);

  const handleValidateRule = useCallback((rule: AutomationRule) => {
    // Simulate rule validation
    showToast({
      title: 'Rule Validation',
      message: 'Automation rule validation completed',
      type: 'success'
    });
  }, [showToast]);

  const handleTestRuleInBuilder = useCallback((rule: AutomationRule) => {
    showToast({
      title: 'Testing Rule',
      message: 'Running test execution in builder...',
      type: 'info'
    });
  }, [showToast]);

  const handleCreateFromTemplate = useCallback((template: AutomationTemplate) => {
    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name: template.template.name || template.name,
      description: template.template.description || template.description,
      category: template.template.category || 'custom',
      status: 'inactive',
      priority: template.template.priority || 'medium',
      nodes: [],
      edges: [],
      variables: [],
      triggers: [],
      metadata: {
        version: '1.0.0',
        author: user?.email || 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: template.tags,
        dependencies: []
      },
      execution: {
        mode: 'manual',
        retryCount: 3,
        timeout: 300,
        executionHistory: []
      },
      testing: {
        testRuns: [],
        mockData: {},
        validationRules: []
      }
    };

    setEditingRule(newRule);
    setShowBuilder(true);
    setShowTemplates(false);
    
    showToast({
      title: 'Template Applied',
      message: `Created new rule from ${template.name} template`,
      type: 'success'
    });
  }, [user?.email, showToast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg text-white p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-64"></div>
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-96 animate-pulse">
          <div className="h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Automation Rules</h1>
            <p className="text-purple-100 mt-1">
              Visual automation builder for industrial workflows and processes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {activeRules.size} Active Rules
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <BoltIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Rules</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {rules.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Rules</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {activeRules.size}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {metrics ? ((metrics.successfulExecutions / metrics.totalExecutions) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {metrics ? (metrics.averageExecutionTime / 1000).toFixed(2) : 0}s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>Templates</span>
            </button>
            <button
              onClick={handleCreateRule}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Safety Rules</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {rules.filter(r => r.category === 'safety').length} active
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Optimization</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {rules.filter(r => r.category === 'optimization').length} active
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <CogIcon className="h-6 w-6 text-green-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Maintenance</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {rules.filter(r => r.category === 'maintenance').length} active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Management Interface */}
      {metrics && (
        <AutomationManager
          rules={rules}
          executions={executions}
          metrics={metrics}
          onCreateRule={handleCreateRule}
          onEditRule={handleEditRule}
          onDeleteRule={handleDeleteRule}
          onDuplicateRule={handleDuplicateRule}
          onToggleRule={handleToggleRule}
          onViewRule={handleViewRule}
          onViewMetrics={handleViewMetrics}
          onTestRule={handleTestRule}
        />
      )}

      {/* Automation Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editingRule ? `Editing: ${editingRule.name}` : 'Design your automation workflow'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setEditingRule(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <AutomationBuilderWrapper
                rule={editingRule || undefined}
                onSave={handleSaveRule}
                onTest={handleTestRuleInBuilder}
                onValidate={handleValidateRule}
                isReadOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Automation Templates</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Start with a pre-built template to speed up development
                </p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {template.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleCreateFromTemplate(template)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
