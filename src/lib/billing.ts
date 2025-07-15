/**
 * Billing Calculator for IoT Platform
 * 
 * Provides comprehensive billing calculations including:
 * - Usage-based pricing calculations
 * - Overage computations
 * - Energy cost calculations
 * - ROI analysis
 * - Billing report generation
 * 
 * @version 1.0.0
 * @author IoT Platform Team
 */

import { z } from 'zod';

// Billing Types
export interface BillingPlan {
  id: string;
  name: string;
  type: 'basic' | 'premium' | 'enterprise' | 'custom';
  baseFee: number;
  deviceLimit: number;
  dataLimitGB: number;
  apiCallsLimit: number;
  storageGB: number;
  features: string[];
  overageRates: {
    perDevice: number;
    perGB: number;
    perApiCall: number;
    perStorageGB: number;
  };
}

export interface UsageMetrics {
  devices: number;
  dataUsageGB: number;
  apiCalls: number;
  storageUsedGB: number;
  energyConsumedKWh: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface BillingResult {
  baseFee: number;
  overageCharges: {
    devices: number;
    data: number;
    apiCalls: number;
    storage: number;
  };
  energyCosts: number;
  totalAmount: number;
  breakdown: BillingBreakdown[];
}

export interface BillingBreakdown {
  category: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface EnergyPricing {
  baseRatePerKWh: number;
  peakRatePerKWh: number;
  offPeakRatePerKWh: number;
  timeOfUseEnabled: boolean;
  peakHours: { start: number; end: number }[];
}

export interface ROIAnalysis {
  totalCosts: number;
  totalSavings: number;
  netBenefit: number;
  paybackPeriodMonths: number;
  roi: number;
  annualizedSavings: number;
}

// Validation Schemas
const BillingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['basic', 'premium', 'enterprise', 'custom']),
  baseFee: z.number().min(0),
  deviceLimit: z.number().min(0),
  dataLimitGB: z.number().min(0),
  apiCallsLimit: z.number().min(0),
  storageGB: z.number().min(0),
  features: z.array(z.string()),
  overageRates: z.object({
    perDevice: z.number().min(0),
    perGB: z.number().min(0),
    perApiCall: z.number().min(0),
    perStorageGB: z.number().min(0),
  }),
});

const UsageMetricsSchema = z.object({
  devices: z.number().min(0),
  dataUsageGB: z.number().min(0),
  apiCalls: z.number().min(0),
  storageUsedGB: z.number().min(0),
  energyConsumedKWh: z.number().min(0),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
});

/**
 * Core Billing Calculator Class
 */
export class BillingCalculator {
  private energyPricing: EnergyPricing;

  constructor(energyPricing?: EnergyPricing) {
    this.energyPricing = energyPricing || {
      baseRatePerKWh: 0.12,
      peakRatePerKWh: 0.18,
      offPeakRatePerKWh: 0.08,
      timeOfUseEnabled: false,
      peakHours: [{ start: 9, end: 17 }],
    };
  }

  /**
   * Calculate total billing for a given plan and usage
   */
  calculateBilling(plan: BillingPlan, usage: UsageMetrics): BillingResult {
    // Validate inputs
    const validatedPlan = BillingPlanSchema.parse(plan);
    const validatedUsage = UsageMetricsSchema.parse(usage);

    const breakdown: BillingBreakdown[] = [];
    
    // Base fee
    breakdown.push({
      category: 'Base Fee',
      description: `${validatedPlan.name} plan base fee`,
      quantity: 1,
      rate: validatedPlan.baseFee,
      amount: validatedPlan.baseFee,
    });

    // Calculate overage charges
    const overageCharges = this.calculateOverages(validatedPlan, validatedUsage, breakdown);
    
    // Calculate energy costs
    const energyCosts = this.calculateEnergyCosts(validatedUsage.energyConsumedKWh, breakdown);

    const totalAmount = validatedPlan.baseFee + 
                       Object.values(overageCharges).reduce((sum, charge) => sum + charge, 0) + 
                       energyCosts;

    return {
      baseFee: validatedPlan.baseFee,
      overageCharges,
      energyCosts,
      totalAmount,
      breakdown,
    };
  }

