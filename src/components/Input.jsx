import React from 'react';

export default function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  min,
  step,
  disabled = false,
  readOnly = false,
  className = ''
}) {
  return (
    <div className={`mb-4`}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   ${disabled || readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''}
                   ${className}`}
      />
    </div>
  );
}
