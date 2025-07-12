import { 
  calculateEnergyCost, 
  calculateDetailedCost, 
  calculateCostPrediction, 
  calculatePotentialSavings,
  calculateCostEfficiency,
  calculateBudgetProgress,
  isInPeakHours,
  getCostBreakdown,
  optimizeRatePlan
} from '../energyCostCalculation';
import { RatePlan } from '@/types/energy';

describe('Energy Cost Calculation Library', () => {
  const mockFixedRatePlan: RatePlan = {
    id: 'fixed',
    name: 'Fixed Rate',
    provider: 'Test Electric',
    type: 'fixed',
    rates: {
      base: 0.12,
      peak: 0.12,
      offPeak: 0.12,
      tiers: []
    },
    peakHours: [],
    monthlyFee: 10.00
  };

  const mockTieredRatePlan: RatePlan = {
    id: 'tiered',
    name: 'Tiered Rate',
    provider: 'Test Electric',
    type: 'tiered',
    rates: {
      base: 0.10,
      peak: 0.10,
      offPeak: 0.10,
      tiers: [
        { threshold: 500, rate: 0.10 },
        { threshold: 1000, rate: 0.15 },
        { threshold: Infinity, rate: 0.20 }
      ]
    },
    peakHours: [],
    monthlyFee: 10.00
  };

  const mockTimeOfUseRatePlan: RatePlan = {
    id: 'tou',
    name: 'Time of Use',
    provider: 'Test Electric',
    type: 'time_of_use',
    rates: {
      base: 0.10,
      peak: 0.20,
      offPeak: 0.08,
      tiers: []
    },
    peakHours: [
      { startTime: '14:00', endTime: '20:00' }
    ],
    monthlyFee: 10.00
  };

  describe('calculateEnergyCost', () => {
    it('calculates fixed rate cost correctly', () => {
      const cost = calculateEnergyCost(100, mockFixedRatePlan);
      expect(cost).toBe(12.00); // 100 * 0.12
    });

    it('calculates time of use cost during peak hours', () => {
      const peakTime = new Date('2025-01-01T16:00:00Z'); // 4 PM
      const cost = calculateEnergyCost(100, mockTimeOfUseRatePlan, peakTime, true);
      expect(cost).toBe(20.00); // 100 * 0.20
    });

    it('calculates time of use cost during off-peak hours', () => {
      const offPeakTime = new Date('2025-01-01T10:00:00Z'); // 10 AM
      const cost = calculateEnergyCost(100, mockTimeOfUseRatePlan, offPeakTime, false);
      expect(cost).toBe(8.00); // 100 * 0.08
    });

    it('handles tiered rates', () => {
      const cost = calculateEnergyCost(750, mockTieredRatePlan);
      // Should use tiered calculation
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('calculateDetailedCost', () => {
    it('provides detailed cost breakdown', () => {
      const result = calculateDetailedCost(100, mockFixedRatePlan);
      
      expect(result).toHaveProperty('totalCost');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('averageRate');
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('includes monthly fee in breakdown', () => {
      const result = calculateDetailedCost(100, mockFixedRatePlan);
      
      expect(result.breakdown.monthlyFee).toBe(10.00);
    });
  });

  describe('calculateCostPrediction', () => {
    it('predicts future costs based on usage', () => {
      const prediction = calculateCostPrediction(25, mockFixedRatePlan, 'month');
      
      expect(prediction).toHaveProperty('daily');
      expect(prediction).toHaveProperty('weekly');
      expect(prediction).toHaveProperty('monthly');
      expect(prediction).toHaveProperty('yearly');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction.monthly).toBeGreaterThan(0);
    });

    it('adjusts predictions for different periods', () => {
      const weeklyPrediction = calculateCostPrediction(25, mockFixedRatePlan, 'week');
      const monthlyPrediction = calculateCostPrediction(25, mockFixedRatePlan, 'month');
      
      expect(monthlyPrediction.monthly).toBeGreaterThan(weeklyPrediction.weekly);
    });
  });

  describe('calculatePotentialSavings', () => {
    it('calculates savings between rate plans', () => {
      const scenarios = [
        { category: 'peak_shifting', reduction: 15 },
        { category: 'efficiency_upgrade', reduction: 10 }
      ];

      const savings = calculatePotentialSavings(800, scenarios);
      
      expect(savings).toBeGreaterThan(0);
      expect(savings).toBeLessThan(800);
    });

    it('handles empty scenarios', () => {
      const savings = calculatePotentialSavings(800, []);
      expect(savings).toBe(0);
    });
  });

  describe('calculateCostEfficiency', () => {
    it('calculates efficiency score', () => {
      const score = calculateCostEfficiency(
        800, // usage
        96,  // cost
        1000, // average usage
        120   // average cost
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles zero averages', () => {
      const score = calculateCostEfficiency(800, 96, 0, 0);
      expect(score).toBe(50); // Default fallback
    });
  });

  describe('calculateBudgetProgress', () => {
    it('calculates budget progress under budget', () => {
      const progress = calculateBudgetProgress(80, 100, 'month');
      
      expect(progress.percentage).toBe(80);
      expect(progress.isOverBudget).toBe(false);
      expect(progress.remaining).toBe(20);
    });

    it('calculates budget progress over budget', () => {
      const progress = calculateBudgetProgress(120, 100, 'month');
      
      expect(progress.percentage).toBe(120);
      expect(progress.isOverBudget).toBe(true);
      expect(progress.remaining).toBe(0);
      expect(progress.overage).toBe(20);
    });
  });

  describe('isInPeakHours', () => {
    it('identifies peak hours correctly', () => {
      const peakTime = new Date('2025-01-01T16:00:00Z'); // 4 PM
      const isPeak = isInPeakHours(peakTime, mockTimeOfUseRatePlan);
      expect(isPeak).toBe(true);
    });

    it('identifies off-peak hours correctly', () => {
      const offPeakTime = new Date('2025-01-01T10:00:00Z'); // 10 AM
      const isPeak = isInPeakHours(offPeakTime, mockTimeOfUseRatePlan);
      expect(isPeak).toBe(false);
    });

    it('handles plans without peak hours', () => {
      const isPeak = isInPeakHours(new Date(), mockFixedRatePlan);
      expect(isPeak).toBe(false);
    });
  });

  describe('getCostBreakdown', () => {
    it('provides detailed cost breakdown', () => {
      const breakdown = getCostBreakdown(100, mockFixedRatePlan);
      
      expect(breakdown).toHaveProperty('baseCost');
      expect(breakdown).toHaveProperty('peakCost');
      expect(breakdown).toHaveProperty('offPeakCost');
      expect(breakdown).toHaveProperty('tierCosts');
      expect(breakdown).toHaveProperty('monthlyFee');
      expect(breakdown).toHaveProperty('taxes');
    });
  });

  describe('optimizeRatePlan', () => {
    it('recommends optimal rate plan', () => {
      const plans = [mockFixedRatePlan, mockTieredRatePlan, mockTimeOfUseRatePlan];
      const optimal = optimizeRatePlan(800, plans);
      
      expect(optimal).toBeDefined();
      expect(optimal.ratePlan).toBeDefined();
      expect(optimal.estimatedMonthlyCost).toBeGreaterThan(0);
      expect(optimal.potentialSavings).toBeGreaterThanOrEqual(0);
    });

    it('handles single rate plan', () => {
      const optimal = optimizeRatePlan(800, [mockFixedRatePlan]);
      
      expect(optimal.ratePlan).toBe(mockFixedRatePlan);
      expect(optimal.potentialSavings).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero usage', () => {
      const cost = calculateEnergyCost(0, mockFixedRatePlan);
      expect(cost).toBe(0);
    });

    it('handles negative usage', () => {
      const cost = calculateEnergyCost(-10, mockFixedRatePlan);
      expect(cost).toBe(0);
    });

    it('handles malformed rate plan', () => {
      const malformedPlan = {
        ...mockFixedRatePlan,
        rates: {
          base: undefined,
          peak: undefined,
          offPeak: undefined,
          tiers: []
        }
      } as any;

      const cost = calculateEnergyCost(100, malformedPlan);
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('handles invalid timestamps', () => {
      const cost = calculateEnergyCost(100, mockTimeOfUseRatePlan, new Date('invalid'));
      expect(cost).toBeGreaterThan(0);
    });
  });
});