  /**
   * Calculate overage charges
   */
  private calculateOverages(
    plan: BillingPlan, 
    usage: UsageMetrics, 
    breakdown: BillingBreakdown[]
  ): BillingResult['overageCharges'] {
    const overages = {
      devices: 0,
      data: 0,
      apiCalls: 0,
      storage: 0,
    };

    // Device overage
    if (usage.devices > plan.deviceLimit) {
      const excess = usage.devices - plan.deviceLimit;
      overages.devices = excess * plan.overageRates.perDevice;
      breakdown.push({
        category: 'Device Overage',
        description: `${excess} devices over ${plan.deviceLimit} limit`,
        quantity: excess,
        rate: plan.overageRates.perDevice,
        amount: overages.devices,
      });
    }

    // Data overage
    if (usage.dataUsageGB > plan.dataLimitGB) {
      const excess = usage.dataUsageGB - plan.dataLimitGB;
      overages.data = excess * plan.overageRates.perGB;
      breakdown.push({
        category: 'Data Overage',
        description: `${excess.toFixed(2)} GB over ${plan.dataLimitGB} GB limit`,
        quantity: excess,
        rate: plan.overageRates.perGB,
        amount: overages.data,
      });
    }

    // API calls overage
    if (usage.apiCalls > plan.apiCallsLimit) {
      const excess = usage.apiCalls - plan.apiCallsLimit;
      overages.apiCalls = excess * plan.overageRates.perApiCall;
      breakdown.push({
        category: 'API Calls Overage',
        description: `${excess} calls over ${plan.apiCallsLimit} limit`,
        quantity: excess,
        rate: plan.overageRates.perApiCall,
        amount: overages.apiCalls,
      });
    }

    // Storage overage
    if (usage.storageUsedGB > plan.storageGB) {
      const excess = usage.storageUsedGB - plan.storageGB;
      overages.storage = excess * plan.overageRates.perStorageGB;
      breakdown.push({
        category: 'Storage Overage',
        description: `${excess.toFixed(2)} GB over ${plan.storageGB} GB limit`,
        quantity: excess,
        rate: plan.overageRates.perStorageGB,
        amount: overages.storage,
      });
    }

    return overages;
  }

  /**
   * Calculate energy costs with time-of-use pricing
   */
  calculateEnergyCosts(energyKWh: number, breakdown?: BillingBreakdown[]): number {
    if (!this.energyPricing.timeOfUseEnabled) {
      const cost = energyKWh * this.energyPricing.baseRatePerKWh;
      if (breakdown) {
        breakdown.push({
          category: 'Energy Costs',
          description: `${energyKWh.toFixed(2)} kWh at base rate`,
          quantity: energyKWh,
          rate: this.energyPricing.baseRatePerKWh,
          amount: cost,
        });
      }
      return cost;
    }

    // Simplified time-of-use calculation (assumes even distribution)
    // In a real implementation, you'd need actual timestamp data
    const peakPercentage = 0.4; // Assume 40% during peak hours
    const offPeakPercentage = 0.6; // Assume 60% during off-peak hours

    const peakUsage = energyKWh * peakPercentage;
    const offPeakUsage = energyKWh * offPeakPercentage;

    const peakCost = peakUsage * this.energyPricing.peakRatePerKWh;
    const offPeakCost = offPeakUsage * this.energyPricing.offPeakRatePerKWh;

    if (breakdown) {
      breakdown.push({
        category: 'Energy Costs (Peak)',
        description: `${peakUsage.toFixed(2)} kWh at peak rate`,
        quantity: peakUsage,
        rate: this.energyPricing.peakRatePerKWh,
        amount: peakCost,
      });
      breakdown.push({
        category: 'Energy Costs (Off-Peak)',
        description: `${offPeakUsage.toFixed(2)} kWh at off-peak rate`,
        quantity: offPeakUsage,
        rate: this.energyPricing.offPeakRatePerKWh,
        amount: offPeakCost,
      });
    }

    return peakCost + offPeakCost;
  }

