# IoT Platform Component Library Guide

## 📚 Overview

This comprehensive guide covers all reusable components in the IoT Platform Component Library. Each component is designed with accessibility, performance, and developer experience in mind.

## 🎯 Design Principles

- **Accessibility First**: All components meet WCAG 2.1 AA standards
- **Performance Optimized**: React.memo, useMemo, and efficient re-rendering patterns
- **Type Safe**: Full TypeScript support with comprehensive interfaces
- **Responsive**: Mobile-first responsive design approach
- **Themeable**: Support for light/dark modes and custom themes

## 📦 Component Categories

### Base UI Components (`/components/ui/`)
- **Button**: Primary action component with variants and states
- **Input**: Form input with validation and accessibility features
- **Card**: Container component for content organization
- **Badge**: Status indicator and labeling component
- **Modal**: Overlay dialog component

### Shared Business Components (`/components/shared/`)
- **DeviceCard**: IoT device status and control interface
- **ChartWidget**: Data visualization with multiple chart types
- **DataTable**: Advanced table with sorting, filtering, pagination
- **EnergyGauge**: Circular gauge for energy consumption display
- **PricingTable**: Pricing plan comparison and selection
- **RuleBuilder**: Visual automation rule configuration
- **NotificationPanel**: Real-time notification management

## 🔧 Component APIs

### DeviceCard

```typescript
interface DeviceCardProps {
  device: Device;
  variant?: 'compact' | 'detailed' | 'control';
  onClick?: (device: Device) => void;
  onToggle?: (device: Device, state: boolean) => void;
  className?: string;
  testId?: string;
}

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: 'online' | 'offline' | 'warning' | 'error';
  batteryLevel?: number;
  signalStrength?: number;
  lastSeen: Date;
  location?: string;
  metadata?: Record<string, any>;
}
```

**Usage Example:**
```tsx
import { DeviceCard } from '@/components/shared/DeviceCard';

function DeviceList({ devices }: { devices: Device[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map(device => (
        <DeviceCard
          key={device.id}
          device={device}
          variant="detailed"
          onClick={handleDeviceClick}
          onToggle={handleDeviceToggle}
        />
      ))}
    </div>
  );
}
```

### ChartWidget

```typescript
interface ChartWidgetProps {
  title: string;
  data: ChartDataPoint[];
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'gauge';
  config?: ChartConfig;
  interactive?: boolean;
  className?: string;
  testId?: string;
}

interface ChartDataPoint {
  timestamp?: string | Date;
  label?: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}
```

**Usage Example:**
```tsx
import { ChartWidget } from '@/components/shared/ChartWidget';

function EnergyDashboard({ energyData }: { energyData: ChartDataPoint[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartWidget
        title="Energy Consumption"
        data={energyData}
        chartType="line"
        interactive={true}
        config={{
          showGrid: true,
          enableZoom: true,
          colors: ['#3B82F6', '#10B981', '#F59E0B']
        }}
      />
    </div>
  );
}
```

### DataTable

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  pageSize?: number;
  className?: string;
  testId?: string;
}

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}
```

**Usage Example:**
```tsx
import { DataTable } from '@/components/shared/DataTable';

const columns = [
  { key: 'name', header: 'Device Name', sortable: true },
  { key: 'status', header: 'Status', filterable: true },
  { key: 'lastSeen', header: 'Last Seen', sortable: true }
];

function DeviceTable({ devices }: { devices: Device[] }) {
  return (
    <DataTable
      data={devices}
      columns={columns}
      sortable={true}
      filterable={true}
      paginated={true}
      pageSize={20}
    />
  );
}
```

### EnergyGauge

```typescript
interface EnergyGaugeProps {
  value: number;
  max: number;
  unit?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  thresholds?: GaugeThreshold[];
  animated?: boolean;
  className?: string;
  testId?: string;
}

interface GaugeThreshold {
  value: number;
  color: string;
  label?: string;
}
```

**Usage Example:**
```tsx
import { EnergyGauge } from '@/components/shared/EnergyGauge';

function EnergyMonitor({ currentUsage }: { currentUsage: number }) {
  const thresholds = [
    { value: 70, color: '#10B981', label: 'Efficient' },
    { value: 85, color: '#F59E0B', label: 'Moderate' },
    { value: 100, color: '#EF4444', label: 'High' }
  ];

  return (
    <EnergyGauge
      value={currentUsage}
      max={100}
      unit="%"
      size="large"
      thresholds={thresholds}
      animated={true}
    />
  );
}
```

### PricingTable

```typescript
interface PricingTableProps {
  plans: PricingPlan[];
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
  className?: string;
  testId?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}
```

**Usage Example:**
```tsx
import { PricingTable } from '@/components/shared/PricingTable';

function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <PricingTable
      plans={pricingPlans}
      billingCycle={billingCycle}
      onBillingCycleChange={setBillingCycle}
      onSelectPlan={handlePlanSelection}
      currentPlanId="pro"
    />
  );
}
```

### RuleBuilder

```typescript
interface RuleBuilderProps {
  rules: AutomationRule[];
  onRulesChange: (rules: AutomationRule[]) => void;
  deviceTypes: DeviceType[];
  availableActions: ActionType[];
  className?: string;
  testId?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
}
```

**Usage Example:**
```tsx
import { RuleBuilder } from '@/components/shared/RuleBuilder';

