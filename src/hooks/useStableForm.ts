import { useCallback, useRef, useMemo } from 'react';

/**
 * Enhanced stable form hook with focus preservation
 * Prevents input focus loss by maintaining stable function references
 * 
 * Usage:
 * const { formData, setFormData, createHandler, resetForm } = useStableForm(initialData);
 * <input onChange={createHandler('fieldName')} value={formData.fieldName} />
 */
export function useStableForm<T extends Record<string, any>>(
  initialData: T,
  onFieldChange?: (field: keyof T, value: any, formData: T) => void
) {
  const [formData, setFormData] = React.useState<T>(initialData);
  const handlersRef = useRef<Record<string, any>>({});
  const errorsRef = useRef<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Create stable input handler that preserves focus
  const createHandler = useCallback((fieldName: keyof T) => {
    const key = fieldName as string;
    
    // Return existing handler if already created
    if (handlersRef.current[key]) {
      return handlersRef.current[key];
    }

    // Create new stable handler
    const handler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      const newValue = type === 'checkbox' ? checked : 
                       type === 'number' ? (value === '' ? 0 : Number(value)) : 
                       value;

      setFormData(prev => {
        const newFormData = { ...prev, [fieldName]: newValue };
        onFieldChange?.(fieldName, newValue, newFormData);
        return newFormData;
      });

      // Clear field error on change
      setErrors(prev => {
        if (prev[key]) {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        }
        return prev;
      });
    };

    // Store handler for reuse
    handlersRef.current[key] = handler;
    return handler;
  }, [onFieldChange]);

  // Create value-based handler for direct value setting
  const createValueHandler = useCallback((fieldName: keyof T) => {
    const key = `${fieldName as string}_value`;
    
    if (handlersRef.current[key]) {
      return handlersRef.current[key];
    }

    const handler = (value: any) => {
      setFormData(prev => {
        const newFormData = { ...prev, [fieldName]: value };
        onFieldChange?.(fieldName, value, newFormData);
        return newFormData;
      });

      // Clear field error on change
      setErrors(prev => {
        if (prev[fieldName as string]) {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        }
        return prev;
      });
    };

    handlersRef.current[key] = handler;
    return handler;
  }, [onFieldChange]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    // Clear handlers cache to prevent stale closures
    handlersRef.current = {};
  }, [initialData]);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  // Set multiple errors
  const setFieldErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Update form data programmatically
  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    createHandler,
    createValueHandler,
    resetForm,
    errors,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    updateFormData,
    hasErrors: Object.keys(errors).length > 0
  };
}

/**
 * Simple stable input hook for single values
 */
export function useStableInput<T>(
  initialValue: T,
  onChange?: (value: T) => void
) {
  const [value, setValue] = React.useState<T>(initialValue);
  
  const handler = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value: inputValue, type, checked } = e.target as HTMLInputElement;
    const newValue = (type === 'checkbox' ? checked : 
                     type === 'number' ? (inputValue === '' ? 0 : Number(inputValue)) : 
                     inputValue) as T;
    
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const valueHandler = useCallback((newValue: T) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    handler,
    valueHandler,
    reset,
    setValue
  };
}

/**
 * Hook for array form data (like lists of items)
 */
export function useStableArrayForm<T>(
  initialData: T[],
  onArrayChange?: (items: T[]) => void
) {
  const [items, setItems] = React.useState<T[]>(initialData);
  const handlersRef = useRef<Record<string, any>>({});

  const createItemHandler = useCallback((index: number, field: keyof T) => {
    const key = `${index}_${field as string}`;
    
    if (handlersRef.current[key]) {
      return handlersRef.current[key];
    }

    const handler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      const newValue = type === 'checkbox' ? checked : 
                       type === 'number' ? (value === '' ? 0 : Number(value)) : 
                       value;

      setItems(prev => {
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], [field]: newValue };
        onArrayChange?.(newItems);
        return newItems;
      });
    };

    handlersRef.current[key] = handler;
    return handler;
  }, [onArrayChange]);

  const addItem = useCallback((item: T) => {
    setItems(prev => {
      const newItems = [...prev, item];
      onArrayChange?.(newItems);
      return newItems;
    });
  }, [onArrayChange]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      onArrayChange?.(newItems);
      return newItems;
    });
  }, [onArrayChange]);

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      onArrayChange?.(newItems);
      return newItems;
    });
  }, [onArrayChange]);

  const resetArray = useCallback(() => {
    setItems(initialData);
    handlersRef.current = {};
  }, [initialData]);

  return {
    items,
    setItems,
    createItemHandler,
    addItem,
    removeItem,
    updateItem,
    resetArray
  };
}

// Import React at the top level to avoid issues
import React from 'react';
