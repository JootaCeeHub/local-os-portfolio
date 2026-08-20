import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  success,
  required,
  children,
  description,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      
      <div className="relative">
        {children}
        
        {/* Success indicator */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-1 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input: React.FC<InputProps> = React.memo(({ 
  error, 
  success, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'input';
  const statusClasses = error ? 'input-error' : success ? 'input-success' : '';
  
  return (
    <input
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export const Textarea: React.FC<TextareaProps> = React.memo(({ 
  error, 
  success, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'input min-h-[100px] resize-vertical';
  const statusClasses = error ? 'input-error' : success ? 'input-success' : '';
  
  return (
    <textarea
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  success?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = React.memo(({ 
  error, 
  success, 
  options,
  placeholder,
  className = '', 
  ...props 
}) => {
  const baseClasses = 'input';
  const statusClasses = error ? 'input-error' : success ? 'input-success' : '';
  
  return (
    <select
      className={`${baseClasses} ${statusClasses} ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = React.memo(({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="spinner h-4 w-4 mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';