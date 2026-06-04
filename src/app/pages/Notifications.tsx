import { Bell, CheckCircle2, Info, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';

const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'Queue Update', message: 'Your ticket A-042 has been called. Please proceed to Counter 3.', time: '2 min ago', type: 'called', read: false },
  { id: 2, title: 'Appointment Confirmed', message: 'Your appointment for General Teller has been confirmed for tomorrow at 10:00 AM.', time: '1 hr ago', type: 'success', read: false },
  { id: 3, title: 'System Notice', message: 'SQMS will undergo maintenance on Sunday 2:00 AM – 4:00 AM. All services will be temporarily unavailable.', time: '3 hrs ago', type: 'info', read: true },
  { id: 4, title: 'Service Completed', message: 'Your service at Downtown Branch has been completed. Thank you for using SQMS!', time: 'Yesterday', type: 'success', read: true },
  { id: 5, title: 'New Business Request', message: 'A new business registration request is awaiting your approval.', time: '2 days ago', type: 'info', read: true },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>Notifications</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>
            <Check size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(notif => {
          const iconColor = notif.type === 'called' ? '#2563eb' : notif.type === 'success' ? '#059669' : '#d97706';
          const iconBg    = notif.type === 'called' ? '#eff6ff' : notif.type === 'success' ? '#f0fdf4' : '#fffbeb';
          const Icon = notif.type === 'called' ? Bell : notif.type === 'success' ? CheckCircle2 : Info;
          return (
            <div key={notif.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              backgroundColor: notif.read ? '#fff' : '#f8faff',
              borderRadius: 16, padding: '18px 20px',
              border: `1px solid ${notif.read ? '#e2e8f0' : '#bfdbfe'}`,
              boxShadow: notif.read ? 'none' : '0 2px 8px rgba(37,99,235,0.06)',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={iconColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{notif.title}</p>
                    <p style={{ fontSize: 14, color: '#475569', margin: '5px 0 0', lineHeight: 1.6, fontWeight: 400 }}>{notif.message}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', fontWeight: 500 }}>{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <div style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563eb', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={36} color="#94a3b8" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>No notifications</p>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
