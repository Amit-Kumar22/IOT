/**
 * Intersection Observer Hook
 * Custom hook for intersection observer with lazy loading support
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
  once?: boolean;
  enabled?: boolean;
}

export function useIntersectionObserver({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  onIntersect,
  onLeave,
  once = false,
  enabled = true
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((element: Element | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isCurrentlyIntersecting = entry.isIntersecting;
          setIsIntersecting(isCurrentlyIntersecting);

          if (isCurrentlyIntersecting) {
            setHasIntersected(true);
            onIntersect?.(entry);
            
            if (once) {
              observer.disconnect();
            }
          } else {
            onLeave?.(entry);
          }
        });
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, onIntersect, onLeave, once, enabled]);

  return {
    ref: setRef,
    isIntersecting,
    hasIntersected
  };
}

export default useIntersectionObserver;
