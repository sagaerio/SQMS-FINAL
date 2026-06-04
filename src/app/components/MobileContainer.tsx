import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function MobileContainer({
  title,
  showBack = false,
  children
}: {
  title?: string;
  showBack?: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {title && (
        <div style={{ height: 56, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16, flexShrink: 0, position: 'relative' }}>
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              style={{ position: 'absolute', left: 8, padding: 8, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <ChevronLeft size={24} color="#334155" />
            </button>
          )}
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', textAlign: 'center', width: '100%', margin: 0 }}>{title}</h1>
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        {children}
      </div>
    </div>
  );
}

export function MobileLayout() {
  return (
    <Outlet />
  );
}
