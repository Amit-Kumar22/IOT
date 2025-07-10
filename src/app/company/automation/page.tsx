'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  CpuChipIcon,
  FireIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

/**
 * Company Automation Page - Industrial Process Automation
 * Advanced automation workflows, scheduling, and process control for industrial environments
 */
export default function CompanyAutomation() {
  // Mock industrial automation data - moved to top
  const automationData = {
    workflows: [
      {
        id: 'production-startup',
        name: 'Production Line Startup Sequence',
        description: 'Automated startup procedure for production line A with safety checks',
        status: 'active',
        type: 'process',
        priority: 'high',
        triggers: [
          { type: 'schedule', value: 'Daily at 06:00' },
          { type: 'manual', value: 'Operator override' }
        ],
        conditions: [
          { type: 'safety', check: 'Emergency stops clear', status: 'pass' },
          { type: 'environmental', check: 'Temperature < 45°C', status: 'pass' },
          { type: 'maintenance', check: 'No active maintenance windows', status: 'pass' }
        ],
        actions: [
          { step: 1, action: 'Initialize safety systems', duration: '30s', status: 'completed' },
          { step: 2, action: 'Start air compressors', duration: '60s', status: 'completed' },
          { step: 3, action: 'Prime hydraulic systems', duration: '90s', status: 'running' },
          { step: 4, action: 'Start conveyor belts', duration: '45s', status: 'pending' },
          { step: 5, action: 'Initialize quality scanners', duration: '30s', status: 'pending' }
        ],
        lastRun: '2024-12-10 06:00:00',
        nextRun: '2024-12-11 06:00:00',
        successRate: 98.5,
        avgDuration: '4.2 minutes'
      },
      {
        id: 'quality-control-check',
        name: 'Automated Quality Control',
        description: 'Continuous quality monitoring with automatic rejection handling',
        status: 'active',
        type: 'monitoring',
        priority: 'critical',
        triggers: [
          { type: 'continuous', value: 'Every product scan' },
          { type: 'threshold', value: 'Defect rate > 5%' }
        ],
        conditions: [
          { type: 'equipment', check: 'Quality scanners operational', status: 'pass' },
          { type: 'calibration', check: 'Last calibration < 24h', status: 'warning' }
        ],
        actions: [
          { step: 1, action: 'Scan product quality', duration: '2s', status: 'running' },
          { step: 2, action: 'Compare against standards', duration: '1s', status: 'running' },
          { step: 3, action: 'Log results to database', duration: '0.5s', status: 'running' },
          { step: 4, action: 'Reject if defective', duration: '3s', status: 'conditional' }
        ],
        lastRun: '2024-12-10 14:32:15',
        nextRun: 'Continuous',
        successRate: 99.2,
        avgDuration: '6.5 seconds'
      },
      {
        id: 'maintenance-scheduler',
        name: 'Predictive Maintenance Scheduler',
        description: 'AI-driven maintenance scheduling based on equipment condition',
        status: 'active',
        type: 'maintenance',
        priority: 'medium',
        triggers: [
          { type: 'condition', value: 'Vibration threshold exceeded' },
          { type: 'schedule', value: 'Weekly analysis' },
          { type: 'hours', value: 'Operating hours milestone' }
        ],
        conditions: [
          { type: 'sensors', check: 'Vibration sensors active', status: 'pass' },
          { type: 'analysis', check: 'AI model updated', status: 'pass' },
          { type: 'schedule', check: 'Maintenance window available', status: 'warning' }
        ],
        actions: [
          { step: 1, action: 'Analyze sensor data', duration: '30s', status: 'completed' },
          { step: 2, action: 'Run AI prediction model', duration: '60s', status: 'completed' },
          { step: 3, action: 'Generate maintenance schedule', duration: '15s', status: 'completed' },
          { step: 4, action: 'Notify maintenance team', duration: '5s', status: 'completed' }
        ],
        lastRun: '2024-12-10 12:00:00',
        nextRun: '2024-12-17 12:00:00',
        successRate: 94.8,
        avgDuration: '1.8 minutes'
      },
      {
        id: 'energy-optimization',
        name: 'Energy Consumption Optimizer',
        description: 'Dynamic energy management based on production demands',
        status: 'paused',
        type: 'optimization',
        priority: 'low',
        triggers: [
          { type: 'schedule', value: 'Every 15 minutes during production' },
          { type: 'threshold', value: 'Energy cost > $50/hour' }
        ],
        conditions: [
          { type: 'production', check: 'Production line active', status: 'fail' },
          { type: 'grid', check: 'Grid pricing data available', status: 'pass' }
        ],
        actions: [
          { step: 1, action: 'Monitor energy consumption', duration: '5s', status: 'pending' },
          { step: 2, action: 'Analyze production requirements', duration: '10s', status: 'pending' },
          { step: 3, action: 'Optimize equipment power states', duration: '30s', status: 'pending' }
        ],
        lastRun: '2024-12-09 16:45:00',
        nextRun: 'Paused',
        successRate: 87.3,
        avgDuration: '45 seconds'
      }
    ],
    schedules: [
      {
        id: 'daily-startup',
        name: 'Daily Production Startup',
        frequency: 'Daily',
        time: '06:00',
        timezone: 'EST',
        workflows: ['production-startup'],
        active: true,
        lastExecution: '2024-12-10 06:00:00',
        nextExecution: '2024-12-11 06:00:00',
        executionCount: 1247
      },
      {
        id: 'weekly-maintenance',
        name: 'Weekly Maintenance Check',
        frequency: 'Weekly',
        time: 'Sunday 02:00',
        timezone: 'EST',
        workflows: ['maintenance-scheduler'],
        active: true,
        lastExecution: '2024-12-08 02:00:00',
        nextExecution: '2024-12-15 02:00:00',
        executionCount: 52
      },
      {
        id: 'shift-handover',
        name: 'Shift Handover Process',
        frequency: 'Every 8 hours',
        time: '06:00, 14:00, 22:00',
        timezone: 'EST',
        workflows: ['quality-control-check'],
        active: true,
        lastExecution: '2024-12-10 14:00:00',
        nextExecution: '2024-12-10 22:00:00',
        executionCount: 4685
      }
    ],
    rules: [
      {
        id: 'emergency-stop-rule',
        name: 'Emergency Stop Response',
        trigger: 'Emergency stop activated',
        condition: 'Any safety sensor triggered',
        action: 'Halt all production workflows',
        priority: 'critical',
        active: true,
        executionCount: 3
      },
      {
        id: 'temperature-alert-rule',
        name: 'High Temperature Alert',
        trigger: 'Temperature > 50°C',
        condition: 'For more than 5 minutes',
        action: 'Reduce equipment speed by 25%',
        priority: 'high',
        active: true,
        executionCount: 127
      },
      {
        id: 'efficiency-optimization',
        name: 'Production Efficiency Optimizer',
        trigger: 'Efficiency < 85% for 30 minutes',
        condition: 'No active maintenance',
        action: 'Run optimization workflow',
        priority: 'medium',
        active: false,
        executionCount: 45
      }
    ]
  };

  const [activeTab, setActiveTab] = useState('workflows');
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflows, setWorkflows] = useState(automationData.workflows);
  const [schedules, setSchedules] = useState(automationData.schedules);
  const [rules, setRules] = useState(automationData.rules);

  // Handle workflow actions
  const handleWorkflowAction = async (workflowId: string, action: 'start' | 'pause' | 'stop') => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'stopped' }
        : workflow
    ));
    
    console.log(`Workflow ${workflowId} ${action}ed`);
    alert(`Workflow ${action}ed successfully!`);
    setIsProcessing(false);
  };

  // Handle workflow editing
  const handleEditWorkflow = (workflowId: string) => {
    console.log(`Editing workflow: ${workflowId}`);
    alert(`Opening workflow editor for ${workflowId}`);
  };

  // Handle workflow duplication
  const handleDuplicateWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      const newWorkflow = {
        ...workflow,
        id: `${workflowId}-copy`,
        name: `${workflow.name} (Copy)`,
        status: 'stopped'
      };
      setWorkflows(prev => [...prev, newWorkflow]);
      console.log(`Duplicated workflow: ${workflowId}`);
      alert('Workflow duplicated successfully!');
    }
  };

  // Handle creating new workflow
  const handleCreateWorkflow = () => {
    console.log('Creating new workflow...');
    alert('Opening workflow creation wizard...');
  };

  // Handle schedule actions
  const handleScheduleAction = (scheduleId: string, action: 'edit' | 'delete' | 'toggle') => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this schedule?')) {
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
        alert('Schedule deleted successfully!');
      }
    } else if (action === 'toggle') {
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, active: !schedule.active }
          : schedule
      ));
      alert('Schedule status updated!');
    } else if (action === 'edit') {
      console.log(`Editing schedule: ${scheduleId}`);
      alert(`Opening schedule editor for ${scheduleId}`);
    }
  };

  // Handle rule actions
  const handleRuleAction = (ruleId: string, action: 'edit' | 'delete' | 'toggle') => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this rule?')) {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        alert('Rule deleted successfully!');
      }
    } else if (action === 'toggle') {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, active: !rule.active }
          : rule
      ));
      alert('Rule status updated!');
    } else if (action === 'edit') {
      console.log(`Editing rule: ${ruleId}`);
      alert(`Opening rule editor for ${ruleId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'stopped': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'running': return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case 'pending': return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'conditional': return <AdjustmentsHorizontalIcon className="h-4 w-4 text-yellow-500" />;
      default: return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const WorkflowCard = ({ workflow }: { workflow: any }) => {
    const isExpanded = expandedWorkflow === workflow.id;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                {workflow.priority.toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                {workflow.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{workflow.successRate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{workflow.avgDuration}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Last Run</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(workflow.lastRun).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Next Run</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {workflow.nextRun === 'Continuous' ? 'Continuous' : new Date(workflow.nextRun).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {isExpanded ? <ChevronDownIcon className="h-4 w-4 mr-1" /> : <ChevronRightIcon className="h-4 w-4 mr-1" />}
              {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleWorkflowAction(workflow.id, 'start')}
                disabled={isProcessing || workflow.status === 'active'}
                className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                title="Start workflow"
              >
                <PlayIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                disabled={isProcessing || workflow.status === 'paused'}
                className="p-2 text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                title="Pause workflow"
              >
                <PauseIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleWorkflowAction(workflow.id, 'stop')}
                disabled={isProcessing || workflow.status === 'stopped'}
                className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                title="Stop workflow"
              >
                <StopIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleEditWorkflow(workflow.id)}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Edit workflow"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDuplicateWorkflow(workflow.id)}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Duplicate workflow"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Triggers */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Triggers</h4>
                <div className="space-y-2">
                  {workflow.triggers.map((trigger: any, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-400">{trigger.type}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{trigger.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Conditions</h4>
                <div className="space-y-2">
                  {workflow.conditions.map((condition: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          condition.status === 'pass' ? 'bg-green-500' : 
                          condition.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-900 dark:text-white">{condition.check}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        condition.status === 'pass' ? 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400' :
                        condition.status === 'warning' ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {condition.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Actions</h4>
                <div className="space-y-3">
                  {workflow.actions.map((action: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{action.step}</span>
                        {getStepStatusIcon(action.status)}
                        <span className="text-sm text-gray-900 dark:text-white">{action.action}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{action.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SchedulesList = () => (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{schedule.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {schedule.frequency} at {schedule.time} ({schedule.timezone})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleScheduleAction(schedule.id, 'toggle')}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  schedule.active ? 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
                }`}
              >
                {schedule.active ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Last Execution</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(schedule.lastExecution).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Next Execution</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(schedule.nextExecution).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Executions</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{schedule.executionCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Workflows: {schedule.workflows.join(', ')}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleScheduleAction(schedule.id, 'edit')}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Edit schedule"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleScheduleAction(schedule.id, 'delete')}
                className="p-2 text-red-600 hover:text-red-800"
                title="Delete schedule"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const RulesList = () => (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                  {rule.priority.toUpperCase()}
                </span>
                <button
                  onClick={() => handleRuleAction(rule.id, 'toggle')}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.active ? 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}
                >
                  {rule.active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Executed {rule.executionCount} times
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">Trigger:</span>
              <span className="text-sm text-gray-900 dark:text-white">{rule.trigger}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">Condition:</span>
              <span className="text-sm text-gray-900 dark:text-white">{rule.condition}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">Action:</span>
              <span className="text-sm text-gray-900 dark:text-white">{rule.action}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleRuleAction(rule.id, 'edit')}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Edit rule"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleRuleAction(rule.id, 'delete')}
                className="p-2 text-red-600 hover:text-red-800"
                title="Delete rule"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Center</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Industrial process automation and workflow management
              </p>
            </div>
            <button 
              onClick={handleCreateWorkflow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Workflow</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'workflows', name: 'Workflows', count: workflows.length },
              { id: 'schedules', name: 'Schedules', count: schedules.length },
              { id: 'rules', name: 'Rules', count: rules.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}

      {activeTab === 'schedules' && <SchedulesList />}

      {activeTab === 'rules' && <RulesList />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.filter(r => r.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
