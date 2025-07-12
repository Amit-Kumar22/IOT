import { RatePlan, EnergyUsageHistory, CostPrediction, EnergyData, DeviceEnergyBreakdown } from '@/types/energy';

/**
 * Energy cost calculation utilities
 * Handles various rate plans, time-of-use calculations, and cost predictions
 */

export interface CostCalculationResult {
  totalCost: number;
  breakdown: {
    baseCost: number;
    peakCost: number;
    offPeakCost: number;
    tierCosts: { tier: number; cost: number }[];
    monthlyFee: number;
    taxes: number;
  };
  averageRate: number;
  peakHoursUsage: number;
  offPeakHoursUsage: number;
}

export interface CostProjection {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  confidence: number;
}

/**
 * Calculate cost based on usage and rate plan
 */
export function calculateEnergyCost(
  usage: number,
  ratePlan: RatePlan,
  timestamp?: Date,
  isPeakHour?: boolean
): number {
  const date = timestamp || new Date();
  const isCurrentlyPeakHour = isPeakHour !== undefined ? isPeakHour : isInPeakHours(date, ratePlan);

  switch (ratePlan.type) {
    case 'fixed':
      return usage * (ratePlan.rates.base || 0.12);

    case 'time_of_use':
      if (!ratePlan.rates.peak || !ratePlan.rates.offPeak) {
        return usage * (ratePlan.rates.base || 0.12);
      }
      
      const rate = isCurrentlyPeakHour 
        ? ratePlan.rates.peak
        : ratePlan.rates.offPeak;
      return usage * rate;

    case 'tiered':
      return calculateTieredCost(usage, ratePlan);

    default:
      return usage * (ratePlan.rates.base || 0.12);
  }
}

/**
 * Calculate detailed cost breakdown
 */
export function calculateDetailedCost(
  usage: number,
  ratePlan: RatePlan,
  usageHistory?: EnergyUsageHistory,
  timestamp?: Date
): CostCalculationResult {
  const date = timestamp || new Date();
  let totalCost = 0;
  let peakHoursUsage = 0;
  let offPeakHoursUsage = 0;
  
  const breakdown = {
    baseCost: 0,
    peakCost: 0,
    offPeakCost: 0,
    tierCosts: [] as { tier: number; cost: number }[],
    monthlyFee: ratePlan.monthlyFee || 0,
    taxes: 0
  };

  // Calculate based on rate plan type
  switch (ratePlan.type) {
    case 'fixed':
      breakdown.baseCost = usage * (ratePlan.rates.base || 0.12);
      totalCost = breakdown.baseCost;
      break;

    case 'time_of_use':
      if (ratePlan.rates.peak && ratePlan.rates.offPeak && usageHistory) {
        // Calculate peak vs off-peak usage from history
        const peakOffPeakBreakdown = calculatePeakOffPeakUsage(usageHistory, ratePlan);
        peakHoursUsage = peakOffPeakBreakdown.peakUsage;
        offPeakHoursUsage = peakOffPeakBreakdown.offPeakUsage;
        
        breakdown.peakCost = peakHoursUsage * ratePlan.rates.peak;
        breakdown.offPeakCost = offPeakHoursUsage * ratePlan.rates.offPeak;
        totalCost = breakdown.peakCost + breakdown.offPeakCost;
      } else {
        // Fallback to current hour calculation
        const isCurrentlyPeakHour = isInPeakHours(date, ratePlan);
        if (isCurrentlyPeakHour) {
          breakdown.peakCost = usage * (ratePlan.rates.peak || ratePlan.rates.base || 0.12);
          peakHoursUsage = usage;
        } else {
          breakdown.offPeakCost = usage * (ratePlan.rates.offPeak || ratePlan.rates.base || 0.12);
          offPeakHoursUsage = usage;
        }
        totalCost = breakdown.peakCost + breakdown.offPeakCost;
      }
      break;

    case 'tiered':
      const tieredResult = calculateTieredCostDetailed(usage, ratePlan);
      breakdown.tierCosts = tieredResult.tierCosts;
      totalCost = tieredResult.totalCost;
      break;

    default:
      breakdown.baseCost = usage * (ratePlan.rates.base || 0.12);
      totalCost = breakdown.baseCost;
  }

  // Add monthly fee
  totalCost += breakdown.monthlyFee;

  // Calculate taxes (typically 6-10% of energy cost)
  const taxRate = 0.08; // 8% tax rate
  breakdown.taxes = (totalCost - breakdown.monthlyFee) * taxRate;
  totalCost += breakdown.taxes;

  const averageRate = usage > 0 ? (totalCost - breakdown.monthlyFee - breakdown.taxes) / usage : 0;

  return {
    totalCost,
    breakdown,
    averageRate,
    peakHoursUsage,
    offPeakHoursUsage
  };
}

