import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Generic hook for subscribing to real-time updates on any table
 *
 * @example
 * // Subscribe to queue tickets for a specific industry
 * const tickets = useRealtimeSubscription(
 *   'queue_tickets',
 *   '*',
 *   'industry_id=eq.banking'
 * );
 *
 * @example
 * // Subscribe to all counter updates
 * const counters = useRealtimeSubscription('counters', '*');
 */
export function useRealtimeSubscription<T = any>(
  table: string,
  select: string = '*',
  filter?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      try {
        // Initial fetch
        let query = supabase.from(table).select(select);

        if (filter) {
          // Apply filter if provided (e.g., 'industry_id=eq.banking')
          const [column, operation, value] = filter.split(/[.=]/);
          if (operation === 'eq') {
            query = query.eq(column, value);
          }
        }

        const { data: initialData, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setData(initialData || []);
        setLoading(false);

        // Set up real-time subscription
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events: INSERT, UPDATE, DELETE
              schema: 'public',
              table: table,
              filter: filter,
            },
            (payload) => {
              console.log(`Real-time ${payload.eventType} on ${table}:`, payload);

              if (payload.eventType === 'INSERT') {
                setData((current) => [...current, payload.new as T]);
              } else if (payload.eventType === 'UPDATE') {
                setData((current) =>
                  current.map((item: any) =>
                    item.id === (payload.new as any).id ? (payload.new as T) : item
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setData((current) =>
                  current.filter((item: any) => item.id !== (payload.old as any).id)
                );
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error(`Error setting up ${table} subscription:`, err);
        setError(err as Error);
        setLoading(false);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, select, filter]);

  return { data, loading, error };
}
