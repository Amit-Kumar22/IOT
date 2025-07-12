import { AdminUser } from './admin';

// Extract types from AdminUser
export type UserRole = 'admin' | 'company' | 'consumer';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'inactive';

// Enhanced User Management Types
export interface UserSearchFilters {
  query?: string;
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  company?: string;
  lastActiveRange?: {
    start: Date;
    end: Date;
  };
}

export interface UserBulkOperation {
  type: 'activate' | 'deactivate' | 'delete' | 'export' | 'changeRole' | 'assignCompany';
  userIds: string[];
  params?: {
    newRole?: UserRole;
    companyId?: string;
    reason?: string;
  };
}

export interface UserBulkImport {
  file: File;
  mapping: {
    email: string;
    name: string;
    role: string;
    company?: string;
  };
  validateOnly?: boolean;
}

export interface UserImpersonation {
  targetUserId: string;
  adminUserId: string;
  reason: string;
  duration?: number; // in minutes
  permissions?: string[];
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  adminUserId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'role_changed' | 'impersonated';
  changes: Record<string, { old: any; new: any }>;
  timestamp: Date;
  reason?: string;
}

// Enhanced User Management Props
export interface UserManagementTableProps {
  users: AdminUser[];
  loading?: boolean;
  onUserSelect?: (user: AdminUser) => void;
  onUserEdit?: (user: AdminUser) => void;
  onUserDelete?: (userId: string) => void;
  onUserImpersonate?: (userId: string) => void;
  onBulkOperation?: (operation: UserBulkOperation) => void;
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  filters?: UserSearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface UserSearchProps {
  filters: UserSearchFilters;
  onFiltersChange: (filters: UserSearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
  totalResults?: number;
}

export interface UserBulkActionsProps {
  selectedUsers: string[];
  onBulkOperation: (operation: UserBulkOperation) => void;
  loading?: boolean;
  availableRoles: UserRole[];
  availableCompanies: Array<{ id: string; name: string }>;
}

export interface UserImpersonationProps {
  targetUser: AdminUser;
  onImpersonate: (impersonation: UserImpersonation) => void;
  onCancel: () => void;
  loading?: boolean;
  maxDuration?: number;
}

export interface UserActivityLogProps {
  userId: string;
  activities: UserActivity[];
  loading?: boolean;
  onRefresh: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
}

export interface UserAuditLogProps {
  userId?: string;
  auditLogs: UserAuditLog[];
  loading?: boolean;
  onRefresh: () => void;
  filters?: {
    action?: string;
    dateRange?: { start: Date; end: Date };
    adminUserId?: string;
  };
  onFiltersChange?: (filters: any) => void;
}

export interface UserManagementPagination {
  page: number;
  pageSize: number;
  total: number;
}

// User Management API Types
export interface UserManagementAPI {
  searchUsers: (filters: UserSearchFilters, page?: number, pageSize?: number) => Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  
  bulkUpdateUsers: (operation: UserBulkOperation) => Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  }>;
  
  importUsers: (importData: UserBulkImport) => Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors?: string[];
    preview?: AdminUser[];
  }>;
  
  exportUsers: (filters: UserSearchFilters, format: 'csv' | 'excel' | 'pdf') => Promise<{
    url: string;
    filename: string;
  }>;
  
  impersonateUser: (impersonation: UserImpersonation) => Promise<{
    success: boolean;
    sessionToken: string;
    expiresAt: Date;
  }>;
  
  endImpersonation: () => Promise<{ success: boolean }>;
  
  getUserActivity: (userId: string, page?: number, pageSize?: number) => Promise<{
    activities: UserActivity[];
    total: number;
  }>;
  
  getUserAuditLog: (userId?: string, filters?: any) => Promise<{
    auditLogs: UserAuditLog[];
    total: number;
  }>;
}