/**
 * Calculate tiered cost
 */
function calculateTieredCost(usage: number, ratePlan: RatePlan): number {
  if (!ratePlan.rates.tiers || ratePlan.rates.tiers.length === 0) {
    return usage * (ratePlan.rates.base || 0.12);
  }

  let totalCost = 0;
  let remainingUsage = usage;
  let previousThreshold = 0;

  for (const tier of ratePlan.rates.tiers) {
    const tierUsage = Math.min(remainingUsage, tier.threshold - previousThreshold);
    if (tierUsage <= 0) break;

    totalCost += tierUsage * tier.rate;
    remainingUsage -= tierUsage;
    previousThreshold = tier.threshold;

    if (remainingUsage <= 0) break;
  }

  return totalCost;
}

/**
 * Calculate detailed tiered cost with breakdown
 */
function calculateTieredCostDetailed(usage: number, ratePlan: RatePlan): {
  totalCost: number;
  tierCosts: { tier: number; cost: number }[];
} {
  const tierCosts: { tier: number; cost: number }[] = [];
  
  if (!ratePlan.rates.tiers || ratePlan.rates.tiers.length === 0) {
    return {
      totalCost: usage * (ratePlan.rates.base || 0.12),
      tierCosts: [{ tier: 1, cost: usage * (ratePlan.rates.base || 0.12) }]
    };
  }

  let totalCost = 0;
  let remainingUsage = usage;
  let previousThreshold = 0;

  ratePlan.rates.tiers.forEach((tier, index) => {
    const tierUsage = Math.min(remainingUsage, tier.threshold - previousThreshold);
    if (tierUsage <= 0) return;

    const tierCost = tierUsage * tier.rate;
    totalCost += tierCost;
    tierCosts.push({ tier: index + 1, cost: tierCost });
    
    remainingUsage -= tierUsage;
    previousThreshold = tier.threshold;
  });

  return { totalCost, tierCosts };
}

/**
 * Check if given time is in peak hours
 */
export function isInPeakHours(date: Date, ratePlan: RatePlan): boolean {
  if (!ratePlan.peakHours || ratePlan.peakHours.length === 0) {
    return false;
  }

  const timeString = date.toTimeString().slice(0, 5); // HH:MM format
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  return ratePlan.peakHours.some(peakHour => {
    // Check if current time is within peak hours
    if (timeString >= peakHour.start && timeString <= peakHour.end) {
      // Check if peak hours apply to current day (if specified)
      if (peakHour.days && peakHour.days.length > 0) {
        return peakHour.days.includes(dayOfWeek);
      }
      return true;
    }
    return false;
  });
}

/**
 * Calculate peak vs off-peak usage from history
 */
function calculatePeakOffPeakUsage(
  usageHistory: EnergyUsageHistory,
  ratePlan: RatePlan
): { peakUsage: number; offPeakUsage: number } {
  let peakUsage = 0;
  let offPeakUsage = 0;

  usageHistory.data.forEach(dataPoint => {
    const timestamp = new Date(dataPoint.timestamp);
    if (isInPeakHours(timestamp, ratePlan)) {
      peakUsage += dataPoint.consumption;
    } else {
      offPeakUsage += dataPoint.consumption;
    }
  });

  return { peakUsage, offPeakUsage };
}

/**
 * Project future costs based on current usage patterns
 */
export function projectCosts(
  currentUsage: number,
  ratePlan: RatePlan,
  usageHistory?: EnergyUsageHistory,
  growthRate: number = 0
): CostProjection {
  const baseHourlyCost = calculateEnergyCost(currentUsage, ratePlan);
  const adjustedHourlyCost = baseHourlyCost * (1 + growthRate);

  // Calculate projections with seasonal adjustments
  const seasonalMultiplier = getSeasonalMultiplier();
  
  const daily = adjustedHourlyCost * 24 * seasonalMultiplier;
  const weekly = daily * 7;
  const monthly = daily * 30.44; // Average days per month
  const yearly = daily * 365.25; // Account for leap years

  // Calculate confidence based on data availability and consistency
  let confidence = 0.8; // Base confidence
  
  if (usageHistory && usageHistory.data.length > 0) {
    // Higher confidence with more historical data
    confidence = Math.min(0.95, 0.6 + (usageHistory.data.length / 100));
    
    // Reduce confidence if usage is highly variable
    const usageVariability = calculateUsageVariability(usageHistory);
    confidence *= (1 - usageVariability * 0.5);
  }

  return {
    daily,
    weekly,
    monthly,
    yearly,
    confidence: Math.max(0.5, confidence)
  };
}

