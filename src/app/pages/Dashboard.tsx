import { useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ListOrdered, Calendar, BellDot, HeadphonesIcon, History,
  CheckCircle2, Clock, MapPin, RefreshCw, ChevronRight,
  Building, ArrowRight, TrendingUp,
} from 'lucide-react';

function greeting(name: string): string {
  const h = new Date().getHours();
  return `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}, ${name.split(' ')[0]}`;
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

type ActiveTicket = { id: number; ticket_number: string; service_name: string; branch_name: string; status: string; position: number; estimated_wait: number };
type Appointment = { id: number; service_name: string; branch_name: string; appointment_date: string; appointment_time: string; status: string };

const QUICK_ACTIONS = [
  { label: 'Join a Queue',       icon: ListOrdered,    color: '#2563eb', bg: '#eff6ff', desc: 'Get a ticket for any service',        route: '/services'      },
  { label: 'Book Appointment',   icon: Calendar,       color: '#059669', bg: '#f0fdf4', desc: 'Schedule a time that works for you',   route: '/appointments'  },
  { label: 'Live Queue Status',  icon: BellDot,        color: '#7c3aed', bg: '#f5f3ff', desc: 'See real-time wait times',             route: '/status'        },
  { label: 'Register Business',  icon: Building,       color: '#0891b2', bg: '#ecfeff', desc: 'Add your organisation to SQMS',        route: '/businesses'    },
  { label: 'Support Center',     icon: HeadphonesIcon, color: '#d97706', bg: '#fffbeb', desc: 'Get help or report an issue',          route: '/support'       },
  { label: 'Ticket History',     icon: History,        color: '#475569', bg: '#f1f5f9', desc: 'View all your past tickets',           route: '/status'        },
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
      if (user.role === 'staff') navigate('/staff');
      else if (user.role === 'admin' || user.role === 'superadmin') navigate('/admin');
    }
  }, [user, authLoading]);

  const loadData = useCallback(async () => {
    try {
      const SERVER = import.meta.env.VITE_API_URL;
      const headers = { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`, 'Content-Type': 'application/json' };
      const [tRes, aRes] = await Promise.all([
        fetch(`${SERVER}/queues/my-ticket/`, { headers }).catch(() => null),
        fetch(`${SERVER}/appointments/`, { headers }).catch(() => null),
      ]);
      if (tRes?.ok) { const t = await tRes.json().catch(() => null); setActiveTicket(t && ['waiting','called','serving','completed'].includes(t.status) ? t : null); }
      if (aRes?.ok) { const r = await aRes.json().catch(() => []); setAppointments(Array.isArray(r) ? r : r?.results ?? []); }
    } catch { setActiveTicket(null); setAppointments([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); const i = setInterval(loadData, 15000); return () => clearInterval(i); }, [loadData]);

  const totalAppts    = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const upcomingAppts  = appointments.filter(a => ['scheduled','confirmed'].includes(a.status)).length;
  const nextAppt = appointments.filter(a => ['scheduled','confirmed'].includes(a.status)).sort((a,b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - new Date(`${b.appointment_date}T${b.appointment_time}`).getTime())[0];

  if (!showCustomerView && !authLoading) return null;

  const ticketStatusColor = activeTicket?.status === 'serving' ? '#059669' : activeTicket?.status === 'called' ? '#d97706' : '#2563eb';
  const ticketStatusLabel = activeTicket?.status === 'serving' ? 'Now Serving' : activeTicket?.status === 'called' ? "You've Been Called!" : activeTicket?.status === 'completed' ? 'Completed' : 'In Queue';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Hero greeting bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>{greeting(user?.full_name ?? 'there')}</h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>Here's your queue overview for today.</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadData(); }}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#475569' }}
        >
          <RefreshCw size={16} color="#475569" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Appointments', value: totalAppts,    color: '#2563eb', bg: '#eff6ff', icon: Calendar,    desc: 'All time' },
          { label: 'Upcoming',           value: upcomingAppts, color: '#059669', bg: '#f0fdf4', icon: TrendingUp,  desc: 'Scheduled or confirmed' },
          { label: 'Completed',          value: completedAppts,color: '#7c3aed', bg: '#f5f3ff', icon: CheckCircle2,desc: 'Finished' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={24} color={stat.color} />
              </div>
              <div>
                <p style={{ fontSize: 32, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{loading ? '—' : stat.value}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px' }}>{stat.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active queue + next appointment row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Active queue card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Active Queue</span>
            <button onClick={() => navigate('/status')} style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ padding: 24 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                <div className="sqms-spinner" style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #2563eb', borderTopColor: 'transparent' }} />
              </div>
            ) : activeTicket ? (
              <div style={{ backgroundColor: activeTicket.status === 'completed' ? '#f0fdf4' : '#1e40af', borderRadius: 16, padding: 24, color: activeTicket.status === 'completed' ? '#065f46' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: activeTicket.status === 'completed' ? '#059669' : 'rgba(255,255,255,0.7)' }}>{ticketStatusLabel}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: activeTicket.status === 'completed' ? '#065f46' : 'rgba(255,255,255,0.6)' }}>{activeTicket.ticket_number}</span>
                </div>
                <p style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', color: activeTicket.status === 'completed' ? '#065f46' : '#fff' }}>{activeTicket.service_name}</p>
                <p style={{ fontSize: 14, margin: '0 0 16px', color: activeTicket.status === 'completed' ? '#059669' : 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{activeTicket.branch_name}</p>
                {activeTicket.status !== 'completed' && (
                  <div style={{ display: 'flex', gap: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{activeTicket.status === 'serving' ? '—' : `#${activeTicket.position}`}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Position</p>
                    </div>
                    <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{activeTicket.status === 'serving' ? 'Now' : activeTicket.estimated_wait > 0 ? `~${activeTicket.estimated_wait}m` : '<5m'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Wait</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ListOrdered size={28} color="#2563eb" />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>No active queue</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>You're not in any queue right now</p>
                </div>
                <button onClick={() => navigate('/services')} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Join a Queue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next appointment */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Next Appointment</span>
            <button onClick={() => navigate('/appointments')} style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ padding: 24 }}>
            {nextAppt ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, backgroundColor: nextAppt.status === 'confirmed' ? '#f0fdf4' : '#eff6ff', color: nextAppt.status === 'confirmed' ? '#059669' : '#2563eb' }}>
                    {nextAppt.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                  </span>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>{nextAppt.service_name}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { Icon: Calendar, text: formatDate(nextAppt.appointment_date) },
                    { Icon: Clock,    text: formatTime(nextAppt.appointment_time) },
                    { Icon: MapPin,   text: nextAppt.branch_name },
                  ].map(({ Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} color="#64748b" />
                      </div>
                      <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={28} color="#059669" />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>No upcoming appointments</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Schedule one when you're ready</p>
                </div>
                <button onClick={() => navigate('/appointments')} style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.route)}
                style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{action.label}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{action.desc}</p>
                </div>
                <ArrowRight size={16} color="#cbd5e1" style={{ flexShrink: 0, marginTop: 2 }} />
              </button>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sqms-spinner{animation:spin 0.8s linear infinite}`}</style>
    </div>
  );
}