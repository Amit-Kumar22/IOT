/**
 * Energy Management Types and Interfaces
 * Comprehensive type definitions for energy monitoring, cost calculation, and efficiency tracking
 */

export interface EnergyData {
  timestamp: Date;
  totalConsumption: number; // kWh
  cost: number; // Current period cost in dollars
  deviceBreakdown: DeviceEnergyBreakdown[];
  peakHours: TimeRange[];
  efficiency: EfficiencyMetrics;
}

export interface DeviceEnergyBreakdown {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  room: string;
  consumption: number; // kWh
  cost: number; // Device-specific cost
  percentage: number; // Percentage of total consumption
  efficiency: 'high' | 'medium' | 'low';
}

export interface TimeRange {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  description?: string;
}

export interface EfficiencyMetrics {
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  score: number; // 0-100
  suggestions: EfficiencySuggestion[];
  trendsDirection: 'improving' | 'stable' | 'declining';
}

export interface EfficiencySuggestion {
  id: string;
  type: 'device_replacement' | 'schedule_optimization' | 'usage_pattern' | 'automation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavings: number; // Monthly savings in dollars
  difficulty: 'easy' | 'moderate' | 'advanced';
  deviceIds?: string[];
}

export interface EnergyUsageHistory {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: EnergyHistoryPoint[];
}

export interface EnergyHistoryPoint {
  timestamp: Date;
  consumption: number; // kWh
  cost: number;
  weather?: {
    temperature: number;
    humidity: number;
    condition: string;
  };
}

export interface CostPrediction {
  period: 'week' | 'month' | 'year';
  current: number; // Current period cost
  predicted: number; // Predicted cost
  comparison: {
    lastPeriod: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
  };
  breakdown: {
    fixed: number; // Fixed costs (base rate)
    variable: number; // Usage-based costs
    peak: number; // Peak hour costs
    offPeak: number; // Off-peak costs
  };
}

export interface RatePlan {
  id: string;
  name: string;
  provider: string;
  type: 'fixed' | 'time_of_use' | 'tiered';
  rates: {
    base?: number; // Fixed rate per kWh
    peak?: number; // Peak hour rate
    offPeak?: number; // Off-peak rate
    mid?: number; // Mid-peak rate
    tiers?: {
      threshold: number; // kWh threshold
      rate: number; // Rate per kWh
    }[];
  };
  peakHours: TimeRange[];
  monthlyFee?: number;
}

export interface EnergyGoal {
  id: string;
  type: 'consumption' | 'cost' | 'efficiency';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  deadline?: Date;
  achieved: boolean;
  progress: number; // 0-100 percentage
}

export interface EnergyAlert {
  id: string;
  type: 'high_usage' | 'cost_spike' | 'efficiency_drop' | 'goal_progress' | 'peak_hours';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  deviceId?: string;
  threshold?: number;
  currentValue?: number;
  actionable: boolean;
  suggestions?: string[];
}

export interface EnergySettings {
  ratePlan: RatePlan;
  goals: EnergyGoal[];
  alerts: {
    enabled: boolean;
    thresholds: {
      dailyUsage: number; // kWh
      dailyCost: number; // dollars
      peakUsageWarning: boolean;
      efficiencyDropAlert: boolean;
    };
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  preferences: {
    defaultPeriod: 'daily' | 'weekly' | 'monthly';
    showCostProjections: boolean;
    showDeviceBreakdown: boolean;
    showEfficiencyTips: boolean;
    compareToNeighbors: boolean;
  };
}

export interface EnergyStats {
  today: {
    consumption: number;
    cost: number;
    efficiency: number;
  };
  thisWeek: {
    consumption: number;
    cost: number;
    averageDaily: number;
  };
  thisMonth: {
    consumption: number;
    cost: number;
    averageDaily: number;
    projectedTotal: number;
  };
  comparison: {
    yesterdayChange: number;
    lastWeekChange: number;
    lastMonthChange: number;
  };
}

// Utility types for energy calculations
export type EnergyPeriod = 'hour' | 'day' | 'week' | 'month' | 'year';
export type EnergyUnit = 'wh' | 'kwh' | 'mwh';
export type CostUnit = 'cents' | 'dollars';

// API response types
export interface EnergyApiResponse {
  success: boolean;
  data: EnergyData;
  timestamp: Date;
  error?: string;
}

export interface EnergyHistoryApiResponse {
  success: boolean;
  data: EnergyUsageHistory;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  error?: string;
}

// Real-time energy update types
export interface EnergyUpdate {
  deviceId?: string; // If device-specific update
  timestamp: Date;
  consumption: number;
  cost: number;
  type: 'device' | 'total' | 'alert';
}

export interface EnergyWebSocketMessage {
  type: 'energy_update' | 'alert' | 'goal_progress';
  payload: EnergyUpdate | EnergyAlert | EnergyGoal;
  timestamp: Date;
}

// Chart data types for visualization
export interface EnergyChartData {
  timestamp: string;
  consumption: number;
  cost: number;
  efficiency?: number;
  weather?: number;
}

export interface DeviceChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface EnergyTrendData {
  period: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Energy Savings Tips Types
export type SavingsTipCategory = 'heating' | 'cooling' | 'lighting' | 'appliances' | 'general';

export interface EnergySavingsTip {
  id: string;
  title: string;
  description: string;
  category: SavingsTipCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  potentialSavings: number; // monthly savings in dollars
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high';
  steps: string[];
  tools: string[];
  isPersonalized?: boolean;
}

export interface UserProfile {
  homeType: 'apartment' | 'house' | 'condo' | 'townhouse';
  householdSize: number;
  averageUsage: number; // kWh per month
  primaryHeatingSource: 'gas' | 'electric' | 'oil' | 'solar';
  hasSmartDevices: boolean;
  energyGoals: string[];
}
