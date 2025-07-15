/**
 * Security Utilities
 * Input sanitization, validation, and security measures
 */

import { z } from 'zod';
import { errorReporter, ErrorSeverity, ErrorCategory } from './errorReporting';

// Security configuration
interface SecurityConfig {
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableInputSanitization: boolean;
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  suspiciousPatterns: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  encryptionKey: string;
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableInputSanitization: true,
  enableRateLimiting: true,
  maxRequestsPerMinute: 100,
  suspiciousPatterns: [
    '<script',
    'javascript:',
    'eval(',
    'setTimeout(',
    'setInterval(',
    'Function(',
    'onload=',
    'onerror=',
    'onclick=',
    'onmouseover=',
    'onfocus=',
    'onblur=',
    'onchange=',
    'onsubmit=',
    'document.cookie',
    'document.write',
    'window.location',
    'location.href',
    'innerHTML',
    'outerHTML',
    'insertAdjacentHTML',
    'setAttribute',
    'appendChild',
    'removeChild',
    'replaceChild',
    'createElement',
    'createTextNode',
    'createDocumentFragment',
    'importNode',
    'adoptNode',
    'cloneNode',
    'querySelector',
    'querySelectorAll',
    'getElementById',
    'getElementsByClassName',
    'getElementsByTagName',
    'getElementsByName',
    'ajax',
    'fetch',
    'XMLHttpRequest',
    'ActiveXObject',
    'navigator.',
    'screen.',
    'history.',
    'localStorage.',
    'sessionStorage.',
    'indexedDB.',
    'webkitIndexedDB.',
    'mozIndexedDB.',
    'msIndexedDB.',
    'IDBDatabase',
    'IDBObjectStore',
    'IDBTransaction',
    'IDBKeyRange',
    'IDBCursor',
    'IDBIndex',
    'FileReader',
    'WebSocket',
    'EventSource',
    'SharedWorker',
    'Worker',
    'Blob',
    'URL.createObjectURL',
    'URL.revokeObjectURL',
    'atob',
    'btoa',
    'crypto.',
    'performance.',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'requestIdleCallback',
    'cancelIdleCallback',
  ],
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'text/plain',
    'text/csv',
    'application/json',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  encryptionKey: 'your-secret-key-32-characters-long',
};

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token storage
const csrfTokens = new Set<string>();

/**
 * Security Manager
 * Handles all security-related operations
 */
