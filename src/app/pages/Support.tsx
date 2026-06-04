import { useState, useEffect } from 'react';
import { Send, MessageCircle, CheckCircle, Clock, User, ArrowLeft, Plus, Search, AlertCircle } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { industrySupportTopics } from '../data/industryServices';

interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  industry?: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: '#fffbeb', color: '#d97706' },
  replied:  { label: 'Replied',  bg: '#eff6ff', color: '#2563eb' },
  resolved: { label: 'Resolved', bg: '#f0fdf4', color: '#059669' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Support() {
  const { industry } = useIndustry();
  const [userRole, setUserRole] = useState('customer');
  const [userEmail, setUserEmail] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [supportTopics, setSupportTopics] = useState<string[]>([]);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!industry) return;
    const key = industry.id as keyof typeof industrySupportTopics;
    setSupportTopics(industrySupportTopics[key] || industrySupportTopics.banking);
  }, [industry]);

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'customer';
    const email = localStorage.getItem('sqms_user_email') || '';
    const staffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    setUserRole(role);
    setUserEmail(email);

    const stored: SupportTicket[] = JSON.parse(localStorage.getItem('sqms_support_tickets') || '[]');
    if (role === 'staff' && staffIndustry) {
      setTickets(stored.filter(t => t.industry === staffIndustry));
    } else {
      setTickets(stored);
    }
  }, []);

  const isCustomer = userRole === 'customer';

  const visibleTickets = (isCustomer ? tickets.filter(t => t.customerEmail === userEmail) : tickets)
    .filter(t => !searchQuery || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    total: visibleTickets.length,
    pending: visibleTickets.filter(t => t.status === 'pending').length,
    replied: visibleTickets.filter(t => t.status === 'replied').length,
    resolved: visibleTickets.filter(t => t.status === 'resolved').length,
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const userName = localStorage.getItem('sqms_user_name') || 'Customer';
    const userIndustry = localStorage.getItem('sqms_staff_industry') || localStorage.getItem('sqms_industry') || 'banking';
    const newTicket: SupportTicket = {
      id: String(Date.now()),
      customerName: userName,
      customerEmail: userEmail,
      subject: formData.subject,
      message: formData.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      industry: userIndustry,
    };
    const all: SupportTicket[] = JSON.parse(localStorage.getItem('sqms_support_tickets') || '[]');
    const updated = [...all, newTicket];
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updated));
    setTickets(isCustomer ? updated.filter(t => t.customerEmail === userEmail) : updated);
    setFormData({ subject: '', message: '' });
    setSubmitting(false);
    setView('list');
  };

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const staffName = localStorage.getItem('sqms_user_name') || 'Support Staff';
    const all: SupportTicket[] = JSON.parse(localStorage.getItem('sqms_support_tickets') || '[]');
    const updated = all.map(t => t.id === ticketId
      ? { ...t, status: 'replied' as const, reply: replyText, repliedAt: new Date().toISOString(), repliedBy: staffName }
      : t
    );
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updated));
    setTickets(isCustomer ? updated.filter(t => t.customerEmail === userEmail) : updated);
    setSelectedTicket(updated.find(t => t.id === ticketId) || null);
    setReplyText('');
  };

  const handleResolve = (ticketId: string) => {
    const all: SupportTicket[] = JSON.parse(localStorage.getItem('sqms_support_tickets') || '[]');
    const updated = all.map(t => t.id === ticketId ? { ...t, status: 'resolved' as const } : t);
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updated));
    setTickets(isCustomer ? updated.filter(t => t.customerEmail === userEmail) : updated);
    setSelectedTicket(updated.find(t => t.id === ticketId) || null);
  };

  // --- Detail View ---
  if (view === 'detail' && selectedTicket) {
    const ticket = tickets.find(t => t.id === selectedTicket.id) || selectedTicket;
    return (
      <div style={{ maxWidth: 800 }}>
        <button
          onClick={() => { setView('list'); setSelectedTicket(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Tickets
        </button>

        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Ticket header */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{ticket.subject}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                  <User style={{ width: 13, height: 13 }} />{ticket.customerName} · {ticket.customerEmail}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                  <Clock style={{ width: 13, height: 13 }} />{formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          {/* Conversation */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Customer message */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase' }}>Customer Message</p>
              <p style={{ fontSize: 14, color: '#0f172a', margin: 0, lineHeight: 1.7 }}>{ticket.message}</p>
            </div>

            {/* Staff reply */}
            {ticket.reply && (
              <div style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: '16px 20px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: 12, color: '#2563eb', margin: '0 0 8px', fontWeight: 600 }}>
                  Reply from {ticket.repliedBy} · {formatDate(ticket.repliedAt!)}
                </p>
                <p style={{ fontSize: 14, color: '#0f172a', margin: 0, lineHeight: 1.7 }}>{ticket.reply}</p>
              </div>
            )}

            {/* Reply form for staff/admin */}
            {!isCustomer && ticket.status !== 'resolved' && (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                  {ticket.status === 'replied' ? 'Add Another Reply' : 'Reply to Customer'}
                </label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', resize: 'none', height: 100, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => handleReply(ticket.id)}
                    disabled={!replyText.trim()}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', backgroundColor: replyText.trim() ? '#2563eb' : '#e2e8f0', color: replyText.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: 10, cursor: replyText.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}
                  >
                    <Send style={{ width: 15, height: 15 }} /> Send Reply
                  </button>
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#f0fdf4', color: '#059669', border: '1.5px solid #86efac', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                  >
                    <CheckCircle style={{ width: 15, height: 15 }} /> Mark Resolved
                  </button>
                </div>
              </div>
            )}

            {ticket.status === 'resolved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', backgroundColor: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
                <CheckCircle style={{ width: 18, height: 18, color: '#059669' }} />
                <span style={{ fontSize: 14, color: '#059669', fontWeight: 600 }}>This ticket has been resolved</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- New Ticket Form ---
  if (view === 'new' && isCustomer) {
    return (
      <div style={{ maxWidth: 680 }}>
        <button
          onClick={() => setView('list')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Tickets
        </button>

        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle style={{ width: 22, height: 22, color: '#2563eb' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Submit Support Ticket</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>Our team will respond as soon as possible</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>Topic Category</label>
              <select
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', appearance: 'auto' }}
              >
                <option value="">Select a topic...</option>
                {supportTopics.map((topic, i) => <option key={i} value={topic}>{topic}</option>)}
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>Message</label>
              <textarea
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your issue in detail..."
                required
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', resize: 'none', height: 130, fontFamily: 'inherit', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setView('list')}
                style={{ flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', backgroundColor: '#fff', color: '#475569', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >
                <Send style={{ width: 15, height: 15 }} />
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            {isCustomer ? 'Support' : 'Support Tickets'}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
            {isCustomer ? 'Get help from our support team' : 'View and respond to customer support requests'}
          </p>
        </div>
        {isCustomer && (
          <button
            onClick={() => setView('new')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          >
            <Plus style={{ width: 16, height: 16 }} /> New Ticket
          </button>
        )}
      </div>

      {/* Stats row (staff/admin) */}
      {!isCustomer && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
            { label: 'Replied', value: stats.replied, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Resolved', value: stats.resolved, color: '#059669', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search tickets..."
          style={{ width: '100%', padding: '11px 14px 11px 38px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      {/* Empty state */}
      {visibleTickets.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '64px 40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ width: 64, height: 64, backgroundColor: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle style={{ width: 32, height: 32, color: '#cbd5e1' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>No Support Tickets</h3>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px' }}>
            {isCustomer ? "You haven't submitted any support tickets yet" : 'No customer support requests at this time'}
          </p>
          {isCustomer && (
            <button
              onClick={() => setView('new')}
              style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              Submit Your First Ticket
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => { setSelectedTicket(ticket); setView('detail'); }}
              style={{ backgroundColor: '#fff', borderRadius: 14, padding: '18px 22px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              <div style={{ width: 40, height: 40, backgroundColor: ticket.status === 'pending' ? '#fffbeb' : ticket.status === 'resolved' ? '#f0fdf4' : '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {ticket.status === 'pending' && <AlertCircle style={{ width: 20, height: 20, color: '#d97706' }} />}
                {ticket.status === 'replied' && <MessageCircle style={{ width: 20, height: 20, color: '#2563eb' }} />}
                {ticket.status === 'resolved' && <CheckCircle style={{ width: 20, height: 20, color: '#059669' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</p>
                  <StatusBadge status={ticket.status} />
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User style={{ width: 11, height: 11 }} />{ticket.customerName}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 11, height: 11 }} />{formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
              {ticket.reply && (
                <div style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: '6px 12px', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>Reply received</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
