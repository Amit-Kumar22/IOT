/**
 * Billing Management Hook
 * 
 * Provides comprehensive billing management functionality including:
 * - Current and historical billing data
 * - Cost calculations and projections
 * - Usage tracking and monitoring
 * - Cost optimization suggestions
 * - Pricing alerts and notifications
 * - Billing analytics and reports
 * 
 * @version 1.0.0
 * @author IoT Platform Team
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { ApiClient } from '../lib/api';
import { BillingCalculator } from '../lib/billing';
import { CostOptimizer } from '../lib/optimization';
import { MQTTClient } from '../lib/realtime';

// Billing Types and Schemas
export interface BillingCycle {
  id: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'pending';
  totalCost: number;
  breakdown: {
    baseCost: number;
    usageCost: number;
    overageCost: number;
    energyCost: number;
    taxes: number;
    credits: number;
  };
  usage: {
    totalMessages: number;
    totalDataGB: number;
    totalDevices: number;
    totalApiCalls: number;
  };
  plan: {
    id: string;
    name: string;
    tier: 'basic' | 'premium' | 'enterprise';
  };
}

export interface BillingAlert {
  id: string;
  type: 'budget_warning' | 'overage_alert' | 'cost_spike' | 'optimization_suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  amount?: number;
  threshold?: number;
  createdAt: Date;
  acknowledged: boolean;
  actions?: {
    label: string;
    action: string;
    parameters?: Record<string, any>;
  }[];
}

export interface UsageMetrics {
  current: {
    messages: number;
    dataGB: number;
    devices: number;
    apiCalls: number;
    energyKWh: number;
  };
  limits: {
    messages: number;
    dataGB: number;
    devices: number;
    apiCalls: number;
  };
  percentages: {
    messages: number;
    dataGB: number;
    devices: number;
    apiCalls: number;
  };
  projectedMonthly: {
    messages: number;
    dataGB: number;
    devices: number;
    apiCalls: number;
    cost: number;
  };
}

export interface BillingReport {
  period: {
    start: Date;
    end: Date;
    type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  };
  summary: {
    totalCost: number;
    averageMonthlyCost: number;
    costGrowth: number;
    totalUsage: Record<string, number>;
    costBreakdown: Record<string, number>;
  };
  trends: {
    costTrend: Array<{ date: Date; cost: number }>;
    usageTrend: Array<{ date: Date; usage: Record<string, number> }>;
  };
  insights: {
    peakUsagePeriods: Array<{ start: Date; end: Date; cost: number }>;
    costDrivers: Array<{ category: string; percentage: number }>;
    optimizations: Array<{ description: string; potentialSavings: number }>;
  };
}

export interface BillingFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: BillingCycle['status'][];
  planTier?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface BillingSort {
  field: keyof BillingCycle;
  direction: 'asc' | 'desc';
}

// Validation Schemas
const BillingFilterSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  status: z.array(z.enum(['active', 'completed', 'pending'])).optional(),
  planTier: z.array(z.string()).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

/**
 * Billing Management Hook
 */
