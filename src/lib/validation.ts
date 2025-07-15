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
  dateString: z.string().datetime('Invalid date format'),
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

// Enhanced validation schemas for IoT platform
export const enhancedSchemas = {
  // IoT specific validations
  deviceId: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid device ID format'),
  sensorType: z.enum(['temperature', 'humidity', 'pressure', 'light', 'motion', 'gas', 'sound']),
  status: z.enum(['active', 'inactive', 'maintenance', 'error']),
  
  // Network and connectivity
  ipAddress: z.string().ip('Invalid IP address format'),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Invalid MAC address format'),
  
  // Geographic coordinates
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  
  // File and media
  mimeType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/, 'Invalid MIME type'),
  fileName: z.string().min(1).max(255, 'File name must be between 1 and 255 characters'),
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'),
  
  // Version and timestamps
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format (expected x.y.z)'),
  timestamp: z.number().positive('Invalid timestamp'),
  
  // Search and pagination
  searchQuery: z.string().min(1).max(500, 'Search query must be between 1 and 500 characters'),
  page: z.number().int().positive('Page must be a positive integer'),
  pageSize: z.number().int().min(1).max(100, 'Page size must be between 1 and 100'),
  
  // Numeric validations
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be non-negative'),
};

// Device validation schemas
export const deviceSchemas = {
  device: z.object({
    id: commonSchemas.id,
    name: z.string().min(1).max(100, 'Device name must be between 1 and 100 characters'),
    type: z.enum(['sensor', 'actuator', 'gateway', 'controller']),
    model: z.string().min(1).max(50, 'Model must be between 1 and 50 characters'),
    manufacturer: z.string().min(1).max(50, 'Manufacturer must be between 1 and 50 characters'),
    serialNumber: z.string().min(1).max(100, 'Serial number must be between 1 and 100 characters'),
    firmwareVersion: enhancedSchemas.version,
    hardwareVersion: enhancedSchemas.version,
    status: enhancedSchemas.status,
    location: z.object({
      latitude: enhancedSchemas.latitude,
      longitude: enhancedSchemas.longitude,
      address: z.string().max(200, 'Address must be less than 200 characters').optional(),
    }).optional(),
    connectivity: z.object({
      type: z.enum(['wifi', 'ethernet', 'cellular', 'bluetooth', 'zigbee', 'lora']),
      signalStrength: z.number().min(-100).max(0, 'Signal strength must be between -100 and 0'),
      ipAddress: enhancedSchemas.ipAddress.optional(),
      macAddress: enhancedSchemas.macAddress.optional(),
    }),
    capabilities: z.array(z.string()).min(1, 'Device must have at least one capability'),
    metadata: z.record(z.any()).optional(),
    createdAt: commonSchemas.dateString,
    updatedAt: commonSchemas.dateString,
  }),

  sensorReading: z.object({
    deviceId: commonSchemas.id,
    sensorType: enhancedSchemas.sensorType,
    value: z.number(),
    unit: z.string().min(1).max(20, 'Unit must be between 1 and 20 characters'),
    timestamp: enhancedSchemas.timestamp,
    quality: z.enum(['good', 'warning', 'error']).default('good'),
    metadata: z.record(z.any()).optional(),
  }),

  deviceCommand: z.object({
    deviceId: commonSchemas.id,
    command: z.string().min(1).max(100, 'Command must be between 1 and 100 characters'),
    parameters: z.record(z.any()).optional(),
    timestamp: enhancedSchemas.timestamp,
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    timeout: z.number().positive('Timeout must be positive').default(30000),
  }),
};

// Analytics validation schemas
export const analyticsSchemas = {
  dataset: z.object({
    id: commonSchemas.id,
    name: z.string().min(1).max(100, 'Dataset name must be between 1 and 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    type: z.enum(['time_series', 'tabular', 'event', 'geospatial']),
    source: z.string().min(1).max(100, 'Source must be between 1 and 100 characters'),
    schema: z.record(z.any()),
    isActive: z.boolean().default(true),
    createdAt: commonSchemas.dateString,
    updatedAt: commonSchemas.dateString,
  }),

  dashboard: z.object({
    id: commonSchemas.id,
    name: z.string().min(1).max(100, 'Dashboard name must be between 1 and 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    widgets: z.array(z.object({
      id: commonSchemas.id,
      type: z.enum(['chart', 'table', 'metric', 'map', 'text']),
      title: z.string().min(1).max(100, 'Widget title must be between 1 and 100 characters'),
      position: z.object({
        x: enhancedSchemas.nonNegativeNumber,
        y: enhancedSchemas.nonNegativeNumber,
        width: enhancedSchemas.positiveNumber,
        height: enhancedSchemas.positiveNumber,
      }),
      configuration: z.record(z.any()),
      dataSource: z.string().min(1).max(100, 'Data source must be between 1 and 100 characters'),
    })).min(1, 'Dashboard must have at least one widget'),
    isPublic: z.boolean().default(false),
    createdAt: commonSchemas.dateString,
    updatedAt: commonSchemas.dateString,
  }),

  alertRule: z.object({
    id: commonSchemas.id,
    name: z.string().min(1).max(100, 'Alert rule name must be between 1 and 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    datasetId: commonSchemas.id,
    condition: z.object({
      field: z.string().min(1).max(100, 'Field must be between 1 and 100 characters'),
      operator: z.enum(['gt', 'lt', 'gte', 'lte', 'eq', 'ne', 'contains', 'not_contains']),
      value: z.any(),
      aggregation: z.enum(['avg', 'sum', 'min', 'max', 'count']).optional(),
      window: z.number().positive('Window must be positive').optional(),
    }),
    actions: z.array(z.object({
      type: z.enum(['email', 'sms', 'webhook', 'slack']),
      target: z.string().min(1).max(200, 'Target must be between 1 and 200 characters'),
      template: z.string().max(1000, 'Template must be less than 1000 characters').optional(),
    })).min(1, 'Alert rule must have at least one action'),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    isActive: z.boolean().default(true),
    createdAt: commonSchemas.dateString,
    updatedAt: commonSchemas.dateString,
  }),
};

