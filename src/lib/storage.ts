/**
 * Secure Local Storage Utilities
 * Provides encrypted storage with compression and expiration support
 */

import { z } from 'zod';

// Storage entry schema
const StorageEntrySchema = z.object({
  data: z.string(), // Encrypted data
  timestamp: z.number(),
  expiry: z.number().optional(), // Unix timestamp for expiration
  version: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  checksum: z.string().optional(),
});

type StorageEntry = z.infer<typeof StorageEntrySchema>;

// Storage configuration
const StorageConfigSchema = z.object({
  prefix: z.string().default('iot-secure'),
  encryptionEnabled: z.boolean().default(true),
  compressionEnabled: z.boolean().default(true),
  checksumEnabled: z.boolean().default(true),
  defaultExpiry: z.number().optional(), // Default expiry in milliseconds
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB max storage
});

type StorageConfig = z.infer<typeof StorageConfigSchema>;

// Storage types
type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

// Storage event types
type StorageEvent = 'set' | 'get' | 'delete' | 'clear' | 'expire' | 'error';

// Storage event listener
type StorageEventListener = (event: StorageEvent, key: string, data?: any) => void;

/**
 * Simple encryption/decryption utilities
 * Note: This is a basic implementation for demo purposes
 * In production, use a proper encryption library like crypto-js
 */
class SimpleEncryption {
  private key: string;

  constructor(key: string = 'iot-platform-key') {
    this.key = key;
  }

  /**
   * Simple XOR encryption
   */
  encrypt(data: string): string {
    let encrypted = '';
    const keyLength = this.key.length;
    
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.key.charCodeAt(i % keyLength);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }

    return btoa(encrypted); // Base64 encode
  }

  /**
   * Simple XOR decryption
   */
  decrypt(encryptedData: string): string {
    try {
      const encrypted = atob(encryptedData); // Base64 decode
      let decrypted = '';
      const keyLength = this.key.length;
      
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = this.key.charCodeAt(i % keyLength);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }
}

/**
 * Simple compression utilities
 */
class SimpleCompression {
  /**
   * Compress string using simple run-length encoding
   */
  static compress(data: string): string {
    if (data.length === 0) return data;
    
    let compressed = '';
    let count = 1;
    let currentChar = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] === currentChar && count < 9) {
        count++;
      } else {
        compressed += count > 1 ? `${count}${currentChar}` : currentChar;
        currentChar = data[i];
        count = 1;
      }
    }
    
    compressed += count > 1 ? `${count}${currentChar}` : currentChar;
    return compressed;
  }

  /**
   * Decompress string
   */
  static decompress(compressed: string): string {
    if (compressed.length === 0) return compressed;
    
    let decompressed = '';
    let i = 0;
    
    while (i < compressed.length) {
      const char = compressed[i];
      
      if (char >= '2' && char <= '9') {
        const count = parseInt(char);
        const nextChar = compressed[i + 1];
        decompressed += nextChar.repeat(count);
        i += 2;
      } else {
        decompressed += char;
        i++;
      }
    }
    
    return decompressed;
  }
}

/**
 * Checksum utilities
 */
class ChecksumUtils {
  /**
   * Simple checksum calculation
   */
  static calculate(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Verify checksum
   */
  static verify(data: string, checksum: string): boolean {
    return this.calculate(data) === checksum;
  }
}

/**
 * Secure Storage Manager
 * Provides encrypted, compressed, and checksummed storage with expiration
 */
export class SecureStorageManager {
  private config: StorageConfig;
  private encryption: SimpleEncryption;
  private storageType: StorageType;
  private storage: Storage | Map<string, string>;
  private eventListeners: Map<StorageEvent, StorageEventListener[]> = new Map();

  constructor(
    config: Partial<StorageConfig> = {},
    storageType: StorageType = 'localStorage',
    encryptionKey?: string
  ) {
    this.config = StorageConfigSchema.parse(config);
    this.encryption = new SimpleEncryption(encryptionKey);
    this.storageType = storageType;
    this.storage = this.initializeStorage();
  }

  /**
   * Initialize storage based on type
   */
  private initializeStorage(): Storage | Map<string, string> {
    switch (this.storageType) {
      case 'localStorage':
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        break;
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return window.sessionStorage;
        }
        break;
      case 'memory':
        return new Map<string, string>();
    }
    
    // Fallback to memory storage
    return new Map<string, string>();
  }

  /**
   * Get storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.config.prefix}:${key}`;
  }

  /**
   * Get raw data from storage
   */
  private getRawData(key: string): string | null {
    const storageKey = this.getStorageKey(key);
    
    if (this.storage instanceof Map) {
      return this.storage.get(storageKey) || null;
    }
    
    return this.storage.getItem(storageKey);
  }

  /**
   * Set raw data to storage
   */
  private setRawData(key: string, data: string): void {
    const storageKey = this.getStorageKey(key);
    
    if (this.storage instanceof Map) {
      this.storage.set(storageKey, data);
    } else {
      this.storage.setItem(storageKey, data);
    }
  }

