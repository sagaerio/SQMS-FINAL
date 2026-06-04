import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell, Users, User, CheckCircle2, Clock, Calendar, BarChart2, HeadphonesIcon,
  Settings, FileText, Building2, ChevronRight, Activity,
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type QueueStats = { waiting: number; serving: number; completed: number; avg_wait: number };

type QuickAction = {
  key: string; label: string; sub: string; icon: React.ElementType;
  color: string; bg: string; border: string; route: string;
};

const ADMIN_ACTIONS: QuickAction[] = [
  { key: 'queue',         label: 'Queue Monitor',    sub: 'Live view of all counters',    icon: Activity,       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', route: '/status'           },
  { key: 'employees',     label: 'Employees',        sub: 'Manage staff & roles',         icon: Users,          color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', route: '/employees'        },
  { key: 'appointments',  label: 'Appointments',     sub: 'Bookings & schedule',          icon: Calendar,       color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', route: '/appointments'     },
  { key: 'analytics',     label: 'Analytics',        sub: 'Reports & insights',           icon: BarChart2,      color: '#d97706', bg: '#fffbeb', border: '#fde68a', route: '/analytics'        },
  { key: 'support',       label: 'Support Tickets',  sub: 'Help desk & FAQs',             icon: HeadphonesIcon, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', route: '/support'          },
  { key: 'settings',      label: 'System Settings',  sub: 'Services, branches & rules',   icon: Settings,       color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', route: '/businesses'       },
];

const SUPER_ADMIN_ACTIONS: QuickAction[] = [
  { key: 'requests',   label: 'Business Requests', sub: 'Pending approvals',       icon: FileText,  color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', route: '/business-requests' },
  { key: 'businesses', label: 'All Businesses',    sub: 'Manage registered orgs',  icon: Building2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', route: '/businesses'        },
  { key: 'employees',  label: 'All Employees',     sub: 'Staff across all orgs',   icon: Users,     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', route: '/employees'         },
  { key: 'analytics',  label: 'Platform Analytics',sub: 'System-wide reports',     icon: BarChart2, color: '#d97706', bg: '#fffbeb', border: '#fde68a', route: '/analytics'         },
];

const STATUS_ITEMS = ['Queue API', 'Notifications', 'Database', 'Tunnel'];

function fmtTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'superadmin';
  const actions = isSuperAdmin ? SUPER_ADMIN_ACTIONS : ADMIN_ACTIONS;
  const firstName = user?.full_name?.split(' ')[0] ?? 'Admin';

  const [stats, setStats] = useState<QueueStats | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(fmtTime());

  useEffect(() => {
    const t = setInterval(() => setClock(fmtTime()), 30000);
    return () => clearInterval(t);
  }, []);

  const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-587beb74`;
  const hdrs = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      const [statRes, notifRes] = await Promise.all([
        fetch(`${SERVER}/queues/status`, { headers: hdrs }).catch(() => null),
        fetch(`${SERVER}/notifications/unread-count`, { headers: hdrs }).catch(() => null),
      ]);
      if (statRes?.ok) { const d = await statRes.json().catch(() => null); if (d) setStats(d); }
      if (notifRes?.ok) { const d = await notifRes.json().catch(() => null); if (d) setUnread(d.count ?? 0); }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(), 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  const totalToday = (stats?.waiting ?? 0) + (stats?.serving ?? 0) + (stats?.completed ?? 0);

  const adminInitials = user?.full_name
    ? user.full_name.trim().split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : 'A';

  return (
    <div style={{ padding: 16, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 0, backgroundColor: '#f1f5f9' }}>

      {/* Hero banner */}
      <div style={{ backgroundColor: '#1e40af', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, boxShadow: '0 6px 24px rgba(29,78,216,0.3)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999 }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isSuperAdmin ? '#a78bfa' : '#60a5fa' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isSuperAdmin ? '#c4b5fd' : 'rgba(255,255,255,0.9)', letterSpacing: 0.5 }}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{greeting()},</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: '32px' }}>{firstName}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 500 }}>{fmtDate()}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>{clock}</span>
          <button
            onClick={() => navigate('/notifications')}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', position: 'relative' }}
          >
            <Bell size={20} color="#fff" />
            {unread > 0 && (
              <div style={{ position: 'absolute', top: 5, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #1e40af' }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: '#fff' }}>{unread > 9 ? '9+' : unread}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* KPI section label */}
      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Live Queue Overview</span>

      {/* KPI cards */}
      {loading && !stats ? (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, border: '1px solid #e2e8f0' }}>
          <div className="sqms-spinner" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #2563eb', borderTopColor: 'transparent' }} />
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Fetching live data…</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {[
            { icon: Users,       value: stats?.waiting ?? 0,   label: 'Waiting',    color: '#2563eb', iconBg: '#dbeafe', border: '#bfdbfe' },
            { icon: User,        value: stats?.serving ?? 0,   label: 'Serving',    color: '#059669', iconBg: '#d1fae5', border: '#a7f3d0' },
            { icon: CheckCircle2,value: stats?.completed ?? 0, label: 'Done Today', color: '#7c3aed', iconBg: '#ede9fe', border: '#ddd6fe' },
            { icon: Clock,       value: `${stats?.avg_wait ?? 0}m`, label: 'Avg Wait', color: '#d97706', iconBg: '#fef3c7', border: '#fde68a' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, border: `1px solid ${card.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={card.color} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: card.color, lineHeight: '24px' }}>{card.value}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>{card.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary bar */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} color="#2563eb" />
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
            <strong style={{ color: '#0f172a' }}>{totalToday}</strong> customers processed today
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', letterSpacing: 1 }}>LIVE</span>
        </div>
      </div>

      {/* Control panel label */}
      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 20 }}>Control Panel</span>

      {/* Quick actions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              onClick={() => navigate(action.route)}
              style={{ backgroundColor: '#fff', borderRadius: 20, border: `1.5px solid ${action.border}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 6px rgba(15,23,42,0.04)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                <Icon size={22} color={action.color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{action.label}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{action.sub}</span>
              <div style={{ alignSelf: 'flex-start', width: 22, height: 22, borderRadius: 8, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <ChevronRight size={12} color={action.color} />
              </div>
            </button>
          );
        })}
      </div>

      {/* System health */}
      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 20 }}>System Health</span>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1 }}>All systems operational</span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Updated {clock}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {STATUS_ITEMS.map(item => (
            <div key={item} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <CheckCircle2 size={14} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin info card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{adminInitials}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{user?.full_name ?? 'Admin User'}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>{user?.email ?? ''}</p>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 10, backgroundColor: isSuperAdmin ? '#f5f3ff' : '#eff6ff' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: isSuperAdmin ? '#7c3aed' : '#2563eb' }}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .sqms-spinner { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
