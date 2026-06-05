import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Database Types - Now powered by Django REST API
// Re-export types from AuthContext and queueService for backward compatibility
export type { User } from '../app/contexts/AuthContext';
export type {
  QueueTicket,
  Appointment,
  Service,
  Branch,
  Industry
} from '../services/queueService';

// Legacy types for backward compatibility with existing code
export interface Business {
  id: number;
  name: string;
  industry: number;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Counter {
  id: number;
  name: string;
  number?: number;
  branch: number;
  staff?: number;
  is_active: boolean;
  created_at: string;
}

export interface StaffService {
  id: number;
  staff_id: number;
  service_id: number;
  created_at: string;
}
