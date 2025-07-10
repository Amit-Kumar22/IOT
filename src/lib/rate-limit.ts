/**
 * Rate limiting middleware for API security
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export class RateLimiter {
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      message: options.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
    };
  }

  // Get client identifier (IP + User-Agent for better uniqueness)
  private getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown-ip';
    const userAgent = request.headers.get('user-agent') || 'unknown-ua';
    
    return `${ip}:${userAgent.slice(0, 50)}`; // Limit UA length for storage
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  // Check if request should be rate limited
  public check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const clientId = this.getClientId(request);
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }

    let entry = rateLimitStore.get(clientId);
    
    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      entry = {
        count: 1,
        resetTime: now + this.options.windowMs,
      };
      rateLimitStore.set(clientId, entry);
      
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Within existing window
    if (entry.count >= this.options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(clientId, entry);

    return {
      allowed: true,
      remaining: this.options.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Middleware function
  public middleware() {
    return (request: NextRequest) => {
      const result = this.check(request);
      
      if (!result.allowed) {
        return NextResponse.json(
          { 
            message: this.options.message,
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.options.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', this.options.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return response;
    };
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'API rate limit exceeded. Please slow down.',
});

export const passwordResetRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again in an hour.',
});

export const registrationRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registration attempts per hour
  message: 'Too many registration attempts. Please try again in an hour.',
});

// Helper function to apply rate limiting to API routes
export function withRateLimit(rateLimiter: RateLimiter) {
  return (handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const rateLimitResponse = rateLimiter.middleware()(request);
      
      // If rate limit exceeded, return early
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }

      // Continue with original handler
      const response = await handler(request);
      
      // Add rate limit headers to response
      const result = rateLimiter.check(request);
      response.headers.set('X-RateLimit-Limit', rateLimiter['options'].maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return response;
    };
  };
}
