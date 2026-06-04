import { Bell, CheckCircle2, Info, AlertCircle } from 'lucide-react';

const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'Queue Update', message: 'Your ticket A-042 has been called. Please proceed to Counter 3.', time: '2 min ago', type: 'called', read: false },
  { id: 2, title: 'Appointment Confirmed', message: 'Your appointment for General Teller has been confirmed for tomorrow at 10:00 AM.', time: '1 hr ago', type: 'success', read: false },
  { id: 3, title: 'System Notice', message: 'SQMS will undergo maintenance on Sunday 2:00 AM – 4:00 AM.', time: '3 hrs ago', type: 'info', read: true },
  { id: 4, title: 'Service Completed', message: 'Your service at Downtown Branch has been completed. Thank you!', time: 'Yesterday', type: 'success', read: true },
];

export function Notifications() {
  return (
    <div style={{ padding: 16, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 4 }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Notifications</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Mark all read</span>
      </div>

      {DEMO_NOTIFICATIONS.map(notif => {
        const iconColor = notif.type === 'called' ? '#2563eb' : notif.type === 'success' ? '#059669' : '#d97706';
        const iconBg = notif.type === 'called' ? '#eff6ff' : notif.type === 'success' ? '#f0fdf4' : '#fffbeb';
        const Icon = notif.type === 'called' ? Bell : notif.type === 'success' ? CheckCircle2 : Info;
        return (
          <div
            key={notif.id}
            style={{
              display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12,
              backgroundColor: notif.read ? '#fff' : '#f8faff',
              borderRadius: 16, padding: 14,
              border: `1px solid ${notif.read ? '#e2e8f0' : '#bfdbfe'}`,
              boxShadow: '0 1px 6px rgba(15,23,42,0.04)',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={iconColor} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{notif.title}</p>
                {!notif.read && <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: 12, color: '#475569', fontWeight: 500, margin: '4px 0 0', lineHeight: 1.5 }}>{notif.message}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: '4px 0 0' }}>{notif.time}</p>
            </div>
          </div>
        );
      })}

      {DEMO_NOTIFICATIONS.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={32} color="#94a3b8" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No notifications</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
