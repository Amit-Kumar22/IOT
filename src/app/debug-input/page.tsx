'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StableInput } from '@/components/ui/StableInput';

export default function DebugInputPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const renderCountRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);
    console.log('Component rendered:', renderCountRef.current);
  });

  const handleNameChange = useCallback((value: string) => {
    console.log('Name changing to:', value);
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    console.log('Email changing to:', value);
    setFormData(prev => ({ ...prev, email: value }));
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    console.log('Phone changing to:', value);
    setFormData(prev => ({ ...prev, phone: value }));
  }, []);

  // Regular input for comparison
  const handleRegularChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`${name} changing to:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Render Count: {renderCount}
          </p>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Debug Input Focus</h1>
        
        <div className="space-y-4">
          <StableInput
            label="Name (Stable Component)"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Enter your name"
          />

          <StableInput
            label="Email (Stable Component)"  
            value={formData.email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            type="email"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone (Regular Input)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleRegularChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter your phone"
            />
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Data:</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
