import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, X, Play, Clock, Users, User, RefreshCw, MapPin, Briefcase, Coffee, Activity } from 'lucide-react';

type QueueTicket = { id: number; ticket_number: string; customer_name: string; service_name: string; branch_name: string; status: string; position: number; estimated_wait: number; issued_at: string; called_at: string | null; notes: string };
type QueueStats = { waiting: number; serving: number; completed: number; avg_wait: number };

function initials(name: string) { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase(); }
function shiftTime(startMs: number) {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h === 0 ? `${m}m on duty` : `${h}h ${m}m on duty`;
}
function elapsed(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`;
  return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
}

export function StaffDashboard() {
  const { user } = useAuth();
  const [waiting, setWaiting] = useState<QueueTicket[]>([]);
  const [serving, setServing] = useState<QueueTicket | null>(null);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [calling, setCalling] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const shiftStart = useRef(Date.now());

  useEffect(() => { const id = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(id); }, []);

 const SERVER = 'https://smart-queue-app-production.up.railway.app/api';
const headers = { Authorization: 'Bearer ' + (localStorage.getItem('access_token') || ''), 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      const toArr = async (res: Response | null): Promise<QueueTicket[]> => {
        if (!res?.ok) return []; const d = await res.json().catch(() => []); return Array.isArray(d) ? d : d?.results ?? [];
      };
      const [wRes, sRes, stRes] = await Promise.all([
        fetch(`${SERVER}/queues/?status=waiting`, { headers }).catch(() => null),
fetch(`${SERVER}/queues/?status=called`, { headers }).catch(() => null),
fetch(`${SERVER}/queues/status/`, { headers }).catch(() => null),
      ]);
      const [wArr, sArr] = await Promise.all([toArr(wRes), toArr(sRes)]);
      setWaiting(wArr); setServing(sArr[0] ?? null);
      if (stRes?.ok) { const d = await stRes.json().catch(() => null); if (d) setStats(d); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i); }, [fetchData]);

  const handleCall = async (t: QueueTicket) => {
    if (serving || calling !== null) return;
    setCalling(t.id);
    await fetch(`${SERVER}/queues/${t.id}/call/`, { method: 'POST', headers }).catch(() => null);
    setCalling(null); fetchData();
  };
  const handleComplete = async () => {
    if (!serving || completing) return;
    setCompleting(true); const id = serving.id; setServing(null);
    await fetch(`${SERVER}/queues/${id}/complete/`, { method: 'POST', headers }).catch(() => null);
    setCompleting(false); fetchData();
  };
  const handleCancel = async (t: QueueTicket) => {
    if (!window.confirm(`Cancel ticket ${t.ticket_number}?`)) return;
    await fetch(`${SERVER}/queues/${t.id}/cancel/`, { method: 'POST', headers }).catch(() => null);
    fetchData();
  };

  const staffName = user?.full_name ?? 'Staff Member';
  const roleBadge = user?.role === 'admin' || user?.role === 'superadmin'
    ? { label: 'Admin', color: '#7c3aed', bg: '#f5f3ff' }
    : { label: 'Staff', color: '#2563eb', bg: '#eff6ff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Top identity + stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>

        {/* Identity card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8' }}>{initials(staffName)}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{staffName}</span>
                <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, backgroundColor: roleBadge.bg, color: roleBadge.color }}>{roleBadge.label}</span>
              </div>
              {(user as any)?.assigned_branch_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MapPin size={13} color="#64748b" />
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{(user as any).assigned_branch_name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Briefcase size={13} color="#94a3b8" />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{shiftTime(shiftStart.current)}</span>
              </div>
              <button
                onClick={() => setActive(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? '#a7f3d0' : '#fde68a'}`, backgroundColor: active ? '#ecfdf5' : '#fffbeb', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: active ? '#10b981' : '#f59e0b' }} />
                <span style={{ color: active ? '#065f46' : '#92400e' }}>{active ? 'Active' : 'On Break'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: Users, label: 'Waiting',    value: String(stats?.waiting   ?? '—'), color: '#2563eb', bg: '#eff6ff' },
            { icon: User,  label: 'Serving',    value: String(stats?.serving   ?? '—'), color: '#059669', bg: '#ecfdf5' },
            { icon: CheckCircle2, label: 'Done Today', value: String(stats?.completed ?? '—'), color: '#7c3aed', bg: '#f5f3ff' },
            { icon: Clock, label: 'Avg Wait',   value: stats ? `${stats.avg_wait}m` : '—',  color: '#d97706', bg: '#fffbeb' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 6px rgba(15,23,42,0.04)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.color} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0 }}>{loading ? '—' : s.value}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content: serving + queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>

        {/* Currently Serving card */}
        <div style={{ backgroundColor: active ? '#1e40af' : '#64748b', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', boxShadow: `0 8px 32px rgba(${active ? '29,78,216' : '71,85,105'},0.3)` }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: active ? '#34d399' : '#94a3b8' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Currently Serving</span>
            </div>
            {serving?.called_at && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 8 }}>{elapsed(serving.called_at)}</span>
            )}
          </div>

          {serving ? (
            <>
              <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', letterSpacing: 2, marginTop: 8 }}>{serving.ticket_number}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{serving.customer_name}</span>
              <span style={{ fontSize: 14, color: '#93c5fd', fontWeight: 500, marginBottom: 8 }}>{serving.service_name}</span>
              {!!serving.notes && <span style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 8 }}>{serving.notes}</span>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, width: '100%' }}>
                <button onClick={handleComplete} disabled={completing} style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b981', borderRadius: 12, padding: '14px 0', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 800, color: '#fff', opacity: completing ? 0.6 : 1 }}>
                  <CheckCircle2 size={18} color="#fff" />{completing ? 'Saving…' : 'Complete'}
                </button>
                <button onClick={() => handleCancel(serving)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: '14px 0', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                  <X size={16} color="#fca5a5" /><span style={{ fontSize: 14, fontWeight: 700, color: '#fca5a5' }}>Cancel</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '32px 0' }}>
              <User size={56} color="rgba(255,255,255,0.2)" />
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>No customer being served</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                {!active ? 'You are on break' : waiting.length === 0 ? 'Queue is empty' : 'Call the next customer →'}
              </span>
            </div>
          )}
        </div>

        {/* Waiting queue table */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Waiting Queue</span>
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, backgroundColor: waiting.length > 0 ? '#eff6ff' : '#f1f5f9', color: waiting.length > 0 ? '#1d4ed8' : '#94a3b8' }}>{waiting.length} waiting</span>
            </div>
            <button onClick={() => fetchData()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading && waiting.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <div className="sqms-spinner" style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #2563eb', borderTopColor: 'transparent' }} />
            </div>
          ) : waiting.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' }}>
              <CheckCircle2 size={48} color="#a7f3d0" />
              <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Queue is clear</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No customers waiting right now</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 460 }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 140px 100px 100px', gap: 0, padding: '10px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                {['#', 'Customer', 'Service', 'Wait', 'Actions'].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
                ))}
              </div>
              {waiting.map((ticket, idx) => (
                <div key={ticket.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 140px 100px 100px', gap: 0, padding: '14px 24px', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#475569' }}>{String(idx+1).padStart(2,'0')}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{ticket.ticket_number} <span style={{ fontWeight: 500, color: '#64748b' }}>· {ticket.customer_name}</span></p>
                    {!!ticket.notes && <span style={{ fontSize: 11, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{ticket.notes}</span>}
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{ticket.service_name}</span>
                  <span style={{ fontSize: 13, color: '#d97706', fontWeight: 700 }}>{ticket.estimated_wait > 0 ? `~${ticket.estimated_wait}m` : '<5m'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleCall(ticket)}
                      disabled={!active || !!serving || calling !== null}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid #bfdbfe', backgroundColor: !active || !!serving || calling !== null ? '#f1f5f9' : '#eff6ff', cursor: !active || !!serving || calling !== null ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: !active || !!serving || calling !== null ? '#94a3b8' : '#2563eb' }}
                    >
                      <Play size={12} /> Call
                    </button>
                    <button onClick={() => handleCancel(ticket)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecdd3', backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={13} color="#e11d48" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <RefreshCw size={12} color="#cbd5e1" />
        <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500 }}>Auto-refreshes every 10 seconds</span>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sqms-spinner{animation:spin 0.8s linear infinite}`}</style>
    </div>
  );
}