  /**
   * Remove raw data from storage
   */
  private removeRawData(key: string): void {
    const storageKey = this.getStorageKey(key);
    
    if (this.storage instanceof Map) {
      this.storage.delete(storageKey);
    } else {
      this.storage.removeItem(storageKey);
    }
  }

  /**
   * Get all keys from storage
   */
  private getAllKeys(): string[] {
    const prefix = `${this.config.prefix}:`;
    
    if (this.storage instanceof Map) {
      return Array.from(this.storage.keys())
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''));
    }
    
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(prefix, ''));
      }
    }
    
    return keys;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: StorageEntry): boolean {
    if (!entry.expiry) return false;
    return Date.now() > entry.expiry;
  }

  /**
   * Process data for storage (encrypt, compress, checksum)
   */
  private processDataForStorage(data: any): string {
    try {
      let processedData = JSON.stringify(data);
      
      // Compress if enabled
      if (this.config.compressionEnabled) {
        processedData = SimpleCompression.compress(processedData);
      }
      
      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        processedData = this.encryption.encrypt(processedData);
      }
      
      return processedData;
    } catch (error) {
      this.emitEvent('error', 'process', error);
      throw new Error('Failed to process data for storage');
    }
  }

  /**
   * Process data from storage (decrypt, decompress, verify checksum)
   */
  private processDataFromStorage(processedData: string): any {
    try {
      let data = processedData;
      
      // Decrypt if enabled
      if (this.config.encryptionEnabled) {
        data = this.encryption.decrypt(data);
      }
      
      // Decompress if enabled
      if (this.config.compressionEnabled) {
        data = SimpleCompression.decompress(data);
      }
      
      return JSON.parse(data);
    } catch (error) {
      this.emitEvent('error', 'process', error);
      throw new Error('Failed to process data from storage');
    }
  }

  /**
   * Emit storage event
   */
  private emitEvent(event: StorageEvent, key: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(event, key, data);
      } catch (error) {
        console.error('Storage event listener error:', error);
      }
    });
  }

  /**
   * Get storage usage
   */
  private getStorageUsage(): number {
    let usage = 0;
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      const rawData = this.getRawData(key);
      if (rawData) {
        usage += rawData.length * 2; // Approximate byte size
      }
    });
    
    return usage;
  }

  /**
   * Set value in storage
   */
  set<T = any>(
    key: string,
    data: T,
    options: {
      expiry?: number; // Unix timestamp or duration in ms
      version?: string;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    try {
      // Check storage size limit
      const currentUsage = this.getStorageUsage();
      if (currentUsage > this.config.maxSize) {
        throw new Error('Storage size limit exceeded');
      }

      const processedData = this.processDataForStorage(data);
      const now = Date.now();
      
      // Calculate expiry
      let expiry: number | undefined;
      if (options.expiry) {
        expiry = options.expiry > now ? options.expiry : now + options.expiry;
      } else if (this.config.defaultExpiry) {
        expiry = now + this.config.defaultExpiry;
      }

      const entry: StorageEntry = {
        data: processedData,
        timestamp: now,
        expiry,
        version: options.version,
        metadata: options.metadata,
        checksum: this.config.checksumEnabled ? ChecksumUtils.calculate(processedData) : undefined,
      };

      const entryData = JSON.stringify(entry);
      this.setRawData(key, entryData);
      this.emitEvent('set', key, data);
    } catch (error) {
      this.emitEvent('error', key, error);
      throw error;
    }
  }

  /**
   * Get value from storage
   */
  get<T = any>(key: string): T | null {
    try {
      const rawData = this.getRawData(key);
      if (!rawData) {
        this.emitEvent('get', key, null);
        return null;
      }

      const entry = JSON.parse(rawData) as StorageEntry;
      
      // Validate entry structure
      const validatedEntry = StorageEntrySchema.parse(entry);
      
      // Check if expired
      if (this.isExpired(validatedEntry)) {
        this.remove(key);
        this.emitEvent('expire', key);
        return null;
      }

      // Verify checksum if enabled
      if (this.config.checksumEnabled && validatedEntry.checksum) {
        if (!ChecksumUtils.verify(validatedEntry.data, validatedEntry.checksum)) {
          this.remove(key);
          this.emitEvent('error', key, 'Checksum verification failed');
          return null;
        }
      }

      const data = this.processDataFromStorage(validatedEntry.data);
      this.emitEvent('get', key, data);
      return data;
    } catch (error) {
      this.emitEvent('error', key, error);
      return null;
    }
  }

  /**
   * Check if key exists in storage
   */
  has(key: string): boolean {
    try {
      const rawData = this.getRawData(key);
      if (!rawData) return false;

      const entry = JSON.parse(rawData) as StorageEntry;
      const validatedEntry = StorageEntrySchema.parse(entry);
      
      // Check if expired
      if (this.isExpired(validatedEntry)) {
        this.remove(key);
        this.emitEvent('expire', key);
        return false;
      }

      return true;
    } catch (error) {
      this.emitEvent('error', key, error);
      return false;
    }
  }

  /**
   * Remove value from storage
   */
  remove(key: string): boolean {
    try {
      const existed = this.has(key);
      this.removeRawData(key);
      if (existed) {
        this.emitEvent('delete', key);
      }
      return existed;
    } catch (error) {
      this.emitEvent('error', key, error);
      return false;
    }
  }

  /**
   * Clear all storage entries
   */
  clear(): void {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => this.removeRawData(key));
      this.emitEvent('clear', '');
    } catch (error) {
      this.emitEvent('error', '', error);
    }
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    try {
      return this.getAllKeys().filter(key => this.has(key));
    } catch (error) {
      this.emitEvent('error', '', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  size(): number {
    return this.getStorageUsage();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      if (!this.has(key)) {
        cleaned++;
      }
    });
    
    return cleaned;
  }

  /**
   * Get entry metadata
   */
  getMetadata(key: string): Record<string, any> | null {
    try {
      const rawData = this.getRawData(key);
      if (!rawData) return null;

      const entry = JSON.parse(rawData) as StorageEntry;
      const validatedEntry = StorageEntrySchema.parse(entry);
      
      if (this.isExpired(validatedEntry)) {
        this.remove(key);
        return null;
      }

      return {
        timestamp: validatedEntry.timestamp,
        expiry: validatedEntry.expiry,
        version: validatedEntry.version,
        metadata: validatedEntry.metadata,
      };
    } catch (error) {
      this.emitEvent('error', key, error);
      return null;
    }
  }

  /**
   * Update entry expiry
   */
  updateExpiry(key: string, expiry: number): boolean {
    try {
      const rawData = this.getRawData(key);
      if (!rawData) return false;

      const entry = JSON.parse(rawData) as StorageEntry;
      const validatedEntry = StorageEntrySchema.parse(entry);
      
      if (this.isExpired(validatedEntry)) {
        this.remove(key);
        return false;
      }

      const now = Date.now();
      validatedEntry.expiry = expiry > now ? expiry : now + expiry;
      
      const updatedData = JSON.stringify(validatedEntry);
      this.setRawData(key, updatedData);
      return true;
    } catch (error) {
      this.emitEvent('error', key, error);
      return false;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event: StorageEvent, listener: StorageEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: StorageEvent, listener: StorageEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    keys: number;
    size: number;
    maxSize: number;
    usage: number;
    storageType: StorageType;
  } {
    const keys = this.keys();
    const size = this.getStorageUsage();
    
    return {
      keys: keys.length,
      size,
      maxSize: this.config.maxSize,
      usage: size / this.config.maxSize,
      storageType: this.storageType,
    };
  }
}

