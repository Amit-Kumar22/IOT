/**
 * Unit tests for validation utilities
 * Tests input validation, sanitization, and security functions
 */

import { 
  InputSanitizer, 
  RequestValidator, 
  addSecurityHeaders, 
  addCorsHeaders 
} from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

describe('InputSanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should remove dangerous HTML tags', () => {
      const dangerousInput = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = InputSanitizer.sanitizeHtml(dangerousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should allow safe HTML tags', () => {
      const safeInput = '<p>Hello <b>world</b> and <i>everyone</i></p>';
      const sanitized = InputSanitizer.sanitizeHtml(safeInput);
      
      expect(sanitized).toBe(safeInput);
    });

    it('should remove dangerous attributes', () => {
      const dangerousInput = '<p onclick="alert()">Click me</p>';
      const sanitized = InputSanitizer.sanitizeHtml(dangerousInput);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('<p>Click me</p>');
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      const dangerousInput = 'Hello<script>alert()</script>';
      const sanitized = InputSanitizer.sanitizeString(dangerousInput);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
      expect(sanitized).toBe('Helloscriptalert/script');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const sanitized = InputSanitizer.sanitizeString(input);
      
      expect(sanitized).toBe('hello world');
    });

    it('should limit string length', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = InputSanitizer.sanitizeString(longInput);
      
      expect(sanitized.length).toBe(1000);
    });
  });

  describe('sanitizeSql', () => {
    it('should remove SQL injection characters', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitized = InputSanitizer.sanitizeSql(sqlInjection);
      
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('--');
      expect(sanitized).not.toContain('DROP');
    });

    it('should remove SQL keywords', () => {
      const sqlInjection = 'SELECT * FROM users WHERE id = 1';
      const sanitized = InputSanitizer.sanitizeSql(sqlInjection);
      
      expect(sanitized).not.toContain('SELECT');
      expect(sanitized).not.toContain('FROM');
      expect(sanitized).not.toContain('WHERE');
    });
  });

  describe('sanitizeFilePath', () => {
    it('should remove directory traversal attempts', () => {
      const maliciousPath = '../../../etc/passwd';
      const sanitized = InputSanitizer.sanitizeFilePath(maliciousPath);
      
      expect(sanitized).not.toContain('..');
      expect(sanitized).toBe('etcpasswd');
    });

    it('should remove invalid file characters', () => {
      const invalidPath = 'file<>:*?"|name.txt';
      const sanitized = InputSanitizer.sanitizeFilePath(invalidPath);
      
      expect(sanitized).toBe('filename.txt');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values in object', () => {
      const dangerousObject = {
        name: '<script>alert()</script>John',
        email: 'test@example.com',
        nested: {
          description: 'Safe<script>unsafe</script>content'
        }
      };

      const sanitized = InputSanitizer.sanitizeObject(dangerousObject);
      
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.nested.description).not.toContain('<script>');
    });

    it('should handle arrays', () => {
      const arrayObject = {
        tags: ['<script>tag1</script>', 'safe-tag', '<div>tag3</div>']
      };

      const sanitized = InputSanitizer.sanitizeObject(arrayObject);
      
      expect(sanitized.tags[0]).not.toContain('<script>');
      expect(sanitized.tags[1]).toBe('safe-tag');
      expect(sanitized.tags[2]).not.toContain('<div>');
    });

    it('should preserve non-string values', () => {
      const mixedObject = {
        name: 'John<script>',
        age: 25,
        active: true,
        score: 98.5,
        tags: null
      };

      const sanitized = InputSanitizer.sanitizeObject(mixedObject);
      
      expect(sanitized.age).toBe(25);
      expect(sanitized.active).toBe(true);
      expect(sanitized.score).toBe(98.5);
      expect(sanitized.tags).toBeNull();
    });
  });
});

describe('RequestValidator', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0)
  });

  describe('validateBody', () => {
    it('should validate valid request body', async () => {
      const validBody = { name: 'John', email: 'john@example.com', age: 25 };
      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'content-type': 'application/json' }
      });

      const result = await RequestValidator.validateBody(request, testSchema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.age).toBe(25);
      }
    });

    it('should reject invalid request body', async () => {
      const invalidBody = { name: '', email: 'invalid-email', age: -1 };
      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
        headers: { 'content-type': 'application/json' }
      });

      const result = await RequestValidator.validateBody(request, testSchema);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        body: '{ invalid json',
        headers: { 'content-type': 'application/json' }
      });

      const result = await RequestValidator.validateBody(request, testSchema);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('Invalid JSON format');
      }
    });
  });

  describe('validateQuery', () => {
    it('should validate valid query parameters', () => {
      const querySchema = z.object({
        page: z.number(),
        limit: z.number(),
        search: z.string().optional()
      });

      const request = new NextRequest('http://localhost/test?page=1&limit=10&search=test');
      
      const result = RequestValidator.validateQuery(request, querySchema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.search).toBe('test');
      }
    });

    it('should handle missing required query parameters', () => {
      const querySchema = z.object({
        requiredParam: z.string()
      });

      const request = new NextRequest('http://localhost/test');
      
      const result = RequestValidator.validateQuery(request, querySchema);
      
      expect(result.success).toBe(false);
    });

    it('should convert string numbers to numbers', () => {
      const querySchema = z.object({
        page: z.number(),
        score: z.number()
      });

      const request = new NextRequest('http://localhost/test?page=5&score=98.5');
      
      const result = RequestValidator.validateQuery(request, querySchema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.score).toBe(98.5);
      }
    });
  });

  describe('validateParams', () => {
    it('should validate valid path parameters', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
        slug: z.string()
      });

      const params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-slug'
      };
      
      const result = RequestValidator.validateParams(params, paramsSchema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result.data.slug).toBe('test-slug');
      }
    });

    it('should reject invalid path parameters', () => {
      const paramsSchema = z.object({
        id: z.string().uuid()
      });

      const params = {
        id: 'invalid-uuid'
      };
      
      const result = RequestValidator.validateParams(params, paramsSchema);
      
      expect(result.success).toBe(false);
    });
  });
});

describe('Security Headers', () => {
  describe('addSecurityHeaders', () => {
    it('should add all required security headers', () => {
      const response = new NextResponse();
      const secureResponse = addSecurityHeaders(response);
      
      expect(secureResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(secureResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(secureResponse.headers.get('X-Frame-Options')).toBe('DENY');
      expect(secureResponse.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
      expect(secureResponse.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should include HSTS header in production', () => {
      // Mock NODE_ENV for this test
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };
      
      const response = new NextResponse();
      const secureResponse = addSecurityHeaders(response);
      
      expect(secureResponse.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
      
      // Restore original environment
      process.env = originalEnv;
    });
  });

  describe('addCorsHeaders', () => {
    it('should add CORS headers for allowed origin', () => {
      const response = new NextResponse();
      const corsResponse = addCorsHeaders(response, 'http://localhost:3000');
      
      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toContain('GET, POST, PUT, DELETE');
      expect(corsResponse.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });

    it('should handle wildcard for requests without origin', () => {
      const response = new NextResponse();
      const corsResponse = addCorsHeaders(response);
      
      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should reject unauthorized origins', () => {
      const response = new NextResponse();
      const corsResponse = addCorsHeaders(response, 'http://malicious-site.com');
      
      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBeUndefined();
    });
  });
});
