/**
 * Performance Optimization Utilities
 * Comprehensive performance optimization for the IoT platform
 */

'use client';

import { ReactNode, useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * LazyImage Component
 * Lazy-loaded image with placeholder and error handling
 */
export function LazyImage({
  src,
  alt,
  placeholder,
  className = '',
  onLoad,
  onError,
  ...props
}: {
  src: string;
  alt: string;
  placeholder?: string | ReactNode;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  const { ref: observerRef } = useIntersectionObserver({
    threshold: 0.1,
    onIntersect: () => setIsInView(true),
    once: true
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    observerRef.current = node;
  }, [observerRef]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          {placeholder || (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={combinedRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * VirtualizedList Component
 * Efficient rendering of large lists using virtualization
 */
export function VirtualizedList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5
}: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );
    
    return items.slice(Math.max(0, startIndex - overscan), endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * LazyComponent Component
 * Lazy-loaded component with suspense
 */
export function LazyComponent({
  loader,
  fallback,
  ...props
}: {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: ReactNode;
  [key: string]: any;
}) {
  const Component = lazy(loader);
  
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Debounced Input Component
 * Input with debounced value updates
 */
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 300,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(value);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onChange, debounceMs]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

/**
 * Memoized Chart Component
 * Optimized chart rendering with memoization
 */
export const MemoizedChart = React.memo(function Chart({
  data,
  width,
  height,
  type = 'line',
  className = ''
}: {
  data: any[];
  width: number;
  height: number;
  type?: 'line' | 'bar' | 'pie';
  className?: string;
}) {
  const chartData = useMemo(() => {
    // Process chart data
    return data.map((item, index) => ({
      ...item,
      id: index,
      processed: true
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    return {
      width,
      height,
      type,
      responsive: true,
      maintainAspectRatio: false
    };
  }, [width, height, type]);

  return (
    <div className={`chart-container ${className}`}>
      <svg width={width} height={height}>
        {/* Chart implementation would go here */}
        <rect width={width} height={height} fill="transparent" />
        <text x={width / 2} y={height / 2} textAnchor="middle" className="text-sm fill-gray-500">
          Chart: {type} ({chartData.length} items)
        </text>
      </svg>
    </div>
  );
});

/**
 * InfiniteScroll Component
 * Infinite scrolling with pagination
 */
export function InfiniteScroll({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  className = '',
  threshold = 100
}: {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  className?: string;
  threshold?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleScroll = useCallback(
    debounce(() => {
      if (!containerRef.current || !hasMore || loading || isLoadingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setIsLoadingMore(true);
        loadMore();
      }
    }, 100),
    [hasMore, loading, isLoadingMore, loadMore, threshold]
  );

  useEffect(() => {
    setIsLoadingMore(false);
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div key={item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {(loading || isLoadingMore) && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No more items to load
        </div>
      )}
    </div>
  );
}

/**
 * CacheProvider Component
 * Simple in-memory cache for API responses
 */
export function CacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const get = useCallback((key: string, maxAge = 5 * 60 * 1000) => {
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }, []);

  const set = useCallback((key: string, data: any) => {
    cache.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  // Provide cache methods through context if needed
  const value = { get, set, clear };

  return <>{children}</>;
}

/**
 * OptimizedTable Component
 * Optimized table with virtual scrolling
 */
export function OptimizedTable({
  columns,
  data,
  rowHeight = 50,
  headerHeight = 40,
  maxHeight = 400,
  className = ''
}: {
  columns: Array<{
    key: string;
    title: string;
    width?: number;
    render?: (value: any, record: any) => ReactNode;
  }>;
  data: any[];
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number;
  className?: string;
}) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex" style={{ height: headerHeight }}>
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center px-4 py-2 font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ width: column.width || 'auto', minWidth: column.width || 100 }}
              onClick={() => handleSort(column.key)}
            >
              {column.title}
              {sortColumn === column.key && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <VirtualizedList
        items={sortedData}
        itemHeight={rowHeight}
        containerHeight={maxHeight}
        renderItem={(record, index) => (
          <div className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            {columns.map((column) => (
              <div
                key={column.key}
                className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 truncate"
                style={{ width: column.width || 'auto', minWidth: column.width || 100 }}
              >
                {column.render ? column.render(record[column.key], record) : record[column.key]}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize
      }));
    }

    return () => {
      observer.disconnect();
      const endTime = performance.now();
      console.log(`Component lifecycle: ${endTime - startTime}ms`);
    };
  }, []);

  return metrics;
}

/**
 * Utility function for debouncing
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Utility function for throttling
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export {
  debounce,
  throttle
};

export default {
  LazyImage,
  VirtualizedList,
  LazyComponent,
  DebouncedInput,
  MemoizedChart,
  InfiniteScroll,
  CacheProvider,
  OptimizedTable,
  usePerformanceMonitor,
  debounce,
  throttle
};
