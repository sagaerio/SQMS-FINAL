/**
 * Real-time Queue Hooks - Polling-based for Django backend
 * Automatically updates when tickets are created, updated, or deleted
 */
import { useEffect, useState } from 'react';
import { getQueueStatus, getActiveTicket, type QueueTicket } from '../services/queueService';

/**
 * Real-time hook for queue status
 * Polls every 5 seconds for updates
 */
export function useRealtimeQueue(pollingInterval = 5000) {
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const { data, error: fetchError } = await getQueueStatus();
        if (fetchError) {
          setError(fetchError);
        } else {
          setQueueData(data);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchQueueStatus();

    // Set up polling
    const interval = setInterval(fetchQueueStatus, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { queueData, loading, error };
}

/**
 * Real-time hook for a specific ticket
 * Monitors status changes for the current user's active ticket
 * Polls every 3 seconds for updates
 */
export function useRealtimeTicket(pollingInterval = 3000) {
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data, error: fetchError } = await getActiveTicket();
        if (fetchError) {
          setError(fetchError);
          setTicket(null);
        } else {
          setTicket(data);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTicket();

    // Set up polling
    const interval = setInterval(fetchTicket, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { ticket, loading, error };
}

/**
 * Real-time hook for all user tickets (history)
 * Polls every 10 seconds for updates
 */
export function useRealtimeTickets(pollingInterval = 10000) {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { getCustomerTickets } = await import('../services/queueService');
        const { data, error: fetchError } = await getCustomerTickets();
        if (fetchError) {
          setError(fetchError);
        } else {
          setTickets(data || []);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTickets();

    // Set up polling
    const interval = setInterval(fetchTickets, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { tickets, loading, error };
}
