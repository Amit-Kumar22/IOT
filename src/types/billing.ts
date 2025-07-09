/**
 * Billing and pricing types for IoT platform
 */

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: PlanFeature[];
  limits: PlanLimits;
  isActive: boolean;
  isPopular?: boolean;
  trialDays?: number;
  setupFee?: number;
  createdAt: string;
  updatedAt: string;
}

export type PlanType = 'free' | 'basic' | 'standard' | 'premium' | 'enterprise' | 'custom';

export type BillingCycle = 'monthly' | 'yearly' | 'one_time';

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

export interface PlanLimits {
  devices: number;
  dataPoints: number;
  apiCalls: number;
  storage: number; // in GB
  users: number;
  alerts: number;
  automations: number;
  retention: number; // in days
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  dueDate: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: string;
    end: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export type PaymentType = 'card' | 'bank_account' | 'paypal' | 'crypto';

export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  metricType: UsageMetricType;
  quantity: number;
  timestamp: string;
  period: string; // YYYY-MM format
  metadata?: Record<string, unknown>;
}

export type UsageMetricType = 
  | 'devices'
  | 'data_points'
  | 'api_calls'
  | 'storage'
  | 'alerts'
  | 'automations';

export interface UsageSummary {
  userId: string;
  period: string;
  metrics: UsageMetric[];
  totalCost: number;
  currency: string;
  generatedAt: string;
}

export interface UsageMetric {
  type: UsageMetricType;
  current: number;
  limit: number;
  overage: number;
  cost: number;
  overageCost: number;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface TaxRate {
  id: string;
  displayName: string;
  percentage: number;
  jurisdiction: string;
  type: TaxType;
  isActive: boolean;
}

export type TaxType = 'vat' | 'gst' | 'sales_tax' | 'other';

export interface BillingSettings {
  userId: string;
  billingAddress?: BillingAddress;
  taxId?: string;
  invoiceEmails: string[];
  autoCollect: boolean;
  currency: string;
  timezone: string;
}

export interface Credit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  type: CreditType;
  status: CreditStatus;
  expiresAt?: string;
  appliedAt?: string;
  invoiceId?: string;
  createdAt: string;
}

export type CreditType = 'promotional' | 'refund' | 'adjustment' | 'loyalty';
export type CreditStatus = 'available' | 'applied' | 'expired' | 'canceled';

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // percentage or fixed amount
  currency?: string;
  minimumAmount?: number;
  maximumUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  applicablePlans?: string[];
}

export type DiscountType = 'percentage' | 'fixed_amount';

export interface BillingEvent {
  id: string;
  type: BillingEventType;
  userId: string;
  subscriptionId?: string;
  invoiceId?: string;
  amount?: number;
  currency?: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export type BillingEventType = 
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'invoice_created'
  | 'invoice_paid'
  | 'invoice_failed'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'usage_reported';

export interface Revenue {
  period: string;
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  newCustomerRevenue: number;
  expansionRevenue: number;
  contractionRevenue: number;
  churnRevenue: number;
  currency: string;
}

export interface CustomerLifetimeValue {
  userId: string;
  totalSpent: number;
  averageMonthlySpend: number;
  predictedLifetimeValue: number;
  churnProbability: number;
  customerSince: string;
  lastPayment: string;
}