export function useBilling() {
  const dispatch = useDispatch();
  const apiClient = useRef<ApiClient | null>(null);
  const billingCalculator = useRef<BillingCalculator | null>(null);
  const costOptimizer = useRef<CostOptimizer | null>(null);
  const mqttClient = useRef<MQTTClient | null>(null);
  
  // State management
  const [currentCycle, setCurrentCycle] = useState<BillingCycle | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingCycle[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [alerts, setAlerts] = useState<BillingAlert[]>([]);
  const [reports, setReports] = useState<Record<string, BillingReport>>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BillingFilter>({});
  const [sort, setSort] = useState<BillingSort>({ field: 'startDate', direction: 'desc' });
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Initialize clients
  useEffect(() => {
    apiClient.current = new ApiClient();
    billingCalculator.current = new BillingCalculator();
    
    // Initialize cost optimizer with default settings
    const optimizationSettings = {
      budgetLimit: 1000, // Default budget limit
      alertThresholds: {
        budgetPercentage: 80,
        overagePercentage: 10,
        spikePercentage: 50,
      },
      optimizationPreferences: {
        aggressiveness: 'moderate' as const,
        prioritizeCostSavings: true,
        allowPlanChanges: true,
        allowFeatureChanges: true,
      },
    };
    
    costOptimizer.current = new CostOptimizer(optimizationSettings, billingCalculator.current);
    
    if (realtimeEnabled) {
      mqttClient.current = new MQTTClient({
        broker: 'mqtt://localhost',
        port: 1883,
        keepAlive: 60,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
      });
      mqttClient.current.connect().catch(console.error);
    }

    return () => {
      mqttClient.current?.disconnect();
    };
  }, [realtimeEnabled]);

  // Subscribe to real-time billing updates
  useEffect(() => {
    if (!mqttClient.current || !realtimeEnabled) return;

    const handleUsageUpdate = (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        updateUsageMetrics(data);
      } catch (error) {
        console.error('Failed to handle usage update:', error);
      }
    };

    const handleBillingAlert = (topic: string, message: Buffer) => {
      try {
        const alert = JSON.parse(message.toString()) as BillingAlert;
        setAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts
      } catch (error) {
        console.error('Failed to handle billing alert:', error);
      }
    };

    // Subscribe to billing events
    mqttClient.current.subscribe('billing/usage/update', handleUsageUpdate);
    mqttClient.current.subscribe('billing/alerts/+', handleBillingAlert);

    return () => {
      mqttClient.current?.unsubscribe('billing/usage/update');
      mqttClient.current?.unsubscribe('billing/alerts/+');
    };
  }, [realtimeEnabled]);

  // Update usage metrics with real-time data
  const updateUsageMetrics = useCallback((data: any) => {
    setUsageMetrics(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        current: {
          ...prev.current,
          ...data,
        },
        percentages: {
          messages: (data.messages || prev.current.messages) / prev.limits.messages * 100,
          dataGB: (data.dataGB || prev.current.dataGB) / prev.limits.dataGB * 100,
          devices: (data.devices || prev.current.devices) / prev.limits.devices * 100,
          apiCalls: (data.apiCalls || prev.current.apiCalls) / prev.limits.apiCalls * 100,
        },
      };
    });
  }, []);

  // Fetch current billing cycle
  const fetchCurrentCycle = useCallback(async () => {
    if (!apiClient.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.current.get<BillingCycle>('/billing/current');
      setCurrentCycle(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch current billing cycle');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch billing history
  const fetchBillingHistory = useCallback(async (refresh = false) => {
    if (!apiClient.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.current.get<BillingCycle[]>('/billing/history', {
        params: {
          ...filter,
          sort: `${sort.field}:${sort.direction}`,
          refresh,
        }
      });

      setBillingHistory(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch billing history');
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  // Fetch usage metrics
  const fetchUsageMetrics = useCallback(async () => {
    if (!apiClient.current) return;

    try {
      const response = await apiClient.current.get<UsageMetrics>('/billing/usage/current');
      setUsageMetrics(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch usage metrics');
    }
  }, []);

  // Fetch billing alerts
  const fetchAlerts = useCallback(async () => {
    if (!apiClient.current) return;

    try {
      const response = await apiClient.current.get<BillingAlert[]>('/billing/alerts');
      setAlerts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch billing alerts');
    }
  }, []);

  // Calculate cost for usage
  const calculateCost = useCallback((usage: Partial<UsageMetrics['current']>) => {
    if (!billingCalculator.current || !currentCycle) return null;

    try {
      // Create a mock plan for calculation
      const plan = {
        id: currentCycle.plan.id,
        name: currentCycle.plan.name,
        type: currentCycle.plan.tier as 'basic' | 'premium' | 'enterprise',
        baseFee: currentCycle.breakdown.baseCost,
        deviceLimit: 100, // Mock limits
        dataLimitGB: 1000,
        apiCallsLimit: 100000,
        storageGB: 100,
        features: [],
        overageRates: {
          perDevice: 5,
          perGB: 0.1,
          perApiCall: 0.001,
          perStorageGB: 0.05,
        },
      };

      const usageData = {
        devices: usage.devices || 0,
        dataUsageGB: usage.dataGB || 0,
        apiCalls: usage.apiCalls || 0,
        storageUsedGB: 10, // Mock storage
        energyConsumedKWh: usage.energyKWh || 0,
        period: {
          start: currentCycle.startDate,
          end: currentCycle.endDate,
        },
      };

      return billingCalculator.current.calculateBilling(plan, usageData);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate cost');
      return null;
    }
  }, [currentCycle]);

  // Get cost optimization suggestions
  const getOptimizationSuggestions = useCallback(async () => {
    if (!costOptimizer.current || !currentCycle || !usageMetrics) return [];

    try {
      // Create a mock plan for optimization
      const plan = {
        id: currentCycle.plan.id,
        name: currentCycle.plan.name,
        type: currentCycle.plan.tier as 'basic' | 'premium' | 'enterprise',
        baseFee: currentCycle.breakdown.baseCost,
        deviceLimit: 100,
        dataLimitGB: 1000,
        apiCallsLimit: 100000,
        storageGB: 100,
        features: [],
        overageRates: {
          perDevice: 5,
          perGB: 0.1,
          perApiCall: 0.001,
          perStorageGB: 0.05,
        },
      };

      // Create usage pattern
      const usagePattern = {
        averageMonthlyUsage: {
          devices: usageMetrics.current.devices,
          dataUsageGB: usageMetrics.current.dataGB,
          apiCalls: usageMetrics.current.apiCalls,
          storageUsedGB: 10,
          energyConsumedKWh: usageMetrics.current.energyKWh,
          period: {
            start: currentCycle.startDate,
            end: currentCycle.endDate,
          },
        },
        peakUsage: {
          devices: usageMetrics.current.devices * 1.5,
          dataUsageGB: usageMetrics.current.dataGB * 1.5,
          apiCalls: usageMetrics.current.apiCalls * 1.5,
          storageUsedGB: 15,
          energyConsumedKWh: usageMetrics.current.energyKWh * 1.5,
          period: {
            start: currentCycle.startDate,
            end: currentCycle.endDate,
          },
        },
        trends: {
          deviceGrowthRate: 10,
          dataGrowthRate: 15,
          apiCallGrowthRate: 20,
          storageGrowthRate: 5,
        },
        seasonality: {
          highSeasonMonths: [11, 12, 1],
          lowSeasonMonths: [6, 7, 8],
          seasonalityFactor: 1.2,
        },
      };

      // Mock historical billing
      const historicalBilling = [currentCycle].map(cycle => ({
        baseFee: cycle.breakdown.baseCost,
        overageCharges: {
          devices: cycle.breakdown.overageCost * 0.25,
          data: cycle.breakdown.overageCost * 0.25,
          apiCalls: cycle.breakdown.overageCost * 0.25,
          storage: cycle.breakdown.overageCost * 0.25,
        },
        energyCosts: cycle.breakdown.energyCost,
        totalAmount: cycle.totalCost,
        breakdown: [],
      }));

      return costOptimizer.current.generateOptimizationSuggestions(
        plan,
        usagePattern,
        historicalBilling
      );
    } catch (err: any) {
      setError(err.message || 'Failed to get optimization suggestions');
      return [];
    }
  }, [currentCycle, usageMetrics]);

  // Generate billing report
  const generateReport = useCallback(async (
    period: { start: Date; end: Date; type: 'monthly' | 'quarterly' | 'yearly' | 'custom' }
  ) => {
    if (!apiClient.current) return null;

    try {
      setLoading(true);
      
      const reportKey = `${period.type}-${period.start.getTime()}-${period.end.getTime()}`;
      
      // Check cache first
      if (reports[reportKey]) {
        return reports[reportKey];
      }

      const response = await apiClient.current.post<BillingReport>('/billing/reports', {
        period,
      });

      setReports(prev => ({
        ...prev,
        [reportKey]: response.data,
      }));

      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate billing report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [reports]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!apiClient.current) return;

    try {
      await apiClient.current.patch(`/billing/alerts/${alertId}`, {
        acknowledged: true,
      });

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge alert');
    }
  }, []);

  // Execute alert action
  const executeAlertAction = useCallback(async (alertId: string, actionIndex: number) => {
    if (!apiClient.current) return;

    const alert = alerts.find(a => a.id === alertId);
    if (!alert || !alert.actions || !alert.actions[actionIndex]) {
      setError('Invalid alert or action');
      return;
    }

    try {
      const action = alert.actions[actionIndex];
      
      await apiClient.current.post(`/billing/alerts/${alertId}/execute`, {
        action: action.action,
        parameters: action.parameters,
      });

      // Refresh current data after action
      await Promise.all([
        fetchCurrentCycle(),
        fetchUsageMetrics(),
        fetchAlerts(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to execute alert action');
    }
  }, [alerts, fetchCurrentCycle, fetchUsageMetrics, fetchAlerts]);

  // Update billing plan
  const updateBillingPlan = useCallback(async (planId: string) => {
    if (!apiClient.current) return;

    try {
      setLoading(true);
      
      await apiClient.current.patch('/billing/plan', {
        planId,
      });

      // Refresh current cycle and usage after plan change
      await Promise.all([
        fetchCurrentCycle(),
        fetchUsageMetrics(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to update billing plan');
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentCycle, fetchUsageMetrics]);

  // Export billing data
  const exportBillingData = useCallback(async (
    format: 'csv' | 'pdf' | 'json',
    period?: { start: Date; end: Date }
  ) => {
    if (!apiClient.current) return null;

    try {
      setLoading(true);
      
      const response = await apiClient.current.get('/billing/export', {
        params: {
          format,
          startDate: period?.start?.toISOString(),
          endDate: period?.end?.toISOString(),
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billing-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to export billing data');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed values
  const filteredHistory = useMemo(() => {
    let result = [...billingHistory];

    // Apply filters
    if (filter.dateRange) {
      result = result.filter(cycle => {
        const cycleStart = new Date(cycle.startDate);
        return cycleStart >= filter.dateRange!.start && cycleStart <= filter.dateRange!.end;
      });
    }

    if (filter.status?.length) {
      result = result.filter(cycle => filter.status!.includes(cycle.status));
    }

    if (filter.planTier?.length) {
      result = result.filter(cycle => filter.planTier!.includes(cycle.plan.tier));
    }

    if (filter.minAmount !== undefined) {
      result = result.filter(cycle => cycle.totalCost >= filter.minAmount!);
    }

    if (filter.maxAmount !== undefined) {
      result = result.filter(cycle => cycle.totalCost <= filter.maxAmount!);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [billingHistory, filter, sort]);

  const unacknowledgedAlerts = useMemo(() => 
    alerts.filter(alert => !alert.acknowledged),
    [alerts]
  );

  const criticalAlerts = useMemo(() => 
    alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged),
    [alerts]
  );

  const billingStats = useMemo(() => {
    if (!billingHistory.length) return null;

    const totalCost = billingHistory.reduce((sum, cycle) => sum + cycle.totalCost, 0);
    const averageCost = totalCost / billingHistory.length;
    const lastMonth = billingHistory[0];
    const previousMonth = billingHistory[1];
    
    const costGrowth = previousMonth 
      ? ((lastMonth.totalCost - previousMonth.totalCost) / previousMonth.totalCost) * 100
      : 0;

    return {
      totalCost,
      averageCost,
      costGrowth,
      totalCycles: billingHistory.length,
    };
  }, [billingHistory]);

  // Initial data loading
  useEffect(() => {
    Promise.all([
      fetchCurrentCycle(),
      fetchBillingHistory(),
      fetchUsageMetrics(),
      fetchAlerts(),
    ]).catch(console.error);
  }, [fetchCurrentCycle, fetchBillingHistory, fetchUsageMetrics, fetchAlerts]);

  // Utility functions
  const getCycleById = useCallback((cycleId: string) => 
    billingHistory.find(cycle => cycle.id === cycleId),
    [billingHistory]
  );

  const isOverage = useCallback((type: keyof UsageMetrics['percentages']) => {
    if (!usageMetrics) return false;
    return usageMetrics.percentages[type] > 100;
  }, [usageMetrics]);

  const getUsagePercentage = useCallback((type: keyof UsageMetrics['percentages']) => {
    if (!usageMetrics) return 0;
    return Math.min(usageMetrics.percentages[type], 100);
  }, [usageMetrics]);

  return {
    // Data
    currentCycle,
    billingHistory: filteredHistory,
    allBillingHistory: billingHistory,
    usageMetrics,
    alerts,
    unacknowledgedAlerts,
    criticalAlerts,
    reports,
    billingStats,
    
    // State
    loading,
    error,
    filter,
    sort,
    realtimeEnabled,
    
    // Actions
    fetchCurrentCycle,
    fetchBillingHistory,
    fetchUsageMetrics,
    fetchAlerts,
    calculateCost,
    getOptimizationSuggestions,
    generateReport,
    acknowledgeAlert,
    executeAlertAction,
    updateBillingPlan,
    exportBillingData,
    
    // Utilities
    getCycleById,
    isOverage,
    getUsagePercentage,
    setFilter,
    setSort,
    setRealtimeEnabled,
    setError: (error: string | null) => setError(error),
    
    // Refresh
    refresh: () => Promise.all([
      fetchCurrentCycle(),
      fetchBillingHistory(true),
      fetchUsageMetrics(),
      fetchAlerts(),
    ]),
  };
}
