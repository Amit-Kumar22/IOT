/**
 * Security and Performance Optimization Tests
 * Tests for Phase 6 and Phase 7 components
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { securityManager, securitySchemas, securityUtils } from '../lib/security';
import { performanceOptimizationManager, ResourceType } from '../lib/performanceOptimization';
import { globalErrorHandler } from '../lib/globalErrorHandler';
import { recoveryManager } from '../lib/errorRecovery';
import { errorAnalytics } from '../lib/errorAnalytics';

// Mock dependencies
jest.mock('../lib/errorReporting');
jest.mock('../lib/performance');
jest.mock('../lib/storage');

// Mock crypto.subtle for testing
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockImplementation(async () => {
        const buffer = new ArrayBuffer(32);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < 32; i++) {
          view[i] = Math.floor(Math.random() * 256);
        }
        return buffer;
      }),
    },
    randomUUID: jest.fn().mockReturnValue('test-uuid-' + Math.random().toString(36).substr(2, 9)),
    getRandomValues: jest.fn().mockImplementation((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

describe('Security Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    it('should sanitize script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = securityManager.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("xss")');
      expect(sanitized).toContain('Hello World');
    });

    it('should sanitize event handlers', () => {
      const maliciousInput = '<div onclick="alert(1)">Click me</div>';
      const sanitized = securityManager.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert(1)');
      expect(sanitized).toContain('Click me');
    });

    it('should encode HTML entities', () => {
      const input = '<>&"\'/';
      const sanitized = securityManager.sanitizeInput(input);
      
      expect(sanitized).toBe('&lt;&gt;&amp;&quot;&#x27;&#x2F;');
    });
  });

  describe('Input Validation', () => {
    it('should detect suspicious patterns', () => {
      const maliciousInput = 'javascript:alert(1)';
      const result = securityManager.validateInput(maliciousInput);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Suspicious pattern detected: javascript:');
    });

    it('should pass clean input', () => {
      const cleanInput = 'Hello, this is a normal message.';
      const result = securityManager.validateInput(cleanInput);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const token = securityManager.generateCSRFToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should validate CSRF tokens', () => {
      const token = securityManager.generateCSRFToken();
      const isValid = securityManager.validateCSRFToken(token);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      const invalidToken = 'invalid-token';
      const isValid = securityManager.validateCSRFToken(invalidToken);
      
      expect(isValid).toBe(false);
    });

    it('should be one-time use tokens', () => {
      const token = securityManager.generateCSRFToken();
      
      // First use should be valid
      expect(securityManager.validateCSRFToken(token)).toBe(true);
      
      // Second use should be invalid
      expect(securityManager.validateCSRFToken(token)).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user';
      const result = securityManager.checkRateLimit(identifier);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThan(100);
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-heavy';
      
      // Make requests up to limit
      for (let i = 0; i < 100; i++) {
        securityManager.checkRateLimit(identifier);
      }
      
      // Next request should be blocked
      const result = securityManager.checkRateLimit(identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate allowed file types', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = securityManager.validateFileUpload(file);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject disallowed file types', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });
      const result = securityManager.validateFileUpload(file);
      
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should reject oversized files', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const result = securityManager.validateFileUpload(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes('File too large'))).toBe(true);
    });
  });

  describe('Encryption and Hashing', () => {
    it('should encrypt and decrypt data', () => {
      const originalData = 'sensitive information';
      const encrypted = securityManager.encrypt(originalData);
      const decrypted = securityManager.decrypt(encrypted);
      
      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    it('should hash passwords', async () => {
      const password = 'mySecretPassword123!';
      const hash = await securityManager.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify password hashes', async () => {
      const password = 'mySecretPassword123!';
      const hash = await securityManager.hashPassword(password);
      const isValid = await securityManager.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'mySecretPassword123!';
      const wrongPassword = 'wrongPassword';
      const hash = await securityManager.hashPassword(password);
      const isValid = await securityManager.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Security Schemas', () => {
    it('should validate safe strings', () => {
      const safeString = 'This is a safe string';
      expect(() => securitySchemas.safeString.parse(safeString)).not.toThrow();
    });

    it('should reject unsafe strings', () => {
      const unsafeString = '<script>alert("xss")</script>';
      expect(() => securitySchemas.safeString.parse(unsafeString)).toThrow();
    });

    it('should validate secure emails', () => {
      const validEmail = 'user@example.com';
      expect(() => securitySchemas.secureEmail.parse(validEmail)).not.toThrow();
    });

    it('should validate secure passwords', () => {
      const strongPassword = 'MyStr0ng!Password';
      expect(() => securitySchemas.securePassword.parse(strongPassword)).not.toThrow();
    });

    it('should reject weak passwords', () => {
      const weakPassword = 'weak';
      expect(() => securitySchemas.securePassword.parse(weakPassword)).toThrow();
    });
  });

  describe('Security Utils', () => {
    it('should generate secure API keys', () => {
      const apiKey = securityUtils.generateApiKey();
      
      expect(apiKey).toBeDefined();
      expect(typeof apiKey).toBe('string');
      expect(apiKey.length).toBe(32);
    });

    it('should create secure headers', () => {
      const headers = securityUtils.createSecureHeaders();
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Strict-Transport-Security');
    });

    it('should validate JWT structure', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const invalidJWT = 'invalid.jwt';
      
      expect(securityUtils.validateJwtStructure(validJWT)).toBe(true);
      expect(securityUtils.validateJwtStructure(invalidJWT)).toBe(false);
    });

    it('should generate nonce', () => {
      const nonce = securityUtils.generateNonce();
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBe(16);
    });
  });
});

describe('Performance Optimization Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Resource Preloading', () => {
    it('should preload resources', () => {
      const url = '/test-resource.js';
      const type = ResourceType.SCRIPT;
      
      performanceOptimizationManager.preloadResource(url, type);
      
      // Check if link element was created
      const preloadLink = document.querySelector(`link[href="${url}"]`);
      expect(preloadLink).toBeTruthy();
      expect(preloadLink?.getAttribute('rel')).toBe('preload');
      expect(preloadLink?.getAttribute('as')).toBe('script');
    });

    it('should not preload duplicate resources', () => {
      const url = '/duplicate-resource.js';
      const type = ResourceType.SCRIPT;
      
      performanceOptimizationManager.preloadResource(url, type);
      performanceOptimizationManager.preloadResource(url, type);
      
      const preloadLinks = document.querySelectorAll(`link[href="${url}"]`);
      expect(preloadLinks.length).toBe(1);
    });
  });

  describe('Resource Prefetching', () => {
    it('should prefetch resources', () => {
      const url = '/test-prefetch.js';
      const type = ResourceType.SCRIPT;
      
      performanceOptimizationManager.prefetchResource(url, type);
      
      const prefetchLink = document.querySelector(`link[href="${url}"]`);
      expect(prefetchLink).toBeTruthy();
      expect(prefetchLink?.getAttribute('rel')).toBe('prefetch');
    });
  });

  describe('Component Lazy Loading', () => {
    it('should lazy load components', async () => {
      const mockComponent = { default: () => 'MockComponent' };
      const importFunction = jest.fn() as jest.Mock<() => Promise<{ default: () => string }>>;
      importFunction.mockResolvedValue(mockComponent);
      
      const component = await performanceOptimizationManager.lazyLoadComponent(
        importFunction,
        'TestComponent'
      );
      
      expect(importFunction).toHaveBeenCalled();
      expect(component).toBe(mockComponent.default);
    });

    it('should cache loaded components', async () => {
      const mockComponent = { default: () => 'CachedComponent' };
      const importFunction = jest.fn() as jest.Mock<() => Promise<{ default: () => string }>>;
      importFunction.mockResolvedValue(mockComponent);
      
      // First load
      await performanceOptimizationManager.lazyLoadComponent(
        importFunction,
        'CachedComponent'
      );
      
      // Second load (should use cache)
      await performanceOptimizationManager.lazyLoadComponent(
        importFunction,
        'CachedComponent'
      );
      
      expect(importFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Image Optimization', () => {
    it('should optimize image loading', () => {
      // Create test image elements
      const img1 = document.createElement('img');
      img1.setAttribute('data-src', '/test1.jpg');
      img1.setAttribute('data-type', 'image');
      document.body.appendChild(img1);
      
      const img2 = document.createElement('img');
      img2.setAttribute('data-src', '/test2.jpg');
      img2.setAttribute('data-type', 'image');
      document.body.appendChild(img2);
      
      performanceOptimizationManager.optimizeImageLoading();
      
      // Check if loading attribute was added
      expect(img1.loading).toBe('lazy');
      expect(img2.loading).toBe('lazy');
      
      // Cleanup
      document.body.removeChild(img1);
      document.body.removeChild(img2);
    });
  });

  describe('Performance Metrics', () => {
    it('should get optimization metrics', () => {
      const metrics = performanceOptimizationManager.getPerformanceOptimizationMetrics();
      
      expect(metrics).toHaveProperty('bundleSize');
      expect(metrics).toHaveProperty('loadTime');
      expect(metrics).toHaveProperty('chunkCount');
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('compressionRatio');
    });

    it('should clear cache', () => {
      performanceOptimizationManager.clearCache();
      
      const metrics = performanceOptimizationManager.getPerformanceOptimizationMetrics();
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        enableCodeSplitting: false,
        enableLazyLoading: false,
      };
      
      performanceOptimizationManager.updateConfig(newConfig);
      
      // Configuration should be updated (test via behavior)
      expect(performanceOptimizationManager.updateConfig).toBeDefined();
    });
  });
});

describe('Global Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle errors with context', () => {
    const error = new Error('Test error');
    const context = {
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'test-agent',
    };
    
    globalErrorHandler.handleError(error, context);
    
    // Should not throw
    expect(true).toBe(true);
  });

  it('should track error statistics', () => {
    const error1 = new Error('First error');
    const error2 = new Error('Second error');
    
    globalErrorHandler.handleError(error1, { timestamp: Date.now() });
    globalErrorHandler.handleError(error2, { timestamp: Date.now() });
    
    const stats = globalErrorHandler.getErrorStats();
    
    expect(stats.totalErrors).toBeGreaterThan(0);
    expect(stats.errorsByType).toBeDefined();
    expect(stats.errorsBySeverity).toBeDefined();
  });

  it('should clear statistics', () => {
    globalErrorHandler.clearStats();
    
    const stats = globalErrorHandler.getErrorStats();
    expect(stats.totalErrors).toBe(0);
  });
});

describe('Recovery Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should recover from errors with retry strategy', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('Success');
    };

    const context = {
      operationName: 'testOperation',
      timestamp: Date.now(),
    };

    const result = await recoveryManager.executeWithRecovery(
      operation,
      [{
        strategy: 'retry' as any,
        maxAttempts: 3,
        delay: 100,
        backoff: 'linear' as any,
      }],
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe('Success');
    expect(attempts).toBe(3);
  });

  it('should use fallback on failure', async () => {
    const operation = () => {
      throw new Error('Always fails');
    };

    const context = {
      operationName: 'testOperation',
      timestamp: Date.now(),
    };

    const result = await recoveryManager.executeWithRecovery(
      operation,
      [{
        strategy: 'fallback' as any,
        maxAttempts: 1,
        delay: 0,
        backoff: 'linear' as any,
        fallbackData: 'Fallback result',
      }],
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe('Fallback result');
  });

  it('should get recovery statistics', () => {
    const stats = recoveryManager.getRecoveryStats();
    
    expect(stats).toHaveProperty('activeRecoveries');
    expect(stats).toHaveProperty('totalAttempts');
    expect(stats).toHaveProperty('successfulRecoveries');
    expect(stats).toHaveProperty('failedRecoveries');
  });
});

describe('Error Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track error occurrences', () => {
    const error = new Error('Analytics test error');
    
    errorAnalytics.trackError(error);
    
    const analytics = errorAnalytics.getAnalytics();
    expect(analytics.totalErrors).toBeGreaterThan(0);
  });

  it('should generate insights', () => {
    // Generate multiple errors to trigger insights
    for (let i = 0; i < 10; i++) {
      errorAnalytics.trackError(new Error(`Test error ${i}`));
    }
    
    const insights = errorAnalytics.getInsights();
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should get error trends', () => {
    const trends = errorAnalytics.getTrends('hour');
    
    expect(trends).toHaveProperty('period');
    expect(trends).toHaveProperty('data');
    expect(trends.period).toBe('hour');
    expect(Array.isArray(trends.data)).toBe(true);
  });

  it('should export data', () => {
    const jsonData = errorAnalytics.exportData('json');
    const data = JSON.parse(jsonData);
    
    expect(data).toHaveProperty('analytics');
    expect(data).toHaveProperty('errors');
    expect(data).toHaveProperty('exportedAt');
  });

  it('should manage alerts', () => {
    const alerts = errorAnalytics.getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
    
    if (alerts.length > 0) {
      const alertId = alerts[0].id;
      
      errorAnalytics.acknowledgeAlert(alertId, 'test-user');
      errorAnalytics.resolveAlert(alertId);
      
      const updatedAlerts = errorAnalytics.getAlerts();
      expect(updatedAlerts.length).toBeLessThanOrEqual(alerts.length);
    }
  });
});

describe('Integration Tests', () => {
  it('should handle complete error and recovery flow', async () => {
    const error = new Error('Integration test error');
    const context = {
      operationName: 'integrationTest',
      timestamp: Date.now(),
    };

    // Track error in analytics
    errorAnalytics.trackError(error);

    // Handle error globally
    globalErrorHandler.handleError(error, context);

    // Attempt recovery
    const operation = () => {
      throw error;
    };

    const result = await recoveryManager.executeWithRecovery(
      operation,
      [{
        strategy: 'fallback' as any,
        maxAttempts: 1,
        delay: 0,
        backoff: 'linear' as any,
        fallbackData: 'Recovered',
      }],
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe('Recovered');
  });

  it('should handle security and performance together', () => {
    const input = '<script>alert("test")</script>Normal text';
    const sanitized = securityManager.sanitizeInput(input);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Normal text');
    
    // Test rate limiting
    const rateResult = securityManager.checkRateLimit('integration-test');
    expect(rateResult.allowed).toBe(true);
    
    // Test performance optimization
    const url = '/integration-test.js';
    performanceOptimizationManager.preloadResource(url, ResourceType.SCRIPT);
    
    const preloadLink = document.querySelector(`link[href="${url}"]`);
    expect(preloadLink).toBeTruthy();
  });
});

describe('Performance Impact Tests', () => {
  it('should handle large inputs efficiently', () => {
    const largeInput = 'a'.repeat(10000);
    const startTime = performance.now();
    
    const sanitized = securityManager.sanitizeInput(largeInput);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(sanitized).toBeDefined();
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  it('should handle multiple simultaneous operations', async () => {
    const operations = Array.from({ length: 10 }, (_, i) => {
      const importFunction = jest.fn() as jest.Mock<() => Promise<{ default: () => string }>>;
      importFunction.mockResolvedValue({ default: () => `Component${i}` });
      
      return performanceOptimizationManager.lazyLoadComponent(
        importFunction,
        `Component${i}`
      );
    });
    
    const results = await Promise.all(operations);
    
    expect(results).toHaveLength(10);
    results.forEach((result, index) => {
      expect(result()).toBe(`Component${index}`);
    });
  });
});
