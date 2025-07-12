/**
 * Settings and Configuration Types
 * Comprehensive type definitions for company settings and system configuration
 */

// Company Profile Types
export interface CompanyProfile {
  id: string;
  name: string;
  description?: string;
  industry: string;
  website?: string;
  logo?: string;
  address: CompanyAddress;
  contact: CompanyContact;
  settings: CompanySettings;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
}

export interface CompanyContact {
  primaryEmail: string;
  secondaryEmail?: string;
  phone: string;
  fax?: string;
  supportContact?: string;
  technicalContact?: string;
}

export interface CompanySettings {
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  measurementSystem: 'metric' | 'imperial';
  notifications: NotificationSettings;
  security: SecuritySettings;
  branding: BrandingSettings;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    alerts: boolean;
    reports: boolean;
    maintenance: boolean;
    security: boolean;
  };
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
    alerts: boolean;
  };
  push: {
    enabled: boolean;
    alerts: boolean;
    maintenance: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  mfa: {
    enabled: boolean;
    required: boolean;
    methods: ('sms' | 'email' | 'app')[];
  };
  sessionTimeout: number;
  ipWhitelist: string[];
  apiAccess: {
    enabled: boolean;
    rateLimit: number;
    allowedOrigins: string[];
  };
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  customCSS?: string;
  showPoweredBy: boolean;
}

// User Management Types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: UserPermission[];
  department?: string;
  title?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: UserPermission[];
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'devices' | 'analytics' | 'control' | 'automation' | 'billing';
  action: 'read' | 'write' | 'execute' | 'admin';
  resource: string;
  conditions?: Record<string, any>;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: string;
  timeFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
    refreshInterval: number;
  };
}

export interface UserInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
}

// System Configuration Types
export interface SystemConfiguration {
  general: GeneralSettings;
  performance: PerformanceSettings;
  backup: BackupSettings;
  maintenance: MaintenanceSettings;
  monitoring: MonitoringSettings;
  alerts: AlertSettings;
  logging: LoggingSettings;
}

export interface GeneralSettings {
  systemName: string;
  systemVersion: string;
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  maintenanceMode: boolean;
  maxUsers: number;
  maxDevices: number;
  dataRetentionDays: number;
  autoUpdateEnabled: boolean;
}

export interface PerformanceSettings {
  maxConcurrentConnections: number;
  requestTimeout: number;
  queryTimeout: number;
  cacheSize: number;
  cacheTTL: number;
  compressionEnabled: boolean;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
}

export interface BackupSettings {
  enabled: boolean;
  schedule: string;
  retention: number;
  location: 'local' | 'cloud' | 'both';
  encryption: boolean;
  compression: boolean;
  verificationEnabled: boolean;
  destinations: BackupDestination[];
}

export interface BackupDestination {
  id: string;
  name: string;
  type: 'local' | 's3' | 'ftp' | 'sftp';
  configuration: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface MaintenanceSettings {
  autoMaintenance: boolean;
  maintenanceWindow: {
    start: string;
    end: string;
    timezone: string;
    days: number[];
  };
  cleanupTasks: {
    logs: boolean;
    tempFiles: boolean;
    cache: boolean;
    oldBackups: boolean;
  };
  updateSettings: {
    autoUpdate: boolean;
    updateWindow: string;
    notificationDays: number;
  };
}

export interface MonitoringSettings {
  systemMetrics: boolean;
  deviceMetrics: boolean;
  performanceMetrics: boolean;
  errorTracking: boolean;
  healthChecks: {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoints: string[];
  };
  alerting: {
    enabled: boolean;
    thresholds: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  };
}

export interface AlertSettings {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  throttling: {
    enabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
  };
  escalation: {
    enabled: boolean;
    levels: EscalationLevel[];
  };
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams';
  configuration: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
  throttleMinutes: number;
  escalationMinutes: number;
}

export interface EscalationLevel {
  level: number;
  waitMinutes: number;
  channels: string[];
  users: string[];
}

export interface LoggingSettings {
  level: 'error' | 'warn' | 'info' | 'debug';
  destinations: LogDestination[];
  retention: {
    errorDays: number;
    warnDays: number;
    infoDays: number;
    debugDays: number;
  };
  rotation: {
    enabled: boolean;
    maxFileSize: number;
    maxFiles: number;
  };
  formatting: {
    timestamp: boolean;
    level: boolean;
    module: boolean;
    json: boolean;
  };
}

export interface LogDestination {
  id: string;
  name: string;
  type: 'file' | 'syslog' | 'database' | 'external';
  configuration: Record<string, any>;
  enabled: boolean;
  minLevel: string;
}

// Integration Settings Types
export interface IntegrationSettings {
  protocols: ProtocolConfiguration[];
  apis: ApiConfiguration[];
  webhooks: WebhookConfiguration[];
  connectors: ConnectorConfiguration[];
  authentication: AuthenticationSettings;
  security: IntegrationSecurity;
}

export interface ProtocolConfiguration {
  id: string;
  name: string;
  type: 'mqtt' | 'modbus' | 'opcua' | 'bacnet' | 'http' | 'tcp' | 'serial';
  enabled: boolean;
  settings: Record<string, any>;
  endpoints: ProtocolEndpoint[];
  authentication?: {
    type: 'none' | 'basic' | 'certificate' | 'token';
    credentials: Record<string, any>;
  };
  encryption?: {
    enabled: boolean;
    protocol: string;
    certificate?: string;
  };
}

export interface ProtocolEndpoint {
  id: string;
  name: string;
  address: string;
  port: number;
  path?: string;
  enabled: boolean;
  healthCheck: boolean;
  timeout: number;
  retries: number;
}

export interface ApiConfiguration {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  baseUrl: string;
  authentication: {
    type: 'none' | 'apikey' | 'bearer' | 'oauth2';
    configuration: Record<string, any>;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burst: number;
  };
  endpoints: ApiEndpoint[];
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  enabled: boolean;
  public: boolean;
  authentication: boolean;
  rateLimit?: number;
  caching?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface WebhookConfiguration {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  events: string[];
  headers: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'signature';
    configuration: Record<string, any>;
  };
  retries: {
    enabled: boolean;
    maxAttempts: number;
    backoffMs: number;
  };
  timeout: number;
}

export interface ConnectorConfiguration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  configuration: Record<string, any>;
  schedule?: string;
  dataMapping: DataMapping[];
  errorHandling: {
    onError: 'stop' | 'continue' | 'retry';
    maxRetries: number;
    notifyOnError: boolean;
  };
}

