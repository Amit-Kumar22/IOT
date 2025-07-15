/**
 * Error Reporting Analytics
 * Advanced error tracking and analytics system
 */

import { errorReporter, ErrorSeverity, ErrorCategory } from '../lib/errorReporting';
import { performanceMonitor, MetricType } from '../lib/performance';

// Analytics interfaces
interface ErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByTime: Array<{ timestamp: number; count: number }>;
  topErrorMessages: Array<{ message: string; count: number }>;
  errorRate: number;
  meanTimeToResolution: number;
  userImpact: number;
}

interface ErrorTrend {
  period: 'hour' | 'day' | 'week' | 'month';
  data: Array<{
    timestamp: number;
    errorCount: number;
    uniqueUsers: number;
    criticalErrors: number;
    resolvedErrors: number;
  }>;
}

interface ErrorInsight {
  type: 'spike' | 'pattern' | 'anomaly' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  data: Record<string, any>;
}

interface ErrorAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'pattern';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  acknowledgedBy?: string;
  data: Record<string, any>;
}

// Error analytics configuration
interface AnalyticsConfig {
  enableRealTimeMonitoring: boolean;
  alertThresholds: {
    errorRate: number;
    criticalErrorCount: number;
    errorSpike: number;
  };
  retentionPeriod: number; // days
  aggregationIntervals: {
    realTime: number; // minutes
    hourly: number;
    daily: number;
  };
}

/**
 * Error Analytics Manager
 */
