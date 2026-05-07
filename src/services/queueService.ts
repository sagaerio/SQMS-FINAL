import { supabase, QueueTicket, Appointment, Service, Counter, Industry } from '../lib/supabase';

// =====================================================
// QUEUE TICKETS
// =====================================================

export const createQueueTicket = async (
  customerId: string,
  industryId: string,
  serviceId: string
) => {
  try {
    // Get current queue position
    const { count } = await supabase
      .from('queue_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('industry_id', industryId)
      .eq('status', 'waiting');

    const position = (count || 0) + 1;

    // Get service estimated time
    const { data: service } = await supabase
      .from('services')
      .select('estimated_time')
      .eq('id', serviceId)
      .single();

    const estimatedWaitTime = position * (service?.estimated_time || 15);

    const { data, error } = await supabase
      .from('queue_tickets')
      .insert({
        customer_id: customerId,
        industry_id: industryId,
        service_id: serviceId,
        position,
        estimated_wait_time: estimatedWaitTime,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getCustomerTickets = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('queue_tickets')
      .select(`
        *,
        industry:industries(*),
        service:services(*),
        counter:counters(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getActiveTicket = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('queue_tickets')
      .select(`
        *,
        industry:industries(*),
        service:services(*),
        counter:counters(*)
      `)
      .eq('customer_id', customerId)
      .in('status', ['waiting', 'called', 'serving'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const cancelTicket = async (ticketId: string) => {
  try {
    const { error } = await supabase
      .from('queue_tickets')
      .update({ status: 'cancelled' })
      .eq('id', ticketId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getQueueByIndustry = async (industryId: string) => {
  try {
    const { data, error } = await supabase
      .from('queue_tickets')
      .select(`
        *,
        customer:users(full_name, email),
        service:services(name),
        counter:counters(name)
      `)
      .eq('industry_id', industryId)
      .in('status', ['waiting', 'called', 'serving'])
      .order('position', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateTicketStatus = async (
  ticketId: string,
  status: QueueTicket['status'],
  counterId?: string
) => {
  try {
    const updates: any = { status };

    if (status === 'called') updates.called_at = new Date().toISOString();
    if (status === 'serving') updates.served_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    if (counterId) updates.counter_id = counterId;

    const { error } = await supabase
      .from('queue_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// =====================================================
// APPOINTMENTS
// =====================================================

export const createAppointment = async (
  customerId: string,
  industryId: string,
  serviceId: string,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string
) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        customer_id: customerId,
        industry_id: industryId,
        service_id: serviceId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getCustomerAppointments = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        industry:industries(*),
        service:services(*),
        counter:counters(*),
        staff:users(full_name, email)
      `)
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: Appointment['status']
) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const cancelAppointment = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, 'cancelled');
};

// =====================================================
// SERVICES
// =====================================================

export const getServicesByIndustry = async (industryId: string) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('industry_id', industryId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getAllServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        industry:industries(name, color)
      `)
      .eq('is_active', true)
      .order('industry_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// =====================================================
// COUNTERS
// =====================================================

export const getCountersByIndustry = async (industryId: string) => {
  try {
    const { data, error } = await supabase
      .from('counters')
      .select(`
        *,
        staff:users(full_name, email)
      `)
      .eq('industry_id', industryId)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateCounterStatus = async (
  counterId: string,
  status: Counter['status']
) => {
  try {
    const { error } = await supabase
      .from('counters')
      .update({ status })
      .eq('id', counterId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const assignTicketToCounter = async (
  ticketId: string,
  counterId: string
) => {
  try {
    const { error } = await supabase
      .from('queue_tickets')
      .update({
        counter_id: counterId,
        status: 'called',
        called_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;

    // Update counter's current ticket
    await supabase
      .from('counters')
      .update({ current_ticket: ticketId })
      .eq('id', counterId);

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// =====================================================
// INDUSTRIES
// =====================================================

export const getAllIndustries = async () => {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export const subscribeToQueueUpdates = (
  industryId: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel(`queue_${industryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_tickets',
        filter: `industry_id=eq.${industryId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};

export const subscribeToTicketUpdates = (
  ticketId: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel(`ticket_${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'queue_tickets',
        filter: `id=eq.${ticketId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};
