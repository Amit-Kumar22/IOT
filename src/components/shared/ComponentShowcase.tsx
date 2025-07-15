import React, { useState } from 'react';
import { DeviceCard } from './DeviceCard';
import { ChartWidget } from './ChartWidget';
import { DataTable } from './DataTable';
import EnergyGauge from './EnergyGauge';
import PricingTable from './PricingTable';
import RuleBuilder from './RuleBuilder';
import NotificationPanel from './NotificationPanel';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ComponentShowcaseProps {
  className?: string;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ className }) => {
  const [activeComponent, setActiveComponent] = useState('DeviceCard');

  // Sample data for demonstrations
  const sampleDevice = {
    id: '1',
    name: 'Smart Thermostat',
    type: 'thermostat',
    status: 'online' as const,
    location: 'Living Room',
    batteryLevel: 85,
    lastSeen: new Date(),
    temperature: 72,
    humidity: 45,
    energyUsage: 1.2,
    isConnected: true,
    signalStrength: 85,
    isControllable: true,
    firmware: '2.1.0',
    serialNumber: 'ST-2024-001',
    model: 'EcoSmart Pro',
    manufacturer: 'TechHome',
    capabilities: ['temperature_control', 'humidity_monitoring', 'energy_tracking'],
    metadata: {
      installDate: '2024-01-15',
      warrantyExpiry: '2026-01-15',
      maintenanceSchedule: 'Monthly'
    }
  };

  const sampleChartData = [
    { label: 'Jan', value: 400, secondary: 240 },
    { label: 'Feb', value: 300, secondary: 139 },
    { label: 'Mar', value: 300, secondary: 980 },
    { label: 'Apr', value: 278, secondary: 390 },
    { label: 'May', value: 189, secondary: 480 },
    { label: 'Jun', value: 239, secondary: 380 }
  ];

  const sampleTableData = [
    { id: '1', name: 'Device 1', status: 'online', energy: 1.2, location: 'Kitchen' },
    { id: '2', name: 'Device 2', status: 'offline', energy: 0.8, location: 'Bedroom' },
    { id: '3', name: 'Device 3', status: 'warning', energy: 2.1, location: 'Living Room' }
  ];

  const samplePricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 29, yearly: 290 },
      features: ['Up to 5 devices', 'Basic analytics', 'Email support'],
      popular: false,
      description: 'Perfect for small homes',
      limits: { devices: 5, automations: 10, storage: '1GB' },
      ctaText: 'Get Started'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: { monthly: 59, yearly: 590 },
      features: ['Up to 25 devices', 'Advanced analytics', 'Priority support', 'Automation rules'],
      popular: true,
      description: 'Great for medium-sized homes',
      limits: { devices: 25, automations: 50, storage: '10GB' },
      ctaText: 'Upgrade Now'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      features: ['Unlimited devices', 'Custom integrations', '24/7 support', 'White-label options'],
      popular: false,
      description: 'For large installations',
      limits: { devices: -1, automations: -1, storage: 'Unlimited' },
      ctaText: 'Contact Sales'
    }
  ];

  const sampleNotifications = [
    {
      id: '1',
      title: 'Energy Usage Alert',
      message: 'Your energy consumption is 15% higher than usual',
      type: 'warning' as const,
      timestamp: new Date(),
      read: false,
      priority: 'high' as const,
      source: 'system',
      category: 'energy'
    },
    {
      id: '2',
      title: 'System Update',
      message: 'New firmware available for your smart thermostat',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      priority: 'medium' as const,
      source: 'system',
      category: 'updates'
    }
  ];

  const components = {
    DeviceCard: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Device Card Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeviceCard device={sampleDevice} />
          <DeviceCard 
            device={{...sampleDevice, status: 'offline'}} 
            variant="compact" 
          />
          <DeviceCard 
            device={{...sampleDevice, status: 'warning'}} 
            variant="detailed" 
          />
        </div>
      </div>
    ),
    ChartWidget: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chart Widget Components</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartWidget
            title="Energy Usage"
            type="line"
            data={sampleChartData}
            height={300}
          />
          <ChartWidget
            title="Device Status"
            type="pie"
            data={sampleChartData}
            height={300}
          />
        </div>
      </div>
    ),
    DataTable: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Table Component</h3>
        <DataTable
          data={sampleTableData}
          columns={[
            { key: 'name', label: 'Device Name' },
            { key: 'status', label: 'Status' },
            { key: 'energy', label: 'Energy (kWh)' },
            { key: 'location', label: 'Location' }
          ]}
          sortable
          filterable
          selectable
        />
      </div>
    ),
    EnergyGauge: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Energy Gauge Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnergyGauge 
            value={75} 
            max={100} 
            label="Current Usage"
            size="medium"
          />
          <EnergyGauge 
            value={45} 
            max={100} 
            label="Efficiency"
            size="medium"
            color="green"
          />
          <EnergyGauge 
            value={85} 
            max={100} 
            label="Peak Usage"
            size="medium"
            color="orange"
          />
        </div>
      </div>
    ),
    PricingTable: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing Table Component</h3>
        <PricingTable
          plans={samplePricingPlans}
          billingCycle="monthly"
          onPlanSelect={(planId) => console.log('Selected plan:', planId)}
        />
      </div>
    ),
    RuleBuilder: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Rule Builder Component</h3>
        <div className="h-96">
          <RuleBuilder
            onRuleChange={(rule) => console.log('Rule changed:', rule)}
            onRuleTest={(rule) => console.log('Testing rule:', rule)}
          />
        </div>
      </div>
    ),
    NotificationPanel: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Panel Component</h3>
        <div className="max-w-md">
          <NotificationPanel
            notifications={sampleNotifications}
            showSearch
            showUnreadCount
            showBulkActions
          />
        </div>
      </div>
    )
  };

  return (
    <div className={`p-6 ${className || ''}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Showcase</h1>
        <p className="text-gray-600">
          Explore all the reusable components built for the IoT platform
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Object.keys(components).map((componentName) => (
            <Button
              key={componentName}
              variant={activeComponent === componentName ? 'primary' : 'outline'}
              onClick={() => setActiveComponent(componentName)}
              className="mb-2"
            >
              {componentName}
            </Button>
          ))}
        </div>
      </div>

      {/* Component Display */}
      <Card className="p-6">
        {components[activeComponent as keyof typeof components]}
      </Card>

      {/* Component Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Component Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {activeComponent === 'DeviceCard' && (
              <>
                <li>• Multiple visual states (online, offline, warning, error)</li>
                <li>• Responsive variants (compact, detailed, control)</li>
                <li>• Interactive elements and quick actions</li>
                <li>• Accessibility compliant with keyboard navigation</li>
              </>
            )}
            {activeComponent === 'ChartWidget' && (
              <>
                <li>• Multiple chart types (line, bar, pie, area, gauge)</li>
                <li>• Interactive features (zoom, pan, tooltips)</li>
                <li>• Performance optimized for large datasets</li>
                <li>• Customizable themes and colors</li>
              </>
            )}
            {activeComponent === 'DataTable' && (
              <>
                <li>• Sorting, filtering, and pagination</li>
                <li>• Row selection and bulk operations</li>
                <li>• Expandable rows and nested data</li>
                <li>• Responsive design for mobile devices</li>
              </>
            )}
            {activeComponent === 'EnergyGauge' && (
              <>
                <li>• Circular gauge with arc display</li>
                <li>• Color-coded zones and thresholds</li>
                <li>• Animated needle movement</li>
                <li>• Multiple size variants</li>
              </>
            )}
            {activeComponent === 'PricingTable' && (
              <>
                <li>• Card-based layout for pricing plans</li>
                <li>• Billing cycle toggle functionality</li>
                <li>• Feature comparison matrix</li>
                <li>• Responsive design for mobile</li>
              </>
            )}
            {activeComponent === 'RuleBuilder' && (
              <>
                <li>• Drag-and-drop visual interface</li>
                <li>• Component palette (triggers, conditions, actions)</li>
                <li>• Connection system between rule nodes</li>
                <li>• Rule validation and testing</li>
              </>
            )}
            {activeComponent === 'NotificationPanel' && (
              <>
                <li>• Real-time notification management</li>
                <li>• Advanced filtering and search</li>
                <li>• Bulk action operations</li>
                <li>• Priority-based display</li>
              </>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Usage Statistics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Components:</span>
              <span className="font-semibold">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Test Coverage:</span>
              <span className="font-semibold">90%+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accessibility:</span>
              <span className="font-semibold">WCAG 2.1 AA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Performance:</span>
              <span className="font-semibold">Optimized</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;
