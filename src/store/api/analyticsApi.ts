import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DeviceAnalytics {
  deviceId: string;
  metrics: {
    uptime: number;
    errorRate: number;
    dataPointsCount: number;
    averageResponseTime: number;
    batteryLevel?: number;
    signalStrength?: number;
  };
  trends: {
    period: string;
    uptimeTrend: number;
    errorTrend: number;
    usageTrend: number;
  };
}

export interface CompanyAnalytics {
  companyId: string;
  overview: {
    totalDevices: number;
    activeDevices: number;
    totalDataPoints: number;
    totalAlerts: number;
    averageUptime: number;
  };
  deviceBreakdown: {
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
  };
  usage: {
    daily: { date: string; dataPoints: number; deviceActivity: number }[];
    monthly: { month: string; dataPoints: number; costs: number }[];
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
    resolved: number;
  };
}

export interface SystemAnalytics {
  overview: {
    totalCompanies: number;
    totalDevices: number;
    totalUsers: number;
    systemUptime: number;
    totalDataPoints: number;
    revenue: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    concurrent_users: number;
  };
  usage: {
    topCompanies: { companyId: string; name: string; deviceCount: number; usage: number }[];
    deviceTypeDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
  };
  trends: {
    userGrowth: { month: string; newUsers: number; churnRate: number }[];
    revenueGrowth: { month: string; revenue: number; growth: number }[];
    deviceGrowth: { month: string; newDevices: number; activeDevices: number }[];
  };
}

export interface AlertAnalytics {
  companyId?: string;
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    resolved: number;
    unresolved: number;
  };
  trends: {
    daily: { date: string; count: number; type: string }[];
    byDevice: { deviceId: string; deviceName: string; count: number }[];
    byType: { type: string; count: number; averageResolutionTime: number }[];
  };
  topIssues: {
    issue: string;
    count: number;
    affectedDevices: number;
    averageResolutionTime: number;
  }[];
}

