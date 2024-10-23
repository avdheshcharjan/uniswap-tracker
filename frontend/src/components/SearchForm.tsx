

import React, { useState, useCallback } from 'react';
import { formatISO } from 'date-fns';
import { SearchParams } from '../types/transaction';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  initialValues?: SearchParams;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, 
  isLoading = false, 
  initialValues = {} 
}) => {
  // State for form values
  const [formData, setFormData] = useState<SearchParams>({
    hash: initialValues.hash || '',
    fromTimestamp: initialValues.fromTimestamp || '',
    toTimestamp: initialValues.toTimestamp || '',
  });

  // State for validation errors
  const [errors, setErrors] = useState<{
    hash?: string;
    fromTimestamp?: string;
    toTimestamp?: string;
    dateRange?: string;
  }>({});

  // Validate hash format
  const validateHash = (hash: string): boolean => {
    if (hash && !hash.match(/^0x[a-fA-F0-9]{64}$/)) {
      setErrors(prev => ({
        ...prev,
        hash: 'Invalid transaction hash format. Should start with 0x followed by 64 hexadecimal characters.'
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, hash: undefined }));
    return true;
  };

  // Validate date range
  const validateDateRange = (from: string, to: string): boolean => {
    if (from && to && new Date(from) > new Date(to)) {
      setErrors(prev => ({
        ...prev,
        dateRange: 'From date must be before or equal to To date'
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, dateRange: undefined }));
    return true;
  };

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate hash if provided
    if (formData.hash && !validateHash(formData.hash)) {
      return;
    }

    // Validate date range if both dates are provided
    if (formData.fromTimestamp && formData.toTimestamp) {
      if (!validateDateRange(formData.fromTimestamp, formData.toTimestamp)) {
        return;
      }
    }

    // Format dates to ISO string if they exist
    const searchParams: SearchParams = {
      ...formData,
      fromTimestamp: formData.fromTimestamp 
        ? formatISO(new Date(formData.fromTimestamp))
        : undefined,
      toTimestamp: formData.toTimestamp
        ? formatISO(new Date(formData.toTimestamp))
        : undefined,
    };

    onSearch(searchParams);
  }, [formData, onSearch]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setFormData({
      hash: '',
      fromTimestamp: '',
      toTimestamp: '',
    });
    setErrors({});
    onSearch({});
  }, [onSearch]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear related errors
    if (name === 'hash') {
      setErrors(prev => ({ ...prev, hash: undefined }));
    } else if (['fromTimestamp', 'toTimestamp'].includes(name)) {
      setErrors(prev => ({ ...prev, dateRange: undefined }));
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 mb-8"
    >
      <div className="space-y-6">
        {/* Transaction Hash Input */}
        <div>
          <label 
            htmlFor="hash"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transaction Hash
          </label>
          <input
            id="hash"
            name="hash"
            type="text"
            value={formData.hash}
            onChange={handleInputChange}
            placeholder="0x..."
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.hash ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.hash && (
            <p className="mt-1 text-sm text-red-600">{errors.hash}</p>
          )}
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="fromTimestamp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From Date
            </label>
            <input
              id="fromTimestamp"
              name="fromTimestamp"
              type="datetime-local"
              value={formData.fromTimestamp}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dateRange ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label 
              htmlFor="toTimestamp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To Date
            </label>
            <input
              id="toTimestamp"
              name="toTimestamp"
              type="datetime-local"
              value={formData.toTimestamp}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dateRange ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Date Range Error */}
        {errors.dateRange && (
          <p className="text-sm text-red-600">{errors.dateRange}</p>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg 
                  className="w-4 h-4 mr-2 animate-spin" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;           