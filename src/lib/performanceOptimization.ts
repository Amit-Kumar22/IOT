/**
 * Performance Optimization Utilities
 * Code splitting, lazy loading, and bundle optimization
 */

import { performanceMonitor, MetricType } from './performance';
import { errorReporter, ErrorSeverity, ErrorCategory } from './errorReporting';

// Performance optimization configuration
interface PerformanceOptimizationConfig {
  enableCodeSplitting: boolean;
  enableLazyLoading: boolean;
  enablePrefetching: boolean;
  enableServiceWorker: boolean;
  chunkSizeLimit: number;
  cacheMaxAge: number;
  compressionLevel: number;
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableGzip: boolean;
  enableBrotli: boolean;
  preloadImages: boolean;
  optimizeImages: boolean;
  enableWebP: boolean;
  enableHTTP2Push: boolean;
}

// Default optimization configuration
const defaultPerformanceOptimizationConfig: PerformanceOptimizationConfig = {
  enableCodeSplitting: true,
  enableLazyLoading: true,
  enablePrefetching: true,
  enableServiceWorker: true,
  chunkSizeLimit: 244 * 1024, // 244KB
  cacheMaxAge: 86400000, // 24 hours
  compressionLevel: 6,
  enableTreeShaking: true,
  enableMinification: true,
  enableGzip: true,
  enableBrotli: true,
  preloadImages: true,
  optimizeImages: true,
  enableWebP: true,
  enableHTTP2Push: false,
};

// Resource types for optimization
export enum ResourceType {
  SCRIPT = 'script',
  STYLE = 'style',
  IMAGE = 'image',
  FONT = 'font',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  WORKER = 'worker',
}

// Loading strategies
export enum LoadingStrategy {
  EAGER = 'eager',
  LAZY = 'lazy',
  PREFETCH = 'prefetch',
  PRELOAD = 'preload',
  DEFER = 'defer',
}

// Performance optimization metrics
interface PerformanceOptimizationMetrics {
  bundleSize: number;
  loadTime: number;
  chunkCount: number;
  cacheHitRate: number;
  compressionRatio: number;
  imageOptimizationSavings: number;
  lazyLoadingSavings: number;
  codeSplittingSavings: number;
}

/**
 * Performance Optimization Manager
 * Handles all performance optimization strategies
 */
export class PerformanceOptimizationManager {
  private config: PerformanceOptimizationConfig;
  private resourceCache = new Map<string, { data: any; timestamp: number; type: ResourceType }>();
  private loadingQueue: Array<{ url: string; strategy: LoadingStrategy; callback?: () => void }> = [];
  private observerMap = new Map<string, IntersectionObserver>();
  private preloadedResources = new Set<string>();
  private metrics: PerformanceOptimizationMetrics = {
    bundleSize: 0,
    loadTime: 0,
    chunkCount: 0,
    cacheHitRate: 0,
    compressionRatio: 0,
    imageOptimizationSavings: 0,
    lazyLoadingSavings: 0,
    codeSplittingSavings: 0,
  };

  constructor(config: Partial<PerformanceOptimizationConfig> = {}) {
    this.config = { ...defaultPerformanceOptimizationConfig, ...config };
    this.initializeOptimizations();
  }

  /**
   * Initialize optimization strategies
   */
  private initializeOptimizations(): void {
    if (typeof window !== 'undefined') {
      // Initialize lazy loading
      if (this.config.enableLazyLoading) {
        this.initializeLazyLoading();
      }

      // Initialize prefetching
      if (this.config.enablePrefetching) {
        this.initializePrefetching();
      }

      // Initialize service worker
      if (this.config.enableServiceWorker) {
        this.initializeServiceWorker();
      }

      // Initialize image optimization
      if (this.config.optimizeImages) {
        this.initializeImageOptimization();
      }

      // Start performance monitoring
      this.startPerformanceMonitoring();
    }
  }

