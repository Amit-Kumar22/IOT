/**
 * Analytics Dashboard Types
 * Comprehensive type definitions for company analytics features
 */

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'area' | 'scatter';
  title: string;
  dataSource: string;
  timeRange: string;
  aggregation: 'sum' | 'average' | 'min' | 'max' | 'count';
  refreshRate: number; // in seconds
  filters?: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  color?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: ChartConfig[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MetricsData {
  timestamp: string;
  value: number;
  deviceId?: string;
  unit?: string;
  quality?: 'good' | 'bad' | 'uncertain';
}

export interface PerformanceMetrics {
  deviceUptime: number; // percentage
  energyEfficiency: number; // percentage
  communicationReliability: number; // percentage
  alertFrequency: number; // alerts per hour
  costPerDevice: number; // cost in currency
  totalDevices: number;
  activeDevices: number;
  errorRate: number; // percentage
  throughput: number; // data points per minute
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  deviceIds?: string[];
  deviceTypes?: string[];
  locations?: string[];
  status?: ('online' | 'offline' | 'warning' | 'error')[];
  groupBy?: 'device' | 'type' | 'location' | 'hour' | 'day' | 'week' | 'month';
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'scheduled' | 'on-demand';
  format: 'pdf' | 'excel' | 'csv';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  recipients: string[]; // email addresses
  widgets: string[]; // widget IDs to include
  filters: AnalyticsFilter;
  isActive: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between';
  threshold: number | [number, number];
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  notifications: {
    email: boolean;
    dashboard: boolean;
    webhook?: string;
  };
  isActive: boolean;
  deviceFilters?: string[];
}

export interface DrillDownData {
  level: 'device' | 'parameter' | 'timeframe';
  filters: Record<string, any>;
  breadcrumb: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg';
  timeRange: {
    start: Date;
    end: Date;
  };
  widgets: string[];
  includeRawData: boolean;
  title?: string;
  description?: string;
}

export interface WidgetInteraction {
  type: 'click' | 'hover' | 'zoom' | 'drill-down';
  data: any;
  timestamp: Date;
  widgetId: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}
