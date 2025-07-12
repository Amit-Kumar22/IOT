/**
 * Application configuration management
 * Validates environment variables and provides typed config access
 */

import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Authentication & Security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('true'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  
  // API
  API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  
  // Session
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.coerce.number().default(86400),
  
  // Security Headers
  CSP_ENABLED: z.string().transform(val => val === 'true').default('true'),
  HSTS_ENABLED: z.string().transform(val => val === 'true').default('false'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FILE_ENABLED: z.string().transform(val => val === 'true').default('false'),
  
  // Feature Flags
  ENABLE_2FA: z.string().transform(val => val === 'true').default('true'),
  ENABLE_API_KEYS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SESSION_MANAGEMENT: z.string().transform(val => val === 'true').default('true'),
});

// Type for validated environment
export type Environment = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Invalid environment configuration:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Validated configuration
export const config = validateEnv();

// Configuration helpers
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// JWT Configuration
export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
} as const;

// Database Configuration
export const dbConfig = {
  url: config.DATABASE_URL,
  enabled: Boolean(config.DATABASE_URL),
} as const;

// Redis Configuration
export const redisConfig = {
  url: config.REDIS_URL,
  enabled: Boolean(config.REDIS_URL),
} as const;

// Email Configuration
export const emailConfig = {
  enabled: Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS),
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  user: config.SMTP_USER,
  pass: config.SMTP_PASS,
} as const;

// Rate Limiting Configuration
export const rateLimitConfig = {
  enabled: config.RATE_LIMIT_ENABLED,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  windowMs: config.RATE_LIMIT_WINDOW_MS,
} as const;

// API Configuration
export const apiConfig = {
  baseUrl: config.API_BASE_URL,
  publicUrl: config.NEXT_PUBLIC_API_URL,
} as const;

// Session Configuration
export const sessionConfig = {
  secret: config.SESSION_SECRET,
  maxAge: config.SESSION_MAX_AGE,
} as const;

// Security Configuration
export const securityConfig = {
  cspEnabled: config.CSP_ENABLED,
  hstsEnabled: config.HSTS_ENABLED,
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...(config.HSTS_ENABLED && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    }),
  },
} as const;

// Logging Configuration
export const loggingConfig = {
  level: config.LOG_LEVEL,
  fileEnabled: config.LOG_FILE_ENABLED,
} as const;

// Feature Flags
export const featureFlags = {
  twoFactor: config.ENABLE_2FA,
  apiKeys: config.ENABLE_API_KEYS,
  sessionManagement: config.ENABLE_SESSION_MANAGEMENT,
} as const;

// Environment-specific configurations
export const environmentConfigs = {
  development: {
    debug: true,
    logLevel: 'debug' as const,
    enableDevTools: true,
    strictSSL: false,
  },
  production: {
    debug: false,
    logLevel: 'warn' as const,
    enableDevTools: false,
    strictSSL: true,
  },
  test: {
    debug: false,
    logLevel: 'error' as const,
    enableDevTools: false,
    strictSSL: false,
  },
} as const;

// Current environment config
export const envConfig = environmentConfigs[config.NODE_ENV];

// Validation function for runtime checks
export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required production settings
  if (isProduction) {
    if (config.JWT_SECRET === 'your-secret-key-min-32-chars-long-for-development-only-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
    
    if (config.NEXTAUTH_SECRET === 'your-nextauth-secret-key-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be changed from default value in production');
    }
    
    if (config.SESSION_SECRET === 'your-session-secret-key-min-32-chars') {
      errors.push('SESSION_SECRET must be changed from default value in production');
    }
    
    if (!config.HSTS_ENABLED) {
      errors.push('HSTS should be enabled in production');
    }
  }

  // Check feature dependencies
  if (featureFlags.twoFactor && !emailConfig.enabled) {
    errors.push('2FA requires email configuration');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export configuration summary for debugging
export function getConfigSummary() {
  return {
    environment: config.NODE_ENV,
    features: featureFlags,
    services: {
      database: dbConfig.enabled,
      redis: redisConfig.enabled,
      email: emailConfig.enabled,
    },
    security: {
      rateLimiting: rateLimitConfig.enabled,
      csp: securityConfig.cspEnabled,
      hsts: securityConfig.hstsEnabled,
    },
  };
}
