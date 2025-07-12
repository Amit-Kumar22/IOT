/**
 * Configuration validation tests
 * Tests environment variable validation and configuration helpers
 */

// Mock environment variables for testing
const mockEnvVars = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret-key-min-32-chars-long',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-nextauth-secret-key-min-32-chars',
  SESSION_SECRET: 'test-session-secret-key-min-32-chars',
  RATE_LIMIT_ENABLED: 'true',
  RATE_LIMIT_MAX_REQUESTS: '100',
  RATE_LIMIT_WINDOW_MS: '60000',
  API_BASE_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  SESSION_MAX_AGE: '86400',
  CSP_ENABLED: 'true',
  HSTS_ENABLED: 'false',
  LOG_LEVEL: 'error',
  LOG_FILE_ENABLED: 'false',
  ENABLE_2FA: 'true',
  ENABLE_API_KEYS: 'true',
  ENABLE_SESSION_MANAGEMENT: 'true',
} as const;

// Store original environment
const originalEnv = process.env;

describe('Configuration', () => {
  beforeEach(() => {
    // Reset environment with type assertion
    (process.env as any) = { ...originalEnv, ...mockEnvVars };
  });

  afterEach(() => {
    // Restore original environment
    (process.env as any) = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should validate valid environment variables', () => {
      expect(() => {
        // Re-import to test with new env vars
        jest.resetModules();
        require('../config');
      }).not.toThrow();
    });

    it('should throw error for missing JWT_SECRET', () => {
      delete (process.env as any).JWT_SECRET;
      
      expect(() => {
        jest.resetModules();
        require('../config');
      }).toThrow('Invalid environment configuration');
    });

    it('should throw error for short JWT_SECRET', () => {
      (process.env as any).JWT_SECRET = 'too-short';
      
      expect(() => {
        jest.resetModules();
        require('../config');
      }).toThrow('JWT secret must be at least 32 characters');
    });

    it('should throw error for invalid NODE_ENV', () => {
      (process.env as any).NODE_ENV = 'invalid';
      
      expect(() => {
        jest.resetModules();
        require('../config');
      }).toThrow('Invalid environment configuration');
    });

    it('should throw error for invalid URL format', () => {
      (process.env as any).NEXTAUTH_URL = 'not-a-url';
      
      expect(() => {
        jest.resetModules();
        require('../config');
      }).toThrow('Invalid environment configuration');
    });

    it('should use default values for optional fields', () => {
      // Remove optional fields
      delete (process.env as any).JWT_EXPIRES_IN;
      delete (process.env as any).RATE_LIMIT_MAX_REQUESTS;
      delete (process.env as any).LOG_LEVEL;
      
      expect(() => {
        jest.resetModules();
        const { config } = require('../config');
        expect(config.JWT_EXPIRES_IN).toBe('15m');
        expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(100);
        expect(config.LOG_LEVEL).toBe('info');
      }).not.toThrow();
    });
  });

  describe('Configuration Helpers', () => {
    it('should correctly identify development environment', () => {
      (process.env as any).NODE_ENV = 'development';
      jest.resetModules();
      const { isDevelopment, isProduction, isTest } = require('../config');
      
      expect(isDevelopment).toBe(true);
      expect(isProduction).toBe(false);
      expect(isTest).toBe(false);
    });

    it('should correctly identify production environment', () => {
      (process.env as any).NODE_ENV = 'production';
      jest.resetModules();
      const { isDevelopment, isProduction, isTest } = require('../config');
      
      expect(isDevelopment).toBe(false);
      expect(isProduction).toBe(true);
      expect(isTest).toBe(false);
    });

    it('should correctly identify test environment', () => {
      (process.env as any).NODE_ENV = 'test';
      jest.resetModules();
      const { isDevelopment, isProduction, isTest } = require('../config');
      
      expect(isDevelopment).toBe(false);
      expect(isProduction).toBe(false);
      expect(isTest).toBe(true);
    });
  });

  describe('Configuration Objects', () => {
    it('should create JWT configuration object', () => {
      jest.resetModules();
      const { jwtConfig } = require('../config');
      
      expect(jwtConfig).toEqual({
        secret: 'test-jwt-secret-key-min-32-chars-long',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
      });
    });

    it('should create rate limit configuration object', () => {
      jest.resetModules();
      const { rateLimitConfig } = require('../config');
      
      expect(rateLimitConfig).toEqual({
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      });
    });

    it('should create security configuration object', () => {
      jest.resetModules();
      const { securityConfig } = require('../config');
      
      expect(securityConfig.cspEnabled).toBe(true);
      expect(securityConfig.hstsEnabled).toBe(false);
      expect(securityConfig.headers).toHaveProperty('X-Frame-Options');
      expect(securityConfig.headers).toHaveProperty('X-Content-Type-Options');
      expect(securityConfig.headers).toHaveProperty('X-XSS-Protection');
    });

    it('should include HSTS header when enabled', () => {
      (process.env as any).HSTS_ENABLED = 'true';
      jest.resetModules();
      const { securityConfig } = require('../config');
      
      expect(securityConfig.headers).toHaveProperty('Strict-Transport-Security');
    });

    it('should create feature flags object', () => {
      jest.resetModules();
      const { featureFlags } = require('../config');
      
      expect(featureFlags).toEqual({
        twoFactor: true,
        apiKeys: true,
        sessionManagement: true,
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should validate development configuration', () => {
      (process.env as any).NODE_ENV = 'development';
      jest.resetModules();
      const { validateConfiguration } = require('../config');
      
      const result = validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate production configuration with proper secrets', () => {
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).JWT_SECRET = 'production-jwt-secret-key-min-32-chars';
      (process.env as any).NEXTAUTH_SECRET = 'production-nextauth-secret-key-min-32-chars';
      (process.env as any).SESSION_SECRET = 'production-session-secret-key-min-32-chars';
      (process.env as any).HSTS_ENABLED = 'true';
      
      jest.resetModules();
      const { validateConfiguration } = require('../config');
      
      const result = validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for production with default secrets', () => {
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).JWT_SECRET = 'your-secret-key-min-32-chars-long-for-development-only-change-in-production';
      (process.env as any).NEXTAUTH_SECRET = 'your-nextauth-secret-key-change-in-production';
      (process.env as any).SESSION_SECRET = 'your-session-secret-key-min-32-chars';
      (process.env as any).HSTS_ENABLED = 'false';
      
      jest.resetModules();
      const { validateConfiguration } = require('../config');
      
      const result = validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('JWT_SECRET must be changed from default value in production');
      expect(result.errors).toContain('NEXTAUTH_SECRET must be changed from default value in production');
      expect(result.errors).toContain('SESSION_SECRET must be changed from default value in production');
      expect(result.errors).toContain('HSTS should be enabled in production');
    });

    it('should fail validation when 2FA is enabled without email config', () => {
      (process.env as any).ENABLE_2FA = 'true';
      // Don't set email configuration
      delete (process.env as any).SMTP_HOST;
      delete (process.env as any).SMTP_USER;
      delete (process.env as any).SMTP_PASS;
      
      jest.resetModules();
      const { validateConfiguration } = require('../config');
      
      const result = validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('2FA requires email configuration');
    });
  });

  describe('Configuration Summary', () => {
    it('should provide configuration summary', () => {
      jest.resetModules();
      const { getConfigSummary } = require('../config');
      
      const summary = getConfigSummary();
      
      expect(summary).toHaveProperty('environment');
      expect(summary).toHaveProperty('features');
      expect(summary).toHaveProperty('services');
      expect(summary).toHaveProperty('security');
      
      expect(summary.environment).toBe('test');
      expect(summary.features).toHaveProperty('twoFactor');
      expect(summary.services).toHaveProperty('database');
      expect(summary.security).toHaveProperty('rateLimiting');
    });

    it('should correctly identify enabled services', () => {
      (process.env as any).DATABASE_URL = 'postgresql://localhost:5432/test';
      (process.env as any).REDIS_URL = 'redis://localhost:6379';
      (process.env as any).SMTP_HOST = 'smtp.example.com';
      (process.env as any).SMTP_USER = 'test@example.com';
      (process.env as any).SMTP_PASS = 'password';
      
      jest.resetModules();
      const { getConfigSummary } = require('../config');
      
      const summary = getConfigSummary();
      
      expect(summary.services.database).toBe(true);
      expect(summary.services.redis).toBe(true);
      expect(summary.services.email).toBe(true);
    });
  });

  describe('Environment-specific Configurations', () => {
    it('should provide development-specific configuration', () => {
      (process.env as any).NODE_ENV = 'development';
      jest.resetModules();
      const { envConfig } = require('../config');
      
      expect(envConfig.debug).toBe(true);
      expect(envConfig.logLevel).toBe('debug');
      expect(envConfig.enableDevTools).toBe(true);
      expect(envConfig.strictSSL).toBe(false);
    });

    it('should provide production-specific configuration', () => {
      (process.env as any).NODE_ENV = 'production';
      jest.resetModules();
      const { envConfig } = require('../config');
      
      expect(envConfig.debug).toBe(false);
      expect(envConfig.logLevel).toBe('warn');
      expect(envConfig.enableDevTools).toBe(false);
      expect(envConfig.strictSSL).toBe(true);
    });

    it('should provide test-specific configuration', () => {
      (process.env as any).NODE_ENV = 'test';
      jest.resetModules();
      const { envConfig } = require('../config');
      
      expect(envConfig.debug).toBe(false);
      expect(envConfig.logLevel).toBe('error');
      expect(envConfig.enableDevTools).toBe(false);
      expect(envConfig.strictSSL).toBe(false);
    });
  });

  describe('Type Coercion', () => {
    it('should convert string boolean to boolean', () => {
      (process.env as any).RATE_LIMIT_ENABLED = 'false';
      (process.env as any).CSP_ENABLED = 'true';
      
      jest.resetModules();
      const { config } = require('../config');
      
      expect(config.RATE_LIMIT_ENABLED).toBe(false);
      expect(config.CSP_ENABLED).toBe(true);
    });

    it('should convert string numbers to numbers', () => {
      (process.env as any).RATE_LIMIT_MAX_REQUESTS = '200';
      (process.env as any).SESSION_MAX_AGE = '7200';
      
      jest.resetModules();
      const { config } = require('../config');
      
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(200);
      expect(config.SESSION_MAX_AGE).toBe(7200);
    });
  });
});
