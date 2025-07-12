// Billing Plan Management Types

export interface BillingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  features: BillingFeature[];
  limits: BillingLimits;
  status: 'active' | 'inactive' | 'deprecated';
  visibility: 'public' | 'private' | 'internal';
  metadata: BillingPlanMetadata;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BillingFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
  unit?: string;
  category: 'core' | 'premium' | 'enterprise' | 'addon';
}

export interface BillingLimits {
  maxUsers: number;
  maxDevices: number;
  maxDataStorage: number; // in GB
  maxApiCalls: number;
  maxIntegrations: number;
  supportLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  customBranding: boolean;
  sslCertificate: boolean;
  backupRetention: number; // in days
}

export interface BillingPlanMetadata {
  popularPlan: boolean;
  recommendedFor: string[];
  targetUserSize: string;
  setupTime: string;
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  tags: string[];
  discountEligible: boolean;
  trialPeriod: number; // in days
}

export interface BillingPlanTemplate {
  id: string;
  name: string;
  category: 'starter' | 'professional' | 'enterprise' | 'custom';
  basePrice: number;
  features: Partial<BillingFeature>[];
  limits: Partial<BillingLimits>;
  isTemplate: true;
}

export interface BillingPlanComparison {
  plans: BillingPlan[];
  comparisonFeatures: ComparisonFeature[];
  recommendedPlan?: string;
}

export interface ComparisonFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  planValues: { [planId: string]: string | number | boolean };
}

export interface BillingPlanUsage {
  planId: string;
  activeSubscriptions: number;
  revenue: number;
  conversionRate: number;
  averageLifetime: number;
  churnRate: number;
  popularFeatures: string[];
  userFeedback: UserFeedback[];
}

export interface UserFeedback {
  id: string;
  userId: string;
  planId: string;
  rating: number;
  comment: string;
  category: 'pricing' | 'features' | 'support' | 'performance';
  timestamp: string;
}

export interface BillingPlanFilter {
  priceRange?: { min: number; max: number };
  billingCycle?: BillingPlan['billingCycle'];
  status?: BillingPlan['status'];
  visibility?: BillingPlan['visibility'];
  features?: string[];
  userSize?: string;
  searchTerm?: string;
}

export interface BillingPlanFormData {
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingPlan['billingCycle'];
  features: BillingFeature[];
  limits: BillingLimits;
  visibility: BillingPlan['visibility'];
  metadata: BillingPlanMetadata;
}

export interface BillingPlanValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface BillingPlanAction {
  type: 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'duplicate';
  planId?: string;
  data?: Partial<BillingPlanFormData>;
  userId: string;
  timestamp: string;
  reason?: string;
}

export interface BillingPlanState {
  plans: BillingPlan[];
  templates: BillingPlanTemplate[];
  selectedPlan: BillingPlan | null;
  filters: BillingPlanFilter;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// API Response Types
export interface BillingPlanResponse {
  data: BillingPlan[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface BillingPlanCreateRequest {
  plan: BillingPlanFormData;
  templateId?: string;
}

export interface BillingPlanUpdateRequest {
  planId: string;
  updates: Partial<BillingPlanFormData>;
  version: number;
}

export interface BillingPlanDeleteRequest {
  planId: string;
  reason: string;
  migrateToId?: string;
}

// Pricing Calculator Types
export interface PricingCalculation {
  basePlan: BillingPlan;
  addons: BillingAddon[];
  totalPrice: number;
  discounts: BillingDiscount[];
  finalPrice: number;
  breakdown: PriceBreakdown[];
}

export interface BillingAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'per_user' | 'per_device' | 'per_gb' | 'flat_rate';
}

export interface BillingDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'trial';
  value: number;
  description: string;
  validUntil?: string;
}

export interface PriceBreakdown {
  item: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'base' | 'addon' | 'discount';
}

// Export all types for use in components
