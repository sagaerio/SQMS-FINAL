import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Counter } from '../lib/supabase';

/**
 * Real-time hook for service counters
 * Updates when counter status changes (active/inactive/on_break)
 */
export function useRealtimeCounters(industryId?: string) {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;

    const setupCounters = async () => {
      try {
        // Initial fetch
        let query = supabase
          .from('counters')
          .select('*')
          .order('name', { ascending: true });

        if (industryId) {
          query = query.eq('industry_id', industryId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setCounters(data || []);
        setLoading(false);

        // Subscribe to real-time changes
        channel = supabase
          .channel('counters_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'counters',
              filter: industryId ? `industry_id=eq.${industryId}` : undefined,
            },
            (payload) => {
              console.log('Counter update:', payload);

              if (payload.eventType === 'INSERT') {
                setCounters((current) => [...current, payload.new as Counter]);
              } else if (payload.eventType === 'UPDATE') {
                setCounters((current) =>
                  current.map((counter) =>
                    counter.id === (payload.new as Counter).id
                      ? (payload.new as Counter)
                      : counter
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setCounters((current) =>
                  current.filter((counter) => counter.id !== (payload.old as any).id)
                );
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up counters subscription:', err);
        setLoading(false);
      }
    };

    setupCounters();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [industryId]);

  return { counters, loading };
}