  /**
   * Initialize lazy loading
   */
  private initializeLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              this.loadResource(element);
              observer.unobserve(element);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );

      this.observerMap.set('lazy-loading', observer);

      // Observe all lazy loadable elements
      document.querySelectorAll('[data-lazy]').forEach((element) => {
        observer.observe(element);
      });
    }
  }

  /**
   * Initialize prefetching
   */
  private initializePrefetching(): void {
    // Prefetch resources based on user behavior
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.prefetchCriticalResources();
      });
    } else {
      setTimeout(() => {
        this.prefetchCriticalResources();
      }, 100);
    }
  }

  /**
   * Initialize service worker
   */
  private initializeServiceWorker(): void {
    if ('serviceWorker' in navigator && 'caches' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          this.recordMetric('service_worker_registration', 1, MetricType.COUNTER);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          this.reportError(error, 'service_worker_registration');
        });
    }
  }

  /**
   * Initialize image optimization
   */
  private initializeImageOptimization(): void {
    // Convert images to WebP if supported
    if (this.config.enableWebP && this.supportsWebP()) {
      this.convertImagesToWebP();
    }

    // Optimize image loading
    this.optimizeImageLoading();
  }

  /**
   * Lazy load component with dynamic import
   */
  async lazyLoadComponent<T>(
    importFunction: () => Promise<{ default: T }>,
    componentName: string
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Check if component is already cached
      const cacheKey = `component:${componentName}`;
      const cached = this.resourceCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        this.recordMetric('component_cache_hit', 1, MetricType.COUNTER);
        return cached.data;
      }

      // Import component
      const module = await importFunction();
      const component = module.default;

      // Cache component
      this.resourceCache.set(cacheKey, {
        data: component,
        timestamp: Date.now(),
        type: ResourceType.SCRIPT,
      });

      // Record metrics
      const loadTime = performance.now() - startTime;
      this.recordMetric('component_load_time', loadTime, MetricType.TIMING, {
        component: componentName,
      });

      this.recordMetric('component_lazy_load', 1, MetricType.COUNTER, {
        component: componentName,
      });

      return component;
    } catch (error) {
      this.reportError(error as Error, 'component_lazy_load', { componentName });
      throw error;
    }
  }

  /**
   * Preload critical resources
   */
  preloadResource(url: string, type: ResourceType, priority: 'high' | 'low' = 'low'): void {
    if (this.preloadedResources.has(url)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.crossOrigin = 'anonymous';

    switch (type) {
      case ResourceType.SCRIPT:
        link.as = 'script';
        break;
      case ResourceType.STYLE:
        link.as = 'style';
        break;
      case ResourceType.IMAGE:
        link.as = 'image';
        break;
      case ResourceType.FONT:
        link.as = 'font';
        break;
      case ResourceType.AUDIO:
        link.as = 'audio';
        break;
      case ResourceType.VIDEO:
        link.as = 'video';
        break;
      case ResourceType.DOCUMENT:
        link.as = 'document';
        break;
      case ResourceType.WORKER:
        link.as = 'worker';
        break;
    }

    if (priority === 'high') {
      link.setAttribute('importance', 'high');
    }

    document.head.appendChild(link);
    this.preloadedResources.add(url);

    this.recordMetric('resource_preload', 1, MetricType.COUNTER, {
      type: type.toString(),
      priority,
    });
  }

  /**
   * Prefetch resource for future navigation
   */
  prefetchResource(url: string, type: ResourceType): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.crossOrigin = 'anonymous';

    switch (type) {
      case ResourceType.SCRIPT:
        link.as = 'script';
        break;
      case ResourceType.STYLE:
        link.as = 'style';
        break;
      case ResourceType.IMAGE:
        link.as = 'image';
        break;
      case ResourceType.FONT:
        link.as = 'font';
        break;
      case ResourceType.DOCUMENT:
        link.as = 'document';
        break;
    }

    document.head.appendChild(link);

    this.recordMetric('resource_prefetch', 1, MetricType.COUNTER, {
      type: type.toString(),
    });
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      
      // Add loading attribute
      element.loading = 'lazy';
      
      // Add intersection observer for lazy loading
      const observer = this.observerMap.get('lazy-loading');
      if (observer) {
        observer.observe(element);
      }
    });
  }

  /**
   * Convert images to WebP format
   */
  private convertImagesToWebP(): void {
    const images = document.querySelectorAll('img[src]');
    
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      const originalSrc = element.src;
      
      // Only convert if not already WebP
      if (!originalSrc.includes('.webp')) {
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Test if WebP version exists
        const testImg = new Image();
        testImg.onload = () => {
          element.src = webpSrc;
          this.recordMetric('image_webp_conversion', 1, MetricType.COUNTER);
        };
        testImg.onerror = () => {
          // Keep original if WebP not available
        };
        testImg.src = webpSrc;
      }
    });
  }

  /**
   * Check if WebP is supported
   */
  private supportsWebP(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      return dataURL ? dataURL.indexOf('data:image/webp') === 0 : false;
    } catch (error) {
      // In test environments or when canvas is not available, assume WebP is not supported
      return false;
    }
  }

  /**
   * Load resource with optimization
   */
  private loadResource(element: HTMLElement): void {
    const src = element.getAttribute('data-src');
    const type = element.getAttribute('data-type') as ResourceType;
    
    if (!src) return;

    const startTime = performance.now();

    switch (element.tagName.toLowerCase()) {
      case 'img':
        this.loadImage(element as HTMLImageElement, src);
        break;
      case 'script':
        this.loadScript(element as HTMLScriptElement, src);
        break;
      case 'link':
        this.loadStylesheet(element as HTMLLinkElement, src);
        break;
      case 'iframe':
        this.loadIframe(element as HTMLIFrameElement, src);
        break;
    }

    // Record load time
    const loadTime = performance.now() - startTime;
    this.recordMetric('resource_load_time', loadTime, MetricType.TIMING, {
      type: type || 'unknown',
    });
  }

  /**
   * Load image with optimization
   */
  private loadImage(img: HTMLImageElement, src: string): void {
    const startTime = performance.now();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric('image_load_time', loadTime, MetricType.TIMING);
      this.recordMetric('image_lazy_load', 1, MetricType.COUNTER);
      
      // Remove data-src attribute
      img.removeAttribute('data-src');
    };

    img.onerror = () => {
      this.reportError(new Error(`Failed to load image: ${src}`), 'image_load');
    };

    // Add loading animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    img.src = src;
    
    img.onload = () => {
      img.style.opacity = '1';
    };
  }

  /**
   * Load script with optimization
   */
  private loadScript(script: HTMLScriptElement, src: string): void {
    const startTime = performance.now();
    
    script.onload = () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric('script_load_time', loadTime, MetricType.TIMING);
      this.recordMetric('script_lazy_load', 1, MetricType.COUNTER);
    };

    script.onerror = () => {
      this.reportError(new Error(`Failed to load script: ${src}`), 'script_load');
    };

    script.src = src;
  }

  /**
   * Load stylesheet with optimization
   */
  private loadStylesheet(link: HTMLLinkElement, href: string): void {
    const startTime = performance.now();
    
    link.onload = () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric('stylesheet_load_time', loadTime, MetricType.TIMING);
      this.recordMetric('stylesheet_lazy_load', 1, MetricType.COUNTER);
    };

    link.onerror = () => {
      this.reportError(new Error(`Failed to load stylesheet: ${href}`), 'stylesheet_load');
    };

    link.href = href;
  }

  /**
   * Load iframe with optimization
   */
  private loadIframe(iframe: HTMLIFrameElement, src: string): void {
    const startTime = performance.now();
    
    iframe.onload = () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric('iframe_load_time', loadTime, MetricType.TIMING);
      this.recordMetric('iframe_lazy_load', 1, MetricType.COUNTER);
    };

    iframe.onerror = () => {
      this.reportError(new Error(`Failed to load iframe: ${src}`), 'iframe_load');
    };

    iframe.src = src;
  }

  /**
   * Prefetch critical resources
   */
  private prefetchCriticalResources(): void {
    // Prefetch commonly used resources
    const criticalResources = [
      { url: '/api/user/profile', type: ResourceType.DOCUMENT },
      { url: '/api/devices', type: ResourceType.DOCUMENT },
      { url: '/api/analytics/dashboard', type: ResourceType.DOCUMENT },
    ];

    criticalResources.forEach(({ url, type }) => {
      this.prefetchResource(url, type);
    });
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.config.cacheMaxAge;
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor bundle size
    this.monitorBundleSize();
    
    // Monitor load times
    this.monitorLoadTimes();
    
    // Monitor cache performance
    this.monitorCachePerformance();
  }

  /**
   * Monitor bundle size
   */
  private monitorBundleSize(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        const navigation = entries[0];
        this.metrics.bundleSize = navigation.transferSize || 0;
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        this.recordMetric('bundle_size', this.metrics.bundleSize, MetricType.GAUGE);
        this.recordMetric('page_load_time', this.metrics.loadTime, MetricType.TIMING);
      }
    }
  }

  /**
   * Monitor load times
   */
  private monitorLoadTimes(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource_load_time', resourceEntry.duration, MetricType.TIMING, {
              name: resourceEntry.name,
              type: this.getResourceType(resourceEntry.name),
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Monitor cache performance
   */
  private monitorCachePerformance(): void {
    const cacheHits = this.resourceCache.size;
    const totalRequests = cacheHits + this.preloadedResources.size;
    
    if (totalRequests > 0) {
      this.metrics.cacheHitRate = (cacheHits / totalRequests) * 100;
      this.recordMetric('cache_hit_rate', this.metrics.cacheHitRate, MetricType.GAUGE);
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return 'script';
      case 'css':
        return 'style';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'audio';
      case 'mp4':
      case 'webm':
      case 'ogg':
        return 'video';
      default:
        return 'document';
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(name: string, value: number, type: MetricType, tags?: Record<string, string>): void {
    performanceMonitor.recordMetric(name, value, type, tags);
  }

  /**
   * Report error
   */
  private reportError(error: Error, context: string, additionalData?: Record<string, any>): void {
    errorReporter.reportError(error, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.PERFORMANCE,
      source: 'performance_optimization_manager',
      context: {
        timestamp: Date.now(),
        additionalData: {
          context,
          ...additionalData,
        },
      },
      tags: ['optimization', 'performance'],
    });
  }

  /**
   * Get optimization metrics
   */
  getPerformanceOptimizationMetrics(): PerformanceOptimizationMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.resourceCache.clear();
    this.preloadedResources.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default performance optimization manager instance
export const performanceOptimizationManager = new PerformanceOptimizationManager();

// Export types
export type {
  PerformanceOptimizationConfig,
  PerformanceOptimizationMetrics,
};
