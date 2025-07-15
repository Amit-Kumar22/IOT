import type { Meta, StoryObj } from '@storybook/react';
import PricingTable from './PricingTable';

const meta: Meta<typeof PricingTable> = {
  title: 'Shared/PricingTable',
  component: PricingTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive pricing table component with plans, features comparison, and billing cycles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    billingCycle: {
      control: { type: 'select' },
      options: ['monthly', 'yearly'],
      description: 'Billing cycle selection',
    },
    showComparison: {
      control: { type: 'boolean' },
      description: 'Show detailed feature comparison',
    },
    currency: {
      control: { type: 'text' },
      description: 'Currency symbol or code',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small home automation setups',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    features: [
      { name: 'Up to 10 devices', isIncluded: true },
      { name: 'Basic automation rules', isIncluded: true },
      { name: 'Mobile app access', isIncluded: true },
      { name: 'Email support', isIncluded: true },
      { name: 'Advanced analytics', isIncluded: false },
      { name: 'Custom integrations', isIncluded: false },
    ],
    limits: [
      { name: 'Devices', value: 10 },
      { name: 'Automation rules', value: 25 },
      { name: 'Data retention', value: 30, unit: 'days' },
    ],
    ctaText: 'Start Basic Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for advanced users and medium-sized homes',
    price: {
      monthly: 19.99,
      yearly: 199.99,
    },
    features: [
      { name: 'Up to 50 devices', isIncluded: true },
      { name: 'Advanced automation rules', isIncluded: true },
      { name: 'Mobile & web access', isIncluded: true },
      { name: 'Priority support', isIncluded: true },
      { name: 'Advanced analytics', isIncluded: true },
      { name: 'Custom integrations', isIncluded: false },
    ],
    limits: [
      { name: 'Devices', value: 50 },
      { name: 'Automation rules', value: 100 },
      { name: 'Data retention', value: 365, unit: 'days' },
    ],
    ctaText: 'Upgrade to Pro',
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large installations and commercial use',
    price: {
      monthly: 49.99,
      yearly: 499.99,
    },
    features: [
      { name: 'Unlimited devices', isIncluded: true },
      { name: 'Advanced automation rules', isIncluded: true },
      { name: 'Full platform access', isIncluded: true },
      { name: '24/7 phone support', isIncluded: true },
      { name: 'Advanced analytics', isIncluded: true },
      { name: 'Custom integrations', isIncluded: true },
    ],
    limits: [
      { name: 'Devices', value: 'unlimited' as const },
      { name: 'Automation rules', value: 'unlimited' as const },
      { name: 'Data retention', value: 'unlimited' as const },
    ],
    ctaText: 'Contact Sales',
    isEnterprise: true,
  },
];

export const Default: Story = {
  args: {
    plans: mockPlans,
    billingCycle: 'monthly',
    highlightedPlan: 'pro',
    showComparison: true,
    currency: '$',
    onPlanSelect: (planId: string) => console.log('Selected plan:', planId),
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => console.log('Billing cycle:', cycle),
  },
};

export const YearlyBilling: Story = {
  args: {
    plans: mockPlans,
    billingCycle: 'yearly',
    highlightedPlan: 'pro',
    showComparison: true,
    currency: '$',
    onPlanSelect: (planId: string) => console.log('Selected plan:', planId),
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => console.log('Billing cycle:', cycle),
  },
};

export const WithoutComparison: Story = {
  args: {
    plans: mockPlans,
    billingCycle: 'monthly',
    highlightedPlan: 'pro',
    showComparison: false,
    currency: '$',
    onPlanSelect: (planId: string) => console.log('Selected plan:', planId),
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => console.log('Billing cycle:', cycle),
  },
};

export const WithCurrentPlan: Story = {
  args: {
    plans: mockPlans,
    billingCycle: 'monthly',
    currentPlan: 'basic',
    highlightedPlan: 'pro',
    showComparison: true,
    currency: '$',
    onPlanSelect: (planId: string) => console.log('Selected plan:', planId),
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => console.log('Billing cycle:', cycle),
  },
};

export const EuroCurrency: Story = {
  args: {
    plans: mockPlans.map(plan => ({
      ...plan,
      price: {
        monthly: plan.price.monthly * 0.85,
        yearly: plan.price.yearly * 0.85,
      },
    })),
    billingCycle: 'monthly',
    highlightedPlan: 'pro',
    showComparison: true,
    currency: '€',
    onPlanSelect: (planId: string) => console.log('Selected plan:', planId),
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => console.log('Billing cycle:', cycle),
  },
};
