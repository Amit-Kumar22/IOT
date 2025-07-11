'use client';

import React, { useState } from 'react';
import { StableForm, FormField, FormSelect, FormTextarea, useFormData } from '@/components/ui/StableForm';

const FormPreview = () => {
  const data = useFormData();
  
  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Data Preview:</h3>
      <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default function StableFormTestPage() {
  const [formData, setFormData] = useState({});

  const handleDataChange = (data: Record<string, any>) => {
    setFormData(data);
    console.log('Form data changed:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stable Form Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This form uses optimized components to prevent input focus loss.
        </p>
        
        <StableForm 
          initialData={{ role: 'user', country: 'us' }}
          onDataChange={handleDataChange}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                required
              />
              
              <FormField
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                required
              />
            </div>

            <FormField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="role"
                label="Role"
                options={[
                  { value: 'admin', label: 'Administrator' },
                  { value: 'user', label: 'User' },
                  { value: 'manager', label: 'Manager' },
                ]}
                required
              />

              <FormSelect
                name="country"
                label="Country"
                options={[
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'de', label: 'Germany' },
                ]}
                required
              />
            </div>

            <FormField
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
            />

            <FormTextarea
              name="bio"
              label="Bio"
              placeholder="Tell us about yourself..."
              rows={4}
            />

            <FormField
              name="website"
              label="Website"
              type="url"
              placeholder="https://example.com"
            />

            <FormPreview />

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => console.log('Submitting:', formData)}
              >
                Submit
              </button>
            </div>
          </div>
        </StableForm>
      </div>
    </div>
  );
}
