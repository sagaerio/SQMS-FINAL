/**
 * Real-time Subscription Hook - Polling-based for Django backend
 * Generic polling hook for any async function
 */
import { useEffect, useState } from 'react';

export function useRealtimeSubscription<T>(
  fetchFunction: () => Promise<{ data: T | null; error: Error | null }>,
  pollingInterval = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: fetchError } = await fetchFunction();
        if (fetchError) {
          setError(fetchError);
        } else {
          setData(result);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchFunction, pollingInterval]);

  return { data, loading, error };
}
