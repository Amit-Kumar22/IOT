import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PricingPlan, Subscription, Invoice, Usage, PaymentMethod, BillingAddress } from '../slices/billingSlice';

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreatePaymentMethodRequest {
  type: 'card' | 'bank' | 'paypal';
  token: string; // Payment processor token
  makeDefault?: boolean;
}

export interface CreateInvoiceRequest {
  companyId: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  dueDate: string;
}

export interface PayInvoiceRequest {
  paymentMethodId: string;
}

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/billing',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Plan', 'Subscription', 'Invoice', 'Usage', 'PaymentMethod', 'BillingAddress'],
  endpoints: (builder) => ({
    // Pricing plans
    getPlans: builder.query<PricingPlan[], void>({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),
    
    getPlan: builder.query<PricingPlan, string>({
      query: (id) => `/plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'Plan', id }],
    }),
    
    // Subscriptions
    getSubscription: builder.query<Subscription, string | undefined>({
      query: (companyId) => ({
        url: '/subscription',
        params: companyId ? { companyId } : {},
      }),
      providesTags: ['Subscription'],
    }),
    
    createSubscription: builder.mutation<Subscription, CreateSubscriptionRequest>({
      query: (subscriptionData) => ({
        url: '/subscription',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['Subscription', 'Usage'],
    }),
    
    updateSubscription: builder.mutation<Subscription, UpdateSubscriptionRequest>({
      query: (updates) => ({
        url: '/subscription',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    cancelSubscription: builder.mutation<Subscription, { immediate?: boolean }>({
      query: ({ immediate = false }) => ({
        url: '/subscription/cancel',
        method: 'POST',
        body: { immediate },
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    reactivateSubscription: builder.mutation<Subscription, void>({
      query: () => ({
        url: '/subscription/reactivate',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Usage tracking
    getUsage: builder.query<Usage, { companyId?: string; period?: string }>({
      query: (params) => ({
        url: '/usage',
        params,
      }),
      providesTags: ['Usage'],
    }),
    
    getUsageHistory: builder.query<{ date: string; usage: Usage }[], { companyId?: string; days?: number }>({
      query: (params) => ({
        url: '/usage/history',
        params,
      }),
      providesTags: ['Usage'],
    }),
    
    // Invoices
    getInvoices: builder.query<Invoice[], { companyId?: string; status?: string; limit?: number }>({
      query: (params) => ({
        url: '/invoices',
        params,
      }),
      providesTags: ['Invoice'],
    }),
    
    getInvoice: builder.query<Invoice, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (invoiceData) => ({
        url: '/invoices',
        method: 'POST',
        body: invoiceData,
      }),
      invalidatesTags: ['Invoice'],
    }),
    
    payInvoice: builder.mutation<Invoice, { id: string; payment: PayInvoiceRequest }>({
      query: ({ id, payment }) => ({
        url: `/invoices/${id}/pay`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    
    downloadInvoice: builder.query<Blob, string>({
      query: (id) => ({
        url: `/invoices/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Payment methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),
    
    addPaymentMethod: builder.mutation<PaymentMethod, CreatePaymentMethodRequest>({
      query: (paymentMethodData) => ({
        url: '/payment-methods',
        method: 'POST',
        body: paymentMethodData,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    removePaymentMethod: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    setDefaultPaymentMethod: builder.mutation<PaymentMethod, string>({
      query: (id) => ({
        url: `/payment-methods/${id}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    // Billing address
    getBillingAddress: builder.query<BillingAddress, void>({
      query: () => '/billing-address',
      providesTags: ['BillingAddress'],
    }),
    
    updateBillingAddress: builder.mutation<BillingAddress, Partial<BillingAddress>>({
      query: (addressData) => ({
        url: '/billing-address',
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['BillingAddress'],
    }),
    
    // Billing preview and estimation
    previewPlanChange: builder.query<{
      prorationAmount: number;
      nextInvoiceAmount: number;
      effectiveDate: string;
    }, string>({
      query: (planId) => `/preview/plan-change/${planId}`,
    }),
    
    estimateUsageCost: builder.query<{
      estimatedCost: number;
      breakdown: Record<string, number>;
    }, { deviceCount: number; dataPoints: number }>({
      query: (params) => ({
        url: '/estimate/usage',
        params,
      }),
    }),
    
    // Webhooks and events
    getBillingEvents: builder.query<{
      id: string;
      type: string;
      data: any;
      timestamp: string;
    }[], { limit?: number }>({
      query: (params) => ({
        url: '/events',
        params,
      }),
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useGetUsageQuery,
  useGetUsageHistoryQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  usePayInvoiceMutation,
  useDownloadInvoiceQuery,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useGetBillingAddressQuery,
  useUpdateBillingAddressMutation,
  usePreviewPlanChangeQuery,
  useEstimateUsageCostQuery,
  useGetBillingEventsQuery,
} = billingApi;
