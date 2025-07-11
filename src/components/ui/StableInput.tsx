'use client';

import React, { useState, useCallback, memo } from 'react';

// Memoized input component to prevent unnecessary re-renders
const StableInput = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text" 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );
});

StableInput.displayName = 'StableInput';

export { StableInput };
