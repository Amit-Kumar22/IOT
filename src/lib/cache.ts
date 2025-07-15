/**
 * Cache Management System
 * Provides in-memory and persistent caching with TTL support
 */

import { z } from 'zod';

// Cache entry schema
const CacheEntrySchema = z.object({
  data: z.any(),
  timestamp: z.number(),
  ttl: z.number().optional(), // Time to live in milliseconds
  version: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

type CacheEntry = z.infer<typeof CacheEntrySchema>;

// Cache configuration
const CacheConfigSchema = z.object({
  maxSize: z.number().default(1000),
  defaultTTL: z.number().default(5 * 60 * 1000), // 5 minutes
  cleanupInterval: z.number().default(60 * 1000), // 1 minute
  persistentStorage: z.boolean().default(false),
  storagePrefix: z.string().default('iot-cache'),
  compressionEnabled: z.boolean().default(false),
});

type CacheConfig = z.infer<typeof CacheConfigSchema>;

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

// Cache event types
type CacheEvent = 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear';

// Cache event listener
type CacheEventListener = (event: CacheEvent, key: string, data?: any) => void;

/**
 * Advanced Cache Management System
 * Supports in-memory and persistent caching with TTL, LRU eviction, and compression
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: Map<string, number> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
    memoryUsage: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<CacheEvent, CacheEventListener[]> = new Map();
  private accessCounter = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = CacheConfigSchema.parse(config);
    this.initializeCleanup();
    this.loadFromPersistentStorage();
  }

  /**
   * Initialize automatic cleanup timer
   */
  private initializeCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Load cache from persistent storage
   */
  private loadFromPersistentStorage(): void {
    if (!this.config.persistentStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );

      keys.forEach(key => {
        try {
          const storageKey = key.replace(`${this.config.storagePrefix}:`, '');
          const data = localStorage.getItem(key);
          
          if (data) {
            const entry = JSON.parse(data) as CacheEntry;
            
            // Validate entry
            const validatedEntry = CacheEntrySchema.parse(entry);
            
            // Check if entry is still valid
            if (this.isEntryValid(validatedEntry)) {
              this.cache.set(storageKey, validatedEntry);
              this.updateAccessOrder(storageKey);
            } else {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.warn(`Failed to load cache entry for key ${key}:`, error);
          localStorage.removeItem(key);
        }
      });

      this.updateStats();
    } catch (error) {
      console.error('Failed to load cache from persistent storage:', error);
    }
  }

  /**
   * Save cache entry to persistent storage
   */
  private saveToPersistentStorage(key: string, entry: CacheEntry): void {
    if (!this.config.persistentStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storageKey = `${this.config.storagePrefix}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Failed to save cache entry to persistent storage:`, error);
    }
  }

  /**
   * Remove cache entry from persistent storage
   */
  private removeFromPersistentStorage(key: string): void {
    if (!this.config.persistentStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storageKey = `${this.config.storagePrefix}:${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Failed to remove cache entry from persistent storage:`, error);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const ttl = entry.ttl || this.config.defaultTTL;
    return now - entry.timestamp < ttl;
  }

  /**
   * Update access order for LRU eviction
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Get least recently used key
   */
  private getLRUKey(): string | null {
    let lruKey: string | null = null;
    let lruAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    const lruKey = this.getLRUKey();
    if (lruKey) {
      this.delete(lruKey);
      this.stats.evictions++;
      this.emitEvent('evict', lruKey);
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    // Calculate approximate memory usage
    let memoryUsage = 0;
    for (const [key, entry] of this.cache) {
      memoryUsage += key.length * 2; // String character size
      memoryUsage += JSON.stringify(entry).length * 2;
    }
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * Emit cache event
   */
  private emitEvent(event: CacheEvent, key: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(event, key, data);
      } catch (error) {
        console.error(`Cache event listener error:`, error);
      }
    });
  }

  /**
   * Compress data if compression is enabled
   */
  private compressData(data: any): any {
    if (!this.config.compressionEnabled) {
      return data;
    }

    // Simple compression by removing whitespace from JSON
    if (typeof data === 'object') {
      return JSON.parse(JSON.stringify(data));
    }

    return data;
  }

  /**
   * Get value from cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      this.emitEvent('miss', key);
      return null;
    }

    // Check if entry is still valid
    if (!this.isEntryValid(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateStats();
      this.emitEvent('miss', key);
      return null;
    }

    // Update access order and stats
    this.updateAccessOrder(key);
    this.stats.hits++;
    this.updateStats();
    this.emitEvent('hit', key, entry.data);

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T = any>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      version?: string;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      data: this.compressData(data),
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      version: options.version,
      metadata: options.metadata,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.saveToPersistentStorage(key, entry);
    this.updateStats();
    this.emitEvent('set', key, data);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.accessOrder.delete(key);
      this.removeFromPersistentStorage(key);
      this.updateStats();
      this.emitEvent('delete', key);
    }
    return existed;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry is still valid
    if (!this.isEntryValid(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    
    // Clear persistent storage
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }

    this.updateStats();
    this.emitEvent('clear', '');
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (!this.isEntryValid(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size,
      hitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Add event listener
   */
  addEventListener(event: CacheEvent, listener: CacheEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: CacheEvent, listener: CacheEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get or set with fallback function
   */
  async getOrSet<T = any>(
    key: string,
    fallbackFn: () => Promise<T> | T,
    options: {
      ttl?: number;
      version?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallbackFn();
    this.set(key, value, options);
    return value;
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = CacheConfigSchema.parse({ ...this.config, ...newConfig });
    this.initializeCleanup();
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
    this.eventListeners.clear();
  }
}

// Default cache instance
export const cache = new CacheManager();

// Cache utilities
export const cacheUtils = {
  /**
   * Create cache key from object
   */
  createKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  },

  /**
   * Create versioned cache key
   */
  createVersionedKey(prefix: string, params: Record<string, any>, version: string): string {
    return `${this.createKey(prefix, params)}:v${version}`;
  },

  /**
   * Cache decorator for functions
   */
  cached<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      keyPrefix?: string;
      ttl?: number;
      version?: string;
      cacheInstance?: CacheManager;
    } = {}
  ): T {
    const cacheInstance = options.cacheInstance || cache;
    const keyPrefix = options.keyPrefix || fn.name || 'cached';

    return ((...args: Parameters<T>) => {
      const key = cacheUtils.createKey(keyPrefix, { args });
      
      return cacheInstance.getOrSet(
        key,
        () => fn(...args),
        {
          ttl: options.ttl,
          version: options.version,
        }
      );
    }) as T;
  },

  /**
   * Invalidate cache by pattern
   */
  invalidateByPattern(pattern: string | RegExp, cacheInstance: CacheManager = cache): number {
    const keys = cacheInstance.keys();
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    let invalidated = 0;
    keys.forEach(key => {
      if (regex.test(key)) {
        cacheInstance.delete(key);
        invalidated++;
      }
    });

    return invalidated;
  },

  /**
   * Cache multiple values
   */
  mset(
    entries: Array<[string, any]>,
    options: {
      ttl?: number;
      version?: string;
      metadata?: Record<string, any>;
    } = {},
    cacheInstance: CacheManager = cache
  ): void {
    entries.forEach(([key, value]) => {
      cacheInstance.set(key, value, options);
    });
  },

  /**
   * Get multiple values
   */
  mget<T = any>(keys: string[], cacheInstance: CacheManager = cache): Array<T | null> {
    return keys.map(key => cacheInstance.get<T>(key));
  },

  /**
   * Delete multiple values
   */
  mdel(keys: string[], cacheInstance: CacheManager = cache): number {
    let deleted = 0;
    keys.forEach(key => {
      if (cacheInstance.delete(key)) {
        deleted++;
      }
    });
    return deleted;
  },
};

// Export types
export type {
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheEvent,
  CacheEventListener,
};
