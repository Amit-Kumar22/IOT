/**
 * Unit Tests for Cost Optimization and Pricing Alerts
 * 
 * Tests optimization suggestions, pricing alerts, and cost analysis
 */

import {
  CostOptimizer,
  OptimizationSuggestion,
  PricingAlert,
  CostOptimizationSettings,
  UsagePattern,
  defaultOptimizer,
  createOptimizationReport,
} from '../optimization';
import {
  BillingCalculator,
  BillingPlan,
  UsageMetrics,
  BillingResult,
  BILLING_PLANS,
} from '../billing';

describe('CostOptimizer', () => {
  let optimizer: CostOptimizer;
  let billingCalculator: BillingCalculator;
  let basicPlan: BillingPlan;
  let premiumPlan: BillingPlan;
  let enterprisePlan: BillingPlan;
  let sampleUsage: UsageMetrics;
  let samplePattern: UsagePattern;
  let optimizationSettings: CostOptimizationSettings;

  beforeEach(() => {
    billingCalculator = new BillingCalculator();
    basicPlan = BILLING_PLANS[0];
    premiumPlan = BILLING_PLANS[1];
    enterprisePlan = BILLING_PLANS[2];

    sampleUsage = {
      devices: 8,
      dataUsageGB: 15.5,
      apiCalls: 12000,
      storageUsedGB: 6.2,
      energyConsumedKWh: 200.5,
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      },
    };

    samplePattern = {
      averageMonthlyUsage: sampleUsage,
      peakUsage: {
        ...sampleUsage,
        devices: 12,
        dataUsageGB: 25,
        apiCalls: 18000,
        storageUsedGB: 9,
        energyConsumedKWh: 300,
      },
      trends: {
        deviceGrowthRate: 0.05, // 5% monthly
        dataGrowthRate: 0.08, // 8% monthly
        apiCallGrowthRate: 0.06, // 6% monthly
        storageGrowthRate: 0.04, // 4% monthly
      },
      seasonality: {
        highSeasonMonths: [6, 7, 8], // Summer months
        lowSeasonMonths: [1, 2, 11, 12], // Winter months
        seasonalityFactor: 1.3,
      },
    };

    optimizationSettings = {
      budgetLimit: 200,
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
    };

    optimizer = new CostOptimizer(optimizationSettings, billingCalculator);
  });

  describe('Constructor and Settings', () => {
    it('should initialize with valid settings', () => {
      const settings = optimizer.getSettings();
      expect(settings.budgetLimit).toBe(200);
      expect(settings.alertThresholds.budgetPercentage).toBe(80);
      expect(settings.optimizationPreferences.aggressiveness).toBe('moderate');
    });

    it('should validate settings on initialization', () => {
      const invalidSettings = {
        ...optimizationSettings,
        budgetLimit: -100,
      };

      expect(() => {
        new CostOptimizer(invalidSettings);
      }).toThrow();
    });

    it('should update settings correctly', () => {
      const newSettings = { budgetLimit: 300 };
      optimizer.updateSettings(newSettings);
      
      expect(optimizer.getSettings().budgetLimit).toBe(300);
      expect(optimizer.getSettings().alertThresholds.budgetPercentage).toBe(80); // Should remain unchanged
    });
  });

  describe('Plan Optimization Suggestions', () => {
    it('should suggest plan downgrade for underutilization', () => {
      // Create usage pattern with low utilization on premium plan
      const lowUsagePattern: UsagePattern = {
        ...samplePattern,
        averageMonthlyUsage: {
          devices: 5, // Well below premium limit of 50
          dataUsageGB: 20, // Well below premium limit of 100
          apiCalls: 30000, // Well below premium limit of 100000
          storageUsedGB: 10, // Well below premium limit of 50
          energyConsumedKWh: 100,
          period: sampleUsage.period,
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        premiumPlan,
        lowUsagePattern,
        []
      );

      const downgradeSuggestion = suggestions.find(s => s.type === 'plan_downgrade');
      expect(downgradeSuggestion).toBeDefined();
      expect(downgradeSuggestion!.title).toContain('Basic');
      expect(downgradeSuggestion!.estimatedSavings).toBeGreaterThan(0);
      expect(downgradeSuggestion!.confidence).toBe('high');
    });

    it('should suggest plan upgrade for frequent overages', () => {
      // Create usage pattern with frequent overages on basic plan
      const highUsagePattern: UsagePattern = {
        ...samplePattern,
        averageMonthlyUsage: {
          devices: 15, // Over basic limit of 10
          dataUsageGB: 15, // Over basic limit of 10
          apiCalls: 15000, // Over basic limit of 10000
          storageUsedGB: 8, // Over basic limit of 5
          energyConsumedKWh: 200,
          period: sampleUsage.period,
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        highUsagePattern,
        []
      );
      
      const upgradeSuggestion = suggestions.find(s => s.type === 'plan_upgrade');
      expect(upgradeSuggestion).toBeDefined();
      expect(upgradeSuggestion!.title).toContain('Premium');
      expect(upgradeSuggestion!.confidence).toBeDefined();
    });

    it('should not suggest plan changes when disabled', () => {
      const restrictedSettings = {
        ...optimizationSettings,
        optimizationPreferences: {
          ...optimizationSettings.optimizationPreferences,
          allowPlanChanges: false,
        },
      };

      const restrictedOptimizer = new CostOptimizer(restrictedSettings);
      const suggestions = restrictedOptimizer.generateOptimizationSuggestions(
        premiumPlan,
        samplePattern,
        []
      );

      const planSuggestions = suggestions.filter(s => 
        s.type === 'plan_upgrade' || s.type === 'plan_downgrade'
      );
      expect(planSuggestions).toHaveLength(0);
    });
  });

  describe('Usage Optimization Suggestions', () => {
    it('should suggest device optimization for rapid growth', () => {
      const rapidGrowthPattern: UsagePattern = {
        ...samplePattern,
        trends: {
          ...samplePattern.trends,
          deviceGrowthRate: 0.15, // 15% monthly growth
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        rapidGrowthPattern,
        []
      );

      const deviceOptimization = suggestions.find(s => 
        s.type === 'usage_reduction' && s.id === 'device_optimization'
      );
      expect(deviceOptimization).toBeDefined();
      expect(deviceOptimization!.title).toContain('Device Usage');
      expect(deviceOptimization!.actionItems).toContain('Audit active devices and remove unused ones');
    });

    it('should suggest data optimization for high data growth', () => {
      const highDataGrowthPattern: UsagePattern = {
        ...samplePattern,
        trends: {
          ...samplePattern.trends,
          dataGrowthRate: 0.20, // 20% monthly growth
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        highDataGrowthPattern,
        []
      );

      const dataOptimization = suggestions.find(s => 
        s.type === 'usage_reduction' && s.id === 'data_optimization'
      );
      expect(dataOptimization).toBeDefined();
      expect(dataOptimization!.title).toContain('Data Usage');
      expect(dataOptimization!.actionItems).toContain('Implement data compression for device communications');
    });

    it('should suggest timing optimization for energy costs', () => {
      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      const timingOptimization = suggestions.find(s => s.type === 'timing_optimization');
      expect(timingOptimization).toBeDefined();
      expect(timingOptimization!.title).toContain('Energy Usage Timing');
    });
  });

  describe('Feature Optimization Suggestions', () => {
    it('should suggest API optimization for high usage', () => {
      const highApiUsagePattern: UsagePattern = {
        ...samplePattern,
        averageMonthlyUsage: {
          ...samplePattern.averageMonthlyUsage,
          apiCalls: 7500, // 75% of basic plan limit of 10000 (above 70% threshold)
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        highApiUsagePattern,
        []
      );

      const apiOptimization = suggestions.find(s => 
        s.type === 'feature_optimization' && s.id === 'api_optimization'
      );
      expect(apiOptimization).toBeDefined();
      expect(apiOptimization!.title).toContain('API Usage');
      expect(apiOptimization!.actionItems).toContain('Implement API response caching');
    });

    it('should not suggest feature changes when disabled', () => {
      const restrictedSettings = {
        ...optimizationSettings,
        optimizationPreferences: {
          ...optimizationSettings.optimizationPreferences,
          allowFeatureChanges: false,
        },
      };

      const restrictedOptimizer = new CostOptimizer(restrictedSettings);
      const suggestions = restrictedOptimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      const featureSuggestions = suggestions.filter(s => s.type === 'feature_optimization');
      expect(featureSuggestions).toHaveLength(0);
    });
  });

  describe('Pricing Alerts', () => {
    it('should generate budget exceeded alert', () => {
      const billing: BillingResult = {
        baseFee: 99.99,
        overageCharges: { devices: 50, data: 30, apiCalls: 20, storage: 10 },
        energyCosts: 25,
        totalAmount: 234.99, // Exceeds budget of 200
        breakdown: [],
      };

      const alerts = optimizer.generatePricingAlerts(billing, sampleUsage);
      const budgetAlert = alerts.find(a => a.type === 'budget_exceeded');
      
      expect(budgetAlert).toBeDefined();
      expect(budgetAlert!.severity).toBe('critical');
      expect(budgetAlert!.title).toBe('Budget Exceeded');
      expect(budgetAlert!.currentValue).toBe(234.99);
    });

    it('should generate budget warning alert', () => {
      const billing: BillingResult = {
        baseFee: 99.99,
        overageCharges: { devices: 20, data: 15, apiCalls: 10, storage: 5 },
        energyCosts: 15,
        totalAmount: 164.99, // 82.5% of budget (above 80% threshold)
        breakdown: [],
      };

      const alerts = optimizer.generatePricingAlerts(billing, sampleUsage);
      const warningAlert = alerts.find(a => a.id === 'budget_warning');
      
      expect(warningAlert).toBeDefined();
      expect(warningAlert!.severity).toBe('warning');
      expect(warningAlert!.title).toBe('Budget Warning');
    });

    it('should generate overage warning alert', () => {
      const billing: BillingResult = {
        baseFee: 29.99,
        overageCharges: { devices: 15, data: 10, apiCalls: 5, storage: 3 }, // Total: 33 (110% of base fee)
        energyCosts: 20,
        totalAmount: 82.99,
        breakdown: [],
      };

      const alerts = optimizer.generatePricingAlerts(billing, sampleUsage);
      const overageAlert = alerts.find(a => a.type === 'overage_warning');
      
      expect(overageAlert).toBeDefined();
      expect(overageAlert!.severity).toBe('critical'); // Over 50% threshold
      expect(overageAlert!.title).toBe('High Overage Charges');
    });

    it('should generate cost spike alert', () => {
      const previousBilling: BillingResult = {
        baseFee: 29.99,
        overageCharges: { devices: 0, data: 0, apiCalls: 0, storage: 0 },
        energyCosts: 15,
        totalAmount: 44.99,
        breakdown: [],
      };

      const currentBilling: BillingResult = {
        baseFee: 29.99,
        overageCharges: { devices: 20, data: 15, apiCalls: 10, storage: 5 },
        energyCosts: 25,
        totalAmount: 104.99, // 133% increase
        breakdown: [],
      };

      const alerts = optimizer.generatePricingAlerts(currentBilling, sampleUsage, previousBilling);
      const spikeAlert = alerts.find(a => a.type === 'unusual_spike');
      
      expect(spikeAlert).toBeDefined();
      expect(spikeAlert!.severity).toBe('critical');
      expect(spikeAlert!.title).toBe('Unusual Cost Spike');
    });

    it('should handle no alerts when everything is normal', () => {
      const billing: BillingResult = {
        baseFee: 29.99,
        overageCharges: { devices: 0, data: 0, apiCalls: 0, storage: 0 },
        energyCosts: 15,
        totalAmount: 44.99, // Well within budget
        breakdown: [],
      };

      const alerts = optimizer.generatePricingAlerts(billing, sampleUsage);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Aggressiveness Levels', () => {
    it('should filter suggestions based on conservative aggressiveness', () => {
      const conservativeSettings = {
        ...optimizationSettings,
        optimizationPreferences: {
          ...optimizationSettings.optimizationPreferences,
          aggressiveness: 'conservative' as const,
        },
      };

      const conservativeOptimizer = new CostOptimizer(conservativeSettings);
      const suggestions = conservativeOptimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      // Conservative should only show high-confidence suggestions with significant savings
      // but plan upgrade/downgrade and timing optimization suggestions are always included for strategic value
      suggestions.forEach(suggestion => {
        if (suggestion.type !== 'plan_upgrade' && 
            suggestion.type !== 'plan_downgrade' && 
            suggestion.type !== 'timing_optimization') {
          expect(suggestion.confidence).toBe('high');
          expect(suggestion.estimatedSavings).toBeGreaterThan(10);
        }
      });
    });

    it('should include more suggestions for aggressive aggressiveness', () => {
      const aggressiveSettings = {
        ...optimizationSettings,
        optimizationPreferences: {
          ...optimizationSettings.optimizationPreferences,
          aggressiveness: 'aggressive' as const,
        },
      };

      const aggressiveOptimizer = new CostOptimizer(aggressiveSettings);
      const moderateOptimizer = new CostOptimizer(optimizationSettings);

      const aggressiveSuggestions = aggressiveOptimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      const moderateSuggestions = moderateOptimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      // Aggressive should include more suggestions
      expect(aggressiveSuggestions.length).toBeGreaterThanOrEqual(moderateSuggestions.length);
    });
  });

  describe('Default Optimizer Instance', () => {
    it('should export working default optimizer', () => {
      const suggestions = defaultOptimizer.generateOptimizationSuggestions(
        basicPlan,
        samplePattern,
        []
      );

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should have reasonable default settings', () => {
      const settings = defaultOptimizer.getSettings();
      
      expect(settings.budgetLimit).toBe(500);
      expect(settings.optimizationPreferences.aggressiveness).toBe('moderate');
      expect(settings.optimizationPreferences.allowPlanChanges).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should create optimization report correctly', () => {
      const suggestions: OptimizationSuggestion[] = [
        {
          id: 'test1',
          type: 'plan_downgrade',
          title: 'Test 1',
          description: 'Test description',
          estimatedSavings: 50,
          confidence: 'high',
          impact: 'high',
          actionItems: [],
          priority: 8,
        },
        {
          id: 'test2',
          type: 'usage_reduction',
          title: 'Test 2',
          description: 'Test description',
          estimatedSavings: 30,
          confidence: 'medium',
          impact: 'medium',
          actionItems: [],
          priority: 6,
        },
      ];

      const alerts: PricingAlert[] = [
        {
          id: 'alert1',
          type: 'budget_exceeded',
          severity: 'critical',
          title: 'Critical Alert',
          message: 'Test message',
          threshold: 100,
          currentValue: 150,
          createdAt: new Date(),
        },
        {
          id: 'alert2',
          type: 'overage_warning',
          severity: 'warning',
          title: 'Warning Alert',
          message: 'Test message',
          threshold: 25,
          currentValue: 30,
          createdAt: new Date(),
        },
      ];

      const report = createOptimizationReport(suggestions, alerts);

      expect(report.totalPotentialSavings).toBe(80);
      expect(report.criticalAlerts).toBe(1);
      expect(report.highPrioritySuggestions).toBe(1);
      expect(report.summary).toContain('2 optimization opportunities');
      expect(report.summary).toContain('$80.00');
      expect(report.summary).toContain('1 critical alerts');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty usage patterns', () => {
      const emptyPattern: UsagePattern = {
        averageMonthlyUsage: {
          devices: 0,
          dataUsageGB: 0,
          apiCalls: 0,
          storageUsedGB: 0,
          energyConsumedKWh: 0,
          period: sampleUsage.period,
        },
        peakUsage: {
          devices: 0,
          dataUsageGB: 0,
          apiCalls: 0,
          storageUsedGB: 0,
          energyConsumedKWh: 0,
          period: sampleUsage.period,
        },
        trends: {
          deviceGrowthRate: 0,
          dataGrowthRate: 0,
          apiCallGrowthRate: 0,
          storageGrowthRate: 0,
        },
        seasonality: {
          highSeasonMonths: [],
          lowSeasonMonths: [],
          seasonalityFactor: 1,
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        emptyPattern,
        []
      );

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle negative growth rates', () => {
      const decliningPattern: UsagePattern = {
        ...samplePattern,
        trends: {
          deviceGrowthRate: -0.05,
          dataGrowthRate: -0.03,
          apiCallGrowthRate: -0.02,
          storageGrowthRate: -0.01,
        },
      };

      const suggestions = optimizer.generateOptimizationSuggestions(
        basicPlan,
        decliningPattern,
        []
      );

      expect(suggestions).toBeDefined();
      // Should not suggest usage reduction for declining trends
      const usageReductions = suggestions.filter(s => s.type === 'usage_reduction');
      expect(usageReductions).toHaveLength(0);
    });
  });
});