  /**
   * Calculate ROI analysis
   */
  calculateROI(
    monthlyBilling: BillingResult[],
    implementationCost: number,
    monthlySavings: number,
    analysisMonths: number = 12
  ): ROIAnalysis {
    const totalCosts = implementationCost + 
                      monthlyBilling.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    const totalSavings = monthlySavings * analysisMonths;
    const netBenefit = totalSavings - totalCosts;
    const roi = totalCosts > 0 ? (netBenefit / totalCosts) * 100 : 0;
    
    // Calculate payback period
    let paybackPeriodMonths = 0;
    let cumulativeCosts = implementationCost;
    let cumulativeSavings = 0;
    
    for (let month = 0; month < monthlyBilling.length && cumulativeSavings < cumulativeCosts; month++) {
      cumulativeCosts += monthlyBilling[month].totalAmount;
      cumulativeSavings += monthlySavings;
      paybackPeriodMonths = month + 1;
    }

    const annualizedSavings = monthlySavings * 12;

    return {
      totalCosts,
      totalSavings,
      netBenefit,
      paybackPeriodMonths,
      roi,
      annualizedSavings,
    };
  }

  /**
   * Generate cost projection for future periods
   */
  projectCosts(
    plan: BillingPlan,
    baseUsage: UsageMetrics,
    growthRate: number,
    months: number
  ): BillingResult[] {
    const projections: BillingResult[] = [];
    
    for (let month = 1; month <= months; month++) {
      const growthFactor = Math.pow(1 + growthRate, month);
      const projectedUsage: UsageMetrics = {
        ...baseUsage,
        devices: Math.ceil(baseUsage.devices * growthFactor),
        dataUsageGB: baseUsage.dataUsageGB * growthFactor,
        apiCalls: Math.ceil(baseUsage.apiCalls * growthFactor),
        storageUsedGB: baseUsage.storageUsedGB * growthFactor,
        energyConsumedKWh: baseUsage.energyConsumedKWh * growthFactor,
      };
      
      projections.push(this.calculateBilling(plan, projectedUsage));
    }
    
    return projections;
  }

  /**
   * Compare billing across different plans
   */
  comparePlans(plans: BillingPlan[], usage: UsageMetrics): {
    plan: BillingPlan;
    billing: BillingResult;
    savings?: number;
  }[] {
    const results = plans.map(plan => ({
      plan,
      billing: this.calculateBilling(plan, usage),
    }));

    // Sort by total cost
    results.sort((a, b) => a.billing.totalAmount - b.billing.totalAmount);

    // Calculate savings compared to most expensive
    const mostExpensive = Math.max(...results.map(r => r.billing.totalAmount));
    
    return results.map(result => ({
      ...result,
      savings: mostExpensive - result.billing.totalAmount,
    }));
  }

  /**
   * Update energy pricing
   */
  updateEnergyPricing(energyPricing: EnergyPricing): void {
    this.energyPricing = energyPricing;
  }

  /**
   * Get current energy pricing
   */
  getEnergyPricing(): EnergyPricing {
    return { ...this.energyPricing };
  }
}

// Predefined billing plans
export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    type: 'basic',
    baseFee: 29.99,
    deviceLimit: 10,
    dataLimitGB: 10,
    apiCallsLimit: 10000,
    storageGB: 5,
    features: ['Basic Analytics', 'Email Support', 'Mobile App'],
    overageRates: {
      perDevice: 2.99,
      perGB: 0.50,
      perApiCall: 0.001,
      perStorageGB: 0.25,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    type: 'premium',
    baseFee: 99.99,
    deviceLimit: 50,
    dataLimitGB: 100,
    apiCallsLimit: 100000,
    storageGB: 50,
    features: ['Advanced Analytics', 'Priority Support', 'API Access', 'Custom Reports'],
    overageRates: {
      perDevice: 1.99,
      perGB: 0.30,
      perApiCall: 0.0005,
      perStorageGB: 0.20,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    baseFee: 299.99,
    deviceLimit: 500,
    dataLimitGB: 1000,
    apiCallsLimit: 1000000,
    storageGB: 500,
    features: ['Enterprise Analytics', 'Dedicated Support', 'SLA', 'White Label', 'Custom Integration'],
    overageRates: {
      perDevice: 0.99,
      perGB: 0.15,
      perApiCall: 0.0002,
      perStorageGB: 0.10,
    },
  },
];

// Export default calculator instance
export const billingCalculator = new BillingCalculator();

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};
