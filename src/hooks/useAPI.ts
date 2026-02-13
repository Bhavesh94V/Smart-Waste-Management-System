'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseAPIState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAPIOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for API calls with loading and error states
 * @param apiFunction - The async API function to call
 * @param options - Configuration options
 * @returns Object with data, isLoading, error, and refetch function
 */
export function useAPI<T>(
  apiFunction: () => Promise<T>,
  options: UseAPIOptions = {}
): UseAPIState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    isLoading: options.immediate !== false,
    error: null,
  });

  const execute = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await apiFunction();
      setState(prev => ({ ...prev, data: result, isLoading: false }));
      options.onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      options.onError?.(errorMessage);
    }
  }, [apiFunction, options]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    refetch: execute,
  };
}

/**
 * Hook for triggering API calls on demand (not immediate)
 */
export function useAPIAction<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseAPIOptions = {}
): UseAPIState<T> & { execute: (...args: any[]) => Promise<void> } {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await apiFunction(...args);
      setState(prev => ({ ...prev, data: result, isLoading: false }));
      options.onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      options.onError?.(errorMessage);
    }
  }, [apiFunction, options]);

  return {
    ...state,
    execute,
  };
}
