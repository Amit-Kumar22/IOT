// Performance Testing Utilities - Task 6 Phase 9.4
import { performance } from 'perf_hooks';
import { RenderResult } from '@testing-library/react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentMountTime: number;
  interactionLatency: number;
  bundleSize?: number;
  reRenderCount?: number;
}

export interface ComponentBenchmark {
  componentName: string;
  metrics: PerformanceMetrics;
  timestamp: Date;
  version: string;
  environment: 'test' | 'development' | 'production';
}

export interface PerformanceBudget {
  maxRenderTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  maxBundleSize: number; // KB
  maxInteractionLatency: number; // milliseconds
}

// Default performance budgets for IoT components
export const IOT_COMPONENT_BUDGETS: Record<string, PerformanceBudget> = {
  DeviceCard: {
    maxRenderTime: 50,
    maxMemoryUsage: 5,
    maxBundleSize: 100,
    maxInteractionLatency: 100
  },
  ChartWidget: {
    maxRenderTime: 200,
    maxMemoryUsage: 15,
    maxBundleSize: 300,
    maxInteractionLatency: 200
  },
  DataTable: {
    maxRenderTime: 150,
    maxMemoryUsage: 20,
    maxBundleSize: 200,
    maxInteractionLatency: 150
  },
  NotificationPanel: {
    maxRenderTime: 100,
    maxMemoryUsage: 10,
    maxBundleSize: 150,
    maxInteractionLatency: 100
  },
  PricingTable: {
    maxRenderTime: 75,
    maxMemoryUsage: 8,
    maxBundleSize: 120,
    maxInteractionLatency: 120
  },
  SCADAPanel: {
    maxRenderTime: 300,
    maxMemoryUsage: 25,
    maxBundleSize: 400,
    maxInteractionLatency: 250
  },
  RuleBuilder: {
    maxRenderTime: 250,
    maxMemoryUsage: 20,
    maxBundleSize: 350,
    maxInteractionLatency: 200
  }
};

/**
 * Measure component render performance
 */
export function measureRenderPerformance<T extends () => any>(
  renderFunction: T,
  componentName: string
): Promise<{ renderTime: number; result: ReturnType<T> }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      const result = renderFunction();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        resolve({ renderTime, result });
      });
    });
  });
}

/**
 * Measure memory usage before and after component render
 */
export function measureMemoryUsage(): number {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory;
    return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
  }
  
  // Fallback for environments without memory API
  return 0;
}

/**
 * Measure component interaction latency
 */
export async function measureInteractionLatency(
  interactionFunction: () => void | Promise<void>,
  iterations: number = 10
): Promise<number> {
  const latencies: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    await Promise.resolve(interactionFunction());
    
    // Wait for any async updates
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const endTime = performance.now();
    latencies.push(endTime - startTime);
  }
  
  // Return average latency
  return latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
}

/**
 * Count component re-renders using React DevTools profiler
 */
export function createRenderCounter() {
  let renderCount = 0;
  
  const incrementRenderCount = () => {
    renderCount++;
  };
  
  const getRenderCount = () => renderCount;
  const resetRenderCount = () => { renderCount = 0; };
  
  return { incrementRenderCount, getRenderCount, resetRenderCount };
}

/**
 * Comprehensive component performance benchmark
 */
export async function benchmarkComponent(
  componentName: string,
  renderFunction: () => RenderResult,
  interactions: Array<() => void | Promise<void>> = [],
  iterations: number = 5
): Promise<ComponentBenchmark> {
  const startMemory = measureMemoryUsage();
  
  // Measure render performance
  const { renderTime } = await measureRenderPerformance(renderFunction, componentName);
  
  // Measure memory after render
  const endMemory = measureMemoryUsage();
  const memoryUsage = Math.max(0, endMemory - startMemory);
  
  // Measure interaction latency
  let avgInteractionLatency = 0;
  if (interactions.length > 0) {
    const latencies = await Promise.all(
      interactions.map(interaction => measureInteractionLatency(interaction, iterations))
    );
    avgInteractionLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
  }
  
  const metrics: PerformanceMetrics = {
    renderTime,
    memoryUsage,
    componentMountTime: renderTime, // For now, same as render time
    interactionLatency: avgInteractionLatency
  };
  
  return {
    componentName,
    metrics,
    timestamp: new Date(),
    version: '1.0.0',
    environment: 'test'
  };
}

