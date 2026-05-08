import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { QueueTicket } from '../lib/supabase';

/**
 * Real-time hook for queue tickets
 * Automatically updates when tickets are created, updated, or deleted
 */
export function useRealtimeQueue(industryId?: string) {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;

    const setupQueue = async () => {
      try {
        // Initial fetch
        let query = supabase
          .from('queue_tickets')
          .select('*')
          .order('position', { ascending: true });

        if (industryId) {
          query = query.eq('industry_id', industryId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setTickets(data || []);
        setLoading(false);

        // Subscribe to real-time changes
        channel = supabase
          .channel('queue_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'queue_tickets',
              filter: industryId ? `industry_id=eq.${industryId}` : undefined,
            },
            (payload) => {
              console.log('Queue update:', payload);

              if (payload.eventType === 'INSERT') {
                setTickets((current) => [...current, payload.new as QueueTicket]);
              } else if (payload.eventType === 'UPDATE') {
                setTickets((current) =>
                  current.map((ticket) =>
                    ticket.id === (payload.new as QueueTicket).id
                      ? (payload.new as QueueTicket)
                      : ticket
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setTickets((current) =>
                  current.filter((ticket) => ticket.id !== (payload.old as any).id)
                );
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up queue subscription:', err);
        setLoading(false);
      }
    };

    setupQueue();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [industryId]);

  return { tickets, loading };
}

/**
 * Real-time hook for a specific ticket
 * Monitors status changes for a single ticket
 */
export function useRealtimeTicket(ticketId: string | null) {
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    let channel: any;

    const setupTicket = async () => {
      try {
        // Initial fetch
        const { data, error } = await supabase
          .from('queue_tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (error) throw error;
        setTicket(data);
        setLoading(false);

        // Subscribe to changes for this specific ticket
        channel = supabase
          .channel(`ticket_${ticketId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'queue_tickets',
              filter: `id=eq.${ticketId}`,
            },
            (payload) => {
              console.log('Ticket updated:', payload.new);
              setTicket(payload.new as QueueTicket);
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up ticket subscription:', err);
        setLoading(false);
      }
    };

    setupTicket();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [ticketId]);

  return { ticket, loading };
}
