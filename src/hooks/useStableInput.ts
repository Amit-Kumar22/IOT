import { useCallback, useRef } from 'react';

/**
 * A hook that creates stable input handlers to prevent focus loss
 * Usage: const createHandler = useStableInputHandler(setFormData);
 * Then: onChange={createHandler('fieldName')}
 */
export function useStableInputHandler<T extends Record<string, any>>(
  setState: React.Dispatch<React.SetStateAction<T>>
) {
  // Store handlers in ref to maintain reference equality
  const handlersRef = useRef<Record<string, any>>({});

  const createHandler = useCallback((fieldName: keyof T) => {
    // Return existing handler if already created
    if (handlersRef.current[fieldName as string]) {
      return handlersRef.current[fieldName as string];
    }

    // Create new stable handler
    const handler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      
      setState(prev => ({
        ...prev,
        [fieldName]: type === 'checkbox' ? checked : 
                    type === 'number' ? (value === '' ? 0 : Number(value)) : 
                    value
      }));
    };

    // Store handler for reuse
    handlersRef.current[fieldName as string] = handler;
    return handler;
  }, [setState]);

  return createHandler;
}

/**
 * Hook for object-based form handlers (like nested form data)
 */
export function useStableObjectHandler<T extends Record<string, any>>(
  setState: React.Dispatch<React.SetStateAction<T>>
) {
  const handlersRef = useRef<Record<string, any>>({});

  const createHandler = useCallback((section: keyof T, field: string) => {
    const key = `${section as string}.${field}`;
    
    if (handlersRef.current[key]) {
      return handlersRef.current[key];
    }

    const handler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      
      setState(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, any>),
          [field]: type === 'checkbox' ? checked : 
                   type === 'number' ? (value === '' ? 0 : Number(value)) : 
                   value
        }
      }));
    };

    handlersRef.current[key] = handler;
    return handler;
  }, [setState]);

  return createHandler;
}

/**
 * Simple hook for single value handlers
 */
export function useStableHandler<T>(
  setValue: (value: T) => void
) {
  return useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value, type, checked } = e.target as HTMLInputElement;
    setValue(type === 'checkbox' ? checked as T : value as T);
  }, [setValue]);
}