/**
 * Validate performance against budget
 */
export function validatePerformanceBudget(
  benchmark: ComponentBenchmark,
  budget?: PerformanceBudget
): { passed: boolean; violations: string[] } {
  const componentBudget = budget || IOT_COMPONENT_BUDGETS[benchmark.componentName];
  
  if (!componentBudget) {
    return { passed: true, violations: [] };
  }
  
  const violations: string[] = [];
  const { metrics } = benchmark;
  
  if (metrics.renderTime > componentBudget.maxRenderTime) {
    violations.push(`Render time ${metrics.renderTime.toFixed(2)}ms exceeds budget ${componentBudget.maxRenderTime}ms`);
  }
  
  if (metrics.memoryUsage > componentBudget.maxMemoryUsage) {
    violations.push(`Memory usage ${metrics.memoryUsage.toFixed(2)}MB exceeds budget ${componentBudget.maxMemoryUsage}MB`);
  }
  
  if (metrics.interactionLatency > componentBudget.maxInteractionLatency) {
    violations.push(`Interaction latency ${metrics.interactionLatency.toFixed(2)}ms exceeds budget ${componentBudget.maxInteractionLatency}ms`);
  }
  
  if (metrics.bundleSize && metrics.bundleSize > componentBudget.maxBundleSize) {
    violations.push(`Bundle size ${metrics.bundleSize}KB exceeds budget ${componentBudget.maxBundleSize}KB`);
  }
  
  return {
    passed: violations.length === 0,
    violations
  };
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(
  benchmarks: ComponentBenchmark[]
): {
  summary: {
    totalComponents: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    averageInteractionLatency: number;
    budgetCompliance: number;
  };
  details: Array<ComponentBenchmark & { budgetValidation: ReturnType<typeof validatePerformanceBudget> }>;
} {
  const details = benchmarks.map(benchmark => ({
    ...benchmark,
    budgetValidation: validatePerformanceBudget(benchmark)
  }));
  
  const totalComponents = benchmarks.length;
  const averageRenderTime = benchmarks.reduce((sum, b) => sum + b.metrics.renderTime, 0) / totalComponents;
  const averageMemoryUsage = benchmarks.reduce((sum, b) => sum + b.metrics.memoryUsage, 0) / totalComponents;
  const averageInteractionLatency = benchmarks.reduce((sum, b) => sum + b.metrics.interactionLatency, 0) / totalComponents;
  const passedBudgets = details.filter(d => d.budgetValidation.passed).length;
  const budgetCompliance = (passedBudgets / totalComponents) * 100;
  
  return {
    summary: {
      totalComponents,
      averageRenderTime,
      averageMemoryUsage,
      averageInteractionLatency,
      budgetCompliance
    },
    details
  };
}

/**
 * Performance test wrapper for Jest
 */
export function performanceTest(
  description: string,
  testFn: () => Promise<ComponentBenchmark> | ComponentBenchmark,
  budget?: PerformanceBudget,
  timeout: number = 10000
) {
  return async () => {
    const benchmark = await Promise.resolve(testFn());
    const validation = validatePerformanceBudget(benchmark, budget);
    
    // Log performance metrics
    console.log(`📊 Performance Benchmark: ${benchmark.componentName}`);
    console.log(`⏱️  Render Time: ${benchmark.metrics.renderTime.toFixed(2)}ms`);
    console.log(`💾 Memory Usage: ${benchmark.metrics.memoryUsage.toFixed(2)}MB`);
    console.log(`🖱️  Interaction Latency: ${benchmark.metrics.interactionLatency.toFixed(2)}ms`);
    
    if (!validation.passed) {
      console.warn('⚠️  Performance Budget Violations:', validation.violations);
    } else {
      console.log('✅ All performance budgets met');
    }
    
    // Return benchmark for further assertions
    return { benchmark, validation };
  };
}
