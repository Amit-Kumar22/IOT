/**
 * Unit Tests for Billing Calculator
 * 
 * Tests billing calculations, overage computations, energy costs,
 * ROI analysis, and cost projections
 */

import {
  BillingCalculator,
  BillingPlan,
  UsageMetrics,
  EnergyPricing,
  BILLING_PLANS,
  billingCalculator,
  formatCurrency,
  formatPercentage,
} from '../billing';

describe('BillingCalculator', () => {
  let calculator: BillingCalculator;
  let basicPlan: BillingPlan;
  let premiumPlan: BillingPlan;
  let sampleUsage: UsageMetrics;

  beforeEach(() => {
    calculator = new BillingCalculator();
    basicPlan = BILLING_PLANS[0]; // Basic plan
    premiumPlan = BILLING_PLANS[1]; // Premium plan
    
    sampleUsage = {
      devices: 5,
      dataUsageGB: 8.5,
      apiCalls: 7500,
      storageUsedGB: 3.2,
      energyConsumedKWh: 150.5,
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      },
    };
  });

  describe('Basic Billing Calculations', () => {
    it('should calculate billing within plan limits', () => {
      const result = calculator.calculateBilling(basicPlan, sampleUsage);
      
      expect(result.baseFee).toBe(29.99);
      expect(result.overageCharges.devices).toBe(0);
      expect(result.overageCharges.data).toBe(0);
      expect(result.overageCharges.apiCalls).toBe(0);
      expect(result.overageCharges.storage).toBe(0);
      expect(result.energyCosts).toBeCloseTo(18.06, 2); // 150.5 * 0.12
      expect(result.totalAmount).toBeCloseTo(48.05, 2);
      expect(result.breakdown).toHaveLength(2); // Base fee + energy costs
    });

    it('should calculate overage charges correctly', () => {
      const overageUsage: UsageMetrics = {
        devices: 15, // 5 over limit
        dataUsageGB: 25.5, // 15.5 over limit
        apiCalls: 15000, // 5000 over limit
        storageUsedGB: 8.3, // 3.3 over limit
        energyConsumedKWh: 200,
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      };

      const result = calculator.calculateBilling(basicPlan, overageUsage);
      
      expect(result.overageCharges.devices).toBe(5 * 2.99); // 14.95
      expect(result.overageCharges.data).toBeCloseTo(15.5 * 0.50, 2); // 7.75
      expect(result.overageCharges.apiCalls).toBe(5000 * 0.001); // 5.00
      expect(result.overageCharges.storage).toBeCloseTo(3.3 * 0.25, 2); // 0.825
      expect(result.breakdown).toHaveLength(6); // Base + 4 overages + energy
    });

    it('should validate input parameters', () => {
      const invalidPlan = { ...basicPlan, baseFee: -10 };
      
      expect(() => {
        calculator.calculateBilling(invalidPlan as BillingPlan, sampleUsage);
      }).toThrow();
    });
  });

  describe('Energy Cost Calculations', () => {
    it('should calculate base rate energy costs', () => {
      const cost = calculator.calculateEnergyCosts(100);
      expect(cost).toBe(12); // 100 * 0.12
    });

    it('should calculate time-of-use energy costs', () => {
      const touPricing: EnergyPricing = {
        baseRatePerKWh: 0.12,
        peakRatePerKWh: 0.18,
        offPeakRatePerKWh: 0.08,
        timeOfUseEnabled: true,
        peakHours: [{ start: 9, end: 17 }],
      };

      calculator.updateEnergyPricing(touPricing);
      const cost = calculator.calculateEnergyCosts(100);
      
      // 40% peak (40 * 0.18) + 60% off-peak (60 * 0.08) = 7.2 + 4.8 = 12
      expect(cost).toBeCloseTo(12, 2);
    });

    it('should update and get energy pricing', () => {
      const newPricing: EnergyPricing = {
        baseRatePerKWh: 0.15,
        peakRatePerKWh: 0.22,
        offPeakRatePerKWh: 0.10,
        timeOfUseEnabled: true,
        peakHours: [{ start: 8, end: 18 }],
      };

      calculator.updateEnergyPricing(newPricing);
      const retrieved = calculator.getEnergyPricing();
      
      expect(retrieved).toEqual(newPricing);
      expect(retrieved).not.toBe(newPricing); // Should be a copy
    });
  });

  describe('ROI Analysis', () => {
    it('should calculate ROI analysis correctly', () => {
      const monthlyBilling = [
        calculator.calculateBilling(basicPlan, sampleUsage),
        calculator.calculateBilling(basicPlan, sampleUsage),
        calculator.calculateBilling(basicPlan, sampleUsage),
      ];

      const roi = calculator.calculateROI(
        monthlyBilling,
        1000, // Implementation cost
        100, // Monthly savings
        12 // Analysis months
      );

      expect(roi.totalCosts).toBeCloseTo(1000 + (48.05 * 3), 2);
      expect(roi.totalSavings).toBe(1200); // 100 * 12
      expect(roi.netBenefit).toBeCloseTo(1200 - roi.totalCosts, 2);
      expect(roi.annualizedSavings).toBe(1200);
      expect(roi.paybackPeriodMonths).toBeGreaterThan(0);
    });

    it('should handle zero costs in ROI calculation', () => {
      const roi = calculator.calculateROI([], 0, 100, 12);
      
      expect(roi.roi).toBe(0);
      expect(roi.totalCosts).toBe(0);
      expect(roi.paybackPeriodMonths).toBe(0);
    });
  });

  describe('Cost Projections', () => {
    it('should project costs with growth rate', () => {
      const projections = calculator.projectCosts(
        basicPlan,
        sampleUsage,
        0.1, // 10% monthly growth
        3
      );

      expect(projections).toHaveLength(3);
      expect(projections[0].totalAmount).toBeGreaterThan(sampleUsage.devices * basicPlan.baseFee / 10);
      expect(projections[1].totalAmount).toBeGreaterThan(projections[0].totalAmount);
      expect(projections[2].totalAmount).toBeGreaterThan(projections[1].totalAmount);
    });

    it('should handle zero growth rate', () => {
      const projections = calculator.projectCosts(basicPlan, sampleUsage, 0, 2);
      
      expect(projections).toHaveLength(2);
      expect(projections[0].totalAmount).toBeCloseTo(projections[1].totalAmount, 2);
    });
  });

  describe('Plan Comparison', () => {
    it('should compare multiple plans', () => {
      const comparison = calculator.comparePlans(
        [basicPlan, premiumPlan],
        sampleUsage
      );

      expect(comparison).toHaveLength(2);
      expect(comparison[0].billing.totalAmount).toBeLessThanOrEqual(
        comparison[1].billing.totalAmount
      );
      expect(comparison[0].savings).toBeGreaterThanOrEqual(0); // Cheapest plan has savings vs most expensive
      expect(comparison[1].savings).toBeGreaterThanOrEqual(0);
    });

    it('should handle single plan comparison', () => {
      const comparison = calculator.comparePlans([basicPlan], sampleUsage);
      
      expect(comparison).toHaveLength(1);
      expect(comparison[0].savings).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero usage', () => {
      const zeroUsage: UsageMetrics = {
        devices: 0,
        dataUsageGB: 0,
        apiCalls: 0,
        storageUsedGB: 0,
        energyConsumedKWh: 0,
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      };

      const result = calculator.calculateBilling(basicPlan, zeroUsage);
      
      expect(result.baseFee).toBe(29.99);
      expect(result.energyCosts).toBe(0);
      expect(result.totalAmount).toBe(29.99);
      expect(Object.values(result.overageCharges).every(charge => charge === 0)).toBe(true);
    });

    it('should handle maximum usage values', () => {
      const maxUsage: UsageMetrics = {
        devices: 1000,
        dataUsageGB: 10000,
        apiCalls: 1000000,
        storageUsedGB: 1000,
        energyConsumedKWh: 50000,
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      };

      const result = calculator.calculateBilling(basicPlan, maxUsage);
      
      expect(result.totalAmount).toBeGreaterThan(basicPlan.baseFee);
      expect(result.breakdown.length).toBeGreaterThan(2);
    });
  });

  describe('Predefined Plans', () => {
    it('should have valid predefined billing plans', () => {
      expect(BILLING_PLANS).toHaveLength(3);
      
      BILLING_PLANS.forEach(plan => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.baseFee).toBeGreaterThan(0);
        expect(plan.deviceLimit).toBeGreaterThanOrEqual(0);
        expect(plan.features).toBeInstanceOf(Array);
      });
    });

    it('should have increasing plan values', () => {
      const basic = BILLING_PLANS[0];
      const premium = BILLING_PLANS[1];
      const enterprise = BILLING_PLANS[2];

      expect(premium.baseFee).toBeGreaterThan(basic.baseFee);
      expect(enterprise.baseFee).toBeGreaterThan(premium.baseFee);
      expect(premium.deviceLimit).toBeGreaterThan(basic.deviceLimit);
      expect(enterprise.deviceLimit).toBeGreaterThan(premium.deviceLimit);
    });
  });

  describe('Default Calculator Instance', () => {
    it('should export working default calculator', () => {
      const result = billingCalculator.calculateBilling(basicPlan, sampleUsage);
      
      expect(result).toBeDefined();
      expect(result.totalAmount).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(29.99)).toBe('$29.99');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(0.50)).toBe('$0.50');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(25)).toBe('25.0%');
      expect(formatPercentage(50.5)).toBe('50.5%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date periods', () => {
      const invalidUsage = {
        ...sampleUsage,
        period: {
          start: new Date('invalid'),
          end: new Date('2024-01-31'),
        },
      };

      expect(() => {
        calculator.calculateBilling(basicPlan, invalidUsage);
      }).toThrow();
    });

    it('should handle negative values in overage rates', () => {
      const invalidPlan = {
        ...basicPlan,
        overageRates: {
          perDevice: -1,
          perGB: 0.50,
          perApiCall: 0.001,
          perStorageGB: 0.25,
        },
      };

      expect(() => {
        calculator.calculateBilling(invalidPlan as BillingPlan, sampleUsage);
      }).toThrow();
    });
  });
});
