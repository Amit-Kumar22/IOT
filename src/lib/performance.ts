/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking and optimization insights
 */

import { z } from 'zod';
import { errorReporter, ErrorSeverity, ErrorCategory } from './errorReporting';

// Performance metric types
export enum MetricType {
  TIMING = 'timing',
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

// Performance metric schema
const PerformanceMetricSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.nativeEnum(MetricType),
  value: z.number(),
  timestamp: z.number().positive(),
  tags: z.record(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

// Performance timing schema
const PerformanceTimingSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  startTime: z.number().positive(),
  endTime: z.number().positive(),
  duration: z.number().positive(),
  tags: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

type PerformanceTiming = z.infer<typeof PerformanceTimingSchema>;

// Performance configuration
const PerformanceConfigSchema = z.object({
  enabled: z.boolean().default(true),
  endpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
  batchSize: z.number().int().min(1).max(1000).default(100),
  flushInterval: z.number().positive().default(30000), // 30 seconds
  maxMetrics: z.number().int().min(100).max(10000).default(1000),
  enableWebVitals: z.boolean().default(true),
  enableResourceTiming: z.boolean().default(true),
  enableUserTiming: z.boolean().default(true),
  enableNavigationTiming: z.boolean().default(true),
  enableMemoryMonitoring: z.boolean().default(true),
  enableNetworkMonitoring: z.boolean().default(true),
  enableCustomMetrics: z.boolean().default(true),
  slowThreshold: z.number().positive().default(1000), // 1 second
  errorThreshold: z.number().min(0).max(100).default(5), // 5% error rate
  memoryThreshold: z.number().positive().default(50 * 1024 * 1024), // 50MB
  enableAlerts: z.boolean().default(true),
  alertEndpoint: z.string().url().optional(),
  samplingRate: z.number().min(0).max(1).default(1), // 100% sampling
});

type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

// Performance events
type PerformanceEvent = 'metric' | 'timing' | 'alert' | 'batch_sent' | 'error';

// Performance event listener
type PerformanceEventListener = (event: PerformanceEvent, data?: any) => void;

// Web Vitals metrics
interface WebVitalsMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

// Resource timing data
interface ResourceTiming {
  name: string;
  startTime: number;
  duration: number;
  size: number;
  type: string;
  initiatorType: string;
}

// Memory usage data
interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

// Network performance data
interface NetworkPerformance {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  timestamp: number;
}

/**
 * Performance Monitor Service
 * Comprehensive performance monitoring and alerting system
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private timings: PerformanceTiming[] = [];
  private activeTimers: Map<string, number> = new Map();
  private eventListeners: Map<PerformanceEvent, PerformanceEventListener[]> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private observer: PerformanceObserver | null = null;
  private webVitals: WebVitalsMetrics = {};
  private memoryMonitorTimer: NodeJS.Timeout | null = null;
  private networkMonitorTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = PerformanceConfigSchema.parse(config);
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if (!this.config.enabled) return;

    // Set up auto-flush
    this.setupAutoFlush();

    // Set up web vitals monitoring
    if (this.config.enableWebVitals) {
      this.setupWebVitalsMonitoring();
    }

    // Set up resource timing monitoring
    if (this.config.enableResourceTiming) {
      this.setupResourceTimingMonitoring();
    }

    // Set up navigation timing monitoring
    if (this.config.enableNavigationTiming) {
      this.setupNavigationTimingMonitoring();
    }

    // Set up memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.setupMemoryMonitoring();
    }

    // Set up network monitoring
    if (this.config.enableNetworkMonitoring) {
      this.setupNetworkMonitoring();
    }

    // Set up user timing monitoring
    if (this.config.enableUserTiming) {
      this.setupUserTimingMonitoring();
    }
  }

  /**
   * Set up automatic metric flushing
   */
  private setupAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);
  }

  /**
   * Set up Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    if (typeof window === 'undefined') return;

    // FCP - First Contentful Paint
    this.observePerformanceEntry('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.webVitals.FCP = entry.startTime;
        this.recordMetric('web_vitals_fcp', entry.startTime, MetricType.TIMING);
      }
    });

    // LCP - Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.webVitals.LCP = entry.startTime;
      this.recordMetric('web_vitals_lcp', entry.startTime, MetricType.TIMING);
    });

    // FID - First Input Delay
    this.observePerformanceEntry('first-input', (entry) => {
      const fid = entry.processingStart - entry.startTime;
      this.webVitals.FID = fid;
      this.recordMetric('web_vitals_fid', fid, MetricType.TIMING);
    });

    // CLS - Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.webVitals.CLS = (this.webVitals.CLS || 0) + entry.value;
        this.recordMetric('web_vitals_cls', entry.value, MetricType.GAUGE);
      }
    });

    // TTFB - Time to First Byte
    if (window.performance?.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.fetchStart;
      this.webVitals.TTFB = ttfb;
      this.recordMetric('web_vitals_ttfb', ttfb, MetricType.TIMING);
    }
  }

  /**
   * Set up resource timing monitoring
   */
  private setupResourceTimingMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.observePerformanceEntry('resource', (entry) => {
      const resource: ResourceTiming = {
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType,
        initiatorType: entry.initiatorType,
      };

      this.recordMetric('resource_timing', entry.duration, MetricType.TIMING, {
        resource_name: entry.name,
        resource_type: entry.initiatorType,
      });

      // Alert on slow resources
      if (entry.duration > this.config.slowThreshold) {
        this.emitAlert('slow_resource', {
          resource: entry.name,
          duration: entry.duration,
          threshold: this.config.slowThreshold,
        });
      }
    });
  }

  /**
   * Set up navigation timing monitoring
   */
  private setupNavigationTimingMonitoring(): void {
    if (typeof window === 'undefined' || !window.performance?.timing) return;

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    // Key navigation metrics
    const metrics = {
      dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcp_connect: timing.connectEnd - timing.connectStart,
      request_response: timing.responseEnd - timing.requestStart,
      dom_processing: timing.domComplete - timing.domLoading,
      page_load: timing.loadEventEnd - navigationStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(`navigation_${name}`, value, MetricType.TIMING);
    });
  }

  /**
   * Set up memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
    }

    this.memoryMonitorTimer = setInterval(() => {
      let memoryUsage: MemoryUsage | null = null;

      // Browser memory
      if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
        const memory = (window.performance as any).memory;
        memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
          timestamp: Date.now(),
        };
      }
      
      // Node.js memory
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memory = process.memoryUsage();
        memoryUsage = {
          used: memory.heapUsed,
          total: memory.heapTotal,
          percentage: (memory.heapUsed / memory.heapTotal) * 100,
          timestamp: Date.now(),
        };
      }

      if (memoryUsage) {
        this.recordMetric('memory_usage', memoryUsage.used, MetricType.GAUGE);
        this.recordMetric('memory_percentage', memoryUsage.percentage, MetricType.GAUGE);

        // Alert on high memory usage
        if (memoryUsage.used > this.config.memoryThreshold) {
          this.emitAlert('high_memory_usage', {
            usage: memoryUsage.used,
            threshold: this.config.memoryThreshold,
            percentage: memoryUsage.percentage,
          });
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined' || !window.navigator?.connection) return;

    if (this.networkMonitorTimer) {
      clearInterval(this.networkMonitorTimer);
    }

    this.networkMonitorTimer = setInterval(() => {
      const connection = (window.navigator as any).connection;
      if (connection) {
        const networkPerf: NetworkPerformance = {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
          timestamp: Date.now(),
        };

        this.recordMetric('network_downlink', networkPerf.downlink, MetricType.GAUGE);
        this.recordMetric('network_rtt', networkPerf.rtt, MetricType.GAUGE);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Set up user timing monitoring
   */
  private setupUserTimingMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.observePerformanceEntry('measure', (entry) => {
      this.recordMetric(`user_timing_${entry.name}`, entry.duration, MetricType.TIMING);
    });
  }

  /**
   * Observe performance entries
   */
  private observePerformanceEntry(entryType: string, callback: (entry: any) => void): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });

      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn(`Failed to observe ${entryType} entries:`, error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    type: MetricType = MetricType.GAUGE,
    tags?: Record<string, string>,
    labels?: string[],
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled || !this.shouldSample()) return;

    const metric: PerformanceMetric = {
      id: crypto.randomUUID(),
      name,
      type,
      value,
      timestamp: Date.now(),
      tags,
      labels,
      metadata,
    };

    this.metrics.push(metric);
    this.emitEvent('metric', metric);

    // Maintain max metrics limit
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift();
    }

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);
  }

  /**
   * Start timing measurement
   */
  startTiming(name: string, tags?: Record<string, string>): void {
    if (!this.config.enabled) return;

    const startTime = performance.now();
    this.activeTimers.set(name, startTime);

    // Mark in browser performance API
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(`${name}_start`);
    }
  }

  /**
   * End timing measurement
   */
  endTiming(name: string, tags?: Record<string, string>, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const endTime = performance.now();
    const startTime = this.activeTimers.get(name);

    if (startTime === undefined) {
      console.warn(`No start time found for timing: ${name}`);
      return;
    }

    const duration = endTime - startTime;
    this.activeTimers.delete(name);

    // Mark in browser performance API
    if (typeof window !== 'undefined' && window.performance?.mark && window.performance?.measure) {
      window.performance.mark(`${name}_end`);
      window.performance.measure(name, `${name}_start`, `${name}_end`);
    }

    const timing: PerformanceTiming = {
      id: crypto.randomUUID(),
      name,
      startTime,
      endTime,
      duration,
      tags,
      metadata,
    };

    this.timings.push(timing);
    this.recordMetric(name, duration, MetricType.TIMING, tags, undefined, metadata);
    this.emitEvent('timing', timing);

    // Check for slow operations
    if (duration > this.config.slowThreshold) {
      this.emitAlert('slow_operation', {
        operation: name,
        duration,
        threshold: this.config.slowThreshold,
      });
    }
  }

  /**
   * Time a function execution
   */
  timeFunction<T extends (...args: any[]) => any>(
    fn: T,
    name?: string,
    tags?: Record<string, string>
  ): T {
    const timingName = name || fn.name || 'anonymous_function';

    return ((...args: Parameters<T>) => {
      this.startTiming(timingName, tags);
      
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            this.endTiming(timingName, tags);
          });
        }
        
        this.endTiming(timingName, tags);
        return result;
      } catch (error) {
        this.endTiming(timingName, tags, { error: true });
        throw error;
      }
    }) as T;
  }

  /**
   * Check if metric should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (!this.config.enableAlerts) return;

    // Check timing thresholds
    if (metric.type === MetricType.TIMING && metric.value > this.config.slowThreshold) {
      this.emitAlert('slow_metric', {
        metric: metric.name,
        value: metric.value,
        threshold: this.config.slowThreshold,
      });
    }

    // Check memory thresholds
    if (metric.name === 'memory_usage' && metric.value > this.config.memoryThreshold) {
      this.emitAlert('memory_threshold', {
        metric: metric.name,
        value: metric.value,
        threshold: this.config.memoryThreshold,
      });
    }
  }

  /**
   * Emit performance alert
   */
  private emitAlert(type: string, data: any): void {
    this.emitEvent('alert', { type, data, timestamp: Date.now() });

    // Report to error reporting service
    errorReporter.reportError(new Error(`Performance alert: ${type}`), {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.PERFORMANCE,
      source: 'performance_monitor',
      context: {
        timestamp: Date.now(),
        additionalData: data,
      },
      tags: ['performance', 'alert', type],
    });
  }

  /**
   * Emit event
   */
  private emitEvent(event: PerformanceEvent, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Performance event listener error:', error);
      }
    });
  }

  /**
   * Flush metrics to remote endpoint
   */
  async flushMetrics(): Promise<void> {
    if (!this.config.enabled || !this.config.endpoint) return;

    if (this.metrics.length === 0 && this.timings.length === 0) return;

    const metricsToSend = this.metrics.splice(0, this.config.batchSize);
    const timingsToSend = this.timings.splice(0, this.config.batchSize);

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          timings: timingsToSend,
          webVitals: this.webVitals,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.emitEvent('batch_sent', { 
        metrics: metricsToSend.length,
        timings: timingsToSend.length,
      });
    } catch (error) {
      // Put metrics back in queue
      this.metrics.unshift(...metricsToSend);
      this.timings.unshift(...timingsToSend);
      this.emitEvent('error', error);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalMetrics: number;
    totalTimings: number;
    webVitals: WebVitalsMetrics;
    recentMetrics: PerformanceMetric[];
    recentTimings: PerformanceTiming[];
    averageValues: Record<string, number>;
    slowestOperations: PerformanceTiming[];
  } {
    const recentMetrics = this.metrics.slice(-10);
    const recentTimings = this.timings.slice(-10);

    // Calculate averages
    const averageValues: Record<string, number> = {};
    const metricGroups: Record<string, number[]> = {};

    this.metrics.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = [];
      }
      metricGroups[metric.name].push(metric.value);
    });

    Object.entries(metricGroups).forEach(([name, values]) => {
      averageValues[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Find slowest operations
    const slowestOperations = this.timings
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalMetrics: this.metrics.length,
      totalTimings: this.timings.length,
      webVitals: this.webVitals,
      recentMetrics,
      recentTimings,
      averageValues,
      slowestOperations,
    };
  }

  /**
   * Clear all metrics and timings
   */
  clear(): void {
    this.metrics = [];
    this.timings = [];
    this.activeTimers.clear();
    this.webVitals = {};
  }

  /**
   * Add event listener
   */
  addEventListener(event: PerformanceEvent, listener: PerformanceEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: PerformanceEvent, listener: PerformanceEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = PerformanceConfigSchema.parse({ ...this.config, ...newConfig });
    if (this.config.enabled) {
      this.initializeMonitoring();
    }
  }

  /**
   * Destroy performance monitor
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
      this.memoryMonitorTimer = null;
    }

    if (this.networkMonitorTimer) {
      clearInterval(this.networkMonitorTimer);
      this.networkMonitorTimer = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Final flush
    this.flushMetrics();
    
    this.clear();
    this.eventListeners.clear();
  }
}

// Default performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance utilities
export const performanceUtils = {
  /**
   * Measure function performance
   */
  measure<T extends (...args: any[]) => any>(
    fn: T,
    name?: string,
    tags?: Record<string, string>
  ): T {
    return performanceMonitor.timeFunction(fn, name, tags);
  },

  /**
   * Measure async function performance
   */
  measureAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name?: string,
    tags?: Record<string, string>
  ): T {
    const timingName = name || fn.name || 'async_function';

    return (async (...args: Parameters<T>) => {
      performanceMonitor.startTiming(timingName, tags);
      
      try {
        const result = await fn(...args);
        performanceMonitor.endTiming(timingName, tags);
        return result;
      } catch (error) {
        performanceMonitor.endTiming(timingName, tags, { error: true });
        throw error;
      }
    }) as T;
  },

  /**
   * Create performance decorator
   */
  performance<T extends (...args: any[]) => any>(
    name?: string,
    tags?: Record<string, string>
  ) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      const timingName = name || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = function (...args: any[]) {
        return performanceMonitor.timeFunction(originalMethod.bind(this), timingName, tags)(...args);
      };

      return descriptor;
    };
  },

  /**
   * Monitor API call performance
   */
  monitorApiCall<T>(
    url: string,
    options: RequestInit,
    fetchFn: (url: string, options: RequestInit) => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return fetchFn(url, options)
      .then(response => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        performanceMonitor.recordMetric('api_call_duration', duration, MetricType.TIMING, {
          url,
          method: options.method || 'GET',
          success: 'true',
        });
        
        return response;
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        performanceMonitor.recordMetric('api_call_duration', duration, MetricType.TIMING, {
          url,
          method: options.method || 'GET',
          success: 'false',
        });
        
        throw error;
      });
  },

  /**
   * Monitor component render performance
   */
  monitorComponentRender(componentName: string, renderFn: () => any): any {
    const startTime = performance.now();
    
    try {
      const result = renderFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric('component_render_time', duration, MetricType.TIMING, {
        component: componentName,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric('component_render_time', duration, MetricType.TIMING, {
        component: componentName,
        error: 'true',
      });
      
      throw error;
    }
  },
};

// Export types
export type {
  PerformanceMetric,
  PerformanceTiming,
  PerformanceConfig,
  PerformanceEvent,
  PerformanceEventListener,
  WebVitalsMetrics,
  ResourceTiming,
  MemoryUsage,
  NetworkPerformance,
};
