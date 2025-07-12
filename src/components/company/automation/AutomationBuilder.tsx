'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  BellIcon,
  CodeBracketIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { AutomationRule, AutomationNode as AutomationNodeType, AutomationEdge } from '@/types/automation';

// Custom Node Components
const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-blue-500 text-white border-2 ${
    selected ? 'border-blue-300' : 'border-blue-500'
  }`}>
    <div className="flex items-center space-x-2">
      <BoltIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-blue-100 mt-1">{data.description}</div>
    )}
  </div>
);

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-yellow-500 text-white border-2 ${
    selected ? 'border-yellow-300' : 'border-yellow-500'
  }`}>
    <div className="flex items-center space-x-2">
      <ShieldCheckIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-yellow-100 mt-1">{data.description}</div>
    )}
  </div>
);

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-green-500 text-white border-2 ${
    selected ? 'border-green-300' : 'border-green-500'
  }`}>
    <div className="flex items-center space-x-2">
      <WrenchScrewdriverIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-green-100 mt-1">{data.description}</div>
    )}
  </div>
);

const DecisionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-purple-500 text-white border-2 ${
    selected ? 'border-purple-300' : 'border-purple-500'
  } transform rotate-45`}>
    <div className="transform -rotate-45">
      <div className="flex items-center space-x-2">
        <div className="font-medium text-sm">{data.label}</div>
      </div>
    </div>
  </div>
);

const TimerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-orange-500 text-white border-2 ${
    selected ? 'border-orange-300' : 'border-orange-500'
  }`}>
    <div className="flex items-center space-x-2">
      <ClockIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.config?.delay && (
      <div className="text-xs text-orange-100 mt-1">{data.config.delay}ms delay</div>
    )}
  </div>
);

const NotificationNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-pink-500 text-white border-2 ${
    selected ? 'border-pink-300' : 'border-pink-500'
  }`}>
    <div className="flex items-center space-x-2">
      <BellIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-pink-100 mt-1">{data.description}</div>
    )}
  </div>
);

const DataNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-gray-500 text-white border-2 ${
    selected ? 'border-gray-300' : 'border-gray-500'
  }`}>
    <div className="flex items-center space-x-2">
      <ChartBarIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-gray-100 mt-1">{data.description}</div>
    )}
  </div>
);

const LogicNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-indigo-500 text-white border-2 ${
    selected ? 'border-indigo-300' : 'border-indigo-500'
  }`}>
    <div className="flex items-center space-x-2">
      <CodeBracketIcon className="h-4 w-4" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && (
      <div className="text-xs text-indigo-100 mt-1">{data.description}</div>
    )}
  </div>
);

// Node types configuration
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  decision: DecisionNode,
  timer: TimerNode,
  notification: NotificationNode,
  data: DataNode,
  logic: LogicNode
};

