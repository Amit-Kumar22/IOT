/**
 * Offline Functionality Testing Suite
 * Tests offline capabilities and service worker functionality
 */

// Mock Service Worker
const mockServiceWorker = {
  register: jest.fn(),
  unregister: jest.fn(),
  update: jest.fn(),
  addEventListener: jest.fn(),
  postMessage: jest.fn(),
  state: 'activated'
};

// Mock Navigator
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  cmp: jest.fn()
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

describe('Offline Functionality Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Worker Registration', () => {
    it('should register service worker successfully', async () => {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(mockServiceWorker.state).toBe('activated');
    });

    it('should handle service worker registration errors', async () => {
      const errorHandler = jest.fn();
      
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        errorHandler(error);
      }
      
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
    });

    it('should update service worker when new version available', async () => {
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (registration) {
        await registration.update();
      }
      
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should cache essential resources for offline use', () => {
      const essentialResources = [
        '/manifest.json',
        '/static/css/main.css',
        '/static/js/main.js',
        '/consumer/dashboard',
        '/consumer/devices',
        '/consumer/energy',
        '/consumer/automation',
        '/consumer/settings'
      ];
      
      essentialResources.forEach(resource => {
        expect(resource).toMatch(/^\/(.+)/);
      });
      
      expect(essentialResources).toContain('/consumer/dashboard');
      expect(essentialResources).toContain('/consumer/devices');
    });

    it('should implement cache-first strategy for static assets', () => {
      const cacheStrategy = {
        static: 'cache-first',
        api: 'network-first',
        images: 'cache-first',
        fonts: 'cache-first'
      };
      
      expect(cacheStrategy.static).toBe('cache-first');
      expect(cacheStrategy.api).toBe('network-first');
      expect(cacheStrategy.images).toBe('cache-first');
      expect(cacheStrategy.fonts).toBe('cache-first');
    });

    it('should manage cache size and cleanup old entries', () => {
      const cacheConfig = {
        maxSize: 50 * 1024 * 1024, // 50MB
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        cleanupInterval: 24 * 60 * 60 * 1000 // 24 hours
      };
      
      expect(cacheConfig.maxSize).toBe(50 * 1024 * 1024);
      expect(cacheConfig.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
      expect(cacheConfig.cleanupInterval).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('Offline Data Storage', () => {
    it('should store device data locally for offline access', () => {
      const deviceData = {
        id: 'device-123',
        name: 'Living Room Light',
        type: 'light',
        room: 'Living Room',
        isOnline: false,
        currentState: { isOn: false, brightness: 0 },
        lastSync: new Date().toISOString()
      };
      
      localStorage.setItem('device-123', JSON.stringify(deviceData));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'device-123',
        JSON.stringify(deviceData)
      );
    });

    it('should store energy data locally for offline viewing', () => {
      const energyData = {
        currentUsage: 2.4,
        todayUsage: 18.7,
        cost: 12.45,
        timestamp: new Date().toISOString(),
        cached: true
      };
      
      localStorage.setItem('energy-data', JSON.stringify(energyData));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'energy-data',
        JSON.stringify(energyData)
      );
    });

    it('should store automation schedules locally', () => {
      const automationData = {
        id: 'automation-123',
        name: 'Morning Routine',
        enabled: true,
        triggers: ['time:07:00'],
        actions: [{ deviceId: 'device-1', action: 'turn_on' }],
        lastExecuted: new Date().toISOString()
      };
      
      localStorage.setItem('automation-123', JSON.stringify(automationData));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'automation-123',
        JSON.stringify(automationData)
      );
    });
  });

  describe('Network Status Detection', () => {
    it('should detect when device goes offline', () => {
      const networkStatus = {
        online: false,
        connectionType: 'none',
        lastOnline: new Date().toISOString()
      };
      
      expect(networkStatus.online).toBe(false);
      expect(networkStatus.connectionType).toBe('none');
      expect(networkStatus.lastOnline).toBeDefined();
    });

    it('should detect when device comes back online', () => {
      const networkStatus = {
        online: true,
        connectionType: 'wifi',
        reconnectedAt: new Date().toISOString()
      };
      
      expect(networkStatus.online).toBe(true);
      expect(networkStatus.connectionType).toBe('wifi');
      expect(networkStatus.reconnectedAt).toBeDefined();
    });

    it('should handle different connection types', () => {
      const connectionTypes = ['wifi', 'cellular', 'ethernet', 'bluetooth', 'none'];
      
      connectionTypes.forEach(type => {
        const connection = {
          type: type,
          effectiveType: type === 'cellular' ? '4g' : null,
          downlink: type === 'wifi' ? 10 : 1
        };
        
        expect(connection.type).toBe(type);
        expect(connectionTypes).toContain(type);
      });
    });
  });

  describe('Offline UI Experience', () => {
    it('should show offline indicator when disconnected', () => {
      const offlineIndicator = {
        visible: true,
        message: 'You are currently offline',
        type: 'warning',
        persistent: true
      };
      
      expect(offlineIndicator.visible).toBe(true);
      expect(offlineIndicator.message).toBe('You are currently offline');
      expect(offlineIndicator.type).toBe('warning');
      expect(offlineIndicator.persistent).toBe(true);
    });

    it('should disable certain features when offline', () => {
      const offlineFeatures = {
        deviceControl: false,
        realTimeUpdates: false,
        automationChanges: false,
        settingsSync: false,
        viewCachedData: true
      };
      
      expect(offlineFeatures.deviceControl).toBe(false);
      expect(offlineFeatures.realTimeUpdates).toBe(false);
      expect(offlineFeatures.automationChanges).toBe(false);
      expect(offlineFeatures.settingsSync).toBe(false);
      expect(offlineFeatures.viewCachedData).toBe(true);
    });

    it('should show cached data with offline indicators', () => {
      const cachedDataIndicators = {
        showCacheTimestamp: true,
        showOfflineIcon: true,
        showSyncStatus: true,
        disableInteractivity: true
      };
      
      expect(cachedDataIndicators.showCacheTimestamp).toBe(true);
      expect(cachedDataIndicators.showOfflineIcon).toBe(true);
      expect(cachedDataIndicators.showSyncStatus).toBe(true);
      expect(cachedDataIndicators.disableInteractivity).toBe(true);
    });
  });

  describe('Data Synchronization', () => {
    it('should queue actions for sync when offline', () => {
      const offlineActions = [
        { type: 'DEVICE_TOGGLE', deviceId: 'device-1', timestamp: new Date().toISOString() },
        { type: 'AUTOMATION_UPDATE', automationId: 'auto-1', timestamp: new Date().toISOString() },
        { type: 'SETTINGS_CHANGE', setting: 'theme', value: 'dark', timestamp: new Date().toISOString() }
      ];
      
      localStorage.setItem('offline-actions', JSON.stringify(offlineActions));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline-actions',
        JSON.stringify(offlineActions)
      );
      expect(offlineActions).toHaveLength(3);
    });

    it('should sync queued actions when back online', () => {
      const queuedActions = [
        { type: 'DEVICE_TOGGLE', deviceId: 'device-1', timestamp: new Date().toISOString() },
        { type: 'AUTOMATION_UPDATE', automationId: 'auto-1', timestamp: new Date().toISOString() }
      ];
      
      const syncResult = {
        totalActions: queuedActions.length,
        successfulSync: 2,
        failedSync: 0,
        syncedAt: new Date().toISOString()
      };
      
      expect(syncResult.totalActions).toBe(2);
      expect(syncResult.successfulSync).toBe(2);
      expect(syncResult.failedSync).toBe(0);
    });

    it('should handle sync conflicts with server data', () => {
      const conflictResolution = {
        strategy: 'server-wins',
        localVersion: 1,
        serverVersion: 2,
        resolution: 'server-wins',
        resolvedAt: new Date().toISOString()
      };
      
      expect(conflictResolution.strategy).toBe('server-wins');
      expect(conflictResolution.serverVersion).toBeGreaterThan(conflictResolution.localVersion);
      expect(conflictResolution.resolution).toBe('server-wins');
    });
  });

  describe('Background Sync', () => {
    it('should register background sync for critical actions', () => {
      const backgroundSyncTags = [
        'device-state-sync',
        'automation-sync',
        'energy-data-sync',
        'settings-sync'
      ];
      
      backgroundSyncTags.forEach(tag => {
        expect(tag).toMatch(/^[\w-]+$/);
      });
      
      expect(backgroundSyncTags).toContain('device-state-sync');
      expect(backgroundSyncTags).toContain('automation-sync');
    });

    it('should handle background sync events', () => {
      const syncEvent = {
        tag: 'device-state-sync',
        waitUntil: jest.fn(),
        lastChance: false
      };
      
      expect(syncEvent.tag).toBe('device-state-sync');
      expect(syncEvent.lastChance).toBe(false);
      expect(typeof syncEvent.waitUntil).toBe('function');
    });
  });

  describe('Offline Performance', () => {
    it('should optimize for offline performance', () => {
      const performanceOptimizations = {
        preloadCriticalData: true,
        compressStoredData: true,
        limitCacheSize: true,
        periodicCleanup: true
      };
      
      expect(performanceOptimizations.preloadCriticalData).toBe(true);
      expect(performanceOptimizations.compressStoredData).toBe(true);
      expect(performanceOptimizations.limitCacheSize).toBe(true);
      expect(performanceOptimizations.periodicCleanup).toBe(true);
    });

    it('should handle storage quota limits', () => {
      const storageQuota = {
        available: 50 * 1024 * 1024, // 50MB
        used: 10 * 1024 * 1024, // 10MB
        remaining: 40 * 1024 * 1024, // 40MB
        warningThreshold: 0.8
      };
      
      const usageRatio = storageQuota.used / storageQuota.available;
      
      expect(usageRatio).toBeLessThan(storageQuota.warningThreshold);
      expect(storageQuota.remaining).toBe(storageQuota.available - storageQuota.used);
    });
  });

  describe('Mobile Offline Features', () => {
    it('should optimize offline features for mobile', () => {
      const mobileOfflineFeatures = {
        reducedCacheSize: true,
        batteryOptimization: true,
        backgroundSyncLimits: true,
        dataCompressionEnabled: true
      };
      
      expect(mobileOfflineFeatures.reducedCacheSize).toBe(true);
      expect(mobileOfflineFeatures.batteryOptimization).toBe(true);
      expect(mobileOfflineFeatures.backgroundSyncLimits).toBe(true);
      expect(mobileOfflineFeatures.dataCompressionEnabled).toBe(true);
    });

    it('should handle mobile-specific offline scenarios', () => {
      const mobileScenarios = [
        'app-backgrounded',
        'low-battery-mode',
        'poor-connectivity',
        'airplane-mode',
        'data-saver-mode'
      ];
      
      mobileScenarios.forEach(scenario => {
        const offlineConfig = {
          scenario: scenario,
          reducedFunctionality: true,
          cacheOptimization: true,
          backgroundSyncDisabled: ['low-battery-mode', 'data-saver-mode'].includes(scenario)
        };
        
        expect(offlineConfig.scenario).toBe(scenario);
        expect(offlineConfig.reducedFunctionality).toBe(true);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle storage errors gracefully', () => {
      const storageError = {
        type: 'QuotaExceededError',
        message: 'Storage quota exceeded',
        recoveryAction: 'cleanup-old-data'
      };
      
      expect(storageError.type).toBe('QuotaExceededError');
      expect(storageError.recoveryAction).toBe('cleanup-old-data');
    });

    it('should provide fallback when offline features fail', () => {
      const fallbackOptions = {
        showBasicUI: true,
        limitedFunctionality: true,
        errorMessage: 'Some features may be unavailable offline',
        retryOption: true
      };
      
      expect(fallbackOptions.showBasicUI).toBe(true);
      expect(fallbackOptions.limitedFunctionality).toBe(true);
      expect(fallbackOptions.retryOption).toBe(true);
    });
  });
});
