import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SQMSHeader } from './SQMSHeader';
import { BottomNav } from './BottomNav';
import { IndustrySelector } from './IndustrySelector';
import { useIndustry } from '../contexts/IndustryContext';
import type { Industry } from './IndustrySelector';

export function Layout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { industry, setIndustry } = useIndustry();
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleIndustrySelect = (selectedIndustry: Industry) => {
    setIndustry(selectedIndustry);
    setShowIndustrySelector(false);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>Q</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0',
      }}
    >
      {/* Mobile phone frame */}
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 0 40px rgba(0,0,0,0.15)',
        }}
      >
        <SQMSHeader />

        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#f8fafc',
          }}
        >
          <Outlet />
        </div>

        <BottomNav />
      </div>

      {showIndustrySelector && (
        <IndustrySelector
          onSelect={handleIndustrySelect}
          onClose={() => setShowIndustrySelector(false)}
          showClose={!!industry}
        />
      )}
    </div>
  );
}

export function MobileLayout() {
  return <Outlet />;
}
