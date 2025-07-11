'use client';

import React, { useState, useCallback } from 'react';

export default function MinimalInputPage() {
  const [value, setValue] = useState('');
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Minimal Input Test</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input (No Providers)
            </label>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type something..."
              autoFocus
            />
          </div>
          <div className="pt-4">
            <p className="text-sm text-gray-600">Value: {value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
