// Shared component types and interfaces for Task 6: Components and Reusables
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface ThemeAwareProps {
  theme?: 'light' | 'dark';
  colorScheme?: string;
}

export interface ResponsiveProps {
  size?: 'small' | 'medium' | 'large';
  variant?: string;
}

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Device related types
export interface Device {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'security' | 'sensor' | 'appliance' | 'industrial';
  status: 'online' | 'offline' | 'warning' | 'error';
  batteryLevel?: number;
  signalStrength: number;
  room?: string;
  lastSeen: Date;
  isControllable: boolean;
  currentState?: any;
  metadata?: Record<string, any>;
}

export interface DeviceCardProps extends BaseComponentProps {
  device: Device;
  variant?: 'compact' | 'detailed' | 'control';
  onDeviceClick?: (deviceId: string) => void;
  onQuickAction?: (deviceId: string, action: string) => void;
  showControls?: boolean;
}

// Chart related types
export interface ChartDataPoint {
  timestamp?: Date;
  label: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface AxisConfig {
  label?: string;
  min?: number;
  max?: number;
  tickFormat?: string;
  showGrid?: boolean;
}

export interface ChartConfig {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animations?: boolean;
  responsive?: boolean;
  theme?: 'light' | 'dark';
}

export interface ChartWidgetProps extends BaseComponentProps {
  title: string;
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'gauge' | 'scatter';
  data: ChartDataPoint[];
  config: ChartConfig;
  height?: number;
  width?: number;
  isLoading?: boolean;
  error?: string;
  onDataPointClick?: (point: ChartDataPoint) => void;
  refreshInterval?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  onRefresh?: () => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onFullscreen?: (isFullscreen: boolean) => void;
  loading?: boolean;
  customConfig?: Record<string, any>;
}

// Pricing related types
export interface PricingFeature {
  name: string;
  description?: string;
  isIncluded: boolean;
  limit?: number | 'unlimited';
  highlight?: boolean;
}

export interface PricingLimit {
  name: string;
  value: number | 'unlimited';
  unit?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PricingFeature[];
  limits: PricingLimit[];
  ctaText: string;
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export interface PricingTableProps extends BaseComponentProps {
  plans: PricingPlan[];
  currentPlan?: string;
  highlightedPlan?: string;
  billingCycle: 'monthly' | 'yearly';
  onPlanSelect: (planId: string) => void;
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
  showComparison?: boolean;
  currency?: string;
}

// Energy gauge types
export interface EnergyThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface EnergyGaugeProps extends BaseComponentProps {
  currentValue: number;
  maxValue: number;
  unit: string;
  thresholds?: EnergyThresholds;
  size?: 'small' | 'medium' | 'large';
  showNeedle?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  colorScheme?: 'default' | 'energy' | 'performance';
  onValueChange?: (value: number) => void;
}

// Rule builder types
export interface RuleTrigger {
  id: string;
  type: 'device' | 'time' | 'location' | 'external';
  config: Record<string, any>;
}

export interface RuleCondition {
  id: string;
  type: string;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'between';
  value: any;
  config: Record<string, any>;
}

export interface RuleAction {
  id: string;
  type: string;
  target: string;
  config: Record<string, any>;
}

export interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  triggers: RuleTrigger[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
}

export interface ConditionType {
  id: string;
  name: string;
  description: string;
  category: string;
  availableOperators: string[];
  valueType: 'string' | 'number' | 'boolean' | 'datetime';
}

export interface ActionType {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredParams: string[];
  optionalParams: string[];
}

export interface TestResult {
  success: boolean;
  message: string;
  executionTime: number;
  steps: Array<{
    step: string;
    result: 'success' | 'failure' | 'warning';
    message: string;
  }>;
}

export interface RuleBuilderProps extends BaseComponentProps {
  initialRule?: AutomationRule;
  availableDevices: Device[];
  availableConditions: ConditionType[];
  availableActions: ActionType[];
  onRuleChange: (rule: AutomationRule) => void;
  onRuleSave: (rule: AutomationRule) => void;
  onRuleTest: (rule: AutomationRule) => Promise<TestResult>;
  readOnly?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  actionLabel?: string;
  actionUrl?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPanelProps extends BaseComponentProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
  maxHeight?: number;
  showUnreadOnly?: boolean;
  groupByType?: boolean;
  autoRefresh?: boolean;
}

// UI Component types
export interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
}

export interface BadgeProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}
