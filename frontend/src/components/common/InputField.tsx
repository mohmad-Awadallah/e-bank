
'use client';

import { useState } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';
import { FormFieldProps } from '@/types/auth';

export const FormField = ({
  label,
  id,
  name,
  type,
  placeholder,
  Icon,
  error,
  status,
  onChange,
  rightElement,
  onBlur,
  autoComplete,
  value,
}: FormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputClassName = `
    w-full px-4 py-2 rounded-md border transition-all pr-10
    ${Icon ? 'pl-10' : 'pl-3'}
    ${error 
      ? 'border-red-500 ring-red-200' 
      : isFocused 
        ? 'border-blue-500 ring-2 ring-blue-200' 
        : 'border-gray-300'}
    focus:outline-none
  `;

  

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 ${
              isFocused ? 'text-blue-500' : ''
            }`}
          />
        )}

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className={inputClassName}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={`${id}-error`}
          value={value}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
          {status === 'checking' && <FaSpinner className="animate-spin text-yellow-500" />}
          {status === 'valid' && <FaCheckCircle className="text-green-500 animate-pop-in" />}
          {status === 'error' && <FaTimesCircle className="text-red-500 animate-pop-in" />}
          {rightElement}
        </div>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-red-500 text-xs mt-1 animate-slide-down"
        >
          {error}
        </p>
      )}
    </div>
  );
};
