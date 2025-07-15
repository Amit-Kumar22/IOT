import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RuleBuilder from '../RuleBuilder';
import { AutomationRule, ConditionType, ActionType } from '../../../types/shared-components';

// Mock dependencies
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
  }),
  useDroppable: () => ({
    setNodeRef: () => {},
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: (array: any[], from: number, to: number) => {
    const newArray = [...array];
    newArray.splice(to, 0, newArray.splice(from, 1)[0]);
    return newArray;
  },
}));

// Mock data
const mockDevices = [
  { 
    id: 'device1', 
    name: 'Temperature Sensor', 
    type: 'sensor' as const,
    status: 'online' as const,
    signalStrength: 85,
    lastSeen: new Date(),
    isControllable: false
  },
  { 
    id: 'device2', 
    name: 'Smart Light', 
    type: 'light' as const,
    status: 'online' as const,
    signalStrength: 92,
    lastSeen: new Date(),
    isControllable: true
  },
  { 
    id: 'device3', 
    name: 'Motion Detector', 
    type: 'sensor' as const,
    status: 'offline' as const,
    signalStrength: 70,
    lastSeen: new Date(),
    isControllable: false
  },
];

const mockConditions: ConditionType[] = [
  {
    id: 'temperature',
    name: 'Temperature Check',
    description: 'Check temperature value',
    category: 'sensor',
    availableOperators: ['greater', 'less', 'equals'],
    valueType: 'number',
  },
  {
    id: 'time',
    name: 'Time Condition',
    description: 'Check time of day',
    category: 'time',
    availableOperators: ['equals', 'between'],
    valueType: 'datetime',
  },
];

const mockActions: ActionType[] = [
  {
    id: 'light_control',
    name: 'Control Light',
    description: 'Turn light on/off',
    category: 'device',
    requiredParams: ['deviceId', 'state'],
    optionalParams: ['brightness'],
  },
  {
    id: 'notification',
    name: 'Send Notification',
    description: 'Send push notification',
    category: 'alert',
    requiredParams: ['message'],
    optionalParams: ['title', 'priority'],
  },
];

const mockRule: AutomationRule = {
  id: 'test-rule',
  name: 'Test Rule',
  description: 'A test automation rule',
  triggers: [
    {
      id: 'trigger1',
      type: 'device',
      config: { deviceId: 'device1', property: 'temperature' },
    },
  ],
  conditions: [
    {
      id: 'condition1',
      type: 'temperature',
      operator: 'greater',
      value: 25,
      config: { threshold: 25 },
    },
  ],
  actions: [
    {
      id: 'action1',
      type: 'light_control',
      target: 'device2',
      config: { state: 'on', brightness: 100 },
    },
  ],
  isActive: true,
};

const defaultProps = {
  availableDevices: mockDevices,
  availableConditions: mockConditions,
  availableActions: mockActions,
  onRuleChange: jest.fn(),
  onRuleSave: jest.fn(),
  onRuleTest: jest.fn(),
};

