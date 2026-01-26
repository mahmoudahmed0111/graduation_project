import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface UseAsyncOperationOptions<TData, TError = Error> {
  operation: (data: TData) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: TError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncOperation<TData, TError = Error>({
  operation,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: UseAsyncOperationOptions<TData, TError>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const execute = useCallback(
    async (data: TData) => {
      try {
        setLoading(true);
        setError(null);
        await operation(data);
        onSuccess?.();
        if (successMessage) {
          // Success message will be handled by toast store if provided
        }
      } catch (err) {
        const operationError = (err as TError) || (new Error('Unknown error') as TError);
        setError(operationError);
        logger.error(errorMessage || 'Operation failed', {
          context: 'useAsyncOperation',
          error: err,
        });
        onError?.(operationError);
      } finally {
        setLoading(false);
      }
    },
    [operation, onSuccess, onError, successMessage, errorMessage]
  );

  return { execute, loading, error };
}

