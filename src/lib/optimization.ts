/**
 * Cost Optimization and Pricing Alerts
 * 
 * Provides intelligent cost optimization suggestions and pricing alerts
 * to help users manage their IoT platform expenses effectively
 * 
 * @version 1.0.0
 * @author IoT Platform Team
 */

import { z } from 'zod';
import { 
  BillingPlan, 
  UsageMetrics, 
  BillingResult,
  BillingCalculator,
  BILLING_PLANS,
  formatCurrency,
  formatPercentage 
} from './billing';

// Types for optimization and alerts
export interface OptimizationSuggestion {
  id: string;
  type: 'plan_upgrade' | 'plan_downgrade' | 'usage_reduction' | 'timing_optimization' | 'feature_optimization';
  title: string;
  description: string;
  estimatedSavings: number;
  confidence: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  priority: number; // 1-10, higher is more important
}

export interface PricingAlert {
  id: string;
  type: 'budget_exceeded' | 'overage_warning' | 'unusual_spike' | 'cost_trend' | 'plan_recommendation';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  actionUrl?: string;
}

export interface CostOptimizationSettings {
  budgetLimit: number;
  alertThresholds: {
    budgetPercentage: number; // Alert when budget usage exceeds this %
    overagePercentage: number; // Alert when overage exceeds this %
    spikePercentage: number; // Alert when costs spike by this %
  };
  optimizationPreferences: {
    aggressiveness: 'conservative' | 'moderate' | 'aggressive';
    prioritizeCostSavings: boolean;
    allowPlanChanges: boolean;
    allowFeatureChanges: boolean;
  };
}

export interface UsagePattern {
  averageMonthlyUsage: UsageMetrics;
  peakUsage: UsageMetrics;
  trends: {
    deviceGrowthRate: number;
    dataGrowthRate: number;
    apiCallGrowthRate: number;
    storageGrowthRate: number;
  };
  seasonality: {
    highSeasonMonths: number[];
    lowSeasonMonths: number[];
    seasonalityFactor: number;
  };
}

// Validation schemas
const OptimizationSettingsSchema = z.object({
  budgetLimit: z.number().min(0),
  alertThresholds: z.object({
    budgetPercentage: z.number().min(0).max(100),
    overagePercentage: z.number().min(0).max(100),
    spikePercentage: z.number().min(0).max(100),
  }),
  optimizationPreferences: z.object({
    aggressiveness: z.enum(['conservative', 'moderate', 'aggressive']),
    prioritizeCostSavings: z.boolean(),
    allowPlanChanges: z.boolean(),
    allowFeatureChanges: z.boolean(),
  }),
});

/**
 * Cost Optimization Engine
 */
export class CostOptimizer {
  private billingCalculator: BillingCalculator;
  private settings: CostOptimizationSettings;

  constructor(settings: CostOptimizationSettings, billingCalculator?: BillingCalculator) {
    this.settings = OptimizationSettingsSchema.parse(settings);
    this.billingCalculator = billingCalculator || new BillingCalculator();
  }