describe('RuleBuilder Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders rule builder with default state', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      expect(screen.getByDisplayValue('New Rule')).toBeInTheDocument();
      expect(screen.getByText('Triggers')).toBeInTheDocument();
      expect(screen.getByText('Conditions')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders with initial rule', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      expect(screen.getByDisplayValue('Test Rule')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test automation rule')).toBeInTheDocument();
    });

    it('renders component palette', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Temperature Check')).toBeInTheDocument();
      expect(screen.getByText('Control Light')).toBeInTheDocument();
    });

    it('renders zoom controls', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
      expect(screen.getByTitle('Reset View')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders action buttons when not read-only', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('hides action buttons when read-only', () => {
      render(<RuleBuilder {...defaultProps} readOnly={true} />);
      
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('Rule Management', () => {
    it('updates rule name', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const nameInput = screen.getByDisplayValue('New Rule');
      fireEvent.change(nameInput, { target: { value: 'Updated Rule' } });
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated Rule' })
      );
    });

    it('updates rule description', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const descInput = screen.getByPlaceholderText('Rule description...');
      fireEvent.change(descInput, { target: { value: 'New description' } });
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'New description' })
      );
    });

    it('toggles rule active state', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const activeCheckbox = screen.getByRole('checkbox');
      fireEvent.click(activeCheckbox);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });

    it('prevents editing when read-only', () => {
      render(<RuleBuilder {...defaultProps} readOnly={true} />);
      
      const nameInput = screen.getByDisplayValue('New Rule');
      const descInput = screen.getByPlaceholderText('Rule description...');
      const activeCheckbox = screen.getByRole('checkbox');
      
      expect(nameInput).toBeDisabled();
      expect(descInput).toBeDisabled();
      expect(activeCheckbox).toBeDisabled();
    });
  });

  describe('Trigger Management', () => {
    it('adds device trigger', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const deviceTrigger = screen.getByText('Device');
      fireEvent.click(deviceTrigger);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          triggers: expect.arrayContaining([
            expect.objectContaining({ type: 'device' })
          ])
        })
      );
    });

    it('adds time trigger', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const timeTrigger = screen.getByText('Time');
      fireEvent.click(timeTrigger);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          triggers: expect.arrayContaining([
            expect.objectContaining({ type: 'time' })
          ])
        })
      );
    });

    it('adds location trigger', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const locationTrigger = screen.getByText('Location');
      fireEvent.click(locationTrigger);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          triggers: expect.arrayContaining([
            expect.objectContaining({ type: 'location' })
          ])
        })
      );
    });

    it('adds external trigger', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const externalTrigger = screen.getByText('External');
      fireEvent.click(externalTrigger);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          triggers: expect.arrayContaining([
            expect.objectContaining({ type: 'external' })
          ])
        })
      );
    });

    it('displays existing triggers', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      expect(screen.getByText('device')).toBeInTheDocument();
    });

    it('removes trigger', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} onRuleChange={onRuleChange} />);
      
      const removeButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );
      
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(onRuleChange).toHaveBeenCalledWith(
          expect.objectContaining({ triggers: [] })
        );
      }
    });
  });

  describe('Condition Management', () => {
    it('adds condition from palette', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const conditionItem = screen.getByText('Temperature Check');
      fireEvent.click(conditionItem);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining([
            expect.objectContaining({ type: 'temperature' })
          ])
        })
      );
    });

    it('displays existing conditions', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      expect(screen.getByText('temperature')).toBeInTheDocument();
    });

    it('removes condition', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} onRuleChange={onRuleChange} />);
      
      // Find and click remove button for condition
      const conditionSection = screen.getByText('temperature').closest('div');
      const removeButton = conditionSection?.querySelector('button');
      
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(onRuleChange).toHaveBeenCalledWith(
          expect.objectContaining({ conditions: [] })
        );
      }
    });
  });

  describe('Action Management', () => {
    it('adds action from palette', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleChange={onRuleChange} />);
      
      const actionItem = screen.getByText('Control Light');
      fireEvent.click(actionItem);
      
      expect(onRuleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          actions: expect.arrayContaining([
            expect.objectContaining({ type: 'light_control' })
          ])
        })
      );
    });

    it('displays existing actions', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      expect(screen.getByText('light_control')).toBeInTheDocument();
    });

    it('removes action', () => {
      const onRuleChange = jest.fn();
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} onRuleChange={onRuleChange} />);
      
      // Find and click remove button for action
      const actionSection = screen.getByText('light_control').closest('div');
      const removeButton = actionSection?.querySelector('button');
      
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(onRuleChange).toHaveBeenCalledWith(
          expect.objectContaining({ actions: [] })
        );
      }
    });
  });

  describe('Zoom and Pan Controls', () => {
    it('zooms in when zoom in button is clicked', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const zoomInButton = screen.getByTitle('Zoom In');
      fireEvent.click(zoomInButton);
      
      expect(screen.getByText('120%')).toBeInTheDocument();
    });

    it('zooms out when zoom out button is clicked', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const zoomOutButton = screen.getByTitle('Zoom Out');
      fireEvent.click(zoomOutButton);
      
      expect(screen.getByText('83%')).toBeInTheDocument();
    });

    it('resets zoom when reset button is clicked', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      // First zoom in
      const zoomInButton = screen.getByTitle('Zoom In');
      fireEvent.click(zoomInButton);
      
      // Then reset
      const resetButton = screen.getByTitle('Reset View');
      fireEvent.click(resetButton);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('limits zoom to maximum value', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const zoomInButton = screen.getByTitle('Zoom In');
      
      // Click zoom in many times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomInButton);
      }
      
      expect(screen.getByText('300%')).toBeInTheDocument();
    });

    it('limits zoom to minimum value', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const zoomOutButton = screen.getByTitle('Zoom Out');
      
      // Click zoom out many times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomOutButton);
      }
      
      expect(screen.getByText('30%')).toBeInTheDocument();
    });
  });

  describe('Rule Testing', () => {
    it('calls onRuleTest when test button is clicked', async () => {
      const onRuleTest = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test passed',
        executionTime: 150,
        steps: [],
      });
      
      render(<RuleBuilder {...defaultProps} onRuleTest={onRuleTest} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      expect(onRuleTest).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Rule' })
      );
    });

    it('shows test results on success', async () => {
      const onRuleTest = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test passed successfully',
        executionTime: 150,
        steps: [
          { step: 'Step 1', result: 'success', message: 'OK' },
          { step: 'Step 2', result: 'success', message: 'OK' },
        ],
      });
      
      render(<RuleBuilder {...defaultProps} onRuleTest={onRuleTest} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Results')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Test passed successfully')).toBeInTheDocument();
        expect(screen.getByText('150ms')).toBeInTheDocument();
      });
    });

    it('shows test results on failure', async () => {
      const onRuleTest = jest.fn().mockResolvedValue({
        success: false,
        message: 'Test failed',
        executionTime: 75,
        steps: [
          { step: 'Step 1', result: 'success', message: 'OK' },
          { step: 'Step 2', result: 'failure', message: 'Failed' },
        ],
      });
      
      render(<RuleBuilder {...defaultProps} onRuleTest={onRuleTest} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByText('Test failed')).toBeInTheDocument();
      });
    });

    it('shows testing state', async () => {
      const onRuleTest = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<RuleBuilder {...defaultProps} onRuleTest={onRuleTest} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });

    it('handles test errors gracefully', async () => {
      const onRuleTest = jest.fn().mockRejectedValue(new Error('Test error'));
      
      render(<RuleBuilder {...defaultProps} onRuleTest={onRuleTest} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });

  describe('Rule Saving', () => {
    it('calls onRuleSave when save button is clicked', () => {
      const onRuleSave = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleSave={onRuleSave} />);
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(onRuleSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Rule' })
      );
    });

    it('saves rule with current state', () => {
      const onRuleSave = jest.fn();
      render(<RuleBuilder {...defaultProps} onRuleSave={onRuleSave} initialRule={mockRule} />);
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(onRuleSave).toHaveBeenCalledWith(mockRule);
    });
  });

  describe('Node Selection', () => {
    it('selects node when clicked', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      const triggerNode = screen.getByText('device');
      fireEvent.click(triggerNode);
      
      expect(triggerNode.closest('div')).toHaveClass('ring-2', 'ring-blue-500');
    });

    it('shows visual feedback for selected node', () => {
      render(<RuleBuilder {...defaultProps} initialRule={mockRule} />);
      
      const triggerNode = screen.getByText('device');
      fireEvent.click(triggerNode);
      
      expect(triggerNode.closest('div')).toHaveClass('ring-2', 'ring-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper checkbox role', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('has proper textbox roles', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });

    it('has proper aria labels and titles', () => {
      render(<RuleBuilder {...defaultProps} />);
      
      expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
      expect(screen.getByTitle('Reset View')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<RuleBuilder {...defaultProps} className="custom-rule-builder" />);
      
      const container = document.querySelector('.custom-rule-builder');
      expect(container).toBeInTheDocument();
    });

    it('maintains base styling with custom className', () => {
      render(<RuleBuilder {...defaultProps} className="custom-rule-builder" />);
      
      const container = document.querySelector('.custom-rule-builder');
      expect(container).toHaveClass('rule-builder', 'bg-white', 'rounded-lg');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty rule gracefully', () => {
      const emptyRule: AutomationRule = {
        name: '',
        description: '',
        triggers: [],
        conditions: [],
        actions: [],
        isActive: false,
      };
      
      render(<RuleBuilder {...defaultProps} initialRule={emptyRule} />);
      
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('handles missing onRuleTest function', () => {
      render(<RuleBuilder {...defaultProps} onRuleTest={undefined} />);
      
      const testButton = screen.getByText('Test');
      fireEvent.click(testButton);
      
      // Should not crash
      expect(testButton).toBeInTheDocument();
    });

    it('handles missing onRuleSave function', () => {
      render(<RuleBuilder {...defaultProps} onRuleSave={undefined} />);
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      // Should not crash
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large number of conditions efficiently', () => {
      const manyConditions: ConditionType[] = Array(50).fill(null).map((_, i) => ({
        id: `condition-${i}`,
        name: `Condition ${i}`,
        description: `Description ${i}`,
        category: 'test',
        availableOperators: ['equals'],
        valueType: 'string',
      }));
      
      const { container } = render(
        <RuleBuilder {...defaultProps} availableConditions={manyConditions} />
      );
      
      expect(container.querySelectorAll('[data-testid]')).toBeDefined();
    });

    it('renders without performance issues', () => {
      const startTime = performance.now();
      render(<RuleBuilder {...defaultProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
    });
  });
});
