import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  onSubmit,
  initialValues = {},
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions<T>) => {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isValid, setIsValid] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
    
    // Validate on change if enabled
    if (validateOnChange) {
      validateField(field as string, value);
    }
  }, [validateOnChange]);

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field));
    
    // Validate on blur if enabled
    if (validateOnBlur && values[field as keyof T] !== undefined) {
      validateField(field, values[field as keyof T]);
    }
  }, [validateOnBlur, values]);

  const validateField = useCallback((field: string, value: any) => {
    try {
      const fieldSchema = (schema as any).shape?.[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => prev.filter(error => error.field !== field));
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError: ValidationError = {
          field,
          message: error.errors[0]?.message || 'Invalid value',
        };
        setErrors(prev => [
          ...prev.filter(e => e.field !== field),
          fieldError,
        ]);
        return false;
      }
    }
    return true;
  }, [schema]);

  const validate = useCallback(() => {
    try {
      schema.parse(values);
      setErrors([]);
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        setErrors(validationErrors);
        setIsValid(false);
        return false;
      }
      setIsValid(false);
      return false;
    }
  }, [schema, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) {
      // Mark all fields as touched to show errors
      const allFields = Object.keys(values);
      setTouched(new Set(allFields));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values as T);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add error handling here
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouched(new Set());
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  const getFieldError = useCallback((field: string) => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  const isFieldTouched = useCallback((field: string) => {
    return touched.has(field);
  }, [touched]);

  const hasFieldError = useCallback((field: string) => {
    return errors.some(error => error.field === field);
  }, [errors]);

  const getFieldProps = useCallback((field: string) => ({
    value: values[field as keyof T] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field as keyof T, e.target.value);
    },
    onBlur: () => setFieldTouched(field),
    error: hasFieldError(field),
    'aria-invalid': hasFieldError(field),
    'aria-describedby': hasFieldError(field) ? `${field}-error` : undefined,
  }), [values, setValue, setFieldTouched, hasFieldError]);

  return {
    values,
    errors,
    isSubmitting,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    validateField,
    validate,
    handleSubmit,
    reset,
    getFieldError,
    isFieldTouched,
    hasFieldError,
    getFieldProps,
  };
};

// Enhanced common validation schemas with better error messages
export const commonSchemas = {
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  
  required: z.string()
    .min(1, 'Este campo es requerido')
    .trim(),
  
  optionalString: z.string().optional().or(z.literal('')),
  
  url: z.string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Número de teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  date: z.string()
    .refine(date => !isNaN(Date.parse(date)), 'Fecha inválida'),
  
  positiveNumber: z.number()
    .positive('Debe ser un número positivo')
    .finite('Debe ser un número válido'),
  
  nonNegativeNumber: z.number()
    .min(0, 'No puede ser negativo')
    .finite('Debe ser un número válido'),
  
  integer: z.number()
    .int('Debe ser un número entero')
    .finite('Debe ser un número válido'),
  
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones'),
  
  hexColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Debe ser un color hexadecimal válido'),
};

// Utility function for conditional validation
export const conditionalSchema = <T>(
  condition: (data: T) => boolean,
  schema: z.ZodSchema<any>
) => {
  return z.any().refine((data) => {
    if (condition(data)) {
      return schema.safeParse(data).success;
    }
    return true;
  });
};

// Utility for async validation
export const asyncValidation = <T>(
  validator: (value: T) => Promise<boolean>,
  message: string = 'Validation failed'
) => {
  return z.any().refine(async (value) => {
    return await validator(value);
  }, { message });
};