function AutomationPanel() {
  const [rules, setRules] = useState<AutomationRule[]>([]);

  return (
    <RuleBuilder
      rules={rules}
      onRulesChange={setRules}
      deviceTypes={availableDeviceTypes}
      availableActions={availableActions}
    />
  );
}
```

### NotificationPanel

```typescript
interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onFilterChange: (filter: NotificationFilter) => void;
  maxHeight?: number;
  className?: string;
  testId?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  source: string;
  category: string;
}
```

**Usage Example:**
```tsx
import { NotificationPanel } from '@/components/shared/NotificationPanel';

function DashboardSidebar() {
  return (
    <NotificationPanel
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDeleteNotification}
      onFilterChange={handleFilterChange}
      maxHeight={600}
    />
  );
}
```

## 🎨 Styling and Theming

### CSS Classes and Customization

All components use Tailwind CSS for styling and support custom themes:

```tsx
// Custom theme example
const customTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444'
  },
  spacing: {
    componentPadding: '1rem',
    componentMargin: '0.5rem'
  }
};

// Apply theme to components
<ChartWidget 
  title="Custom Chart"
  data={data}
  config={{ theme: customTheme }}
/>
```

### Dark Mode Support

All components automatically support dark mode through Tailwind's dark mode classes:

```tsx
// Components automatically adapt to dark mode
<div className="dark">
  <DeviceCard device={device} />
  {/* Will render with dark theme styles */}
</div>
```

## ♿ Accessibility Features

### Keyboard Navigation
- All interactive components support keyboard navigation
- Tab order follows logical flow
- Focus indicators are clearly visible
- Escape key closes modals and dropdowns

### Screen Reader Support
- Proper ARIA labels and descriptions
- Semantic HTML structure
- Screen reader announcements for dynamic content
- Alternative text for visual elements

### Color and Contrast
- WCAG 2.1 AA compliant color ratios
- Color is not the only indicator of state
- High contrast mode support
- Customizable color schemes

## 🚀 Performance Optimizations

### React Optimizations
```tsx
// All components use React.memo for performance
const DeviceCard = React.memo<DeviceCardProps>(({ device, ...props }) => {
  // Component implementation
});

// Expensive calculations use useMemo
const chartData = useMemo(() => 
  processChartData(rawData), [rawData]
);

// Event handlers use useCallback
const handleClick = useCallback((device: Device) => {
  onDeviceClick?.(device);
}, [onDeviceClick]);
```

### Bundle Optimization
- Tree-shaking compatible exports
- Lazy loading for heavy components
- Code splitting for chart libraries
- Optimized asset loading

## 🧪 Testing Guidelines

### Unit Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceCard } from '@/components/shared/DeviceCard';

describe('DeviceCard', () => {
  it('renders device information correctly', () => {
    const mockDevice = { /* device data */ };
    render(<DeviceCard device={mockDevice} />);
    
    expect(screen.getByText(mockDevice.name)).toBeInTheDocument();
    expect(screen.getByText(mockDevice.status)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<DeviceCard device={mockDevice} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith(mockDevice);
  });
});
```

### Integration Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/pages/Dashboard';

describe('Dashboard Integration', () => {
  it('renders all components together', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('device-grid')).toBeInTheDocument();
    expect(screen.getByTestId('energy-chart')).toBeInTheDocument();
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
  });
});
```

## 🔧 Development Guidelines

### Component Creation Checklist
- [ ] TypeScript interfaces defined
- [ ] Props validation implemented
- [ ] Accessibility attributes added
- [ ] Responsive design implemented
- [ ] Unit tests written (90%+ coverage)
- [ ] Storybook stories created
- [ ] Documentation updated

### Code Quality Standards
- Follow SRP (Single Responsibility Principle)
- Use consistent naming conventions
- Keep components under 200 lines
- Extract reusable logic to custom hooks
- Use descriptive variable and function names

### File Structure
```
src/components/shared/ComponentName/
├── index.ts              # Export file
├── ComponentName.tsx     # Main component
├── ComponentName.test.tsx # Unit tests
├── ComponentName.stories.tsx # Storybook stories
├── types.ts              # Type definitions
└── utils.ts              # Component utilities
```

## 🐛 Troubleshooting

### Common Issues

**Component not rendering:**
- Check if all required props are provided
- Verify data format matches expected interfaces
- Check console for TypeScript errors

**Styling issues:**
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify dark mode setup if using theme switching

**Performance issues:**
- Check for unnecessary re-renders with React DevTools
- Verify memoization is working correctly
- Consider virtualizing large lists

**Accessibility warnings:**
- Run axe-core accessibility tests
- Check ARIA labels and descriptions
- Verify keyboard navigation works

### Debugging Tools
```tsx
// Enable component debugging
import { DeviceCard } from '@/components/shared/DeviceCard';

// Add debug prop for development
<DeviceCard 
  device={device} 
  debug={process.env.NODE_ENV === 'development'} 
/>
```

## 📈 Migration Guide

### Upgrading Components
When upgrading to newer versions:

1. Check the changelog for breaking changes
2. Update TypeScript interfaces if needed
3. Run tests to ensure compatibility
4. Update Storybook stories if API changed

### Legacy Component Migration
```tsx
// Old component usage
<OldDeviceCard device={device} />

// New component usage
<DeviceCard 
  device={device} 
  variant="detailed"
  onClick={handleClick}
/>
```

## 🤝 Contributing

### Adding New Components
1. Follow the file structure convention
2. Implement TypeScript interfaces
3. Add comprehensive tests
4. Create Storybook stories
5. Update this documentation

### Modifying Existing Components
1. Maintain backward compatibility
2. Update tests for new functionality
3. Update Storybook stories
4. Document breaking changes

---

This component library is designed to provide a consistent, accessible, and performant foundation for the IoT Platform user interface. For questions or contributions, please refer to the project's contributing guidelines.
