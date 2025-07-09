import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  deviceLimit: number;
  dataRetentionDays: number;
  features: string[];
  isActive: boolean;
}

export interface Usage {
  deviceCount: number;
  dataPoints: number;
  apiCalls: number;
  storageUsed: number; // in MB
  bandwidth: number; // in MB
  lastUpdated: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingState {
  plans: PricingPlan[];
  currentSubscription: Subscription | null;
  usage: Usage | null;
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  usageHistory: {
    date: string;
    usage: Usage;
  }[];
  paymentMethods: PaymentMethod[];
  billingAddress: BillingAddress | null;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface BillingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

const initialState: BillingState = {
  plans: [],
  currentSubscription: null,
  usage: null,
  invoices: [],
  isLoading: false,
  error: null,
  usageHistory: [],
  paymentMethods: [],
  billingAddress: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    // Plans
    setPlans: (state, action: PayloadAction<PricingPlan[]>) => {
      state.plans = action.payload;
    },
    updatePlan: (state, action: PayloadAction<{ id: string; updates: Partial<PricingPlan> }>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = { ...state.plans[index], ...action.payload.updates };
      }
    },
    
    // Subscription
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.currentSubscription = action.payload;
    },
    updateSubscription: (state, action: PayloadAction<Partial<Subscription>>) => {
      if (state.currentSubscription) {
        state.currentSubscription = { ...state.currentSubscription, ...action.payload };
      }
    },
    
    // Usage
    setUsage: (state, action: PayloadAction<Usage>) => {
      state.usage = action.payload;
    },
    updateUsage: (state, action: PayloadAction<Partial<Usage>>) => {
      if (state.usage) {
        state.usage = { ...state.usage, ...action.payload };
      }
    },
    addUsageHistory: (state, action: PayloadAction<{ date: string; usage: Usage }>) => {
      state.usageHistory.unshift(action.payload);
      // Keep only last 30 days
      if (state.usageHistory.length > 30) {
        state.usageHistory = state.usageHistory.slice(0, 30);
      }
    },
    
    // Invoices
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.unshift(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<{ id: string; updates: Partial<Invoice> }>) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...action.payload.updates };
      }
    },
    
    // Payment methods
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      state.paymentMethods = action.payload;
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethods.push(action.payload);
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.filter(method => method.id !== action.payload);
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods.forEach(method => {
        method.isDefault = method.id === action.payload;
      });
    },
    
    // Billing address
    setBillingAddress: (state, action: PayloadAction<BillingAddress>) => {
      state.billingAddress = action.payload;
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setPlans,
  updatePlan,
  setSubscription,
  updateSubscription,
  setUsage,
  updateUsage,
  addUsageHistory,
  setInvoices,
  addInvoice,
  updateInvoice,
  setPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  setBillingAddress,
  setLoading,
  setError,
  clearError,
} = billingSlice.actions;

export default billingSlice.reducer;

// Selectors
export const selectPlans = (state: { billing: BillingState }) => state.billing.plans;
export const selectCurrentSubscription = (state: { billing: BillingState }) => state.billing.currentSubscription;
export const selectUsage = (state: { billing: BillingState }) => state.billing.usage;
export const selectInvoices = (state: { billing: BillingState }) => state.billing.invoices;
export const selectBillingLoading = (state: { billing: BillingState }) => state.billing.isLoading;
export const selectBillingError = (state: { billing: BillingState }) => state.billing.error;
export const selectUsageHistory = (state: { billing: BillingState }) => state.billing.usageHistory;
export const selectPaymentMethods = (state: { billing: BillingState }) => state.billing.paymentMethods;
export const selectBillingAddress = (state: { billing: BillingState }) => state.billing.billingAddress;

// Computed selectors
export const selectCurrentPlan = (state: { billing: BillingState }) => {
  const { plans, currentSubscription } = state.billing;
  if (!currentSubscription) return null;
  return plans.find(plan => plan.id === currentSubscription.planId) || null;
};

export const selectOverdueInvoices = (state: { billing: BillingState }) => {
  return state.billing.invoices.filter(invoice => invoice.status === 'overdue');
};

export const selectTotalOutstanding = (state: { billing: BillingState }) => {
  return state.billing.invoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((total, invoice) => total + invoice.amount, 0);
};

export const selectUsagePercentages = (state: { billing: BillingState }) => {
  const plan = selectCurrentPlan(state);
  const usage = state.billing.usage;
  
  if (!plan || !usage) return null;
  
  return {
    devices: (usage.deviceCount / plan.deviceLimit) * 100,
    storage: (usage.storageUsed / (plan.deviceLimit * 100)) * 100, // Assume 100MB per device
  };
};