export interface DataMapping {
  source: string;
  target: string;
  transformation?: string;
  validation?: string;
  required: boolean;
}

export interface AuthenticationSettings {
  methods: ('local' | 'ldap' | 'oauth2' | 'saml')[];
  defaultMethod: string;
  ldap?: {
    server: string;
    port: number;
    bindDN: string;
    bindPassword: string;
    searchBase: string;
    searchFilter: string;
    ssl: boolean;
  };
  oauth2?: {
    providers: OAuth2Provider[];
  };
  saml?: {
    entityId: string;
    ssoUrl: string;
    certificate: string;
  };
}

export interface OAuth2Provider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  enabled: boolean;
}

export interface IntegrationSecurity {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keySize: number;
  };
  signing: {
    enabled: boolean;
    algorithm: string;
  };
  ipWhitelist: string[];
  corsOrigins: string[];
  requireHttps: boolean;
}

// Form and Validation Types
export interface SettingsFormData {
  companyProfile?: Partial<CompanyProfile>;
  userManagement?: {
    users?: Partial<UserProfile>[];
    roles?: Partial<UserRole>[];
    invitations?: Partial<UserInvitation>[];
  };
  systemConfiguration?: Partial<SystemConfiguration>;
  integrationSettings?: Partial<IntegrationSettings>;
}

export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SettingsFormState {
  data: SettingsFormData;
  errors: SettingsValidationError[];
  isSubmitting: boolean;
  hasChanges: boolean;
  lastSaved?: Date;
}

// Settings Navigation Types
export interface SettingsTab {
  id: string;
  name: string;
  icon: string;
  component: string;
  permission?: string;
  badge?: string | number;
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tabs: SettingsTab[];
  order: number;
}

// Settings Actions Types
export interface SettingsAction {
  type: 'save' | 'reset' | 'export' | 'import' | 'backup' | 'restore';
  category: string;
  data?: any;
  options?: {
    confirm?: boolean;
    message?: string;
  };
}

export interface SettingsExport {
  format: 'json' | 'yaml' | 'csv';
  categories: string[];
  includeSecrets: boolean;
  encrypted: boolean;
}

export interface SettingsImport {
  format: 'json' | 'yaml' | 'csv';
  data: any;
  overwrite: boolean;
  validate: boolean;
}

// Utility Types
export type SettingsUpdatePayload<T> = {
  category: string;
  data: Partial<T>;
  merge?: boolean;
};

export type SettingsPermission = 
  | 'settings.read'
  | 'settings.write'
  | 'settings.admin'
  | 'settings.company.read'
  | 'settings.company.write'
  | 'settings.users.read'
  | 'settings.users.write'
  | 'settings.users.admin'
  | 'settings.system.read'
  | 'settings.system.write'
  | 'settings.system.admin'
  | 'settings.integrations.read'
  | 'settings.integrations.write'
  | 'settings.integrations.admin';
