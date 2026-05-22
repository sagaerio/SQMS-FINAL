import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyhjatpnafdlgmsjbpmv.supabase.co';
const supabasePublishableKey = 'sb_publishable_0GHnri1jhPs_1TQQkA7gOA_E54B23Fv';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'staff' | 'admin' | 'superadmin';
  industry_id?: string;
  counter_id?: string;
  business_id?: string;
  branch_id?: string;  // New: Staff's assigned branch
  created_at: string;
  updated_at: string;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at: string;
}

export interface Service {
  id: string;
  industry_id: string;
  name: string;
  description: string;
  estimated_time: number;
  is_active: boolean;
  created_at: string;
}

export interface Counter {
  id: string;
  business_id: string;
  name: string;
  industry_id: string;
  service_ids: string[];
  staff_id?: string;
  status: 'active' | 'inactive' | 'on_break';
  current_ticket?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  industry_id: string;
  service_id: string;
  branch_id?: string;
  counter_id?: string;
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled' | 'no_show';
  position: number;
  estimated_wait_time: number;
  created_at: string;
  called_at?: string;
  served_at?: string;
  completed_at?: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  industry_id: string;
  service_id: string;
  branch_id?: string;
  counter_id?: string;
  staff_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  industry_id: string;
  address: string;
  phone: string;
  email?: string;
  hours: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  created_at: string;
}
