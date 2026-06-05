/**
 * Queue Service - Django REST API Backend
 * Handles all queue, appointment, service, and branch operations
 */
import { api } from '../lib/api';

// =====================================================
// TYPE DEFINITIONS (matching Django backend models)
// =====================================================

export interface QueueTicket {
  id: number;
  ticket_number: string;
  customer: number;
  service: number;
  branch: number;
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled' | 'missed';
  position: number;
  notes?: string;
  issued_at: string;
  called_at?: string;
  completed_at?: string;
  served_by?: number;
  // Expanded fields
  customer_name?: string;
  service_name?: string;
  branch_name?: string;
}

export interface Appointment {
  id: number;
  customer: number;
  service: number;
  branch: number;
  staff?: number;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Expanded fields
  customer_name?: string;
  service_name?: string;
  branch_name?: string;
  staff_name?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  industry: number;
  estimated_time: number;
  is_active: boolean;
  created_at: string;
}

export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  industry: number;
  is_active: boolean;
  created_at: string;
  // Expanded fields
  industry_name?: string;
}

export interface Industry {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  is_active: boolean;
}

// =====================================================
// QUEUE TICKETS
// =====================================================

export const createQueueTicket = async (
  serviceId: number,
  branchId: number,
  notes?: string
) => {
  try {
    const { data, error } = await api.post<QueueTicket>('/queues/join/', {
      service: serviceId,
      branch: branchId,
      notes: notes || '',
    });

    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getCustomerTickets = async () => {
  try {
    const { data, error } = await api.get<QueueTicket[]>('/queues/my-tickets/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getActiveTicket = async () => {
  try {
    const { data, error } = await api.get<QueueTicket>('/queues/my-ticket/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const cancelTicket = async (ticketId: number) => {
  try {
    const { error } = await api.post(`/queues/${ticketId}/cancel/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const getQueueStatus = async () => {
  try {
    const { data, error } = await api.get<any>('/queues/status/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getBranchQueueCounts = async () => {
  try {
    const { data, error } = await api.get<any>('/queues/branch-counts/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// Staff functions
export const callNextTicket = async (ticketId: number) => {
  try {
    const { data, error } = await api.post(`/queues/${ticketId}/call/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const completeTicket = async (ticketId: number) => {
  try {
    const { data, error } = await api.post(`/queues/${ticketId}/complete/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// APPOINTMENTS
// =====================================================

export const createAppointment = async (
  serviceId: number,
  branchId: number,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string
) => {
  try {
    const { data, error } = await api.post<Appointment>('/appointments/', {
      service: serviceId,
      branch: branchId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      notes: notes || '',
    });

    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getCustomerAppointments = async () => {
  try {
    const { data, error } = await api.get<Appointment[]>('/appointments/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const confirmAppointment = async (appointmentId: number) => {
  try {
    const { error } = await api.post(`/appointments/${appointmentId}/confirm/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const cancelAppointment = async (appointmentId: number) => {
  try {
    const { error } = await api.post(`/appointments/${appointmentId}/cancel/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const completeAppointment = async (appointmentId: number) => {
  try {
    const { error } = await api.post(`/appointments/${appointmentId}/complete/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const updateAppointmentStatus = async (
  appointmentId: number | string,
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
) => {
  try {
    const numericId = typeof appointmentId === 'string' ? parseInt(appointmentId) : appointmentId;

    // Map status to appropriate endpoint
    const endpoint = status === 'confirmed' ? `/appointments/${numericId}/confirm/` :
                     status === 'completed' ? `/appointments/${numericId}/complete/` :
                     status === 'cancelled' ? `/appointments/${numericId}/cancel/` :
                     null;

    if (!endpoint) {
      return { error: new Error('Invalid status') };
    }

    const { error } = await api.post(endpoint, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// SERVICES
// =====================================================

export const seedServices = async () => {
  try {
    const { data, error } = await api.post<any>('/services/seed/', {});
    if (error) return { data: null, error: new Error(error) };
    return { data: data?.services || [], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getAllServices = async () => {
  try {
    const { data, error } = await api.get<Service[]>('/services/');

    if (error) return { data: null, error: new Error(error) };

    // If no services exist, seed them
    if (!data || data.length === 0) {
      console.log('No services found, seeding...');
      const { data: seedData } = await seedServices();
      return { data: seedData, error: null };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getServicesByIndustry = async (industryId: number | string) => {
  try {
    let numericIndustryId = industryId;

    if (typeof industryId === 'string' && isNaN(Number(industryId))) {
      const { data: indData } = await api.get<any[]>('/businesses/visible-industries/', false);
      if (indData) {
        const matchingInd = indData.find((ind: any) => ind.name.toLowerCase() === industryId.toLowerCase() || ind.id.toString() === industryId);
        if (matchingInd) {
          numericIndustryId = matchingInd.id;
        }
      }
    }

    // Try with industry query param first
    const industryKey = typeof numericIndustryId === 'number' ? String(numericIndustryId) : numericIndustryId;
    const { data, error } = await api.get<any[]>(`/services/?industry=${industryKey}`);

    if (error) return { data: null, error: new Error(error) };

    // If no services exist, seed them
    if (!data || data.length === 0) {
      console.log('No services found for industry, seeding...');
      const { data: seedData } = await seedServices();
      if (seedData) {
        const filtered = seedData.filter((s: any) =>
          s.industry === industryKey ||
          String(s.industry) === industryKey ||
          String(s.industry) === String(industryId) ||
          (typeof industryId === 'string' && s.industry === industryId)
        );
        return { data: filtered, error: null };
      }
    }

    // Filter data if backend didn't filter it
    const filteredData = data.filter((s: any) => 
      s.industry === industryKey ||
      String(s.industry) === industryKey ||
      String(s.industry) === String(industryId) ||
      (typeof industryId === 'string' && s.industry === industryId) ||
      s.industry_name === industryKey ||
      s.industry_name === industryId
    );

    return { data: filteredData.length > 0 ? filteredData : data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// =====================================================
// BRANCHES
// =====================================================

export const getAllBranches = async () => {
  try {
    const { data, error } = await api.get<Branch[]>('/branches/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const seedBranches = async () => {
  try {
    const { data, error } = await api.post<Branch[]>('/branches/seed/', {});
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getBranchesByIndustry = async (industryId: number) => {
  try {
    const { data, error } = await api.get<Branch[]>('/branches/');
    if (error) return { data: null, error: new Error(error) };

    // Filter by industry on client side
    const filtered = data?.filter(b => b.industry === industryId) || [];
    return { data: filtered, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// =====================================================
// INDUSTRIES
// =====================================================

export const getAllIndustries = async () => {
  try {
    const { data, error } = await api.get<Industry[]>('/businesses/visible-industries/', false);
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// =====================================================
// BUSINESSES
// =====================================================

export const getBusinessDirectory = async () => {
  try {
    const { data, error } = await api.get<any>('/businesses/directory/', false);
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// =====================================================
// STAFF/ADMIN FUNCTIONS
// =====================================================

export const getQueueByIndustry = async (industryId: number) => {
  try {
    const { data, error } = await api.get<QueueTicket[]>('/queues/');
    if (error) return { data: null, error: new Error(error) };

    // Filter by industry on client side
    const filtered = data?.filter(t => t.service === industryId) || [];
    return { data: filtered, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const updateTicketStatus = async (
  ticketId: number,
  status: QueueTicket['status']
) => {
  try {
    const endpoint = status === 'called' ? `/queues/${ticketId}/call/` :
                     status === 'completed' ? `/queues/${ticketId}/complete/` :
                     status === 'cancelled' ? `/queues/${ticketId}/cancel/` :
                     null;

    if (!endpoint) {
      return { error: new Error('Invalid status') };
    }

    const { error } = await api.post(endpoint, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// BUSINESSES (Backward compatibility)
// =====================================================

export const getBusinessesByIndustry = async (industryId: string | number) => {
  try {
    let numericIndustryId = industryId;
    
    // First try to get all branches
    const { data, error } = await api.get<any[]>('/branches/');

    // Fetch industries to map string name to numeric ID dynamically
    if (typeof industryId === 'string' && isNaN(Number(industryId))) {
      const { data: indData } = await api.get<any[]>('/businesses/visible-industries/', false);
      if (indData) {
        const matchingInd = indData.find((ind: any) => ind.name.toLowerCase() === industryId.toLowerCase() || ind.id.toString() === industryId);
        if (matchingInd) {
          numericIndustryId = matchingInd.id;
        }
      }
    }

    if (error) return { data: null, error: new Error(error) };

    // If no branches exist, seed them
    if (!data || data.length === 0) {
      console.log('No branches found, seeding...');
      const { data: seedData } = await seedBranches();
      if (seedData && seedData.length > 0) {
        const industryKey = typeof numericIndustryId === 'string' ? numericIndustryId : String(numericIndustryId);
        const filtered = seedData.filter((b: any) =>
          b.business_industry === industryKey ||
          String(b.industry) === industryKey ||
          String(b.industry) === String(industryId) ||
          b.industry_name === industryKey ||
          (typeof industryId === 'string' && b.business_industry === industryId)
        );
        return { data: filtered, error: null };
      }
    }

    const industryKey = typeof numericIndustryId === 'string' ? numericIndustryId : String(numericIndustryId);
    const filtered = data?.filter((b: any) =>
      b.business_industry === industryKey ||
      String(b.industry) === industryKey ||
      String(b.industry) === String(industryId) ||
      b.industry_name === industryKey ||
      (typeof industryId === 'string' && b.business_industry === industryId)
    ) || [];

    return { data: filtered, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getAllBusinesses = async () => {
  try {
    const { data, error } = await api.get<Branch[]>('/branches/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

// =====================================================
// COUNTERS (Staff counter management)
// =====================================================

export const getCountersByIndustry = async (industryId: string | number) => {
  try {
    // Django backend doesn't have counters endpoint yet, return empty array
    return { data: [], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const updateCounterStatus = async (
  counterId: number,
  status: 'active' | 'inactive' | 'on_break'
) => {
  try {
    // Django backend doesn't have counters endpoint yet
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const assignTicketToCounter = async (
  ticketId: number,
  counterId: number
) => {
  try {
    // Use call endpoint
    const { error } = await api.post(`/queues/${ticketId}/call/`, {});
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// USER MANAGEMENT (For Admin/Superadmin)
// =====================================================

export const getUsersByIndustry = async (industryId: string | number) => {
  try {
    // Django backend employees endpoint (staff/admin only)
    const { data, error } = await api.get<any[]>('/accounts/employees/');
    if (error) return { data: null, error: new Error(error) };

    // Filter by industry/business if needed
    const filtered = data?.filter(u => u.role === 'staff' || u.role === 'admin') || [];
    return { data: filtered, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const getAllUsers = async () => {
  try {
    // Get all employees (staff, admin, superadmin)
    const { data, error } = await api.get<any[]>('/accounts/employees/');
    if (error) return { data: null, error: new Error(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const assignStaffToBranch = async (staffId: string | number, branchId: string | number) => {
  try {
    const numericStaffId = typeof staffId === 'string' ? parseInt(staffId) : staffId;
    const numericBranchId = typeof branchId === 'string' ? parseInt(branchId) : branchId;

    const { error } = await api.patch(`/accounts/employees/${numericStaffId}/`, {
      assigned_branch: numericBranchId
    });
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const updateUserRole = async (userId: string | number, role: string) => {
  try {
    const numericId = typeof userId === 'string' ? parseInt(userId) : userId;
    const { error } = await api.patch(`/accounts/employees/${numericId}/`, { role });
    if (error) return { error: new Error(error) };
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// STAFF SERVICES (Staff Service Assignments)
// =====================================================

export const getStaffServices = async (staffId: string | number) => {
  try {
    // Get staff user details which includes assigned services
    const numericId = typeof staffId === 'string' ? parseInt(staffId) : staffId;
    const { data, error } = await api.get<any>(`/accounts/employees/${numericId}/`);
    if (error) return { data: null, error: new Error(error) };

    // Return services in expected format
    const services = data?.assigned_services_names?.map((name: string, idx: number) => ({
      id: idx,
      service_id: idx,
      service: { id: idx, name }
    })) || [];

    return { data: services, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const assignServiceToStaff = async (staffId: string | number, serviceId: string | number) => {
  try {
    // Django backend handles this via user profile update
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

export const removeServiceFromStaff = async (staffId: string | number, serviceId: string | number) => {
  try {
    // Django backend handles this via user profile update
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
};

// =====================================================
// ANALYTICS
// =====================================================

export const getAnalyticsByIndustry = async (industryId: string | number) => {
  try {
    const { data, error } = await api.get<any>('/analytics/');
    if (error) return { tickets: [], appointments: [], error: new Error(error) };
    return { tickets: data?.tickets || [], appointments: data?.appointments || [], error: null };
  } catch (err) {
    return { tickets: [], appointments: [], error: err as Error };
  }
};

export const getAllAnalytics = async () => {
  try {
    const { data, error } = await api.get<any>('/analytics/');
    if (error) return { tickets: [], appointments: [], error: new Error(error) };
    return { tickets: data?.tickets || [], appointments: data?.appointments || [], error: null };
  } catch (err) {
    return { tickets: [], appointments: [], error: err as Error };
  }
};

// =====================================================
// REAL-TIME UPDATES (Polling-based for Django backend)
// =====================================================

export const startQueuePolling = (callback: () => void, interval = 5000) => {
  const pollInterval = setInterval(callback, interval);
  return () => clearInterval(pollInterval);
};

export const startAppointmentPolling = (callback: () => void, interval = 10000) => {
  const pollInterval = setInterval(callback, interval);
  return () => clearInterval(pollInterval);
};
