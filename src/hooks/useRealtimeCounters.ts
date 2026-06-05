/**
 * Real-time Counters Hook - Polling-based for Django backend
 */
import { useEffect, useState } from 'react';
import { getBranchQueueCounts } from '../services/queueService';

export function useRealtimeCounters(pollingInterval = 5000) {
  const [counters, setCounters] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const { data, error: fetchError } = await getBranchQueueCounts();
        if (fetchError) {
          setError(fetchError);
        } else {
          setCounters(data);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCounters();

    // Set up polling
    const interval = setInterval(fetchCounters, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { counters, loading, error };
}