export interface RealTimeMetrics {
  timestamp: string;
  activeConnections: number;
  messagesPerSecond: number;
  averageLatency: number;
  errorRate: number;
  onlineDevices: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export interface AnalyticsQuery {
  companyId?: string;
  deviceId?: string;
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/analytics',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Analytics', 'RealTime', 'Reports'],
  endpoints: (builder) => ({
    // Device analytics
    getDeviceAnalytics: builder.query<DeviceAnalytics, AnalyticsQuery & { deviceId: string }>({
      query: ({ deviceId, ...params }) => ({
        url: `/devices/${deviceId}`,
        params,
      }),
      providesTags: (result, error, { deviceId }) => [{ type: 'Analytics', id: deviceId }],
    }),
    
    getDeviceMetrics: builder.query<{
      timestamps: string[];
      metrics: Record<string, number[]>;
    }, AnalyticsQuery & { deviceId: string }>({
      query: ({ deviceId, ...params }) => ({
        url: `/devices/${deviceId}/metrics`,
        params,
      }),
      providesTags: (result, error, { deviceId }) => [{ type: 'Analytics', id: `metrics-${deviceId}` }],
    }),
    
    // Company analytics
    getCompanyAnalytics: builder.query<CompanyAnalytics, AnalyticsQuery>({
      query: (params) => ({
        url: '/company',
        params,
      }),
      providesTags: (result, error, { companyId }) => [
        { type: 'Analytics', id: companyId || 'company' }
      ],
    }),
    
    getCompanyDashboard: builder.query<{
      overview: CompanyAnalytics['overview'];
      recentAlerts: { id: string; message: string; severity: string; timestamp: string }[];
      topDevices: { deviceId: string; name: string; uptime: number; dataPoints: number }[];
      usageChart: { labels: string[]; datasets: { label: string; data: number[] }[] };
    }, { companyId?: string }>({
      query: (params) => ({
        url: '/company/dashboard',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // System analytics (admin only)
    getSystemAnalytics: builder.query<SystemAnalytics, AnalyticsQuery>({
      query: (params) => ({
        url: '/system',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getSystemDashboard: builder.query<{
      overview: SystemAnalytics['overview'];
      performance: SystemAnalytics['performance'];
      recentActivity: { id: string; action: string; user: string; timestamp: string }[];
      alerts: { id: string; message: string; severity: string; timestamp: string }[];
    }, void>({
      query: () => '/system/dashboard',
      providesTags: ['Analytics'],
    }),
    
    // Alert analytics
    getAlertAnalytics: builder.query<AlertAnalytics, AnalyticsQuery>({
      query: (params) => ({
        url: '/alerts',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Real-time metrics
    getRealTimeMetrics: builder.query<RealTimeMetrics, void>({
      query: () => '/realtime',
      providesTags: ['RealTime'],
    }),
    
    // Custom reports
    generateReport: builder.mutation<{
      reportId: string;
      downloadUrl: string;
    }, {
      type: 'device' | 'company' | 'system' | 'usage' | 'billing';
      format: 'pdf' | 'csv' | 'xlsx';
      parameters: AnalyticsQuery;
    }>({
      query: (reportData) => ({
        url: '/reports/generate',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: ['Reports'],
    }),
    
    getReports: builder.query<{
      id: string;
      type: string;
      format: string;
      status: 'pending' | 'completed' | 'failed';
      downloadUrl?: string;
      createdAt: string;
      expiresAt: string;
    }[], void>({
      query: () => '/reports',
      providesTags: ['Reports'],
    }),
    
    downloadReport: builder.query<Blob, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Data export
    exportData: builder.mutation<{
      exportId: string;
      downloadUrl: string;
    }, {
      type: 'devices' | 'analytics' | 'usage';
      format: 'json' | 'csv' | 'xlsx';
      filters: AnalyticsQuery;
    }>({
      query: (exportData) => ({
        url: '/export',
        method: 'POST',
        body: exportData,
      }),
    }),
    
    // Comparative analytics
    compareDevices: builder.query<{
      devices: string[];
      metrics: string[];
      data: Record<string, { timestamps: string[]; values: number[] }>;
    }, {
      deviceIds: string[];
      metrics: string[];
      startDate: string;
      endDate: string;
    }>({
      query: (params) => ({
        url: '/compare/devices',
        params: {
          ...params,
          deviceIds: params.deviceIds.join(','),
          metrics: params.metrics.join(','),
        },
      }),
      providesTags: ['Analytics'],
    }),
    
    comparePeriods: builder.query<{
      current: any;
      previous: any;
      comparison: Record<string, { change: number; percentage: number }>;
    }, {
      companyId?: string;
      currentStart: string;
      currentEnd: string;
      previousStart: string;
      previousEnd: string;
    }>({
      query: (params) => ({
        url: '/compare/periods',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Predictions and forecasting
    getUsageForecast: builder.query<{
      predictions: { date: string; predicted: number; confidence: number }[];
      accuracy: number;
      model: string;
    }, {
      companyId?: string;
      days: number;
      metric: 'devices' | 'dataPoints' | 'costs';
    }>({
      query: (params) => ({
        url: '/forecast/usage',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getAnomalies: builder.query<{
      deviceId: string;
      timestamp: string;
      metric: string;
      value: number;
      expected: number;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }[], {
      companyId?: string;
      deviceId?: string;
      days?: number;
    }>({
      query: (params) => ({
        url: '/anomalies',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDeviceAnalyticsQuery,
  useGetDeviceMetricsQuery,
  useGetCompanyAnalyticsQuery,
  useGetCompanyDashboardQuery,
  useGetSystemAnalyticsQuery,
  useGetSystemDashboardQuery,
  useGetAlertAnalyticsQuery,
  useGetRealTimeMetricsQuery,
  useGenerateReportMutation,
  useGetReportsQuery,
  useDownloadReportQuery,
  useExportDataMutation,
  useCompareDevicesQuery,
  useComparePeriodsQuery,
  useGetUsageForecastQuery,
  useGetAnomaliesQuery,
} = analyticsApi;
