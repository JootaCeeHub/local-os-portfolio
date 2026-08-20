import { useState, useCallback } from 'react';
import React from 'react';
import { useNotificationsStore } from '../store/notifications';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);
  const { addNotification } = useNotificationsStore();

  const handleError = useCallback((error: Error | string, code?: string, details?: any) => {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      code,
      details,
      timestamp: new Date(),
    };

    setError(appError);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', appError);
    }

    // Show user-friendly notification
    addNotification({
      title: 'Error',
      message: appError.message,
      type: 'error',
      category: 'system',
    });

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error);
  }, [addNotification]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryAction = useCallback((action: () => void | Promise<void>) => {
    clearError();
    try {
      const result = action();
      if (result instanceof Promise) {
        result.catch(handleError);
      }
    } catch (err) {
      handleError(err as Error);
    }
  }, [clearError, handleError]);

  return {
    error,
    handleError,
    clearError,
    retryAction,
    hasError: error !== null,
  };
};

// Global error boundary hook
export const useGlobalErrorHandler = () => {
  const { handleError } = useErrorHandler();

  // Handle unhandled promise rejections
  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    handleError(event.reason, 'UNHANDLED_PROMISE_REJECTION');
    event.preventDefault();
  }, [handleError]);

  // Handle global errors
  const handleGlobalError = useCallback((event: ErrorEvent) => {
    handleError(event.error || event.message, 'GLOBAL_ERROR', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }, [handleError]);

  // Set up global error handlers
  React.useEffect(() => {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleUnhandledRejection, handleGlobalError]);
};