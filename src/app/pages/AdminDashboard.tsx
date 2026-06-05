import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell, Users, User, CheckCircle2, Clock, Calendar, BarChart2,
  HeadphonesIcon, Settings, FileText, Building2, ChevronRight,
  Activity, TrendingUp, ArrowRight, RefreshCw,
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type QueueStats = { waiting: number; serving: number; completed: number; avg_wait: number };
type QuickAction = { key: string; label: string; sub: string; icon: React.ElementType; color: string; bg: string; border: string; route: string };

const ADMIN_ACTIONS: QuickAction[] = [
  { key: 'queue',        label: 'Queue Monitor',   sub: 'Live view of all counters',  icon: Activity,       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', route: '/status'           },
  { key: 'employees',    label: 'Employees',       sub: 'Manage staff & roles',        icon: Users,          color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', route: '/employees'        },
  { key: 'appointments', label: 'Appointments',    sub: 'Bookings & schedule',         icon: Calendar,       color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', route: '/appointments'     },
  { key: 'analytics',   label: 'Analytics',       sub: 'Reports & insights',          icon: BarChart2,      color: '#d97706', bg: '#fffbeb', border: '#fde68a', route: '/analytics'        },
  { key: 'support',      label: 'Support Tickets', sub: 'Help desk & FAQs',            icon: HeadphonesIcon, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', route: '/support'          },
  { key: 'settings',     label: 'System Settings', sub: 'Services, branches & rules',  icon: Settings,       color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', route: '/businesses'       },
];

const SUPER_ADMIN_ACTIONS: QuickAction[] = [
  { key: 'requests',   label: 'Business Requests', sub: 'Pending approvals',      icon: FileText,  color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', route: '/business-requests' },
  { key: 'businesses', label: 'All Businesses',    sub: 'Manage registered orgs', icon: Building2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', route: '/businesses'        },
  { key: 'employees',  label: 'All Employees',     sub: 'Staff across all orgs',  icon: Users,     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', route: '/employees'         },
  { key: 'analytics',  label: 'Platform Analytics',sub: 'System-wide reports',    icon: BarChart2, color: '#d97706', bg: '#fffbeb', border: '#fde68a', route: '/analytics'         },
];

const HEALTH_ITEMS = ['Queue API', 'Notifications', 'Database', 'Tunnel'];

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function fmtTime()  { return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
function fmtDate()  { return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const actions = isSuperAdmin ? SUPER_ADMIN_ACTIONS : ADMIN_ACTIONS;
  const firstName = user?.full_name?.split(' ')[0] ?? 'Admin';

  const [stats, setStats]   = useState<QueueStats | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clock, setClock]   = useState(fmtTime());
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { const t = setInterval(() => setClock(fmtTime()), 30000); return () => clearInterval(t); }, []);

  const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-587beb74`;
  const hdrs = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      const [sRes, nRes] = await Promise.all([
        fetch(`${SERVER}/queues/status`, { headers: hdrs }).catch(() => null),
        fetch(`${SERVER}/notifications/unread-count`, { headers: hdrs }).catch(() => null),
      ]);
      if (sRes?.ok) { const d = await sRes.json().catch(() => null); if (d) setStats(d); }
      if (nRes?.ok) { const d = await nRes.json().catch(() => null); if (d) setUnread(d.count ?? 0); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, [fetchData]);

  const syncData = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`${SERVER}/sync-data`, { method: 'POST', headers: hdrs });
      const d = await res.json();
      if (res.ok && d.success) {
        setSyncMsg({ ok: true, text: `Synced ${d.synced.industries} industries, ${d.synced.services} services, ${d.synced.branches} branches` });
      } else {
        setSyncMsg({ ok: false, text: d.error || 'Sync failed' });
      }
    } catch (e: any) {
      setSyncMsg({ ok: false, text: e?.message || 'Network error' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 6000);
    }
  };

  const total = (stats?.waiting ?? 0) + (stats?.serving ?? 0) + (stats?.completed ?? 0);
  const adminInitials = user?.full_name ? user.full_name.trim().split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() : 'A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Hero banner */}
      <div style={{ backgroundColor: '#1e40af', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(29,78,216,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{adminInitials}</span>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '4px 12px', marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isSuperAdmin ? '#a78bfa' : '#60a5fa' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: isSuperAdmin ? '#c4b5fd' : 'rgba(255,255,255,0.9)' }}>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{greeting()},</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '2px 0 0', letterSpacing: -0.5 }}>{firstName}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: 1 }}>{clock}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>{fmtDate()}</p>
          <button onClick={() => navigate('/notifications')} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: 'none', backgroundColor: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, position: 'relative' }}>
            <Bell size={16} />
            {unread > 0 && `${unread} new`} Notifications
            {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', border: '2px solid #1e40af' }}>{unread > 9 ? '9+' : unread}</span>}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 14px' }}>Live Queue Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: Users,        value: stats?.waiting   ?? 0, label: 'Waiting',    sub: 'In queue now',    color: '#2563eb', iconBg: '#dbeafe', border: '#bfdbfe' },
            { icon: User,         value: stats?.serving   ?? 0, label: 'Serving',    sub: 'Being helped',    color: '#059669', iconBg: '#d1fae5', border: '#a7f3d0' },
            { icon: CheckCircle2, value: stats?.completed ?? 0, label: 'Done Today', sub: 'Served today',    color: '#7c3aed', iconBg: '#ede9fe', border: '#ddd6fe' },
            { icon: Clock,        value: `${stats?.avg_wait ?? 0}m`, label: 'Avg Wait', sub: 'Per customer', color: '#d97706', iconBg: '#fef3c7', border: '#fde68a' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 22px', border: `1px solid ${card.border}`, boxShadow: '0 1px 6px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={card.color} />
                </div>
                <div>
                  <p style={{ fontSize: 30, fontWeight: 900, color: card.color, margin: 0, lineHeight: 1 }}>{loading ? '—' : card.value}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px' }}>{card.label}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="#2563eb" />
          <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
            <strong style={{ color: '#0f172a', fontWeight: 800 }}>{total}</strong> customers processed today
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: 1 }}>LIVE</span>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>· Updated {clock}</span>
        </div>
      </div>

      {/* Control panel */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 14px' }}>Control Panel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => navigate(action.route)}
                style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${action.border}`, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 6px rgba(15,23,42,0.04)' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{action.label}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{action.sub}</p>
                </div>
                <ArrowRight size={16} color={action.color} style={{ flexShrink: 0, marginTop: 4 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* System health + admin info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Health */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 6px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', flex: 1 }}>All systems operational</span>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Updated {clock}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {HEALTH_ITEMS.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin info */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 6px rgba(15,23,42,0.04)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Signed In As</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{adminInitials}</span>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{user?.full_name ?? 'Admin User'}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ padding: '8px 14px', borderRadius: 10, backgroundColor: isSuperAdmin ? '#f5f3ff' : '#eff6ff', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: isSuperAdmin ? '#7c3aed' : '#2563eb' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: isSuperAdmin ? '#7c3aed' : '#2563eb' }}>{isSuperAdmin ? 'Super Administrator' : 'Administrator'}</span>
          </div>
        </div>
      </div>

      {/* Sync data to Supabase (superadmin only) */}
      {isSuperAdmin && (
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 3px' }}>Sync Data to Supabase</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Push all industries, services, and branch locations to the live database</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {syncMsg && (
              <span style={{ fontSize: 13, fontWeight: 600, color: syncMsg.ok ? '#059669' : '#e11d48', padding: '6px 12px', borderRadius: 8, backgroundColor: syncMsg.ok ? '#f0fdf4' : '#fff1f2' }}>
                {syncMsg.text}
              </span>
            )}
            <button
              onClick={syncData}
              disabled={syncing}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: syncing ? '#e2e8f0' : '#2563eb', color: syncing ? '#94a3b8' : '#fff', border: 'none', borderRadius: 10, cursor: syncing ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sqms-spinner{animation:spin 0.8s linear infinite}`}</style>
    </div>
  );
}