// API validation schemas
export const apiSchemas = {
  paginationParams: z.object({
    page: enhancedSchemas.page.default(1),
    pageSize: enhancedSchemas.pageSize.default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),

  filterParams: z.object({
    search: enhancedSchemas.searchQuery.optional(),
    status: z.array(enhancedSchemas.status).optional(),
    dateFrom: commonSchemas.dateString.optional(),
    dateTo: commonSchemas.dateString.optional(),
    tags: z.array(z.string()).optional(),
  }),

  bulkOperation: z.object({
    action: z.enum(['delete', 'update', 'activate', 'deactivate']),
    ids: z.array(commonSchemas.id).min(1, 'At least one ID is required'),
    parameters: z.record(z.any()).optional(),
  }),

  fileUpload: z.object({
    fileName: enhancedSchemas.fileName,
    mimeType: enhancedSchemas.mimeType,
    size: z.number().positive('File size must be positive'),
    maxSize: z.number().positive('Max file size must be positive').default(10 * 1024 * 1024), // 10MB
  }).refine(data => data.size <= data.maxSize, {
    message: 'File size exceeds maximum allowed size',
    path: ['size'],
  }),
};

// Advanced validation utilities
export class ValidationUtils {
  /**
   * Validate data against schema with custom error formatting
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: {
      abortEarly?: boolean;
      formatErrors?: boolean;
    } = {}
  ): {
    success: boolean;
    data?: T;
    errors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  } {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    const errors = result.error.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));

    if (options.abortEarly) {
      return {
        success: false,
        errors: errors.slice(0, 1),
      };
    }

    return {
      success: false,
      errors,
    };
  }

  /**
   * Validate array of objects
   */
  static validateArray<T>(
    schema: z.ZodSchema<T>,
    data: unknown[],
    options: {
      abortEarly?: boolean;
      skipInvalid?: boolean;
    } = {}
  ): {
    success: boolean;
    data?: T[];
    errors?: Array<{
      index: number;
      field: string;
      message: string;
      code: string;
    }>;
  } {
    const validItems: T[] = [];
    const errors: Array<{
      index: number;
      field: string;
      message: string;
      code: string;
    }> = [];

    data.forEach((item, index) => {
      const result = schema.safeParse(item);

      if (result.success) {
        validItems.push(result.data);
      } else {
        const itemErrors = result.error.errors.map(error => ({
          index,
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        }));

        errors.push(...itemErrors);

        if (options.abortEarly) {
          return;
        }
      }
    });

    if (errors.length > 0 && !options.skipInvalid) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: validItems,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate partial object (for updates)
   */
  static validatePartial<T>(
    schema: z.ZodObject<any>,
    data: unknown,
    options: {
      abortEarly?: boolean;
    } = {}
  ): {
    success: boolean;
    data?: Partial<T>;
    errors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  } {
    const partialSchema = schema.partial();
    const result = this.validate(partialSchema, data, options);
    return {
      success: result.success,
      data: result.data as Partial<T>,
      errors: result.errors,
    };
  }

  /**
   * Create conditional validation schema
   */
  static conditional<T>(
    condition: (data: any) => boolean,
    trueSchema: z.ZodSchema<T>,
    falseSchema: z.ZodSchema<T>
  ): z.ZodSchema<T> {
    return z.any().superRefine((data, ctx) => {
      const schema = condition(data) ? trueSchema : falseSchema;
      const result = schema.safeParse(data);
      
      if (!result.success) {
        result.error.errors.forEach(error => {
          ctx.addIssue({
            ...error,
            path: error.path,
          });
        });
      }
    }) as z.ZodSchema<T>;
  }

  /**
   * Merge validation schemas
   */
  static mergeSchemas<T extends z.ZodRawShape>(
    schemas: z.ZodObject<T>[]
  ): z.ZodObject<T> {
    return schemas.reduce((merged, schema) => merged.merge(schema));
  }
}

// Enhanced validation result types
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
};

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};
