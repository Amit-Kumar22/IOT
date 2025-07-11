'use client';

import React, { useState, useCallback, createContext, useContext, memo } from 'react';

// Form context to manage state without prop drilling
interface FormContextType {
  data: Record<string, any>;
  updateField: (field: string, value: any) => void;
}

const FormContext = createContext<FormContextType | null>(null);

// Stable form provider that minimizes re-renders
export const StableForm = memo(({ 
  children, 
  initialData = {}, 
  onDataChange 
}: { 
  children: React.ReactNode;
  initialData?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
}) => {
  const [data, setData] = useState(initialData);

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const contextValue = {
    data,
    updateField
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
});

StableForm.displayName = 'StableForm';

// Stable input field that only re-renders when its own value changes
export const FormField = memo(({ 
  name, 
  label, 
  type = 'text', 
  placeholder,
  className = '',
  required = false
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormField must be used within StableForm');
  }

  const { data, updateField } = context;
  const value = data[name] || '';

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(name, e.target.value);
  }, [name, updateField]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
});

FormField.displayName = 'FormField';

// Stable select field
export const FormSelect = memo(({ 
  name, 
  label, 
  options, 
  placeholder,
  className = '',
  required = false
}: {
  name: string;
  label: string;
  options: { value: string; label: string; }[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormSelect must be used within StableForm');
  }

  const { data, updateField } = context;
  const value = data[name] || '';

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateField(name, e.target.value);
  }, [name, updateField]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

// Stable textarea field
export const FormTextarea = memo(({ 
  name, 
  label, 
  placeholder,
  rows = 3,
  className = '',
  required = false
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormTextarea must be used within StableForm');
  }

  const { data, updateField } = context;
  const value = data[name] || '';

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField(name, e.target.value);
  }, [name, updateField]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-vertical"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

// Hook to get form data
export const useFormData = () => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useFormData must be used within StableForm');
  }
  
  return context.data;
};