interface AutomationBuilderProps {
  rule?: AutomationRule;
  onSave: (rule: AutomationRule) => void;
  onTest: (rule: AutomationRule) => void;
  onValidate: (rule: AutomationRule) => void;
  isReadOnly?: boolean;
}

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({
  rule,
  onSave,
  onTest,
  onValidate,
  isReadOnly = false
}) => {
  // Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(
    rule?.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.label,
        description: node.description,
        config: node.data.config,
        inputs: node.data.inputs,
        outputs: node.data.outputs
      }
    })) || []
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    rule?.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      label: edge.label
    })) || []
  );

  // Builder state
  const [selectedNodeType, setSelectedNodeType] = useState<string>('trigger');
  const [isRunning, setIsRunning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Node templates
  const nodeTemplates = [
    {
      type: 'trigger',
      label: 'Device Event',
      description: 'Triggers when device parameter changes',
      icon: BoltIcon,
      color: 'bg-blue-500',
      config: { deviceId: '', parameter: '', condition: 'changed' }
    },
    {
      type: 'trigger',
      label: 'Time Trigger',
      description: 'Triggers at scheduled time',
      icon: ClockIcon,
      color: 'bg-blue-500',
      config: { schedule: '0 0 * * *', timezone: 'UTC' }
    },
    {
      type: 'condition',
      label: 'Value Check',
      description: 'Checks if value meets condition',
      icon: ShieldCheckIcon,
      color: 'bg-yellow-500',
      config: { parameter: '', operator: 'equals', value: '' }
    },
    {
      type: 'condition',
      label: 'Range Check',
      description: 'Checks if value is within range',
      icon: ShieldCheckIcon,
      color: 'bg-yellow-500',
      config: { parameter: '', min: 0, max: 100 }
    },
    {
      type: 'action',
      label: 'Set Parameter',
      description: 'Sets device parameter value',
      icon: WrenchScrewdriverIcon,
      color: 'bg-green-500',
      config: { deviceId: '', parameter: '', value: '' }
    },
    {
      type: 'action',
      label: 'Send Command',
      description: 'Sends command to device',
      icon: WrenchScrewdriverIcon,
      color: 'bg-green-500',
      config: { deviceId: '', command: '', parameters: {} }
    },
    {
      type: 'decision',
      label: 'If/Else',
      description: 'Conditional branching',
      icon: CodeBracketIcon,
      color: 'bg-purple-500',
      config: { condition: '', trueAction: '', falseAction: '' }
    },
    {
      type: 'timer',
      label: 'Delay',
      description: 'Adds delay before next action',
      icon: ClockIcon,
      color: 'bg-orange-500',
      config: { delay: 1000, unit: 'milliseconds' }
    },
    {
      type: 'notification',
      label: 'Send Alert',
      description: 'Sends notification/alert',
      icon: BellIcon,
      color: 'bg-pink-500',
      config: { type: 'email', recipients: [], message: '' }
    },
    {
      type: 'data',
      label: 'Log Data',
      description: 'Logs data to system',
      icon: ChartBarIcon,
      color: 'bg-gray-500',
      config: { logLevel: 'info', message: '', data: {} }
    },
    {
      type: 'logic',
      label: 'Calculate',
      description: 'Performs calculations',
      icon: CodeBracketIcon,
      color: 'bg-indigo-500',
      config: { expression: '', variables: {} }
    }
  ];

  // Handle connection creation
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add new node
  const addNode = useCallback((template: any) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: template.type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: template.label,
        description: template.description,
        config: template.config,
        inputs: [],
        outputs: []
      }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Validate rule
  const validateRule = useCallback(() => {
    const errors: string[] = [];
    
    // Check if there's at least one trigger
    const triggers = nodes.filter(node => node.type === 'trigger');
    if (triggers.length === 0) {
      errors.push('Rule must have at least one trigger node');
    }

    // Check if there's at least one action
    const actions = nodes.filter(node => node.type === 'action');
    if (actions.length === 0) {
      errors.push('Rule must have at least one action node');
    }

    // Check for disconnected nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are not connected`);
    }

    // Check for circular dependencies
    // This is a simplified check - in practice, you'd want a more robust cycle detection
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) {
        errors.push('Circular dependency detected in automation flow');
        break;
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [nodes, edges]);

  // Run automation (simulation)
  const runAutomation = useCallback(async () => {
    if (!validateRule()) return;
    
    setIsRunning(true);
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRunning(false);
  }, [validateRule]);

  // Save rule
  const saveRule = useCallback(() => {
    if (!validateRule()) return;

    const automationRule: AutomationRule = {
      id: rule?.id || `rule_${Date.now()}`,
      name: rule?.name || 'New Automation Rule',
      description: rule?.description || '',
      category: rule?.category || 'custom',
      status: 'inactive',
      priority: rule?.priority || 'medium',
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        label: node.data.label,
        description: node.data.description,
        position: node.position,
        data: {
          config: node.data.config,
          inputs: node.data.inputs || [],
          outputs: node.data.outputs || []
        },
        isVisible: true,
        isEnabled: true,
        lastUpdated: new Date()
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || '',
        targetHandle: edge.targetHandle || '',
        type: edge.type || 'default',
        animated: edge.animated,
        style: edge.style
      })),
      variables: [],
      triggers: [],
      metadata: {
        version: '1.0.0',
        author: 'User',
        createdAt: rule?.metadata.createdAt || new Date(),
        updatedAt: new Date(),
        tags: rule?.metadata.tags || [],
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

    onSave(automationRule);
  }, [nodes, edges, rule, validateRule, onSave]);

  // Selection handler
  const onSelectionChange = useCallback((elements: any) => {
    const selectedNodes = elements.nodes;
    setSelectedNode(selectedNodes.length > 0 ? selectedNodes[0] : null);
  }, []);

  return (
    <div className="h-full flex">
      {/* Node Palette */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Node Types</h3>
        <div className="space-y-2">
          {nodeTemplates.map((template, index) => {
            const IconComponent = template.icon;
            return (
              <button
                key={index}
                onClick={() => addNode(template)}
                disabled={isReadOnly}
                className={`w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${template.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {template.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {template.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
          
          {/* Control Panel */}
          <Panel position="top-right" className="space-y-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={runAutomation}
                  disabled={isRunning || isReadOnly}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-2 rounded-lg"
                  title="Run Automation"
                >
                  {isRunning ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
                
                <button
                  onClick={validateRule}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                  title="Validate Rule"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={saveRule}
                  disabled={isReadOnly}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-2 rounded-lg"
                  title="Save Rule"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
                
                {selectedNode && !isReadOnly && (
                  <button
                    onClick={deleteSelectedNode}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                    title="Delete Selected Node"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-800 dark:text-red-200 mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="font-medium">Validation Errors</span>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Node Info */}
              {selectedNode && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    Selected Node
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div><strong>Type:</strong> {selectedNode.type}</div>
                    <div><strong>Label:</strong> {selectedNode.data.label}</div>
                    {selectedNode.data.description && (
                      <div><strong>Description:</strong> {selectedNode.data.description}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Panel>
          
          {/* Flow Statistics */}
          <Panel position="bottom-right">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div>Nodes: {nodes.length}</div>
                <div>Connections: {edges.length}</div>
                <div>Status: {validationErrors.length === 0 ? 'Valid' : 'Invalid'}</div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrapped component with ReactFlowProvider
export const AutomationBuilderWrapper: React.FC<AutomationBuilderProps> = (props) => (
  <ReactFlowProvider>
    <AutomationBuilder {...props} />
  </ReactFlowProvider>
);
