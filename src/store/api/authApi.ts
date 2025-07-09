import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'company' | 'consumer';
    companyId?: string;
    permissions: string[];
    avatar?: string;
    createdAt: string;
    lastLoginAt?: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'company' | 'consumer';
  companyName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
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
  tagTypes: ['Auth', 'User', 'Profile'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),
    
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User', 'Profile'],
    }),
    
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (refreshData) => ({
        url: '/refresh',
        method: 'POST',
        body: refreshData,
      }),
    }),
    
    // Password management
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (emailData) => ({
        url: '/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (resetData) => ({
        url: '/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),
    
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    // Profile management
    getProfile: builder.query<LoginResponse['user'], void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    
    updateProfile: builder.mutation<LoginResponse['user'], UpdateProfileRequest>({
      query: (updates) => ({
        url: '/profile',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    
    // Email verification
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),
    
    resendVerificationEmail: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/resend-verification',
        method: 'POST',
      }),
    }),
    
    // Session management
    validateSession: builder.query<{ valid: boolean; user?: LoginResponse['user'] }, void>({
      query: () => '/validate-session',
      providesTags: ['Auth'],
    }),
    
    // Two-factor authentication
    enableTwoFactor: builder.mutation<{ secret: string; qrCode: string }, void>({
      query: () => ({
        url: '/2fa/enable',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    
    verifyTwoFactor: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: '/2fa/verify',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),
    
    disableTwoFactor: builder.mutation<{ message: string }, { password: string }>({
      query: ({ password }) => ({
        url: '/2fa/disable',
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useValidateSessionQuery,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useDisableTwoFactorMutation,
} = authApi;
