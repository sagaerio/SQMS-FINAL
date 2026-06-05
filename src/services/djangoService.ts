const API_BASE = import.meta.env.VITE_API_URL || 'https://smart-queue-app-production.up.railway.app/api';

function getHeaders() {
  return {
    'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || ''),
    'Content-Type': 'application/json',
  };
}

async function dGet(path: string) {
  try {
    const res = await fetch(API_BASE + path, { headers: getHeaders() });
    if (!res.ok) return { data: null, error: 'Error ' + res.status };
    const data = await res.json();
    return { data, error: null };
  } catch { return { data: null, error: 'Network error' }; }
}

async function dPost(path: string, body?: object) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST', headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: err.detail || 'Error ' + res.status };
    }
    return { data: await res.json().catch(() => null), error: null };
  } catch { return { data: null, error: 'Network error' }; }
}

async function dPatch(path: string, body: object) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body),
    });
    if (!res.ok) return { data: null, error: 'Error ' + res.status };
    return { data: await res.json(), error: null };
  } catch { return { data: null, error: 'Network error' }; }
}

// ── Services ──────────────────────────────────────────────────────────────────
export async function getServicesByIndustry(industryId: string) {
  const { data, error } = await dGet('/services/?industry=' + industryId);
  if (error) return { data: null, error };
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const seen = new Set();
  return { data: results.filter((s: any) => { if (seen.has(s.name)) return false; seen.add(s.name); return true; }), error: null };
}

export async function getAllServices() {
  return dGet('/services/');
}

// ── Industries ────────────────────────────────────────────────────────────────
export async function getAllIndustries() {
  return dGet('/businesses/visible-industries/');
}

// ── Businesses / Branches ─────────────────────────────────────────────────────
export async function getBusinessesByIndustry(industryId: string) {
  return dGet('/businesses/?industry=' + industryId);
}

export async function getAllBusinesses() {
  return dGet('/businesses/');
}

// ── Queue Tickets ─────────────────────────────────────────────────────────────
export async function getActiveTicket(_customerId?: string) {
  return dGet('/queues/my-ticket/');
}

export async function getCustomerTickets(_customerId?: string) {
  return dGet('/queues/my-tickets/');
}

export async function createQueueTicket(_customerId: string, industryId: string, serviceId: string, branchId?: string) {
  return dPost('/queues/join/', {
    industry: industryId, service: serviceId,
    ...(branchId ? { branch: branchId } : {}),
  });
}

export async function cancelTicket(ticketId: string) {
  return dPost('/queues/' + ticketId + '/cancel/');
}

export async function updateTicketStatus(ticketId: string, status: string) {
  if (status === 'called') return dPost('/queues/' + ticketId + '/call/');
  if (status === 'completed') return dPost('/queues/' + ticketId + '/complete/');
  if (status === 'cancelled') return dPost('/queues/' + ticketId + '/cancel/');
  return { data: null, error: 'Unknown status' };
}

export async function getQueueByIndustry(industryId: string) {
  return dGet('/queues/?industry=' + industryId + '&status=waiting');
}

// ── Appointments ──────────────────────────────────────────────────────────────
export async function getCustomerAppointments(_customerId?: string) {
  return dGet('/appointments/');
}

export async function createAppointment(_customerId: string, industryId: string, serviceId: string, appointmentDate: string, appointmentTime: string, branchId?: string, notes?: string) {
  return dPost('/appointments/', {
    industry: industryId, service: serviceId,
    appointment_date: appointmentDate, appointment_time: appointmentTime,
    ...(branchId ? { branch: branchId } : {}),
    ...(notes ? { notes } : {}),
  });
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  if (status === 'confirmed') return dPost('/appointments/' + appointmentId + '/confirm/');
  if (status === 'completed') return dPost('/appointments/' + appointmentId + '/complete/');
  if (status === 'cancelled') return dPost('/appointments/' + appointmentId + '/cancel/');
  return { data: null, error: 'Unknown status' };
}

export async function cancelAppointment(appointmentId: string) {
  return dPost('/appointments/' + appointmentId + '/cancel/');
}

export const cancelSupabaseAppointment = cancelAppointment;

// ── Users / Employees ─────────────────────────────────────────────────────────
export async function getUsersByIndustry(industryId: string) {
  return dGet('/accounts/employees/?industry=' + industryId);
}

export async function getAllUsers() {
  return dGet('/accounts/employees/');
}

export async function assignStaffToBranch(staffId: string, branchId: string) {
  return dPatch('/accounts/employees/' + staffId + '/', { branch: branchId });
}

export async function updateUserRole(userId: string, role: string) {
  return dPatch('/accounts/employees/' + userId + '/', { role });
}

export async function getStaffServices(staffId: string) {
  const { data, error } = await dGet('/accounts/employees/' + staffId + '/');
  return { data: data?.assigned_services ?? [], error };
}

export async function assignServiceToStaff(staffId: string, serviceId: string) {
  const { data } = await dGet('/accounts/employees/' + staffId + '/');
  const current: string[] = (data?.assigned_services ?? []).map((s: any) => String(s.id ?? s));
  if (!current.includes(String(serviceId))) current.push(String(serviceId));
  return dPatch('/accounts/employees/' + staffId + '/', { assigned_services: current });
}

export async function removeServiceFromStaff(staffId: string, serviceId: string) {
  const { data } = await dGet('/accounts/employees/' + staffId + '/');
  const current: string[] = (data?.assigned_services ?? []).map((s: any) => String(s.id ?? s)).filter((id: string) => id !== String(serviceId));
  return dPatch('/accounts/employees/' + staffId + '/', { assigned_services: current });
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export async function getAnalyticsByIndustry(industryId: string) {
  return dGet('/analytics/?industry=' + industryId);
}

export async function getAllAnalytics() {
  return dGet('/analytics/');
}

// ── Counters (compatibility stubs) ───────────────────────────────────────────
export async function getCountersByIndustry(_industryId: string) {
  return { data: [], error: null };
}

export async function updateCounterStatus(_counterId: string, _status: string) {
  return { data: null, error: null };
}

export async function assignTicketToCounter(_ticketId: string, _counterId: string) {
  return { data: null, error: null };
}

export async function subscribeToQueueUpdates(_industryId: string, _callback: () => void) {
  return () => {};
}

export async function subscribeToTicketUpdates(_ticketId: string, _callback: () => void) {
  return () => {};
}
