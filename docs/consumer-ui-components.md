# Consumer UI Components Documentation

## Overview
This document provides comprehensive documentation for all consumer-facing UI components in the IoT platform. These components are designed to provide an intuitive, accessible, and responsive interface for consumer users to manage their smart home devices.

## Architecture

### Directory Structure
```
src/components/consumer/
├── devices/
│   ├── DeviceCard.tsx         # Individual device display and controls
│   ├── DeviceList.tsx         # Collection of devices with filtering
│   ├── DeviceControls.tsx     # Device-specific control interfaces
│   ├── RoomGrid.tsx           # Room-based device organization
│   ├── QuickActions.tsx       # One-tap device actions
│   ├── ScheduleBuilder.tsx    # Device scheduling interface
│   ├── DeviceStatus.tsx       # Real-time device status
│   └── DeviceSettings.tsx     # Device configuration
├── energy/
│   ├── EnergyDashboard.tsx    # Main energy overview
│   ├── EnergyGauge.tsx        # Energy consumption visualization
│   ├── EnergyChart.tsx        # Historical energy data charts
│   ├── CostPredictor.tsx      # Energy cost predictions
│   ├── EfficiencyScore.tsx    # Energy efficiency metrics
│   └── EnergyTips.tsx         # Energy saving recommendations
├── automation/
│   ├── AutomationCard.tsx     # Individual automation rule display
│   ├── AutomationList.tsx     # Collection of automation rules
│   ├── AutomationCreator.tsx  # Automation rule creation wizard
│   ├── AutomationBuilder.tsx  # Advanced automation builder
│   ├── SceneManager.tsx       # Scene creation and management
│   ├── RuleTemplates.tsx      # Pre-built automation templates
│   └── LocationTrigger.tsx    # Location-based automation triggers
├── settings/
│   ├── UserProfile.tsx        # User profile management
│   ├── NotificationSettings.tsx # Notification preferences
│   ├── SecuritySettings.tsx   # Security configuration
│   ├── ThemeSettings.tsx      # Theme and appearance settings
│   └── DataManagement.tsx     # Data export and privacy controls
└── __tests__/
    ├── accessibility.test.tsx          # WCAG 2.1 compliance tests
    ├── mobile-responsiveness.test.tsx  # Mobile optimization tests
    ├── real-time-updates.test.tsx      # WebSocket functionality tests
    ├── offline-functionality.test.tsx  # PWA and offline capability tests
    ├── performance-testing.test.tsx    # Performance and optimization tests
    └── security-testing.test.tsx       # Security validation tests
```

## Component Documentation

### Device Management Components

#### DeviceCard
**Purpose**: Display individual smart home devices with controls and status information.

**Props**:
```typescript
interface DeviceCardProps {
  device: HomeDevice;
  onToggle: (deviceId: string) => void;
  onUpdate: (deviceId: string, updates: Partial<HomeDevice>) => void;
  className?: string;
}
```

**Features**:
- Real-time status updates
- Device-specific controls (toggle, dimmer, color picker)
- Battery level indicator
- Offline status indication
- Quick action buttons
- Touch-optimized for mobile

**Accessibility**:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for status changes
- High contrast mode support

**Example Usage**:
```tsx
<DeviceCard
  device={livingRoomLight}
  onToggle={handleDeviceToggle}
  onUpdate={handleDeviceUpdate}
  className="mb-4"
/>
```

#### DeviceList
**Purpose**: Display a collection of devices with filtering and sorting capabilities.

**Props**:
```typescript
interface DeviceListProps {
  devices: HomeDevice[];
  onDeviceUpdate: (deviceId: string, updates: Partial<HomeDevice>) => void;
  filterBy?: 'room' | 'type' | 'status';
  sortBy?: 'name' | 'room' | 'lastUsed';
  showRoomHeaders?: boolean;
}
```

**Features**:
- Filtering by room, device type, or status
- Sorting by name, room, or last used
- Room-based grouping
- Empty state handling
- Loading states
- Responsive grid layout

#### DeviceControls
**Purpose**: Provide device-specific control interfaces for different device types.

**Props**:
```typescript
interface DeviceControlsProps {
  device: HomeDevice;
  onUpdate: (updates: Partial<HomeDevice>) => void;
  compact?: boolean;
}
```

**Features**:
- Dynamic control rendering based on device capabilities
- Support for toggle, dimmer, color, and temperature controls
- Validation for control values
- Haptic feedback on mobile devices
- Undo/redo functionality

### Energy Management Components

#### EnergyDashboard
**Purpose**: Provide overview of energy consumption, costs, and efficiency metrics.

**Props**:
```typescript
interface EnergyDashboardProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  showPredictions?: boolean;
  showComparisons?: boolean;
}
```

**Features**:
- Real-time energy consumption display
- Cost calculations and predictions
- Energy efficiency scoring
- Historical data visualization
- Comparison with previous periods
- Energy saving recommendations

