import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { ApiClient } from '@/lib/api';
import { MQTTClient } from '@/lib/realtime';
import { RootState } from '@/store';
import { 
  setAnalyticsData, 
  setAnalyticsLoading, 
  setAnalyticsError,
  updateAnalyticsMetrics,
  clearAnalyticsError 
} from '@/store/slices/analyticsSlice';

// Zod schemas for validation
const TimeRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

const MetricTypeSchema = z.enum(['devices', 'usage', 'performance', 'errors', 'custom']);

const ChartTypeSchema = z.enum(['line', 'bar', 'pie', 'area', 'scatter']);

const AggregationTypeSchema = z.enum(['sum', 'avg', 'max', 'min', 'count']);

const AnalyticsFilterSchema = z.object({
  timeRange: TimeRangeSchema.optional(),
  metricTypes: z.array(MetricTypeSchema).optional(),
  deviceIds: z.array(z.string()).optional(),
  companyId: z.string().optional(),
  customFilters: z.record(z.any()).optional(),
});

const ChartConfigSchema = z.object({
  type: ChartTypeSchema,
  aggregation: AggregationTypeSchema,
  groupBy: z.string().optional(),
  timeInterval: z.enum(['minute', 'hour', 'day', 'week', 'month']).optional(),
});

const MetricDataPointSchema = z.object({
  timestamp: z.date(),
  value: z.number(),
  deviceId: z.string().optional(),
  metricType: MetricTypeSchema,
  metadata: z.record(z.any()).optional(),
});

const AnalyticsDatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  dataPoints: z.array(MetricDataPointSchema),
  config: ChartConfigSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

const AnalyticsReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  datasets: z.array(AnalyticsDatasetSchema),
  filters: AnalyticsFilterSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  isScheduled: z.boolean().optional(),
  scheduleConfig: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string(),
    recipients: z.array(z.string()),
  }).optional(),
});

const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['chart', 'metric', 'table', 'alert']),
  title: z.string(),
  datasetId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  config: z.record(z.any()).optional(),
});

const AnalyticsDashboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  widgets: z.array(DashboardWidgetSchema),
  layout: z.enum(['grid', 'flex']).optional(),
  isPublic: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const AlertRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  metricType: MetricTypeSchema,
  condition: z.object({
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    value: z.number(),
    aggregation: AggregationTypeSchema,
    timeWindow: z.number(), // in minutes
  }),
  actions: z.array(z.object({
    type: z.enum(['email', 'webhook', 'slack']),
    config: z.record(z.any()),
  })),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const RealTimeMetricsSchema = z.object({
  deviceCount: z.number(),
  activeDevices: z.number(),
  totalApiCalls: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number(),
  dataVolume: z.number(),
  timestamp: z.date(),
});

// TypeScript interfaces
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface AnalyticsFilter {
  timeRange?: TimeRange;
  metricTypes?: MetricType[];
  deviceIds?: string[];
  companyId?: string;
  customFilters?: Record<string, any>;
}

export interface ChartConfig {
  type: ChartType;
  aggregation: AggregationType;
  groupBy?: string;
  timeInterval?: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  deviceId?: string;
  metricType: MetricType;
  metadata?: Record<string, any>;
}

