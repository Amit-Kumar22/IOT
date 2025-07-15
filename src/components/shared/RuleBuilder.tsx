import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Play, Save, TestTube, Plus, X, Settings, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { AutomationRule, RuleBuilderProps, RuleTrigger, RuleCondition, RuleAction, ConditionType, ActionType, TestResult } from '../../types/shared-components';

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRule,
  availableDevices,
  availableConditions,
  availableActions,
  onRuleChange,
  onRuleSave,
  onRuleTest,
  readOnly = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rule, setRule] = useState<AutomationRule>(initialRule || {
    name: 'New Rule',
    description: '',
    triggers: [],
    conditions: [],
    actions: [],
    isActive: true,
  });
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Update parent when rule changes
  useEffect(() => {
    onRuleChange(rule);
  }, [rule, onRuleChange]);

  // Helper function to generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new trigger
  const addTrigger = useCallback((type: string) => {
    const newTrigger: RuleTrigger = {
      id: generateId(),
      type: type as 'device' | 'time' | 'location' | 'external',
      config: {},
    };
    setRule(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger],
    }));
  }, []);

  // Add new condition
  const addCondition = useCallback((conditionType: ConditionType) => {
    const newCondition: RuleCondition = {
      id: generateId(),
      type: conditionType.id,
      operator: conditionType.availableOperators[0] as 'equals' | 'greater' | 'less' | 'contains' | 'between',
      value: '',
      config: {},
    };
    setRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
    }));
  }, []);

  // Add new action
  const addAction = useCallback((actionType: ActionType) => {
    const newAction: RuleAction = {
      id: generateId(),
      type: actionType.id,
      target: '',
      config: {},
    };
    setRule(prev => ({
      ...prev,
      actions: [...prev.actions, newAction],
    }));
  }, []);

  // Remove node
  const removeNode = useCallback((id: string, type: 'trigger' | 'condition' | 'action') => {
    setRule(prev => {
      switch (type) {
        case 'trigger':
          return { ...prev, triggers: prev.triggers.filter(item => item.id !== id) };
        case 'condition':
          return { ...prev, conditions: prev.conditions.filter(item => item.id !== id) };
        case 'action':
          return { ...prev, actions: prev.actions.filter(item => item.id !== id) };
        default:
          return prev;
      }
    });
  }, []);

  // Test rule
  const testRule = useCallback(async () => {
    if (!onRuleTest || readOnly) return;
    
    setIsTestRunning(true);
    try {
      const result = await onRuleTest(rule);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        steps: [],
      });
    } finally {
      setIsTestRunning(false);
    }
  }, [rule, onRuleTest, readOnly]);

  // Save rule
  const saveRule = useCallback(() => {
    if (!onRuleSave || readOnly) return;
    onRuleSave(rule);
  }, [rule, onRuleSave, readOnly]);

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag handling
  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedItem(null);
    // Handle drop logic here
  };

  return (
    <div className={`rule-builder bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={rule.name}
              onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              disabled={readOnly}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rule.isActive}
                onChange={(e) => setRule(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={readOnly}
              />
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={zoomOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            {/* Action Buttons */}
            {!readOnly && (
              <>
                <button
                  onClick={testRule}
                  disabled={isTestRunning}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-1"
                >
                  <TestTube className="w-4 h-4" />
                  {isTestRunning ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={saveRule}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-2">
          <input
            type="text"
            value={rule.description || ''}
            onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Rule description..."
            className="w-full text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Component Palette */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Triggers */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Triggers</h3>
              <div className="space-y-1">
                {['device', 'time', 'location', 'external'].map((type) => (
                  <DraggableItem
                    key={type}
                    id={`trigger-${type}`}
                    type="trigger"
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    onAdd={() => addTrigger(type)}
                    disabled={readOnly}
                  />
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conditions</h3>
              <div className="space-y-1">
                {availableConditions.map((condition) => (
                  <DraggableItem
                    key={condition.id}
                    id={`condition-${condition.id}`}
                    type="condition"
                    label={condition.name}
                    onAdd={() => addCondition(condition)}
                    disabled={readOnly}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
              <div className="space-y-1">
                {availableActions.map((action) => (
                  <DraggableItem
                    key={action.id}
                    id={`action-${action.id}`}
                    type="action"
                    label={action.name}
                    onAdd={() => addAction(action)}
                    disabled={readOnly}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div
              ref={canvasRef}
              className="w-full h-full bg-gray-100 relative"
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center',
              }}
            >
              {/* Canvas Content */}
              <div className="absolute inset-0 p-8">
                <div className="flex flex-col space-y-8">
                  {/* Triggers Section */}
                  <RuleSection
                    title="Triggers"
                    items={rule.triggers}
                    type="trigger"
                    onRemove={(id) => removeNode(id, 'trigger')}
                    onSelect={setSelectedNode}
                    selectedNode={selectedNode}
                    readOnly={readOnly}
                  />

                  {/* Conditions Section */}
                  <RuleSection
                    title="Conditions"
                    items={rule.conditions}
                    type="condition"
                    onRemove={(id) => removeNode(id, 'condition')}
                    onSelect={setSelectedNode}
                    selectedNode={selectedNode}
                    readOnly={readOnly}
                  />

                  {/* Actions Section */}
                  <RuleSection
                    title="Actions"
                    items={rule.actions}
                    type="action"
                    onRemove={(id) => removeNode(id, 'action')}
                    onSelect={setSelectedNode}
                    selectedNode={selectedNode}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          </DndContext>
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-gray-700">Test Results</h3>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {testResult.success ? 'Success' : 'Failed'}
            </div>
            <span className="text-xs text-gray-500">
              {testResult.executionTime}ms
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {testResult.message}
          </div>
          
          {testResult.steps.length > 0 && (
            <div className="space-y-1">
              {testResult.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    step.result === 'success' ? 'bg-green-500' :
                    step.result === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-gray-700">{step.step}</span>
                  <span className="text-gray-500">{step.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Draggable Item Component
interface DraggableItemProps {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  label: string;
  onAdd: () => void;
  disabled?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, type, label, onAdd, disabled }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getTypeColor = () => {
    switch (type) {
      case 'trigger': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'condition': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'action': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${getTypeColor()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={disabled ? undefined : onAdd}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {!disabled && (
          <Plus className="w-3 h-3 opacity-50" />
        )}
      </div>
    </div>
  );
};

// Rule Section Component
interface RuleSectionProps {
  title: string;
  items: any[];
  type: 'trigger' | 'condition' | 'action';
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selectedNode: string | null;
  readOnly: boolean;
}

const RuleSection: React.FC<RuleSectionProps> = ({ 
  title, 
  items, 
  type, 
  onRemove, 
  onSelect, 
  selectedNode,
  readOnly 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${type}-section`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] border-2 border-dashed rounded-lg p-4 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <RuleNode
            key={item.id}
            item={item}
            type={type}
            onRemove={() => onRemove(item.id)}
            onSelect={() => onSelect(item.id)}
            isSelected={selectedNode === item.id}
            readOnly={readOnly}
          />
        ))}
        
        {items.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Drop {type}s here or click from the palette
          </div>
        )}
      </div>
    </div>
  );
};

// Rule Node Component
interface RuleNodeProps {
  item: any;
  type: 'trigger' | 'condition' | 'action';
  onRemove: () => void;
  onSelect: () => void;
  isSelected: boolean;
  readOnly: boolean;
}

const RuleNode: React.FC<RuleNodeProps> = ({ 
  item, 
  type, 
  onRemove, 
  onSelect, 
  isSelected,
  readOnly 
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'trigger': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'condition': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'action': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all ${getTypeColor()} ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{item.type || 'Unknown'}</div>
          {item.target && (
            <div className="text-xs text-gray-600 mt-1">Target: {item.target}</div>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 text-red-500 hover:bg-red-100 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleBuilder;
