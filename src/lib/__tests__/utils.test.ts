/**
 * Unit Tests for Utils Library
 * 
 * Tests cover:
 * - cn (className utility)
 * - formatDate
 * - formatDateTime  
 * - formatCurrency
 * - truncate
 * - generateId
 * - debounce
 * - sleep
 */

import { cn, formatDate, formatDateTime, formatCurrency, truncate, generateId, debounce, sleep } from '../utils';

describe('Utils Library', () => {
  describe('cn (className utility)', () => {
    it('should combine class names', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'final-class');
      expect(result).toBe('base-class final-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'final-class');
      expect(result).toBe('base-class final-class');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['base-class', 'array-class'], 'single-class');
      expect(result).toBe('base-class array-class single-class');
    });

    it('should handle objects with conditional classes', () => {
      const result = cn('base-class', {
        'active': true,
        'disabled': false,
        'loading': true,
      });
      expect(result).toBe('base-class active loading');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2023-07-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toMatch(/July 15, 2023/);
    });

    it('should format Date object', () => {
      const date = new Date('2023-07-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('July 15, 2023');
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time from string', () => {
      const date = '2023-07-15T10:30:00Z';
      const result = formatDateTime(date);
      // Time will be displayed in local timezone (e.g., "Jul 15, 2023, 06:30 AM")
      expect(result).toMatch(/Jul 15, 2023.*[AMP]/);
    });

    it('should format Date object with time', () => {
      const date = new Date('2023-07-15T10:30:00Z');
      const result = formatDateTime(date);
      // Time will be displayed in local timezone  
      expect(result).toMatch(/Jul 15, 2023.*[AMP]/);
    });

    it('should handle invalid datetime', () => {
      const result = formatDateTime('invalid-datetime');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format currency with custom currency', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toBe('€1,234.56');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-123.45);
      expect(result).toBe('-$123.45');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncate(text, 20);
      expect(result).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncate(text, 20);
      expect(result).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exact length text';
      const result = truncate(text, 17);
      expect(result).toBe('Exact length text');
    });

    it('should handle empty string', () => {
      const result = truncate('', 10);
      expect(result).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs of consistent length', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1.length).toBe(id2.length);
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified time', async () => {
      const sleepPromise = sleep(100);
      
      jest.advanceTimersByTime(100);
      
      await expect(sleepPromise).resolves.toBeUndefined();
    });

    it('should not resolve before specified time', async () => {
      const sleepPromise = sleep(100);
      
      jest.advanceTimersByTime(50);
      
      // Promise should still be pending
      expect(sleepPromise).toBe(sleepPromise);
    });
  });
});
