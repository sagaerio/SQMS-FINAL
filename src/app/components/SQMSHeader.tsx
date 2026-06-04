import { useNavigate } from 'react-router';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SQMSHeaderProps {
  unreadCount?: number;
}

export function SQMSHeader({ unreadCount = 0 }: SQMSHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user?.full_name
    ? user.full_name.trim().split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Logo row */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', letterSpacing: -0.5 }}>Q</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: 0.5 }}>SQMS</span>
      </div>

      {/* Right row */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Bell */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Bell size={18} color="#475569" />
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px',
                border: '1.5px solid #ffffff',
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 800, color: '#ffffff', lineHeight: '10px' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: 0.5 }}>{initials}</span>
        </button>
      </div>
    </div>
  );
}