export class SecurityManager {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) {
      return input;
    }

    let sanitized = input;

    // First encode HTML entities to prevent XSS
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove on* event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove style tags and content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove link tags
    sanitized = sanitized.replace(/<link\b[^>]*>/gi, '');

    // Remove meta tags
    sanitized = sanitized.replace(/<meta\b[^>]*>/gi, '');

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remove object tags
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

    // Remove embed tags
    sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '');

    // Remove form tags
    sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

    // Remove input tags
    sanitized = sanitized.replace(/<input\b[^>]*>/gi, '');

    // Remove button tags
    sanitized = sanitized.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');

    // Remove textarea tags
    sanitized = sanitized.replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '');

    // Remove select tags
    sanitized = sanitized.replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '');

    // Remove option tags
    sanitized = sanitized.replace(/<option\b[^<]*(?:(?!<\/option>)<[^<]*)*<\/option>/gi, '');

    // HTML entity encoding for special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Validate input against suspicious patterns
   */
  validateInput(input: string): {
    isValid: boolean;
    violations: string[];
    sanitizedInput: string;
  } {
    const violations: string[] = [];
    let sanitizedInput = input;

    // Check for suspicious patterns
    for (const pattern of this.config.suspiciousPatterns) {
      if (input.toLowerCase().includes(pattern.toLowerCase())) {
        violations.push(`Suspicious pattern detected: ${pattern}`);
      }
    }

    // Sanitize input
    sanitizedInput = this.sanitizeInput(input);

    // Report violations
    if (violations.length > 0) {
      errorReporter.reportError(new Error('Security violation detected'), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            originalInput: input,
            violations,
            sanitizedInput,
          },
        },
        tags: ['security', 'xss', 'input_validation'],
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      sanitizedInput,
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const token = crypto.randomUUID();
    csrfTokens.add(token);
    
    // Auto-expire token after 30 minutes
    setTimeout(() => {
      csrfTokens.delete(token);
    }, 30 * 60 * 1000);

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) {
      return true;
    }

    const isValid = csrfTokens.has(token);
    
    if (!isValid) {
      errorReporter.reportError(new Error('Invalid CSRF token'), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            token,
            validTokens: Array.from(csrfTokens),
          },
        },
        tags: ['security', 'csrf', 'token_validation'],
      });
    }

    // Remove token after use (one-time use)
    csrfTokens.delete(token);

    return isValid;
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    if (!this.config.enableRateLimiting) {
      return {
        allowed: true,
        remaining: this.config.maxRequestsPerMinute,
        resetTime: Date.now() + 60000,
      };
    }

    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // 1-minute window
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime <= now) {
      // New window or expired entry
      const newEntry = {
        count: 1,
        resetTime: windowStart + 60000,
      };
      rateLimitStore.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequestsPerMinute - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    const remaining = Math.max(0, this.config.maxRequestsPerMinute - entry.count);
    const allowed = entry.count <= this.config.maxRequestsPerMinute;

    if (!allowed) {
      errorReporter.reportError(new Error('Rate limit exceeded'), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            identifier,
            count: entry.count,
            limit: this.config.maxRequestsPerMinute,
          },
        },
        tags: ['security', 'rate_limiting', 'abuse'],
      });
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: File): {
    isValid: boolean;
    violations: string[];
    error?: string;
  } {
    const violations: string[] = [];

    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      violations.push(`File type not allowed: ${file.type}`);
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      violations.push(`File too large: ${file.size} bytes (max: ${this.config.maxFileSize})`);
    }

    // Check file name
    const fileName = file.name.toLowerCase();
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.aspx', '.jsp'];
    
    for (const ext of suspiciousExtensions) {
      if (fileName.endsWith(ext)) {
        violations.push(`Suspicious file extension: ${ext}`);
        break;
      }
    }

    // Check for double extensions
    if (fileName.includes('..') || fileName.match(/\.\w+\.\w+$/)) {
      violations.push('Double file extension detected');
    }

    // Report violations
    if (violations.length > 0) {
      errorReporter.reportError(new Error('File upload security violation'), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            violations,
          },
        },
        tags: ['security', 'file_upload', 'validation'],
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      error: violations.length > 0 ? violations.join(', ') : undefined,
    };
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    try {
      // Simple XOR encryption (for demo purposes)
      // In production, use a proper encryption library
      const key = this.config.encryptionKey;
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encrypted);
    } catch (error) {
      errorReporter.reportError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            operation: 'encrypt',
            dataLength: data.length,
          },
        },
        tags: ['security', 'encryption', 'error'],
      });
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      // Simple XOR decryption (for demo purposes)
      // In production, use a proper encryption library
      const key = this.config.encryptionKey;
      const encrypted = atob(encryptedData);
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return decrypted;
    } catch (error) {
      errorReporter.reportError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            operation: 'decrypt',
            dataLength: encryptedData.length,
          },
        },
        tags: ['security', 'encryption', 'error'],
      });
      throw error;
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      // Use Web Crypto API for secure hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      errorReporter.reportError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            operation: 'hash_password',
          },
        },
        tags: ['security', 'password', 'hashing', 'error'],
      });
      throw error;
    }
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const hashedPassword = await this.hashPassword(password);
      return hashedPassword === hash;
    } catch (error) {
      errorReporter.reportError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        source: 'security_manager',
        context: {
          timestamp: Date.now(),
          additionalData: {
            operation: 'verify_password',
          },
        },
        tags: ['security', 'password', 'verification', 'error'],
      });
      return false;
    }
  }

  /**
   * Clean rate limit storage
   */
  cleanRateLimitStorage(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    rateLimitViolations: number;
    csrfViolations: number;
    xssAttempts: number;
    fileUploadViolations: number;
    activeTokens: number;
    rateLimitEntries: number;
  } {
    return {
      rateLimitViolations: 0, // Would need to track these
      csrfViolations: 0, // Would need to track these
      xssAttempts: 0, // Would need to track these
      fileUploadViolations: 0, // Would need to track these
      activeTokens: csrfTokens.size,
      rateLimitEntries: rateLimitStore.size,
    };
  }
}

