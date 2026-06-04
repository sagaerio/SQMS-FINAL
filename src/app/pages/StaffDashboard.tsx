import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import {
  MapPin, Briefcase, CheckCircle2, X, Play, Clock, RefreshCw, Users, User,
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type QueueTicket = {
  id: number;
  ticket_number: string;
  customer_name: string;
  service_name: string;
  branch_name: string;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  position: number;
  estimated_wait: number;
  issued_at: string;
  called_at: string | null;
  notes: string;
};

type QueueStats = {
  waiting: number;
  serving: number;
  completed: number;
  avg_wait: number;
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function shiftTime(startMs: number) {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m on duty`;
  return `${h}h ${m}m on duty`;
}

function elapsed(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState<QueueTicket[]>([]);
  const [serving, setServing] = useState<QueueTicket | null>(null);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [calling, setCalling] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const shiftStart = useRef(Date.now());

  // Timer tick for elapsed display
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-587beb74`;
  const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      const [waitRes, servRes, statRes] = await Promise.all([
        fetch(`${SERVER}/queues?status=waiting`, { headers }).catch(() => null),
        fetch(`${SERVER}/queues?status=called`, { headers }).catch(() => null),
        fetch(`${SERVER}/queues/status`, { headers }).catch(() => null),
      ]);

      const toArr = async (res: Response | null): Promise<QueueTicket[]> => {
        if (!res?.ok) return [];
        const d = await res.json().catch(() => []);
        return Array.isArray(d) ? d : d?.results ?? [];
      };

      const [waitArr, servArr, statData] = await Promise.all([toArr(waitRes), toArr(servRes), statRes?.ok ? statRes.json().catch(() => null) : null]);
      setWaiting(waitArr);
      setServing(servArr.length > 0 ? servArr[0] : null);
      if (statData) setStats(statData);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCall = async (ticket: QueueTicket) => {
    if (serving || calling !== null) return;
    setCalling(ticket.id);
    await fetch(`${SERVER}/queues/${ticket.id}/call`, { method: 'POST', headers }).catch(() => null);
    setCalling(null);
    fetchData();
  };

  const handleComplete = async () => {
    if (!serving || completing) return;
    setCompleting(true);
    const id = serving.id;
    setServing(null);
    await fetch(`${SERVER}/queues/${id}/complete`, { method: 'POST', headers }).catch(() => null);
    setCompleting(false);
    fetchData();
  };

  const handleCancel = async (ticket: QueueTicket) => {
    if (!window.confirm(`Cancel ticket ${ticket.ticket_number}?`)) return;
    await fetch(`${SERVER}/queues/${ticket.id}/cancel`, { method: 'POST', headers }).catch(() => null);
    fetchData();
  };

  const staffName = user?.full_name ?? 'Staff Member';
  const roleBadge = user?.role === 'admin' || user?.role === 'superadmin'
    ? { label: 'Admin', color: '#7c3aed', bg: '#f5f3ff' }
    : { label: 'Staff', color: '#2563eb', bg: '#eff6ff' };

  return (
    <div style={{ padding: 16, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 14, backgroundColor: '#f8fafc' }}>

      {/* Identity card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#1d4ed8' }}>{initials(staffName)}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', flex: 1 }}>{staffName}</span>
            <div style={{ borderRadius: 6, padding: '3px 8px', backgroundColor: roleBadge.bg }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: roleBadge.color }}>{roleBadge.label}</span>
            </div>
          </div>
          {(user as any)?.assigned_branch_name && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color="#64748b" />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{(user as any).assigned_branch_name}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Briefcase size={12} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{shiftTime(shiftStart.current)}</span>
          </div>
        </div>
        <button
          onClick={() => setActive(p => !p)}
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5,
            padding: '7px 10px', borderRadius: 12,
            backgroundColor: active ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${active ? '#a7f3d0' : '#fde68a'}`,
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? '#10b981' : '#f59e0b' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#065f46' : '#92400e' }}>
            {active ? 'Active' : 'On Break'}
          </span>
        </button>
      </div>

      {/* Stats row */}
      {loading && !stats ? (
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sqms-spinner" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #2563eb', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          {[
            { icon: Users, label: 'Waiting',    value: String(stats?.waiting   ?? 0), color: '#2563eb', bg: '#eff6ff' },
            { icon: User,  label: 'Serving',    value: String(stats?.serving   ?? 0), color: '#059669', bg: '#ecfdf5' },
            { icon: CheckCircle2, label: 'Done Today', value: String(stats?.completed ?? 0), color: '#7c3aed', bg: '#f5f3ff' },
            { icon: Clock, label: 'Avg Wait',   value: `${stats?.avg_wait ?? 0}m`,    color: '#d97706', bg: '#fffbeb' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, border: `1.5px solid ${item.bg}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={item.color} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{item.value}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Currently Serving card */}
      <div style={{
        backgroundColor: active ? '#1e40af' : '#64748b',
        borderRadius: 24, padding: 22, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
        boxShadow: `0 8px 24px rgba(${active ? '29,78,216' : '71,85,105'},0.35)`,
      }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: active ? '#34d399' : '#94a3b8' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.2 }}>Currently Serving</span>
          </div>
          {serving?.called_at && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', backgroundColor: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: 8 }}>
              {elapsed(serving.called_at)}
            </span>
          )}
        </div>

        {serving ? (
          <>
            <span style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: 1, marginTop: 4 }}>{serving.ticket_number}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{serving.customer_name}</span>
            <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: 500 }}>{serving.service_name}</span>
            {!!serving.notes && (
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: '#bfdbfe', fontWeight: 500 }}>{serving.notes}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 12, width: '100%' }}>
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{ flex: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#10b981', borderRadius: 14, padding: '14px 0', border: 'none', cursor: 'pointer', opacity: completing ? 0.6 : 1 }}
              >
                <CheckCircle2 size={16} color="#fff" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{completing ? 'Saving…' : 'Complete'}</span>
              </button>
              <button
                onClick={() => handleCancel(serving)}
                style={{ flex: 1.2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 14, padding: '14px 0', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
              >
                <X size={16} color="#fca5a5" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>Cancel</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0' }}>
            <User size={44} color="rgba(255,255,255,0.25)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>No customer being served</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              {!active ? 'You are on break' : waiting.length === 0 ? 'Queue is empty' : 'Call the next customer below'}
            </span>
          </div>
        )}
      </div>

      {/* Waiting Queue */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Waiting Queue</span>
        <div style={{ borderRadius: 999, padding: '4px 10px', backgroundColor: waiting.length > 0 ? '#eff6ff' : '#f1f5f9' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: waiting.length > 0 ? '#1d4ed8' : '#94a3b8' }}>{waiting.length} waiting</span>
        </div>
      </div>

      {loading && waiting.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sqms-spinner" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #2563eb', borderTopColor: 'transparent' }} />
        </div>
      ) : waiting.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={44} color="#a7f3d0" />
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Queue is clear</span>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>No customers waiting right now</span>
        </div>
      ) : (
        waiting.map((ticket, idx) => (
          <div key={ticket.id} style={{ backgroundColor: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 14, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#475569' }}>{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{ticket.ticket_number}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{ticket.customer_name}</span>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Briefcase size={11} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{ticket.service_name}</span>
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>·</span>
                  <Clock size={11} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#d97706', fontWeight: 500 }}>{ticket.estimated_wait > 0 ? `~${ticket.estimated_wait}m` : '<5m'}</span>
                </div>
                {!!ticket.notes && (
                  <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, backgroundColor: '#f5f3ff', alignSelf: 'flex-start', padding: '2px 7px', borderRadius: 6 }}>{ticket.notes}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => handleCall(ticket)}
                disabled={!active || !!serving || calling !== null}
                style={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: !active || !!serving || calling !== null ? '#f1f5f9' : '#eff6ff',
                  borderRadius: 10, padding: '8px 12px',
                  border: `1px solid ${!active || !!serving || calling !== null ? '#e2e8f0' : '#bfdbfe'}`,
                  cursor: !active || !!serving || calling !== null ? 'not-allowed' : 'pointer',
                }}
              >
                <Play size={14} color={!active || !!serving || calling !== null ? '#94a3b8' : '#2563eb'} />
                <span style={{ fontSize: 12, fontWeight: 800, color: !active || !!serving || calling !== null ? '#94a3b8' : '#2563eb' }}>Call</span>
              </button>
              <button
                onClick={() => handleCancel(ticket)}
                style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecdd3', cursor: 'pointer' }}
              >
                <X size={14} color="#e11d48" />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 6 }}>
        <RefreshCw size={12} color="#94a3b8" />
        <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 500, textAlign: 'center' }}>Auto-refreshes every 10 seconds · Pull to refresh</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .sqms-spinner { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
