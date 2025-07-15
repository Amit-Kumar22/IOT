import type { Meta, StoryObj } from '@storybook/react';
import RuleBuilder from './RuleBuilder';
import type { AutomationRule, Device, ConditionType, ActionType, TestResult } from '../../types/shared-components';

const meta: Meta<typeof RuleBuilder> = {
  title: 'Shared/RuleBuilder',
  component: RuleBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A visual rule builder for creating automation rules with drag-and-drop interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    readOnly: {
      control: { type: 'boolean' },
      description: 'Make the rule builder read-only',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockDevices: Device[] = [
  {
    id: 'temp-sensor-1',
    name: 'Living Room Temperature',
    type: 'sensor',
    status: 'online',
    signalStrength: 85,
    lastSeen: new Date(),
    isControllable: false,
  },
  {
    id: 'smart-light-1',
    name: 'Living Room Light',
    type: 'light',
    status: 'online',
    signalStrength: 92,
    lastSeen: new Date(),
    isControllable: true,
  },
];

const mockConditions: ConditionType[] = [
  {
    id: 'temperature_greater_than',
    name: 'Temperature Greater Than',
    description: 'Trigger when temperature exceeds threshold',
    category: 'sensor',
    availableOperators: ['greater', 'less', 'equals'],
    valueType: 'number',
  },
  {
    id: 'time_of_day',
    name: 'Time of Day',
    description: 'Trigger at specific time',
    category: 'schedule',
    availableOperators: ['equals', 'between'],
    valueType: 'datetime',
  },
];

const mockActions: ActionType[] = [
  {
    id: 'turn_on_light',
    name: 'Turn On Light',
    description: 'Turn on a smart light',
    category: 'device_control',
    requiredParams: ['deviceId'],
    optionalParams: ['brightness', 'color'],
  },
  {
    id: 'send_notification',
    name: 'Send Notification',
    description: 'Send a push notification',
    category: 'notification',
    requiredParams: ['message'],
    optionalParams: ['title', 'priority'],
  },
];

const emptyRule: AutomationRule = {
  name: 'New Rule',
  description: '',
  triggers: [],
  conditions: [],
  actions: [],
  isActive: true,
};

const basicRule: AutomationRule = {
  name: 'Motion Light Control',
  description: 'Turn on lights when motion is detected',
  triggers: [
    {
      id: 'trigger-1',
      type: 'device',
      config: { deviceId: 'motion-sensor-1', property: 'motion_detected' },
    },
  ],
  conditions: [
    {
      id: 'condition-1',
      type: 'time_range',
      operator: 'between',
      value: { start: '18:00', end: '06:00' },
      config: { description: 'Only during night hours' },
    },
  ],
  actions: [
    {
      id: 'action-1',
      type: 'device_control',
      target: 'smart-light-1',
      config: { property: 'power', value: true },
    },
  ],
  isActive: true,
};

export const Empty: Story = {
  args: {
    initialRule: emptyRule,
    availableDevices: mockDevices,
    availableConditions: mockConditions,
    availableActions: mockActions,
    onRuleChange: (rule: AutomationRule) => console.log('Rule changed:', rule),
    onRuleSave: (rule: AutomationRule) => console.log('Rule saved:', rule),
    onRuleTest: (rule: AutomationRule): Promise<TestResult> => {
      console.log('Testing rule:', rule);
      return Promise.resolve({
        success: true,
        message: 'Rule test completed successfully',
        executionTime: 150,
        steps: [
          { step: 'Validate triggers', result: 'success', message: 'All triggers are valid' },
          { step: 'Check conditions', result: 'success', message: 'Conditions passed' },
          { step: 'Execute actions', result: 'success', message: 'Actions completed' },
        ],
      });
    },
  },
};

export const BasicRule: Story = {
  args: {
    initialRule: basicRule,
    availableDevices: mockDevices,
    availableConditions: mockConditions,
    availableActions: mockActions,
    onRuleChange: (rule: AutomationRule) => console.log('Rule changed:', rule),
    onRuleSave: (rule: AutomationRule) => console.log('Rule saved:', rule),
    onRuleTest: (rule: AutomationRule): Promise<TestResult> => {
      console.log('Testing rule:', rule);
      return Promise.resolve({
        success: true,
        message: 'Rule test completed successfully',
        executionTime: 150,
        steps: [
          { step: 'Validate triggers', result: 'success', message: 'All triggers are valid' },
          { step: 'Check conditions', result: 'success', message: 'Conditions passed' },
          { step: 'Execute actions', result: 'success', message: 'Actions completed' },
        ],
      });
    },
  },
};

export const ReadOnly: Story = {
  args: {
    initialRule: basicRule,
    availableDevices: mockDevices,
    availableConditions: mockConditions,
    availableActions: mockActions,
    readOnly: true,
    onRuleChange: (rule: AutomationRule) => console.log('Rule changed:', rule),
    onRuleSave: (rule: AutomationRule) => console.log('Rule saved:', rule),
    onRuleTest: (rule: AutomationRule): Promise<TestResult> => {
      console.log('Testing rule:', rule);
      return Promise.resolve({
        success: true,
        message: 'Rule test completed successfully',
        executionTime: 150,
        steps: [
          { step: 'Validate triggers', result: 'success', message: 'All triggers are valid' },
          { step: 'Check conditions', result: 'success', message: 'Conditions passed' },
          { step: 'Execute actions', result: 'success', message: 'Actions completed' },
        ],
      });
    },
  },
};
