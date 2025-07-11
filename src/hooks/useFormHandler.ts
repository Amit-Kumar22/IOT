import { useCallback } from 'react';

/**
 * Custom hook for stable form input handlers
 * Prevents input focus loss by memoizing change handlers
 */
export function useFormHandler<T extends Record<string, any>>(
  setter: React.Dispatch<React.SetStateAction<T>>
) {
  const handleChange = useCallback((field: keyof T) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      setter(prev => ({
        ...prev,
        [field]: type === 'checkbox' ? checked : 
                 type === 'number' ? (value === '' ? '' : Number(value)) : 
                 value
      }));
    }, [setter]);

  const handleObjectChange = useCallback((section: keyof T) => 
    (field: string, value: any) => {
      setter(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, any>),
          [field]: value
        }
      }));
    }, [setter]);

  return { handleChange, handleObjectChange };
}