  /**
   * Generate optimization suggestions based on usage patterns
   */
  generateOptimizationSuggestions(
    currentPlan: BillingPlan,
    usagePattern: UsagePattern,
    historicalBilling: BillingResult[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Plan optimization suggestions
    suggestions.push(...this.generatePlanOptimizations(currentPlan, usagePattern));

    // Usage optimization suggestions
    suggestions.push(...this.generateUsageOptimizations(usagePattern, historicalBilling));

    // Timing optimization suggestions
    suggestions.push(...this.generateTimingOptimizations(usagePattern));

    // Feature optimization suggestions
    suggestions.push(...this.generateFeatureOptimizations(currentPlan, usagePattern));

    // Sort by priority and filter by confidence
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .filter(suggestion => this.shouldIncludeSuggestion(suggestion));
  }

  /**
   * Generate plan optimization suggestions
   */
  private generatePlanOptimizations(
    currentPlan: BillingPlan,
    usagePattern: UsagePattern
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (!this.settings.optimizationPreferences.allowPlanChanges) {
      return suggestions;
    }

    // Check if user consistently underutilizes current plan
    if (this.isUnderutilizing(currentPlan, usagePattern)) {
      const lowerPlan = this.findLowerPlan(currentPlan);
      if (lowerPlan) {
        const estimatedSavings = this.calculatePlanSavings(currentPlan, lowerPlan, usagePattern);
        
        suggestions.push({
          id: `plan_downgrade_${lowerPlan.id}`,
          type: 'plan_downgrade',
          title: `Downgrade to ${lowerPlan.name} Plan`,
          description: `Your usage consistently falls below your current plan limits. Downgrading could save money.`,
          estimatedSavings,
          confidence: 'high',
          impact: estimatedSavings > 100 ? 'high' : 'medium',
          actionItems: [
            'Review your actual usage vs plan limits',
            'Consider downgrading to a lower tier',
            'Monitor usage after downgrade to ensure adequate limits'
          ],
          priority: 8,
        });
      }
    }

    // Check if user frequently has overages
    if (this.hasFrequentOverages(currentPlan, usagePattern)) {
      const higherPlan = this.findHigherPlan(currentPlan);
      if (higherPlan) {
        const currentCostWithOverages = this.calculateCostWithOverages(currentPlan, usagePattern);
        const newPlanCost = this.billingCalculator.calculateBilling(higherPlan, usagePattern.averageMonthlyUsage);
        
        // Always suggest upgrade for overages, even if not immediately cost-effective
        const estimatedSavings = Math.max(0, currentCostWithOverages - newPlanCost.totalAmount);
        
        suggestions.push({
          id: `plan_upgrade_${higherPlan.id}`,
          type: 'plan_upgrade',
          title: `Upgrade to ${higherPlan.name} Plan`,
          description: estimatedSavings > 0 ? 
            `Your frequent overages make upgrading more cost-effective than staying on your current plan.` :
            `Consider upgrading to avoid overage charges and get higher limits.`,
          estimatedSavings,
          confidence: estimatedSavings > 0 ? 'high' : 'medium',
          impact: 'high',
          actionItems: [
            'Upgrade to eliminate overage charges',
            'Take advantage of higher limits and better rates',
            'Monitor usage to optimize the new plan'
          ],
          priority: estimatedSavings > 0 ? 9 : 7,
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate usage optimization suggestions
   */
  private generateUsageOptimizations(
    usagePattern: UsagePattern,
    historicalBilling: BillingResult[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Device optimization
    if (usagePattern.trends.deviceGrowthRate > 0.05) { // 5% monthly growth
      suggestions.push({
        id: 'device_optimization',
        type: 'usage_reduction',
        title: 'Optimize Device Usage',
        description: 'Your device count is growing rapidly. Consider consolidating or optimizing device deployment.',
        estimatedSavings: this.estimateDeviceOptimizationSavings(usagePattern),
        confidence: 'medium',
        impact: 'medium',
        actionItems: [
          'Audit active devices and remove unused ones',
          'Consolidate similar devices where possible',
          'Implement device lifecycle management',
          'Consider device pooling for temporary needs'
        ],
        priority: 6,
      });
    }

    // Data usage optimization
    if (usagePattern.trends.dataGrowthRate > 0.08) { // 8% monthly growth
      suggestions.push({
        id: 'data_optimization',
        type: 'usage_reduction',
        title: 'Optimize Data Usage',
        description: 'Data usage is growing quickly. Implementing data optimization strategies could reduce costs.',
        estimatedSavings: this.estimateDataOptimizationSavings(usagePattern),
        confidence: 'high',
        impact: 'high',
        actionItems: [
          'Implement data compression for device communications',
          'Optimize data collection frequency',
          'Use edge processing to reduce data transmission',
          'Archive or delete unnecessary historical data'
        ],
        priority: 7,
      });
    }

    return suggestions;
  }

  /**
   * Generate timing optimization suggestions
   */
  private generateTimingOptimizations(usagePattern: UsagePattern): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Energy timing optimization
    suggestions.push({
      id: 'energy_timing_optimization',
      type: 'timing_optimization',
      title: 'Optimize Energy Usage Timing',
      description: 'Schedule energy-intensive operations during off-peak hours to reduce costs.',
      estimatedSavings: this.estimateTimingOptimizationSavings(usagePattern),
      confidence: 'medium',
      impact: 'medium',
      actionItems: [
        'Schedule device operations during off-peak hours',
        'Implement smart scheduling for energy-intensive tasks',
        'Use time-of-use pricing to your advantage',
        'Consider battery backup for peak hour operation'
      ],
      priority: 5,
    });

    return suggestions;
  }

  /**
   * Generate feature optimization suggestions
   */
  private generateFeatureOptimizations(
    currentPlan: BillingPlan,
    usagePattern: UsagePattern
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (!this.settings.optimizationPreferences.allowFeatureChanges) {
      return suggestions;
    }

    // API usage optimization
    if (usagePattern.averageMonthlyUsage.apiCalls > currentPlan.apiCallsLimit * 0.7) { // 70% threshold
      suggestions.push({
        id: 'api_optimization',
        type: 'feature_optimization',
        title: 'Optimize API Usage',
        description: 'High API usage detected. Implementing caching and batching could reduce costs.',
        estimatedSavings: this.estimateApiOptimizationSavings(usagePattern),
        confidence: 'high',
        impact: 'medium',
        actionItems: [
          'Implement API response caching',
          'Batch multiple API calls together',
          'Use webhooks instead of polling where possible',
          'Optimize API call frequency'
        ],
        priority: 6,
      });
    }

    return suggestions;
  }

  /**
   * Generate pricing alerts based on current usage and billing
   */
  generatePricingAlerts(
    currentBilling: BillingResult,
    usageMetrics: UsageMetrics,
    previousBilling?: BillingResult
  ): PricingAlert[] {
    const alerts: PricingAlert[] = [];

    // Budget exceeded alert
    if (currentBilling.totalAmount > this.settings.budgetLimit) {
      alerts.push({
        id: 'budget_exceeded',
        type: 'budget_exceeded',
        severity: 'critical',
        title: 'Budget Exceeded',
        message: `Your current bill of ${formatCurrency(currentBilling.totalAmount)} exceeds your budget limit of ${formatCurrency(this.settings.budgetLimit)}.`,
        threshold: this.settings.budgetLimit,
        currentValue: currentBilling.totalAmount,
        createdAt: new Date(),
        actionUrl: '/billing/optimize',
      });
    }

    // Budget warning alert
    const budgetUsagePercentage = (currentBilling.totalAmount / this.settings.budgetLimit) * 100;
    if (budgetUsagePercentage > this.settings.alertThresholds.budgetPercentage && 
        currentBilling.totalAmount <= this.settings.budgetLimit) {
      alerts.push({
        id: 'budget_warning',
        type: 'budget_exceeded',
        severity: 'warning',
        title: 'Budget Warning',
        message: `You've used ${formatPercentage(budgetUsagePercentage)} of your budget (${formatCurrency(currentBilling.totalAmount)} of ${formatCurrency(this.settings.budgetLimit)}).`,
        threshold: this.settings.alertThresholds.budgetPercentage,
        currentValue: budgetUsagePercentage,
        createdAt: new Date(),
      });
    }

    // Overage alerts
    const totalOverages = Object.values(currentBilling.overageCharges).reduce((sum, charge) => sum + charge, 0);
    if (totalOverages > 0) {
      const overagePercentage = (totalOverages / currentBilling.baseFee) * 100;
      
      if (overagePercentage > this.settings.alertThresholds.overagePercentage) {
        alerts.push({
          id: 'overage_warning',
          type: 'overage_warning',
          severity: overagePercentage > 50 ? 'critical' : 'warning',
          title: 'High Overage Charges',
          message: `Overage charges of ${formatCurrency(totalOverages)} represent ${formatPercentage(overagePercentage)} of your base fee.`,
          threshold: this.settings.alertThresholds.overagePercentage,
          currentValue: overagePercentage,
          createdAt: new Date(),
          actionUrl: '/billing/plans',
        });
      }
    }

    // Cost spike alerts
    if (previousBilling) {
      const costIncrease = currentBilling.totalAmount - previousBilling.totalAmount;
      const spikePercentage = (costIncrease / previousBilling.totalAmount) * 100;
      
      if (spikePercentage > this.settings.alertThresholds.spikePercentage) {
        alerts.push({
          id: 'cost_spike',
          type: 'unusual_spike',
          severity: spikePercentage > 100 ? 'critical' : 'warning',
          title: 'Unusual Cost Spike',
          message: `Your costs increased by ${formatPercentage(spikePercentage)} (${formatCurrency(costIncrease)}) compared to last period.`,
          threshold: this.settings.alertThresholds.spikePercentage,
          currentValue: spikePercentage,
          createdAt: new Date(),
          actionUrl: '/billing/analysis',
        });
      }
    }

    return alerts;
  }

  // Helper methods for optimization calculations
  private isUnderutilizing(plan: BillingPlan, pattern: UsagePattern): boolean {
    const usage = pattern.averageMonthlyUsage;
    return (
      usage.devices < plan.deviceLimit * 0.6 &&
      usage.dataUsageGB < plan.dataLimitGB * 0.6 &&
      usage.apiCalls < plan.apiCallsLimit * 0.6 &&
      usage.storageUsedGB < plan.storageGB * 0.6
    );
  }

  private hasFrequentOverages(plan: BillingPlan, pattern: UsagePattern): boolean {
    const usage = pattern.averageMonthlyUsage;
    return (
      usage.devices > plan.deviceLimit ||
      usage.dataUsageGB > plan.dataLimitGB ||
      usage.apiCalls > plan.apiCallsLimit ||
      usage.storageUsedGB > plan.storageGB
    );
  }

  private findLowerPlan(currentPlan: BillingPlan): BillingPlan | null {
    const currentIndex = BILLING_PLANS.findIndex(p => p.id === currentPlan.id);
    return currentIndex > 0 ? BILLING_PLANS[currentIndex - 1] : null;
  }

  private findHigherPlan(currentPlan: BillingPlan): BillingPlan | null {
    const currentIndex = BILLING_PLANS.findIndex(p => p.id === currentPlan.id);
    return currentIndex < BILLING_PLANS.length - 1 ? BILLING_PLANS[currentIndex + 1] : null;
  }

  private calculatePlanSavings(currentPlan: BillingPlan, newPlan: BillingPlan, pattern: UsagePattern): number {
    const currentCost = this.billingCalculator.calculateBilling(currentPlan, pattern.averageMonthlyUsage);
    const newCost = this.billingCalculator.calculateBilling(newPlan, pattern.averageMonthlyUsage);
    return Math.max(0, currentCost.totalAmount - newCost.totalAmount);
  }

  private calculateCostWithOverages(plan: BillingPlan, pattern: UsagePattern): number {
    return this.billingCalculator.calculateBilling(plan, pattern.averageMonthlyUsage).totalAmount;
  }

  private estimateDeviceOptimizationSavings(pattern: UsagePattern): number {
    // Estimate 10-20% device reduction potential
    const deviceReduction = pattern.averageMonthlyUsage.devices * 0.15;
    return deviceReduction * 2.99; // Rough estimate using basic plan overage rate
  }

  private estimateDataOptimizationSavings(pattern: UsagePattern): number {
    // Estimate 20-30% data reduction potential through compression and optimization
    const dataReduction = pattern.averageMonthlyUsage.dataUsageGB * 0.25;
    return dataReduction * 0.50; // Rough estimate using basic plan overage rate
  }

  private estimateTimingOptimizationSavings(pattern: UsagePattern): number {
    // Estimate 15-25% energy cost savings through timing optimization
    const energyKWh = pattern.averageMonthlyUsage.energyConsumedKWh;
    const potentialSavings = energyKWh * 0.20 * (0.18 - 0.08); // Peak vs off-peak difference
    return potentialSavings;
  }

  private estimateApiOptimizationSavings(pattern: UsagePattern): number {
    // Estimate 30-40% API call reduction through caching and optimization
    const apiReduction = pattern.averageMonthlyUsage.apiCalls * 0.35;
    return apiReduction * 0.001; // Rough estimate using basic plan overage rate
  }

  private shouldIncludeSuggestion(suggestion: OptimizationSuggestion): boolean {
    const { aggressiveness } = this.settings.optimizationPreferences;
    
    // Always include plan change suggestions as they provide strategic value
    if (suggestion.type === 'plan_upgrade' || suggestion.type === 'plan_downgrade') {
      return true;
    }
    
    switch (aggressiveness) {
      case 'conservative':
        // Include timing optimization even with medium confidence due to long-term value
        if (suggestion.type === 'timing_optimization') {
          return true;
        }
        return suggestion.confidence === 'high' && suggestion.estimatedSavings > 10;
      case 'moderate':
        return suggestion.confidence !== 'low' && suggestion.estimatedSavings > 1;
      case 'aggressive':
        return suggestion.estimatedSavings >= 0;
      default:
        return true;
    }
  }

  /**
   * Update optimization settings
   */
  updateSettings(newSettings: Partial<CostOptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current optimization settings
   */
  getSettings(): CostOptimizationSettings {
    return { ...this.settings };
  }
}

// Export default optimizer instance with moderate settings
export const defaultOptimizer = new CostOptimizer({
  budgetLimit: 500,
  alertThresholds: {
    budgetPercentage: 80,
    overagePercentage: 25,
    spikePercentage: 50,
  },
  optimizationPreferences: {
    aggressiveness: 'moderate',
    prioritizeCostSavings: true,
    allowPlanChanges: true,
    allowFeatureChanges: true,
  },
});

// Utility functions
export const createOptimizationReport = (
  suggestions: OptimizationSuggestion[],
  alerts: PricingAlert[]
): {
  totalPotentialSavings: number;
  criticalAlerts: number;
  highPrioritySuggestions: number;
  summary: string;
} => {
  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.estimatedSavings, 0);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highPrioritySuggestions = suggestions.filter(s => s.priority >= 7).length;
  
  const summary = `Found ${suggestions.length} optimization opportunities with potential savings of ${formatCurrency(totalPotentialSavings)}. ${criticalAlerts} critical alerts require immediate attention.`;
  
  return {
    totalPotentialSavings,
    criticalAlerts,
    highPrioritySuggestions,
    summary,
  };
};