export interface AnalyticsDataset {
  id: string;
  name: string;
  description?: string;
  dataPoints: MetricDataPoint[];
  config: ChartConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description?: string;
  datasets: AnalyticsDataset[];
  filters: AnalyticsFilter;
  createdAt: Date;
  updatedAt: Date;
  isScheduled?: boolean;
  scheduleConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert';
  title: string;
  datasetId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config?: Record<string, any>;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout?: 'grid' | 'flex';
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metricType: MetricType;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    aggregation: AggregationType;
    timeWindow: number;
  };
  actions: Array<{
    type: 'email' | 'webhook' | 'slack';
    config: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeMetrics {
  deviceCount: number;
  activeDevices: number;
  totalApiCalls: number;
  averageResponseTime: number;
  errorRate: number;
  dataVolume: number;
  timestamp: Date;
}

// Type aliases
export type MetricType = z.infer<typeof MetricTypeSchema>;
export type ChartType = z.infer<typeof ChartTypeSchema>;
export type AggregationType = z.infer<typeof AggregationTypeSchema>;

// Analytics hook
export function useAnalytics() {
  const dispatch = useDispatch();
  const { data: analyticsData, loading, error } = useSelector((state: RootState) => state.analytics);
  
  // Local state
  const [datasets, setDatasets] = useState<AnalyticsDataset[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date(),
  });
  const [activeFilters, setActiveFilters] = useState<AnalyticsFilter>({});
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Client references
  const apiClient = useRef<ApiClient>(new ApiClient());
  const mqttClient = useRef<MQTTClient>(new MQTTClient());

  // Initialize analytics data
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch(setAnalyticsLoading(true));
      try {
        await Promise.all([
          fetchDatasets(),
          fetchReports(),
          fetchDashboards(),
          fetchAlertRules(),
          fetchRealTimeMetrics(),
        ]);
      } catch (err: any) {
        dispatch(setAnalyticsError(err.message || 'Failed to load analytics data'));
      } finally {
        dispatch(setAnalyticsLoading(false));
      }
    };

    loadInitialData();
  }, [dispatch]);

  // Setup real-time data subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    const subscribeToRealTimeMetrics = async () => {
      try {
        await mqttClient.current.connect();
        
        // Subscribe to real-time metrics
        mqttClient.current.subscribe('analytics/realtime/metrics', (data) => {
          try {
            const metrics = RealTimeMetricsSchema.parse({
              ...data,
              timestamp: new Date(data.timestamp),
            });
            setRealTimeMetrics(metrics);
            dispatch(updateAnalyticsMetrics(metrics));
          } catch (err) {
            console.error('Failed to parse real-time metrics:', err);
          }
        });

        // Subscribe to dataset updates
        mqttClient.current.subscribe('analytics/datasets/+/update', (data) => {
          try {
            const dataset = AnalyticsDatasetSchema.parse({
              ...data,
              dataPoints: data.dataPoints.map((dp: any) => ({
                ...dp,
                timestamp: new Date(dp.timestamp),
              })),
              createdAt: new Date(data.createdAt),
              updatedAt: new Date(data.updatedAt),
            });
            
            setDatasets(prev => 
              prev.map(d => d.id === dataset.id ? dataset : d)
            );
          } catch (err) {
            console.error('Failed to parse dataset update:', err);
          }
        });

        // Subscribe to alert notifications
        mqttClient.current.subscribe('analytics/alerts/+/triggered', (data) => {
          console.log('Alert triggered:', data);
          // Handle alert notifications
        });
      } catch (err) {
        console.error('Failed to setup real-time analytics:', err);
      }
    };

    subscribeToRealTimeMetrics();

    return () => {
      mqttClient.current.disconnect();
    };
  }, [realtimeEnabled, dispatch]);

  // Fetch datasets
  const fetchDatasets = useCallback(async (filters?: AnalyticsFilter) => {
    try {
      const response = await apiClient.current.get<AnalyticsDataset[]>('/analytics/datasets', {
        params: filters && Object.keys(filters).length > 0 ? { filters } : undefined,
      });

      const validatedDatasets = response.data.map(dataset => 
        AnalyticsDatasetSchema.parse({
          ...dataset,
          dataPoints: dataset.dataPoints.map(dp => ({
            ...dp,
            timestamp: new Date(dp.timestamp),
          })),
          createdAt: new Date(dataset.createdAt),
          updatedAt: new Date(dataset.updatedAt),
        })
      );

      setDatasets(validatedDatasets);
      return validatedDatasets;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to fetch datasets'));
      return [];
    }
  }, [dispatch]);

  // Fetch reports
  const fetchReports = useCallback(async (filters?: AnalyticsFilter) => {
    try {
      const response = await apiClient.current.get<AnalyticsReport[]>('/analytics/reports', {
        params: filters && Object.keys(filters).length > 0 ? { filters } : undefined,
      });

      const validatedReports = response.data.map(report => 
        AnalyticsReportSchema.parse({
          ...report,
          datasets: report.datasets.map(dataset => ({
            ...dataset,
            dataPoints: dataset.dataPoints.map(dp => ({
              ...dp,
              timestamp: new Date(dp.timestamp),
            })),
            createdAt: new Date(dataset.createdAt),
            updatedAt: new Date(dataset.updatedAt),
          })),
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
        })
      );

      setReports(validatedReports);
      return validatedReports;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to fetch reports'));
      return [];
    }
  }, [dispatch]);

  // Fetch dashboards
  const fetchDashboards = useCallback(async () => {
    try {
      const response = await apiClient.current.get<AnalyticsDashboard[]>('/analytics/dashboards');

      const validatedDashboards = response.data.map(dashboard => 
        AnalyticsDashboardSchema.parse({
          ...dashboard,
          createdAt: new Date(dashboard.createdAt),
          updatedAt: new Date(dashboard.updatedAt),
        })
      );

      setDashboards(validatedDashboards);
      return validatedDashboards;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to fetch dashboards'));
      return [];
    }
  }, [dispatch]);

  // Fetch alert rules
  const fetchAlertRules = useCallback(async () => {
    try {
      const response = await apiClient.current.get<AlertRule[]>('/analytics/alerts');

      const validatedRules = response.data.map(rule => 
        AlertRuleSchema.parse({
          ...rule,
          createdAt: new Date(rule.createdAt),
          updatedAt: new Date(rule.updatedAt),
        })
      );

      setAlertRules(validatedRules);
      return validatedRules;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to fetch alert rules'));
      return [];
    }
  }, [dispatch]);

  // Fetch real-time metrics
  const fetchRealTimeMetrics = useCallback(async () => {
    try {
      const response = await apiClient.current.get<RealTimeMetrics>('/analytics/metrics/realtime');
      
      const validatedMetrics = RealTimeMetricsSchema.parse({
        ...response.data,
        timestamp: new Date(response.data.timestamp),
      });

      setRealTimeMetrics(validatedMetrics);
      return validatedMetrics;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to fetch real-time metrics'));
      return null;
    }
  }, [dispatch]);

  // Create dataset
  const createDataset = useCallback(async (
    name: string,
    config: ChartConfig,
    description?: string
  ) => {
    try {
      const response = await apiClient.current.post<AnalyticsDataset>('/analytics/datasets', {
        name,
        config,
        description,
      });

      const newDataset = AnalyticsDatasetSchema.parse({
        ...response.data,
        dataPoints: response.data.dataPoints.map(dp => ({
          ...dp,
          timestamp: new Date(dp.timestamp),
        })),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setDatasets(prev => [...prev, newDataset]);
      return newDataset;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to create dataset'));
      return null;
    }
  }, [dispatch]);

  // Update dataset
  const updateDataset = useCallback(async (
    id: string,
    updates: Partial<Omit<AnalyticsDataset, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const response = await apiClient.current.patch<AnalyticsDataset>(`/analytics/datasets/${id}`, updates);

      const updatedDataset = AnalyticsDatasetSchema.parse({
        ...response.data,
        dataPoints: response.data.dataPoints.map(dp => ({
          ...dp,
          timestamp: new Date(dp.timestamp),
        })),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setDatasets(prev => 
        prev.map(dataset => dataset.id === id ? updatedDataset : dataset)
      );

      return updatedDataset;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to update dataset'));
      return null;
    }
  }, [dispatch]);

  // Delete dataset
  const deleteDataset = useCallback(async (id: string) => {
    try {
      await apiClient.current.delete(`/analytics/datasets/${id}`);
      setDatasets(prev => prev.filter(dataset => dataset.id !== id));
      return true;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to delete dataset'));
      return false;
    }
  }, [dispatch]);

  // Create report
  const createReport = useCallback(async (
    title: string,
    datasetIds: string[],
    filters: AnalyticsFilter,
    description?: string
  ) => {
    try {
      const response = await apiClient.current.post<AnalyticsReport>('/analytics/reports', {
        title,
        datasetIds,
        filters,
        description,
      });

      const newReport = AnalyticsReportSchema.parse({
        ...response.data,
        datasets: response.data.datasets.map(dataset => ({
          ...dataset,
          dataPoints: dataset.dataPoints.map(dp => ({
            ...dp,
            timestamp: new Date(dp.timestamp),
          })),
          createdAt: new Date(dataset.createdAt),
          updatedAt: new Date(dataset.updatedAt),
        })),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to create report'));
      return null;
    }
  }, [dispatch]);

  // Generate report
  const generateReport = useCallback(async (reportId: string) => {
    try {
      const response = await apiClient.current.post(`/analytics/reports/${reportId}/generate`);
      return response.data;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to generate report'));
      return null;
    }
  }, [dispatch]);

  // Create dashboard
  const createDashboard = useCallback(async (
    name: string,
    widgets: DashboardWidget[],
    description?: string
  ) => {
    try {
      const response = await apiClient.current.post<AnalyticsDashboard>('/analytics/dashboards', {
        name,
        widgets,
        description,
      });

      const newDashboard = AnalyticsDashboardSchema.parse({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setDashboards(prev => [...prev, newDashboard]);
      return newDashboard;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to create dashboard'));
      return null;
    }
  }, [dispatch]);

  // Update dashboard
  const updateDashboard = useCallback(async (
    id: string,
    updates: Partial<Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const response = await apiClient.current.patch<AnalyticsDashboard>(`/analytics/dashboards/${id}`, updates);

      const updatedDashboard = AnalyticsDashboardSchema.parse({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setDashboards(prev => 
        prev.map(dashboard => dashboard.id === id ? updatedDashboard : dashboard)
      );

      return updatedDashboard;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to update dashboard'));
      return null;
    }
  }, [dispatch]);

  // Create alert rule
  const createAlertRule = useCallback(async (
    name: string,
    metricType: MetricType,
    condition: AlertRule['condition'],
    actions: AlertRule['actions'],
    description?: string
  ) => {
    try {
      const response = await apiClient.current.post<AlertRule>('/analytics/alerts', {
        name,
        metricType,
        condition,
        actions,
        description,
        isActive: true,
      });

      const newRule = AlertRuleSchema.parse({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setAlertRules(prev => [...prev, newRule]);
      return newRule;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to create alert rule'));
      return null;
    }
  }, [dispatch]);

  // Toggle alert rule
  const toggleAlertRule = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await apiClient.current.patch<AlertRule>(`/analytics/alerts/${id}`, {
        isActive,
      });

      const updatedRule = AlertRuleSchema.parse({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });

      setAlertRules(prev => 
        prev.map(rule => rule.id === id ? updatedRule : rule)
      );

      return updatedRule;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to toggle alert rule'));
      return null;
    }
  }, [dispatch]);

  // Export data
  const exportData = useCallback(async (
    type: 'dataset' | 'report' | 'dashboard',
    id: string,
    format: 'json' | 'csv' | 'xlsx'
  ) => {
    try {
      const response = await apiClient.current.get(`/analytics/export/${type}/${id}`, {
        params: { format },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to export data'));
      return false;
    }
  }, [dispatch]);

  // Computed values
  const filteredDatasets = useMemo(() => {
    let result = [...datasets];

    if (activeFilters.timeRange) {
      result = result.filter(dataset => {
        const datasetTime = dataset.updatedAt;
        return datasetTime >= activeFilters.timeRange!.start && 
               datasetTime <= activeFilters.timeRange!.end;
      });
    }

    if (activeFilters.metricTypes && activeFilters.metricTypes.length > 0) {
      result = result.filter(dataset => 
        dataset.dataPoints.some(dp => 
          activeFilters.metricTypes!.includes(dp.metricType)
        )
      );
    }

    if (activeFilters.deviceIds && activeFilters.deviceIds.length > 0) {
      result = result.filter(dataset =>
        dataset.dataPoints.some(dp =>
          dp.deviceId && activeFilters.deviceIds!.includes(dp.deviceId)
        )
      );
    }

    return result;
  }, [datasets, activeFilters]);

  const aggregatedMetrics = useMemo(() => {
    if (!realTimeMetrics) return null;

    return {
      totalDevices: realTimeMetrics.deviceCount,
      activeDevices: realTimeMetrics.activeDevices,
      deviceUtilization: realTimeMetrics.deviceCount > 0 
        ? (realTimeMetrics.activeDevices / realTimeMetrics.deviceCount) * 100 
        : 0,
      totalApiCalls: realTimeMetrics.totalApiCalls,
      averageResponseTime: realTimeMetrics.averageResponseTime,
      errorRate: realTimeMetrics.errorRate,
      dataVolume: realTimeMetrics.dataVolume,
    };
  }, [realTimeMetrics]);

  const activeAlertRules = useMemo(() => {
    return alertRules.filter(rule => rule.isActive);
  }, [alertRules]);

  // Utility functions
  const clearError = useCallback(() => {
    dispatch(clearAnalyticsError());
  }, [dispatch]);

  const setTimeRange = useCallback((range: TimeRange) => {
    setSelectedTimeRange(range);
    setActiveFilters(prev => ({ ...prev, timeRange: range }));
  }, []);

  const applyFilters = useCallback((filters: AnalyticsFilter) => {
    setActiveFilters(filters);
    if (filters.timeRange) {
      setSelectedTimeRange(filters.timeRange);
    }
  }, []);

  const refreshData = useCallback(async () => {
    dispatch(setAnalyticsLoading(true));
    try {
      await Promise.all([
        fetchDatasets(activeFilters),
        fetchReports(activeFilters),
        fetchDashboards(),
        fetchAlertRules(),
        fetchRealTimeMetrics(),
      ]);
    } catch (err: any) {
      dispatch(setAnalyticsError(err.message || 'Failed to refresh data'));
    } finally {
      dispatch(setAnalyticsLoading(false));
    }
  }, [dispatch, activeFilters, fetchDatasets, fetchReports, fetchDashboards, fetchAlertRules, fetchRealTimeMetrics]);

  return {
    // State
    datasets,
    reports,
    dashboards,
    alertRules,
    realTimeMetrics,
    loading,
    error,
    selectedTimeRange,
    activeFilters,
    realtimeEnabled,

    // Computed values
    filteredDatasets,
    aggregatedMetrics,
    activeAlertRules,

    // Actions
    fetchDatasets,
    fetchReports,
    fetchDashboards,
    fetchAlertRules,
    fetchRealTimeMetrics,
    createDataset,
    updateDataset,
    deleteDataset,
    createReport,
    generateReport,
    createDashboard,
    updateDashboard,
    createAlertRule,
    toggleAlertRule,
    exportData,
    refreshData,

    // Utility functions
    clearError,
    setTimeRange,
    applyFilters,
    setRealtimeEnabled,
  };
}
