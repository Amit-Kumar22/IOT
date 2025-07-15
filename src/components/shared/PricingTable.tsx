import React, { useState } from 'react';
import { Check, X, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTableProps {
  plans: PricingPlan[];
  currentPlan?: string;
  highlightedPlan?: string;
  billingCycle: 'monthly' | 'yearly';
  onPlanSelect: (planId: string) => void;
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
  showComparison?: boolean;
  currency?: string;
  className?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PricingFeature[];
  limits: PricingLimit[];
  ctaText: string;
  isPopular?: boolean;
  isEnterprise?: boolean;
}

interface PricingFeature {
  name: string;
  description?: string;
  isIncluded: boolean;
  limit?: number | 'unlimited';
  highlight?: boolean;
}

interface PricingLimit {
  name: string;
  value: number | 'unlimited';
  unit?: string;
}

const PricingTable: React.FC<PricingTableProps> = ({
  plans,
  currentPlan,
  highlightedPlan,
  billingCycle,
  onPlanSelect,
  onBillingCycleChange,
  showComparison = false,
  currency = 'USD',
  className,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const formatPrice = (price: number, currency: string) => {
    const formatters = {
      USD: (val: number) => `$${val.toLocaleString()}`,
      EUR: (val: number) => `€${val.toLocaleString()}`,
      GBP: (val: number) => `£${val.toLocaleString()}`,
      INR: (val: number) => `₹${val.toLocaleString()}`,
    };
    return formatters[currency as keyof typeof formatters]?.(price) || `$${price.toLocaleString()}`;
  };

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    const yearlyMonthly = yearly / 12;
    const discount = ((monthly - yearlyMonthly) / monthly) * 100;
    return Math.round(discount);
  };

  const renderFeatureValue = (feature: PricingFeature) => {
    if (!feature.isIncluded) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    
    if (feature.limit === 'unlimited') {
      return (
        <div className="flex items-center gap-1">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">Unlimited</span>
        </div>
      );
    }
    
    if (typeof feature.limit === 'number') {
      return (
        <div className="flex items-center gap-1">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">{feature.limit}</span>
        </div>
      );
    }
    
    return <Check className="h-4 w-4 text-green-500" />;
  };

  const renderTooltip = (feature: PricingFeature) => {
    if (!feature.description) return null;
    
    return (
      <div className="relative">
        <Info 
          className="h-4 w-4 text-gray-400 cursor-help"
          onMouseEnter={() => setTooltipVisible(feature.name)}
          onMouseLeave={() => setTooltipVisible(null)}
        />
        {tooltipVisible === feature.name && (
          <div className="absolute z-10 w-48 p-2 mt-1 text-sm bg-gray-900 text-white rounded shadow-lg -left-20">
            {feature.description}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  if (showComparison) {
    // Feature comparison matrix view
    const allFeatures = Array.from(
      new Set(plans.flatMap(plan => plan.features.map(f => f.name)))
    );

    return (
      <div className={cn('w-full overflow-x-auto', className)}>
        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onBillingCycleChange('monthly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => onBillingCycleChange('yearly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Yearly
              {billingCycle === 'yearly' && (
                <span className="ml-1 text-xs text-green-600">Save up to 20%</span>
              )}
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                  Features
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-6 py-4 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        {plan.isPopular && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(plan.price[billingCycle], currency)}
                        <span className="text-sm font-normal text-gray-500">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600">
                          Save {getDiscountPercentage(plan.price.monthly, plan.price.yearly)}%
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allFeatures.map((featureName) => (
                <tr key={featureName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {featureName}
                  </td>
                  {plans.map((plan) => {
                    const feature = plan.features.find(f => f.name === featureName);
                    return (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {feature ? renderFeatureValue(feature) : (
                          <X className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-4"></td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    <button
                      onClick={() => onPlanSelect(plan.id)}
                      className={cn(
                        'w-full px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        plan.isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800',
                        currentPlan === plan.id && 'ring-2 ring-blue-500'
                      )}
                    >
                      {plan.ctaText}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Card-based layout view
  return (
    <div className={cn('w-full', className)}>
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onBillingCycleChange('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => onBillingCycleChange('yearly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Yearly
            {billingCycle === 'yearly' && (
              <span className="ml-1 text-xs text-green-600">Save up to 20%</span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200',
              plan.isPopular
                ? 'border-blue-500 scale-105'
                : 'border-gray-200 hover:border-gray-300',
              currentPlan === plan.id && 'ring-2 ring-blue-500',
              highlightedPlan === plan.id && 'ring-2 ring-yellow-400'
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Plan header */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="text-center space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price[billingCycle], currency)}
                  </span>
                  <span className="text-gray-500">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600">
                    Save {getDiscountPercentage(plan.price.monthly, plan.price.yearly)}%
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2">
                      {renderFeatureValue(feature)}
                      <span className={cn(
                        'text-sm',
                        feature.highlight ? 'font-medium text-gray-900' : 'text-gray-600'
                      )}>
                        {feature.name}
                      </span>
                      {renderTooltip(feature)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limits */}
              {plan.limits.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Limits:</h4>
                  <ul className="space-y-2">
                    {plan.limits.map((limit) => (
                      <li key={limit.name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{limit.name}</span>
                        <span className="font-medium text-gray-900">
                          {limit.value === 'unlimited' ? 'Unlimited' : `${limit.value}${limit.unit || ''}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => onPlanSelect(plan.id)}
                className={cn(
                  'w-full px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800',
                  currentPlan === plan.id && 'ring-2 ring-blue-500'
                )}
              >
                {plan.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingTable;
