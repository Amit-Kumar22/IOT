/**
 * Admin Panel Types and Interfaces
 * Comprehensive type definitions for admin panel components
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'company' | 'consumer';
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  createdAt: Date;
  lastLoginAt?: Date;
  phone?: string;
  avatar?: string;
  companyInfo?: {
    companyName: string;
    industry: string;
    deviceCount: number;
    department?: string;
  };
  consumerInfo?: {
    homeType: string;
    deviceCount: number;
    energyPlan: string;
    location?: string;
  };
  billingPlan: string;
  usage: UserUsageMetrics;
  permissions: string[];
  notes?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserUsageMetrics {
  devicesConnected: number;
  dataUsageMB: number;
  apiCalls: number;
  monthlySpend: number;
  lastBillingDate: Date;
  storageUsedMB: number;
  bandwidthUsedMB: number;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  type: 'free' | 'basic' | 'professional' | 'enterprise';
  pricing: {
    monthly: number;
    yearly: number;
    setup?: number;
    currency: string;
  };
  limits: {
    devices: number;
    dataGB: number;
    apiCalls: number;
    users: number;
    storage: number;
    bandwidth: number;
  };
  features: PlanFeature[];
  overage: {
    perDevice: number;
    perGB: number;
    perAPICall: number;
  };
  isActive: boolean;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriberCount: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'analytics' | 'automation' | 'support' | 'security';
  isIncluded: boolean;
  limit?: number;
  icon?: string;
}

export interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  lifetimeValue: number;
  outstandingInvoices: number;
  overdueAmount: number;
  paymentFailureRate: number;
  upgradeRate: number;
  downgradeRate: number;
  currency: string;
}

export interface UserBillingRecord {
  userId: string;
  userName: string;
  userEmail: string;
  companyName?: string;
  planName: string;
  planType: string;
  monthlySpend: number;
  currentUsage: UsageBreakdown;
  billingStatus: 'current' | 'overdue' | 'suspended' | 'cancelled';
  nextBillingDate: Date;
  lastPaymentDate?: Date;
  paymentMethod: string;
  invoiceCount: number;
  totalSpent: number;
  currency: string;
}

export interface UsageBreakdown {
  devices: { used: number; limit: number };
  dataGB: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
  storage: { used: number; limit: number };
  bandwidth: { used: number; limit: number };
  period: {
    start: Date;
    end: Date;
  };
}

export interface SystemAnalytics {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newSignups: number;
    churnRate: number;
    userGrowthRate: number;
    usersByRole: {
      admin: number;
      company: number;
      consumer: number;
    };
    usersByStatus: {
      active: number;
      inactive: number;
      pending: number;
      suspended: number;
    };
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    totalRevenue: number;
    revenueGrowth: number;
    averageRevenuePerUser: number;
    revenueByPlan: Record<string, number>;
  };
  usageMetrics: {
    totalDevices: number;
    activeDevices: number;
    dataProcessedGB: number;
    apiCalls: number;
    systemUptime: number;
    averageDevicesPerUser: number;
    dataUsageGrowth: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    systemLoad: number;
    databasePerformance: number;
    cacheHitRate: number;
    queueDepth: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  monthlyRevenue: number;
  totalRevenue: number;
  systemUptime: number;
  activeAlerts: number;
  pendingTasks: number;
  systemHealth: 'good' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'billing' | 'security' | 'performance';
  createdAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
  assignedTo?: string;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface RecentActivity {
  id: string;
  type: 'user_action' | 'system_event' | 'billing_event' | 'device_event';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  deviceId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  icon?: string;
  color?: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  sessionDuration: number;
  actionsPerformed: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: Record<string, any>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeHeaders: boolean;
  filename?: string;
}

export interface AdminConfig {
  maxSessionDuration: number;
  requireTwoFactor: boolean;
  allowedIpRanges: string[];
  sessionTimeout: number;
  auditRetentionDays: number;
  exportLimits: {
    maxRows: number;
    maxFileSize: number;
    allowedFormats: string[];
  };
  notifications: {
    email: boolean;
    inApp: boolean;
    slack: boolean;
  };
}

// Form Types
export interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'company' | 'consumer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  phone: string;
  company: string;
  department: string;
  permissions: string[];
  billingPlan: string;
  notes: string;
  requirePasswordReset: boolean;
  twoFactorEnabled: boolean;
}

export interface PlanFormData {
  name: string;
  description: string;
  type: 'free' | 'basic' | 'professional' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  setupFee: number;
  deviceLimit: number;
  dataLimit: number;
  apiCallLimit: number;
  userLimit: number;
  storageLimit: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Search Types
export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  plan?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PlanFilters {
  search?: string;
  type?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BillingFilters {
  search?: string;
  status?: string;
  plan?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: ChartDataPoint[] | TimeSeriesData[];
  options?: Record<string, any>;
  height?: number;
  width?: number;
}