/**
 * Generate cost predictions for different scenarios
 */
export function generateCostPredictions(
  currentUsage: number,
  ratePlan: RatePlan,
  usageHistory?: EnergyUsageHistory
): CostPrediction[] {
  const predictions: CostPrediction[] = [];
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Current usage scenario
  const currentProjection = projectCosts(currentUsage, ratePlan, usageHistory);
  predictions.push({
    scenario: 'current',
    predictedCost: currentProjection.monthly,
    confidence: currentProjection.confidence,
    periodStart: now.toISOString(),
    periodEnd: monthEnd.toISOString(),
    factors: ['current_usage_pattern', 'historical_trends'],
    trend: 'stable'
  });

  // Optimized usage scenario (10% reduction)
  const optimizedProjection = projectCosts(currentUsage, ratePlan, usageHistory, -0.1);
  predictions.push({
    scenario: 'optimized',
    predictedCost: optimizedProjection.monthly,
    confidence: optimizedProjection.confidence * 0.9, // Slightly lower confidence
    periodStart: now.toISOString(),
    periodEnd: monthEnd.toISOString(),
    factors: ['efficiency_improvements', 'behavioral_changes'],
    trend: 'down'
  });

  // High usage scenario (20% increase)
  const highUsageProjection = projectCosts(currentUsage, ratePlan, usageHistory, 0.2);
  predictions.push({
    scenario: 'high_usage',
    predictedCost: highUsageProjection.monthly,
    confidence: optimizedProjection.confidence * 0.85,
    periodStart: now.toISOString(),
    periodEnd: monthEnd.toISOString(),
    factors: ['increased_consumption', 'seasonal_variations'],
    trend: 'up'
  });

  return predictions;
}

/**
 * Calculate cost efficiency score
 */
export function calculateCostEfficiency(
  actualCost: number,
  benchmarkCost: number,
  ratePlan: RatePlan
): number {
  if (benchmarkCost === 0) return 100;
  
  const efficiency = (1 - (actualCost - benchmarkCost) / benchmarkCost) * 100;
  return Math.max(0, Math.min(100, efficiency));
}

/**
 * Calculate device-level cost breakdown
 */
export function calculateDeviceCosts(
  deviceBreakdown: DeviceEnergyBreakdown[],
  ratePlan: RatePlan,
  timestamp?: Date
): DeviceEnergyBreakdown[] {
  return deviceBreakdown.map(device => ({
    ...device,
    cost: calculateEnergyCost(device.consumption, ratePlan, timestamp)
  }));
}

/**
 * Get seasonal multiplier for cost projections
 */
function getSeasonalMultiplier(): number {
  const month = new Date().getMonth();
  
  // Higher usage in summer (AC) and winter (heating)
  const seasonalFactors = [
    1.2, // January
    1.1, // February
    1.0, // March
    0.9, // April
    0.8, // May
    1.3, // June
    1.4, // July
    1.4, // August
    1.2, // September
    0.9, // October
    1.0, // November
    1.2  // December
  ];

  return seasonalFactors[month] || 1.0;
}

/**
 * Calculate usage variability for confidence scoring
 */
function calculateUsageVariability(usageHistory: EnergyUsageHistory): number {
  if (usageHistory.data.length < 2) return 0;

  const usageValues = usageHistory.data.map(d => d.consumption);
  const mean = usageValues.reduce((a, b) => a + b, 0) / usageValues.length;
  const variance = usageValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / usageValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Return coefficient of variation (normalized variability)
  return mean > 0 ? standardDeviation / mean : 0;
}

/**
 * Calculate savings from energy efficiency improvements
 */
export function calculatePotentialSavings(
  currentCost: number,
  ratePlan: RatePlan,
  efficiencyImprovements: { category: string; reduction: number }[]
): { totalSavings: number; breakdown: { category: string; savings: number }[] } {
  let totalSavings = 0;
  const breakdown: { category: string; savings: number }[] = [];

  efficiencyImprovements.forEach(improvement => {
    const categoryCurrentCost = currentCost * 0.2; // Assume 20% of cost per category
    const savings = categoryCurrentCost * improvement.reduction;
    
    totalSavings += savings;
    breakdown.push({
      category: improvement.category,
      savings
    });
  });

  return { totalSavings, breakdown };
}
