import { useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ListOrdered,
  Calendar,
  BellDot,
  HeadphonesIcon,
  History,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ChevronRight,
  Building,
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name.split(' ')[0]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

type ActiveTicket = {
  id: number;
  ticket_number: string;
  service_name: string;
  branch_name: string;
  status: 'waiting' | 'called' | 'serving' | 'completed';
  position: number;
  estimated_wait: number;
};

type Appointment = {
  id: number;
  ticket_number: string;
  service_name: string;
  branch_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
};

const QUICK_ACTIONS = [
  { label: 'Join Queue',        icon: ListOrdered,    color: '#2563eb', bg: '#eff6ff', route: '/services'      },
  { label: 'Book Appointment',  icon: Calendar,       color: '#059669', bg: '#f0fdf4', route: '/appointments'  },
  { label: 'Queue Status',      icon: BellDot,        color: '#7c3aed', bg: '#f5f3ff', route: '/status'        },
  { label: 'Register Business', icon: Building,       color: '#0891b2', bg: '#ecfeff', route: '/businesses'    },
  { label: 'Support',           icon: HeadphonesIcon, color: '#d97706', bg: '#fffbeb', route: '/support'       },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTicket, setActiveTicket] = useState<ActiveTicket | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isCustomerMode = typeof window !== 'undefined' && localStorage.getItem('sqms_customer_mode') === 'true';
  const showCustomerView = user?.role === 'customer' || isCustomerMode;

  useEffect(() => {
    if (authLoading || !user) return;
    if (!showCustomerView) {
      if (user.role === 'staff') { navigate('/staff'); return; }
      if (user.role === 'admin' || user.role === 'superadmin') { navigate('/admin'); return; }
    }
  }, [user, authLoading]);

  const loadData = useCallback(async () => {
    try {
      const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-587beb74`;
      const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };
      const [ticketRes, apptRes] = await Promise.all([
        fetch(`${SERVER}/queues/my-ticket`, { headers }).catch(() => null),
        fetch(`${SERVER}/appointments`, { headers }).catch(() => null),
      ]);
      if (ticketRes?.ok) {
        const t = await ticketRes.json().catch(() => null);
        const isVisible = t && ['waiting', 'called', 'serving', 'completed'].includes(t.status);
        setActiveTicket(isVisible ? t : null);
      }
      if (apptRes?.ok) {
        const raw = await apptRes.json().catch(() => []);
        setAppointments(Array.isArray(raw) ? raw : raw?.results ?? []);
      }
    } catch {
      setActiveTicket(null);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const totalAppts = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const upcomingAppts = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const nextAppt = appointments
    .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
    .sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - new Date(`${b.appointment_date}T${b.appointment_time}`).getTime())[0] ?? null;

  if (!showCustomerView && !authLoading) return null;

  return (
    <div style={{ padding: 16, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Greeting */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 4 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: -0.3, margin: 0 }}>
            {greeting(user?.full_name ?? 'there')}
          </p>
          <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 2, margin: '2px 0 0' }}>
            Here's your queue overview
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadData(); }}
          disabled={refreshing}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
        >
          <RefreshCw size={18} color="#64748b" />
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        {[
          { label: 'Total',     value: totalAppts,     color: '#2563eb' },
          { label: 'Upcoming',  value: upcomingAppts,  color: '#059669' },
          { label: 'Completed', value: completedAppts, color: '#7c3aed' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(15,23,42,0.04)' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{loading ? '–' : stat.value}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Active Queue */}
      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>Active Queue</p>
      {loading ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 72 }}>
          <div className="sqms-spinner" style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #2563eb', borderTopColor: 'transparent' }} />
        </div>
      ) : activeTicket ? (
        activeTicket.status === 'completed' ? (
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: 20, padding: 18, border: '2px solid #6ee7b7', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={22} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 900, color: '#059669', letterSpacing: 1, flex: 1 }}>COMPLETED</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#065f46', fontFamily: 'monospace' }}>{activeTicket.ticket_number}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#065f46', margin: 0 }}>{activeTicket.service_name}</p>
            <p style={{ fontSize: 13, color: '#059669', fontWeight: 500, margin: 0 }}>{activeTicket.branch_name}</p>
            <p style={{ fontSize: 12, color: '#047857', fontWeight: 500, margin: '4px 0 0' }}>Your service has been completed. Thank you!</p>
          </div>
        ) : (
          <button onClick={() => navigate('/status')} style={{ backgroundColor: '#1e40af', borderRadius: 20, padding: 18, boxShadow: '0 4px 16px rgba(30,64,175,0.3)', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 999 }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: activeTicket.status === 'serving' ? '#059669' : activeTicket.status === 'called' ? '#d97706' : '#60a5fa' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: activeTicket.status === 'serving' ? '#6ee7b7' : activeTicket.status === 'called' ? '#fcd34d' : '#93c5fd' }}>
                  {activeTicket.status === 'serving' ? 'Now Serving' : activeTicket.status === 'called' ? "You've Been Called!" : 'In Queue'}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{activeTicket.ticket_number}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{activeTicket.service_name}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500, margin: '0 0 4px' }}>{activeTicket.branch_name}</p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ListOrdered size={16} color="#93c5fd" />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>{activeTicket.status === 'serving' ? '—' : `#${activeTicket.position}`}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Position</p>
                </div>
              </div>
              <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#93c5fd" />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>
                    {activeTicket.status === 'serving' ? 'Your turn' : activeTicket.estimated_wait > 0 ? `~${activeTicket.estimated_wait} min` : '< 5 min'}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Est. wait</p>
                </div>
              </div>
            </div>
          </button>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', minHeight: 72 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ListOrdered size={26} color="#2563eb" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>No Active Queue</p>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>You're not in any queue right now</p>
          </div>
          <button onClick={() => navigate('/services')} style={{ backgroundColor: '#2563eb', borderRadius: 10, padding: '8px 14px', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Join</span>
          </button>
        </div>
      )}

      {/* Next Appointment */}
      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>Next Appointment</p>
      {nextAppt ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Next Appointment</span>
            <button onClick={() => navigate('/appointments')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>View all</span>
            </button>
          </div>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>{nextAppt.service_name}</p>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {[
              { Icon: Calendar, text: formatDate(nextAppt.appointment_date) },
              { Icon: Clock,    text: formatTime(nextAppt.appointment_time) },
              { Icon: MapPin,   text: nextAppt.branch_name },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon size={14} color="#64748b" />
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 999, marginTop: 4, backgroundColor: nextAppt.status === 'confirmed' ? '#f0fdf4' : '#eff6ff' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: nextAppt.status === 'confirmed' ? '#059669' : '#2563eb' }}>
              {nextAppt.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', minHeight: 72 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar size={26} color="#059669" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>No Upcoming Appointments</p>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>Schedule one when you're ready</p>
          </div>
          <button onClick={() => navigate('/appointments')} style={{ backgroundColor: '#059669', borderRadius: 10, padding: '8px 14px', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Book</span>
          </button>
        </div>
      )}

      {/* Ticket History */}
      <button onClick={() => navigate('/status')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(15,23,42,0.04)', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <History size={22} color="#7c3aed" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Ticket History</p>
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>View all your past tickets</p>
        </div>
        <ChevronRight size={22} color="#cbd5e1" />
      </button>

      {/* Quick Actions */}
      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>Quick Actions</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <button key={action.label} onClick={() => navigate(action.route)} style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(15,23,42,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={action.color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{action.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .sqms-spinner { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
