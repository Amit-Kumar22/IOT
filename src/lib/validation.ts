/**
 * Input validation and sanitization middleware
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const commonSchemas = {
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).trim(),
  id: z.string().uuid(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  sort: z.object({
    field: z.string().min(1).max(50),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
};

// Input sanitization functions
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Sanitize string by removing potentially dangerous characters
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>"\\'%;()&+]/g, '') // Remove potentially dangerous chars
      .trim()
      .slice(0, 1000); // Limit length
  }

  /**
   * Sanitize SQL input (basic protection, use parameterized queries primarily)
   */
  static sanitizeSql(input: string): string {
    return input
      .replace(/[';-]/g, '') // Remove SQL injection chars
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION|SELECT|FROM|WHERE)\b/gi, '') // Remove SQL keywords
      .trim()
      .slice(0, 255);
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(input: string): string {
    return input
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[\/\\:*?"<>|]/g, '') // Remove invalid file chars
      .trim()
      .slice(0, 255);
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}

// Request validation middleware
export class RequestValidator {
  /**
   * Validate request body against schema
   */
  static async validateBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
    try {
      const body = await request.json();
      const sanitizedBody = InputSanitizer.sanitizeObject(body);
      const result = schema.safeParse(sanitizedBody);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid JSON format']
      };
    }
  }

  /**
   * Validate query parameters against schema
   */
  static validateQuery<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const url = new URL(request.url);
      const queryParams: any = {};
      
      url.searchParams.forEach((value, key) => {
        const sanitizedKey = InputSanitizer.sanitizeString(key);
        const sanitizedValue = InputSanitizer.sanitizeString(value);
        
        // Convert string numbers to numbers
        if (/^\d+$/.test(sanitizedValue)) {
          queryParams[sanitizedKey] = parseInt(sanitizedValue, 10);
        } else if (/^\d+\.\d+$/.test(sanitizedValue)) {
          queryParams[sanitizedKey] = parseFloat(sanitizedValue);
        } else if (sanitizedValue === 'true' || sanitizedValue === 'false') {
          queryParams[sanitizedKey] = sanitizedValue === 'true';
        } else {
          queryParams[sanitizedKey] = sanitizedValue;
        }
      });
      
      const result = schema.safeParse(queryParams);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid query parameters']
      };
    }
  }

  /**
   * Validate path parameters
   */
  static validateParams<T>(
    params: Record<string, string | string[]>,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const sanitizedParams: any = {};
      
      for (const [key, value] of Object.entries(params)) {
        const sanitizedKey = InputSanitizer.sanitizeString(key);
        if (Array.isArray(value)) {
          sanitizedParams[sanitizedKey] = value.map(v => InputSanitizer.sanitizeString(v));
        } else {
          sanitizedParams[sanitizedKey] = InputSanitizer.sanitizeString(value);
        }
      }
      
      const result = schema.safeParse(sanitizedParams);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid path parameters']
      };
    }
  }
}

// Security headers middleware
export function addSecurityHeaders(response: Response): Response {
  const headers = {
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Content Type Options
    'X-Content-Type-Options': 'nosniff',
    
    // Frame Options
    'X-Frame-Options': 'DENY',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // HSTS (only in production with HTTPS)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }),
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  };

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// CORS configuration
export function addCorsHeaders(response: Response, origin?: string): Response {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
  ].filter(Boolean);

  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ].join(', '),
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Same-origin request
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