export class ErrorAnalyticsManager {
  private config: AnalyticsConfig;
  private errorHistory: Array<any> = [];
  private alerts: ErrorAlert[] = [];
  private insights: ErrorInsight[] = [];
  private subscribers: Array<(analytics: ErrorAnalytics) => void> = [];

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      alertThresholds: {
        errorRate: 0.05, // 5%
        criticalErrorCount: 10,
        errorSpike: 2.0, // 2x normal rate
      },
      retentionPeriod: 30,
      aggregationIntervals: {
        realTime: 5,
        hourly: 60,
        daily: 1440,
      },
      ...config,
    };

    this.initializeAnalytics();
  }

  /**
   * Initialize analytics system
   */
  private initializeAnalytics(): void {
    // Load historical data
    this.loadHistoricalData();

    // Set up real-time monitoring
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }

    // Set up periodic analysis
    this.startPeriodicAnalysis();

    // Clean up old data
    this.startDataCleanup();
  }

  /**
   * Track error occurrence
   */
  trackError(error: Error, context: Record<string, any> = {}): void {
    const errorData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      severity: this.categorizeErrorSeverity(error),
      category: this.categorizeError(error),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        ...context,
      },
      resolved: false,
      resolutionTime: null,
    };

    // Add to history
    this.errorHistory.push(errorData);

    // Update analytics
    this.updateAnalytics();

    // Check for alerts
    this.checkAlerts();

    // Generate insights
    this.generateInsights();

    // Report to external service
    this.reportToExternalService(errorData);

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Get current analytics
   */
  getAnalytics(timeRange?: { start: number; end: number }): ErrorAnalytics {
    const errors = timeRange
      ? this.errorHistory.filter(
          error => error.timestamp >= timeRange.start && error.timestamp <= timeRange.end
        )
      : this.errorHistory;

    const totalErrors = errors.length;
    const errorsByCategory = this.groupByCategory(errors);
    const errorsBySeverity = this.groupBySeverity(errors);
    const errorsByTime = this.groupByTime(errors);
    const topErrorMessages = this.getTopErrorMessages(errors);
    const errorRate = this.calculateErrorRate(errors);
    const meanTimeToResolution = this.calculateMTTR(errors);
    const userImpact = this.calculateUserImpact(errors);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByTime,
      topErrorMessages,
      errorRate,
      meanTimeToResolution,
      userImpact,
    };
  }

  /**
   * Get error trends
   */
  getTrends(period: 'hour' | 'day' | 'week' | 'month'): ErrorTrend {
    const now = Date.now();
    const intervals = this.getTimeIntervals(period, now);

    const data = intervals.map(interval => {
      const errors = this.errorHistory.filter(
        error => error.timestamp >= interval.start && error.timestamp < interval.end
      );

      return {
        timestamp: interval.start,
        errorCount: errors.length,
        uniqueUsers: new Set(errors.map(e => e.context.userId)).size,
        criticalErrors: errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
        resolvedErrors: errors.filter(e => e.resolved).length,
      };
    });

    return { period, data };
  }

  /**
   * Get insights
   */
  getInsights(): ErrorInsight[] {
    return this.insights;
  }

  /**
   * Get alerts
   */
  getAlerts(): ErrorAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedBy = acknowledgedBy;
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Subscribe to analytics updates
   */
  subscribe(callback: (analytics: ErrorAnalytics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const analytics = this.getAnalytics();
    
    if (format === 'csv') {
      return this.convertToCSV(this.errorHistory);
    }
    
    return JSON.stringify({
      analytics,
      errors: this.errorHistory,
      alerts: this.alerts,
      insights: this.insights,
      exportedAt: Date.now(),
    }, null, 2);
  }

  // Private methods

  private loadHistoricalData(): void {
    try {
      const stored = localStorage.getItem('errorAnalytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.errorHistory = data.errorHistory || [];
        this.alerts = data.alerts || [];
        this.insights = data.insights || [];
      }
    } catch (error) {
      console.warn('Failed to load historical error data:', error);
    }
  }

  private saveAnalyticsData(): void {
    try {
      const data = {
        errorHistory: this.errorHistory,
        alerts: this.alerts,
        insights: this.insights,
        lastSaved: Date.now(),
      };
      localStorage.setItem('errorAnalytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  private startRealTimeMonitoring(): void {
    setInterval(() => {
      this.updateAnalytics();
      this.checkAlerts();
    }, this.config.aggregationIntervals.realTime * 60 * 1000);
  }

  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.generateInsights();
      this.saveAnalyticsData();
    }, this.config.aggregationIntervals.hourly * 60 * 1000);
  }

  private startDataCleanup(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    this.errorHistory = this.errorHistory.filter(error => error.timestamp > cutoff);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  private updateAnalytics(): void {
    // Update performance metrics
    const recentErrors = this.errorHistory.filter(
      error => error.timestamp > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );

    performanceMonitor.recordMetric({
      name: 'error_rate',
      value: recentErrors.length,
      type: MetricType.COUNTER,
      tags: { period: '5min' },
    });

    performanceMonitor.recordMetric({
      name: 'critical_errors',
      value: recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      type: MetricType.COUNTER,
      tags: { period: '5min' },
    });
  }

  private checkAlerts(): void {
    const analytics = this.getAnalytics({
      start: Date.now() - (60 * 60 * 1000), // Last hour
      end: Date.now(),
    });

    // Error rate alert
    if (analytics.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert({
        type: 'threshold',
        severity: 'critical',
        title: 'High Error Rate',
        message: `Error rate (${(analytics.errorRate * 100).toFixed(2)}%) exceeds threshold`,
        data: { errorRate: analytics.errorRate },
      });
    }

    // Critical error count alert
    const criticalErrors = analytics.errorsBySeverity[ErrorSeverity.CRITICAL] || 0;
    if (criticalErrors > this.config.alertThresholds.criticalErrorCount) {
      this.createAlert({
        type: 'threshold',
        severity: 'critical',
        title: 'High Critical Error Count',
        message: `${criticalErrors} critical errors in the last hour`,
        data: { criticalErrors },
      });
    }

    // Error spike detection
    const currentRate = this.calculateCurrentErrorRate();
    const historicalRate = this.calculateHistoricalErrorRate();
    if (currentRate > historicalRate * this.config.alertThresholds.errorSpike) {
      this.createAlert({
        type: 'anomaly',
        severity: 'warning',
        title: 'Error Spike Detected',
        message: `Current error rate is ${(currentRate / historicalRate).toFixed(1)}x higher than normal`,
        data: { currentRate, historicalRate },
      });
    }
  }

  private createAlert(alertData: Omit<ErrorAlert, 'id' | 'timestamp' | 'resolved'>): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      alert => !alert.resolved && 
                alert.type === alertData.type && 
                alert.title === alertData.title
    );

    if (!existingAlert) {
      const alert: ErrorAlert = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        resolved: false,
        ...alertData,
      };

      this.alerts.push(alert);
    }
  }

  private generateInsights(): void {
    this.insights = [];

    // Error pattern analysis
    this.analyzeErrorPatterns();

    // Performance impact analysis
    this.analyzePerformanceImpact();

    // User experience analysis
    this.analyzeUserExperience();

    // Trend analysis
    this.analyzeTrends();
  }

  private analyzeErrorPatterns(): void {
    const recentErrors = this.errorHistory.filter(
      error => error.timestamp > Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
    );

    // Group by error message
    const errorGroups = new Map<string, any[]>();
    recentErrors.forEach(error => {
      const key = error.message;
      if (!errorGroups.has(key)) {
        errorGroups.set(key, []);
      }
      errorGroups.get(key)!.push(error);
    });

    // Find patterns
    errorGroups.forEach((errors, message) => {
      if (errors.length > 5) { // Pattern threshold
        this.insights.push({
          type: 'pattern',
          severity: 'medium',
          title: 'Recurring Error Pattern',
          description: `Error "${message}" occurred ${errors.length} times in the last 24 hours`,
          recommendation: 'Investigate the root cause and implement a permanent fix',
          data: { message, count: errors.length, errors },
        });
      }
    });
  }

  private analyzePerformanceImpact(): void {
    const performanceErrors = this.errorHistory.filter(
      error => error.category === ErrorCategory.PERFORMANCE
    );

    if (performanceErrors.length > 0) {
      this.insights.push({
        type: 'anomaly',
        severity: 'medium',
        title: 'Performance Issues Detected',
        description: `${performanceErrors.length} performance-related errors detected`,
        recommendation: 'Optimize application performance and monitor resource usage',
        data: { performanceErrors: performanceErrors.length },
      });
    }
  }

  private analyzeUserExperience(): void {
    const userImpact = this.calculateUserImpact(this.errorHistory);
    
    if (userImpact > 0.1) { // 10% of users affected
      this.insights.push({
        type: 'spike',
        severity: 'high',
        title: 'High User Impact',
        description: `${(userImpact * 100).toFixed(1)}% of users have experienced errors`,
        recommendation: 'Prioritize error fixes that affect the most users',
        data: { userImpact },
      });
    }
  }

  private analyzeTrends(): void {
    const weeklyTrend = this.getTrends('week');
    const currentWeekErrors = weeklyTrend.data[weeklyTrend.data.length - 1]?.errorCount || 0;
    const previousWeekErrors = weeklyTrend.data[weeklyTrend.data.length - 2]?.errorCount || 0;

    if (previousWeekErrors > 0) {
      const change = (currentWeekErrors - previousWeekErrors) / previousWeekErrors;
      
      if (change > 0.2) { // 20% increase
        this.insights.push({
          type: 'spike',
          severity: 'medium',
          title: 'Error Rate Increase',
          description: `Error count increased by ${(change * 100).toFixed(1)}% this week`,
          recommendation: 'Investigate recent changes that may have introduced new errors',
          data: { change, currentWeekErrors, previousWeekErrors },
        });
      } else if (change < -0.2) { // 20% decrease
        this.insights.push({
          type: 'improvement',
          severity: 'low',
          title: 'Error Rate Improvement',
          description: `Error count decreased by ${Math.abs(change * 100).toFixed(1)}% this week`,
          recommendation: 'Continue current practices and monitor for sustained improvement',
          data: { change, currentWeekErrors, previousWeekErrors },
        });
      }
    }
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    } else if (message.includes('auth') || message.includes('permission')) {
      return ErrorCategory.AUTHENTICATION;
    } else if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    } else if (message.includes('device') || message.includes('mqtt')) {
      return ErrorCategory.DEVICE_COMMUNICATION;
    } else if (message.includes('performance') || message.includes('timeout')) {
      return ErrorCategory.PERFORMANCE;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  private categorizeErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal') || 
        message.includes('security') || message.includes('data loss')) {
      return ErrorSeverity.CRITICAL;
    } else if (message.includes('warning') || message.includes('validation')) {
      return ErrorSeverity.LOW;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  private groupByCategory(errors: any[]): Record<ErrorCategory, number> {
    const groups: Record<ErrorCategory, number> = {} as any;
    Object.values(ErrorCategory).forEach(category => {
      groups[category] = 0;
    });
    
    errors.forEach(error => {
      groups[error.category] = (groups[error.category] || 0) + 1;
    });
    
    return groups;
  }

  private groupBySeverity(errors: any[]): Record<ErrorSeverity, number> {
    const groups: Record<ErrorSeverity, number> = {} as any;
    Object.values(ErrorSeverity).forEach(severity => {
      groups[severity] = 0;
    });
    
    errors.forEach(error => {
      groups[error.severity] = (groups[error.severity] || 0) + 1;
    });
    
    return groups;
  }

  private groupByTime(errors: any[]): Array<{ timestamp: number; count: number }> {
    const hourly = new Map<number, number>();
    
    errors.forEach(error => {
      const hour = Math.floor(error.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      hourly.set(hour, (hourly.get(hour) || 0) + 1);
    });
    
    return Array.from(hourly.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private getTopErrorMessages(errors: any[]): Array<{ message: string; count: number }> {
    const counts = new Map<string, number>();
    
    errors.forEach(error => {
      counts.set(error.message, (counts.get(error.message) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateErrorRate(errors: any[]): number {
    if (errors.length === 0) return 0;
    
    // This would need to be calculated based on total requests/actions
    // For now, we'll use a simple calculation
    const totalActions = this.getTotalActionsCount();
    return totalActions > 0 ? errors.length / totalActions : 0;
  }

  private calculateMTTR(errors: any[]): number {
    const resolvedErrors = errors.filter(error => error.resolved && error.resolutionTime);
    
    if (resolvedErrors.length === 0) return 0;
    
    const totalResolutionTime = resolvedErrors.reduce(
      (sum, error) => sum + (error.resolutionTime - error.timestamp),
      0
    );
    
    return totalResolutionTime / resolvedErrors.length;
  }

  private calculateUserImpact(errors: any[]): number {
    const affectedUsers = new Set(errors.map(error => error.context.userId)).size;
    const totalUsers = this.getTotalUsersCount();
    
    return totalUsers > 0 ? affectedUsers / totalUsers : 0;
  }

  private calculateCurrentErrorRate(): number {
    const recentErrors = this.errorHistory.filter(
      error => error.timestamp > Date.now() - (60 * 60 * 1000) // Last hour
    );
    return recentErrors.length;
  }

  private calculateHistoricalErrorRate(): number {
    const historicalErrors = this.errorHistory.filter(
      error => error.timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000) && // Last week
                error.timestamp <= Date.now() - (24 * 60 * 60 * 1000) // Exclude last 24 hours
    );
    return historicalErrors.length / 7; // Average per day
  }

  private getTimeIntervals(period: string, now: number): Array<{ start: number; end: number }> {
    const intervals = [];
    let intervalSize: number;
    let count: number;

    switch (period) {
      case 'hour':
        intervalSize = 60 * 60 * 1000; // 1 hour
        count = 24; // Last 24 hours
        break;
      case 'day':
        intervalSize = 24 * 60 * 60 * 1000; // 1 day
        count = 30; // Last 30 days
        break;
      case 'week':
        intervalSize = 7 * 24 * 60 * 60 * 1000; // 1 week
        count = 12; // Last 12 weeks
        break;
      case 'month':
        intervalSize = 30 * 24 * 60 * 60 * 1000; // 1 month
        count = 12; // Last 12 months
        break;
      default:
        intervalSize = 60 * 60 * 1000;
        count = 24;
    }

    for (let i = 0; i < count; i++) {
      const end = now - (i * intervalSize);
      const start = end - intervalSize;
      intervals.unshift({ start, end });
    }

    return intervals;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  private reportToExternalService(errorData: any): void {
    // Report to external analytics service
    try {
      errorReporter.reportError(new Error(errorData.message), {
        severity: errorData.severity,
        category: errorData.category,
        source: 'analytics_manager',
        context: errorData.context,
      });
    } catch (error) {
      console.warn('Failed to report to external service:', error);
    }
  }

  private notifySubscribers(): void {
    const analytics = this.getAnalytics();
    this.subscribers.forEach(callback => {
      try {
        callback(analytics);
      } catch (error) {
        console.warn('Error notifying subscriber:', error);
      }
    });
  }

  private getUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || crypto.randomUUID();
  }

  private getTotalActionsCount(): number {
    // This would need to be tracked separately
    // For demo purposes, return a reasonable estimate
    return performanceMonitor.getMetric('total_actions')?.value || 1000;
  }

  private getTotalUsersCount(): number {
    // This would need to be tracked separately
    // For demo purposes, return a reasonable estimate
    return 100;
  }
}

// Create global instance
export const errorAnalytics = new ErrorAnalyticsManager();

// Export types
export type {
  ErrorAnalytics,
  ErrorTrend,
  ErrorInsight,
  ErrorAlert,
  AnalyticsConfig,
};