// Default storage instances
export const secureLocalStorage = new SecureStorageManager({}, 'localStorage');
export const secureSessionStorage = new SecureStorageManager({}, 'sessionStorage');
export const secureMemoryStorage = new SecureStorageManager({}, 'memory');

// Storage utilities
export const storageUtils = {
  /**
   * Migrate data between storage instances
   */
  migrate(
    fromStorage: SecureStorageManager,
    toStorage: SecureStorageManager,
    keys?: string[]
  ): number {
    const keysToMigrate = keys || fromStorage.keys();
    let migrated = 0;
    
    keysToMigrate.forEach(key => {
      const data = fromStorage.get(key);
      const metadata = fromStorage.getMetadata(key);
      
      if (data !== null && metadata) {
        toStorage.set(key, data, {
          expiry: metadata.expiry,
          version: metadata.version,
          metadata: metadata.metadata,
        });
        migrated++;
      }
    });
    
    return migrated;
  },

  /**
   * Backup storage data
   */
  backup(storage: SecureStorageManager): { [key: string]: any } {
    const backup: { [key: string]: any } = {};
    const keys = storage.keys();
    
    keys.forEach(key => {
      const data = storage.get(key);
      const metadata = storage.getMetadata(key);
      
      if (data !== null && metadata) {
        backup[key] = {
          data,
          metadata,
        };
      }
    });
    
    return backup;
  },

  /**
   * Restore storage data from backup
   */
  restore(storage: SecureStorageManager, backup: { [key: string]: any }): number {
    let restored = 0;
    
    Object.entries(backup).forEach(([key, entry]) => {
      if (entry.data !== undefined && entry.metadata) {
        storage.set(key, entry.data, {
          expiry: entry.metadata.expiry,
          version: entry.metadata.version,
          metadata: entry.metadata.metadata,
        });
        restored++;
      }
    });
    
    return restored;
  },

  /**
   * Storage decorator for functions
   */
  cached<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      keyPrefix?: string;
      expiry?: number;
      version?: string;
      storage?: SecureStorageManager;
    } = {}
  ): T {
    const storage = options.storage || secureLocalStorage;
    const keyPrefix = options.keyPrefix || fn.name || 'cached';

    return ((...args: Parameters<T>) => {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      
      const cached = storage.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      storage.set(key, result, {
        expiry: options.expiry,
        version: options.version,
      });
      
      return result;
    }) as T;
  },
};

// Export types
export type {
  StorageConfig,
  StorageEntry,
  StorageEvent,
  StorageEventListener,
  StorageType,
};