// Validation schemas for security
export const securitySchemas = {
  // Safe string input (no HTML, scripts, etc.)
  safeString: z.string().refine(
    (value) => {
      const security = new SecurityManager();
      const result = security.validateInput(value);
      return result.isValid;
    },
    {
      message: 'Input contains potentially dangerous content',
    }
  ),

  // Email validation with security checks
  secureEmail: z
    .string()
    .email('Invalid email format')
    .refine(
      (value) => {
        const security = new SecurityManager();
        const result = security.validateInput(value);
        return result.isValid;
      },
      {
        message: 'Email contains potentially dangerous content',
      }
    ),

  // URL validation with security checks
  secureUrl: z
    .string()
    .url('Invalid URL format')
    .refine(
      (value) => {
        // Only allow http and https protocols
        return value.startsWith('http://') || value.startsWith('https://');
      },
      {
        message: 'Only HTTP and HTTPS URLs are allowed',
      }
    ),

  // File upload validation
  secureFile: z.object({
    name: z.string().refine(
      (value) => {
        const security = new SecurityManager();
        const mockFile = new File([''], value, { type: 'text/plain' });
        const result = security.validateFileUpload(mockFile);
        return result.isValid;
      },
      {
        message: 'File name contains potentially dangerous content',
      }
    ),
    type: z.string().refine(
      (value) => {
        const security = new SecurityManager();
        const allowedTypes = security['config'].allowedFileTypes;
        return allowedTypes.includes(value);
      },
      {
        message: 'File type not allowed',
      }
    ),
    size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  }),

  // Password validation
  securePassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(
      (value) => /[A-Z]/.test(value),
      {
        message: 'Password must contain at least one uppercase letter',
      }
    )
    .refine(
      (value) => /[a-z]/.test(value),
      {
        message: 'Password must contain at least one lowercase letter',
      }
    )
    .refine(
      (value) => /[0-9]/.test(value),
      {
        message: 'Password must contain at least one number',
      }
    )
    .refine(
      (value) => /[^A-Za-z0-9]/.test(value),
      {
        message: 'Password must contain at least one special character',
      }
    ),

  // CSRF token validation
  csrfToken: z.string().uuid('Invalid CSRF token format'),
};

// Security middleware for API routes
export const securityMiddleware = (security: SecurityManager) => {
  return {
    // Rate limiting middleware
    rateLimit: (identifier: string) => {
      const result = security.checkRateLimit(identifier);
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`);
      }
      return result;
    },

    // CSRF protection middleware
    csrfProtection: (token: string) => {
      if (!security.validateCSRFToken(token)) {
        throw new Error('Invalid CSRF token');
      }
    },

    // Input sanitization middleware
    sanitizeInput: (input: any) => {
      if (typeof input === 'string') {
        return security.sanitizeInput(input);
      }
      
      if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
          sanitized[key] = typeof value === 'string' ? security.sanitizeInput(value) : value;
        }
        return sanitized;
      }
      
      return input;
    },

    // File upload validation middleware
    validateFileUpload: (file: File) => {
      const result = security.validateFileUpload(file);
      if (!result.isValid) {
        throw new Error(`File upload rejected: ${result.error}`);
      }
      return result;
    },
  };
};

// Security utilities
export const securityUtils = {
  // Generate secure API key
  generateApiKey: (length: number = 32): string => {
    const security = new SecurityManager();
    return security.generateSecureRandom(length);
  },

  // Create secure headers
  createSecureHeaders: (): Record<string, string> => {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    };
  },

  // Validate JWT token structure
  validateJwtStructure: (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  },

  // Generate nonce for CSP
  generateNonce: (): string => {
    const security = new SecurityManager();
    return security.generateSecureRandom(16);
  },
};

// Default security manager instance
export const securityManager = new SecurityManager();

// Auto-cleanup rate limit storage every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    securityManager.cleanRateLimitStorage();
  }, 5 * 60 * 1000);
}

// Export types
export type { SecurityConfig };
