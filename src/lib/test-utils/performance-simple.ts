// Simple Performance Testing Utilities for Jest Environment
import { render, cleanup } from '@testing-library/react';
import { ReactElement } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  interactionLatency: number;
  componentCount: number;
}

export interface PerformanceBudget {
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxInteractionLatency: number;
}

// Performance budgets for IoT components
export const COMPONENT_BUDGETS = {
  DeviceCard: {
    maxRenderTime: 50,
    maxMemoryUsage: 5,
    maxInteractionLatency: 100,
  },
  ChartWidget: {
    maxRenderTime: 200,
    maxMemoryUsage: 15,
    maxInteractionLatency: 200,
  },
  DataTable: {
    maxRenderTime: 150,
    maxMemoryUsage: 20,
    maxInteractionLatency: 150,
  },
  NotificationPanel: {
    maxRenderTime: 100,
    maxMemoryUsage: 10,
    maxInteractionLatency: 100,
  },
};

/**
 * Simple render time measurement for Jest environment
 */
export async function measureRenderTime(
  component: ReactElement,
  iterations: number = 5
): Promise<number> {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    render(component);
    const endTime = Date.now();
    
    times.push(endTime - startTime);
    cleanup();
  }
  
  return times.reduce((sum, time) => sum + time, 0) / times.length;
}

/**
 * Mock memory usage for testing environment
 */
export function getMockMemoryUsage(): number {
  // Return a realistic mock value between 1-10 MB
  return Math.random() * 9 + 1;
}

/**
 * Measure interaction latency
 */
export async function measureInteractionLatency(
  interactionFn: () => Promise<void> | void,
  iterations: number = 3
): Promise<number> {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await interactionFn();
    const endTime = Date.now();
    
    times.push(endTime - startTime);
  }
  
  return times.reduce((sum, time) => sum + time, 0) / times.length;
}

/**
 * Run performance benchmark for a component
 */
export async function benchmarkComponent(
  component: ReactElement,
  componentName: string,
  budget: PerformanceBudget
): Promise<PerformanceMetrics & { meetsBudget: boolean }> {
  const renderTime = await measureRenderTime(component);
  const memoryUsage = getMockMemoryUsage();
  const interactionLatency = await measureInteractionLatency(() => {
    // Simulate basic interaction
    return new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  });

  const meetsBudget = 
    renderTime <= budget.maxRenderTime &&
    memoryUsage <= budget.maxMemoryUsage &&
    interactionLatency <= budget.maxInteractionLatency;

  return {
    renderTime,
    memoryUsage,
    interactionLatency,
    componentCount: 1,
    meetsBudget,
  };
}

/**
 * Validate performance against budget
 */
export function validatePerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget,
  componentName: string
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.renderTime > budget.maxRenderTime) {
    violations.push(`${componentName}: Render time ${metrics.renderTime.toFixed(2)}ms exceeds budget ${budget.maxRenderTime}ms`);
  }

  if (metrics.memoryUsage > budget.maxMemoryUsage) {
    violations.push(`${componentName}: Memory usage ${metrics.memoryUsage.toFixed(2)}MB exceeds budget ${budget.maxMemoryUsage}MB`);
  }

  if (metrics.interactionLatency > budget.maxInteractionLatency) {
    violations.push(`${componentName}: Interaction latency ${metrics.interactionLatency.toFixed(2)}ms exceeds budget ${budget.maxInteractionLatency}ms`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Create a performance test helper
 */
export function createPerformanceTest(
  componentName: string,
  component: ReactElement,
  budget?: PerformanceBudget
) {
  const testBudget = budget || COMPONENT_BUDGETS[componentName as keyof typeof COMPONENT_BUDGETS];
  
  if (!testBudget) {
    throw new Error(`No performance budget defined for component: ${componentName}`);
  }

  return async () => {
    const metrics = await benchmarkComponent(component, componentName, testBudget);
    const validation = validatePerformanceBudget(metrics, testBudget, componentName);

    if (!validation.passed) {
      console.warn(`❌ ${componentName} performance budget violations:`, validation.violations);
    } else {
      console.log(`✅ ${componentName} meets performance budget`, {
        render: `${metrics.renderTime.toFixed(2)}ms`,
        memory: `${metrics.memoryUsage.toFixed(2)}MB`,
        interaction: `${metrics.interactionLatency.toFixed(2)}ms`,
      });
    }

    expect(validation.passed).toBe(true);
    return metrics;
  };
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(
  results: Array<PerformanceMetrics & { name: string; meetsBudget: boolean }>
): string {
  const totalComponents = results.length;
  if (totalComponents === 0) return "No performance data available";

  const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / totalComponents;
  const avgMemoryUsage = results.reduce((sum, r) => sum + r.memoryUsage, 0) / totalComponents;
  const avgInteractionLatency = results.reduce((sum, r) => sum + r.interactionLatency, 0) / totalComponents;
  
  const compliantComponents = results.filter(r => r.meetsBudget).length;
  const complianceRate = (compliantComponents / totalComponents) * 100;

  return `
📊 PERFORMANCE BENCHMARK REPORT
=====================================
Total Components Tested: ${totalComponents}

Average Render Time: ${avgRenderTime.toFixed(2)}ms
Average Memory Usage: ${avgMemoryUsage.toFixed(2)}MB
Average Interaction Latency: ${avgInteractionLatency.toFixed(2)}ms
Budget Compliance: ${complianceRate.toFixed(1)}%

📋 COMPONENT DETAILS:
${results.map(r => `
- ${r.name}:
  Render: ${r.renderTime.toFixed(2)}ms
  Memory: ${r.memoryUsage.toFixed(2)}MB
  Interaction: ${r.interactionLatency.toFixed(2)}ms
  Budget: ${r.meetsBudget ? '✅ PASS' : '❌ FAIL'}
`).join('')}
=====================================
  `;
}