#### EnergyGauge
**Purpose**: Visual representation of current energy consumption.

**Props**:
```typescript
interface EnergyGaugeProps {
  current: number;
  target: number;
  unit: 'kWh' | 'W';
  showTarget?: boolean;
  animated?: boolean;
}
```

**Features**:
- Animated gauge visualization
- Target vs actual comparison
- Color-coded efficiency levels
- Responsive design
- Accessibility-friendly alternative text

### Automation Components

#### AutomationCard
**Purpose**: Display individual automation rules with status and controls.

**Props**:
```typescript
interface AutomationCardProps {
  automation: AutomationRule;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:
- Rule description and conditions display
- Enable/disable toggle
- Edit and delete actions
- Execution history
- Success/failure indicators

#### AutomationCreator
**Purpose**: Wizard-style interface for creating new automation rules.

**Props**:
```typescript
interface AutomationCreatorProps {
  onSave: (automation: AutomationRule) => void;
  onCancel: () => void;
  devices: HomeDevice[];
  templates?: AutomationTemplate[];
}
```

**Features**:
- Step-by-step wizard interface
- Trigger selection (time, device, location)
- Action configuration
- Condition builder
- Rule testing and validation
- Template-based quick setup

## Testing Strategy

### Unit Testing
- **Coverage**: 90%+ for all components
- **Framework**: Jest + React Testing Library
- **Focus**: Component rendering, user interactions, state management
- **Test Files**: Located in `__tests__/` directory

### Accessibility Testing
- **Standard**: WCAG 2.1 AA compliance
- **Tools**: jest-axe for automated testing
- **Coverage**: All interactive elements, keyboard navigation, screen reader compatibility
- **Results**: 12/12 tests passing

### Mobile Responsiveness
- **Viewports**: 320px to 1920px width
- **Touch Interactions**: All controls optimized for touch
- **Performance**: 60fps on mobile devices
- **Results**: 18/18 tests passing

### Real-time Updates
- **WebSocket**: Live device status updates
- **Connection Handling**: Automatic reconnection
- **Data Synchronization**: Real-time state management
- **Results**: 21/21 tests passing

### Offline Functionality
- **Service Workers**: Cache management for offline use
- **PWA Features**: Installable web app
- **Data Persistence**: Local storage for critical data
- **Results**: 26/26 tests passing

### Performance Testing
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Optimized for mobile networks
- **Rendering**: 60fps on mobile devices
- **Results**: 21/21 tests passing

### Security Testing
- **Authentication**: JWT token validation
- **Input Validation**: XSS and injection prevention
- **CSRF Protection**: Token-based request validation
- **Results**: 31/31 tests passing

## Best Practices

### Performance Optimization
1. **Code Splitting**: Lazy loading for non-critical components
2. **Memoization**: React.memo and useMemo for expensive operations
3. **Virtual Scrolling**: For large device lists
4. **Image Optimization**: WebP format with fallbacks
5. **Bundle Analysis**: Regular size monitoring

### Accessibility Guidelines
1. **Semantic HTML**: Use proper heading hierarchy
2. **ARIA Attributes**: Comprehensive labeling
3. **Keyboard Navigation**: Full keyboard accessibility
4. **Color Contrast**: Minimum 4.5:1 ratio
5. **Screen Reader**: Meaningful announcements

### Mobile Optimization
1. **Touch Targets**: Minimum 44px touch areas
2. **Responsive Design**: Fluid layouts and typography
3. **Performance**: Optimized for 3G networks
4. **Gestures**: Intuitive swipe and tap interactions
5. **Viewport**: Proper viewport meta tags

### Error Handling
1. **Graceful Degradation**: Fallback for failed requests
2. **User Feedback**: Clear error messages
3. **Retry Logic**: Automatic retry for transient failures
4. **Logging**: Comprehensive error tracking
5. **Recovery**: Self-healing mechanisms

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.iot-platform.com
NEXT_PUBLIC_WS_URL=wss://ws.iot-platform.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Build Configuration
```json
{
  "build": {
    "optimization": true,
    "minification": true,
    "sourceMaps": true,
    "bundleAnalysis": true
  }
}
```

### Performance Monitoring
- **Real User Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Sentry integration
- **Analytics**: User interaction tracking
- **Performance Budget**: Size and timing thresholds

## Maintenance and Updates

### Regular Tasks
1. **Dependency Updates**: Monthly security updates
2. **Performance Audits**: Quarterly performance reviews
3. **Accessibility Audits**: Semi-annual WCAG compliance checks
4. **Security Scans**: Continuous vulnerability monitoring
5. **User Feedback**: Monthly UX improvement reviews

### Monitoring
- **Component Health**: Real-time error rates
- **Performance Metrics**: Page load times and FPS
- **User Satisfaction**: NPS and usability scores
- **Security Incidents**: Automated alert system

This documentation serves as the complete reference for the consumer UI components, providing developers with the information needed to maintain, extend, and optimize the codebase.
