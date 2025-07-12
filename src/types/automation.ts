/**
 * Automation Builder Types
 * Comprehensive type definitions for industrial automation rules and workflows
 */

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'decision' | 'timer' | 'data' | 'logic' | 'notification';
  subtype?: string;
  label: string;
  description?: string;
  position: { x: number; y: number };
  data: {
    config: Record<string, any>;
    inputs: AutomationPort[];
    outputs: AutomationPort[];
    properties?: Record<string, any>;
  };
  disabled?: boolean;
  error?: string;
  lastExecuted?: Date;
  executionCount?: number;
}

export interface AutomationPort {
  id: string;
  name: string;
  type: 'data' | 'control' | 'event';
  dataType?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  defaultValue?: any;
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: 'default' | 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  label?: string;
  data?: {
    condition?: string;
    delay?: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'optimization' | 'maintenance' | 'quality' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'testing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  variables: AutomationVariable[];
  triggers: AutomationTrigger[];
  schedule?: AutomationSchedule;
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    dependencies: string[];
  };
  execution: {
    mode: 'manual' | 'automatic';
    retryCount: number;
    timeout: number; // seconds
    lastRun?: Date;
    nextRun?: Date;
    executionHistory: AutomationExecution[];
  };
  testing: {
    testRuns: AutomationTestRun[];
    mockData: Record<string, any>;
    validationRules: AutomationValidation[];
  };
}

export interface AutomationVariable {
  id: string;
  name: string;
  type: 'global' | 'local' | 'system' | 'device';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  defaultValue?: any;
  description?: string;
  scope: 'rule' | 'workflow' | 'global';
  persistent: boolean;
  readOnly?: boolean;
}

export interface AutomationTrigger {
  id: string;
  type: 'device_event' | 'time_based' | 'data_threshold' | 'manual' | 'external_api' | 'alarm';
  config: {
    deviceId?: string;
    parameter?: string;
    condition?: 'equals' | 'greater_than' | 'less_than' | 'between' | 'changed' | 'matches';
    value?: any;
    schedule?: string; // cron expression
    webhook?: string;
    debounceTime?: number; // milliseconds
  };
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AutomationSchedule {
  type: 'cron' | 'interval' | 'once';
  expression: string; // cron expression or interval in seconds
  timezone: string;
  startDate?: Date;
  endDate?: Date;
  enabled: boolean;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  trigger: string;
  nodeExecutions: NodeExecution[];
  output?: any;
  error?: string;
  metrics: {
    duration: number; // milliseconds
    nodesExecuted: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface NodeExecution {
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration: number; // milliseconds
}

export interface AutomationTestRun {
  id: string;
  ruleId: string;
  name: string;
  description?: string;
  mockData: Record<string, any>;
  expectedOutput: any;
  actualOutput?: any;
  status: 'passed' | 'failed' | 'pending';
  runTime: Date;
  duration: number; // milliseconds
  assertions: TestAssertion[];
}

export interface TestAssertion {
  id: string;
  description: string;
  type: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'type_check';
  expected: any;
  actual?: any;
  passed: boolean;
  error?: string;
}

export interface AutomationValidation {
  id: string;
  type: 'syntax' | 'logic' | 'safety' | 'performance' | 'dependency';
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  suggestion?: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  template: Partial<AutomationRule>;
  preview: string; // base64 image or URL
  documentation: string;
  examples: AutomationExample[];
}

export interface AutomationExample {
  id: string;
  name: string;
  description: string;
  useCase: string;
  mockData: Record<string, any>;
  expectedOutput: any;
}

export interface AutomationLibrary {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  nodes: AutomationNodeDefinition[];
  functions: AutomationFunction[];
  documentation: string;
  dependencies: string[];
}

export interface AutomationNodeDefinition {
  id: string;
  type: string;
  subtype: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  inputs: AutomationPort[];
  outputs: AutomationPort[];
  properties: AutomationProperty[];
  validation: AutomationValidation[];
  examples: string[];
}

export interface AutomationProperty {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'object' | 'array' | 'code';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string; // JavaScript function
  };
  description?: string;
  group?: string;
}

export interface AutomationFunction {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: AutomationParameter[];
  returnType: string;
  code: string;
  examples: string[];
  documentation: string;
}

export interface AutomationParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  rules: string[]; // rule IDs
  sequence: WorkflowStep[];
  status: 'active' | 'inactive' | 'error';
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

export interface WorkflowStep {
  id: string;
  ruleId: string;
  type: 'sequential' | 'parallel' | 'conditional';
  condition?: string;
  delay?: number; // milliseconds
  retryOnFailure: boolean;
  maxRetries: number;
  dependencies: string[]; // step IDs that must complete first
}

export interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  mostUsedNodes: { nodeType: string; count: number }[];
  performanceByRule: { ruleId: string; avgDuration: number; execCount: number }[];
  errorFrequency: { error: string; count: number; lastOccurrence: Date }[];
  systemLoad: {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    queuedTasks: number;
  };
}

export interface AutomationAlert {
  id: string;
  type: 'rule_failure' | 'performance_degradation' | 'system_overload' | 'security_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actions: AutomationAlertAction[];
}

export interface AutomationAlertAction {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'disable_rule' | 'restart_service';
  config: Record<string, any>;
  executed: boolean;
  executedAt?: Date;
  result?: any;
  error?: string;
}

// Export types for external use
export type AutomationNodeType = AutomationNode['type'];
export type AutomationRuleStatus = AutomationRule['status'];
export type AutomationTriggerType = AutomationTrigger['type'];
export type AutomationExecutionStatus = AutomationExecution['status'];
