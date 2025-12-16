import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        )}

        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-12 px-4 ${Icon ? 'pl-11' : ''}
            bg-white dark:bg-gray-700
            border-2 ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}
            rounded-xl
            text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400
            disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            transition-all duration-200
            text-base
            shadow-sm hover:shadow-md
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;