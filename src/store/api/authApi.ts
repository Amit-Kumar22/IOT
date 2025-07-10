import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  RefreshTokenResponse, 
  PasswordResetRequest, 
  PasswordReset, 
  ChangePassword, 
  UpdateProfile,
  User,
  AuthTokens
} from '@/types/auth';
import type { RootState } from '@/store';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth?.tokens?.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Profile', 'Session'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse & { sessionId: string }, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'Profile', 'Session'],
    }),
    
    register: builder.mutation<AuthResponse & { sessionId: string }, RegisterData>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<{ message: string; loggedOut: boolean }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User', 'Profile', 'Session'],
    }),
    
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Session'],
    }),
    
    // Password management
    forgotPassword: builder.mutation<{ message: string }, PasswordResetRequest>({
      query: (emailData) => ({
        url: '/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, PasswordReset>({
      query: (resetData) => ({
        url: '/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),
    
    changePassword: builder.mutation<{ message: string }, ChangePassword>({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
      invalidatesTags: ['Auth', 'Session'],
    }),
    
    // Profile management
    getProfile: builder.query<User, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    
    updateProfile: builder.mutation<User, UpdateProfile>({
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
    validateSession: builder.query<{ valid: boolean; user?: User; expiresAt?: number }, void>({
      query: () => '/validate-session',
      providesTags: ['Auth', 'Session'],
    }),
    
    getSessions: builder.query<Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      lastActivity: string;
      current: boolean;
    }>, void>({
      query: () => '/sessions',
      providesTags: ['Session'],
    }),
    
    revokeSession: builder.mutation<{ message: string }, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Session'],
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
    
    // Account management
    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: ({ password }) => ({
        url: '/delete-account',
        method: 'DELETE',
        body: { password },
      }),
      invalidatesTags: ['Auth', 'User', 'Profile', 'Session'],
    }),
    
    // API key management
    getApiKeys: builder.query<Array<{
      id: string;
      name: string;
      permissions: string[];
      lastUsed?: string;
      createdAt: string;
      expiresAt?: string;
    }>, void>({
      query: () => '/api-keys',
      providesTags: ['Profile'],
    }),
    
    createApiKey: builder.mutation<{ 
      apiKey: string;
      id: string;
      name: string;
    }, { 
      name: string; 
      permissions: string[];
      expiresAt?: string;
    }>({
      query: (keyData) => ({
        url: '/api-keys',
        method: 'POST',
        body: keyData,
      }),
      invalidatesTags: ['Profile'],
    }),
    
    revokeApiKey: builder.mutation<{ message: string }, { keyId: string }>({
      query: ({ keyId }) => ({
        url: `/api-keys/${keyId}`,
        method: 'DELETE',
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
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useDisableTwoFactorMutation,
  useDeleteAccountMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = authApi;
