import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Bell, User, LogOut, ChevronDown,
  ListOrdered, Calendar, BarChart2, HeadphonesIcon,
  Users, MessageSquare, FileText, Building2, Settings,
  Activity, ShoppingBag, ChevronRight,
} from 'lucide-react';

type NavItem = { path: string; icon: React.ElementType; label: string };

function getNavItems(role: string, isCustomerMode: boolean): NavItem[] {
  if (isCustomerMode && (role === 'staff' || role === 'admin' || role === 'superadmin')) {
    return [
      { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
      { path: '/services',     icon: ListOrdered,     label: 'Services'     },
      { path: '/status',       icon: Activity,        label: 'Queue Status' },
      { path: '/appointments', icon: Calendar,        label: 'Appointments' },
      { path: '/support',      icon: HeadphonesIcon,  label: 'Support'      },
    ];
  }
  if (role === 'superadmin') {
    return [
      { path: '/admin',              icon: LayoutDashboard, label: 'Dashboard'         },
      { path: '/business-requests',  icon: FileText,        label: 'Business Requests' },
      { path: '/businesses',         icon: Building2,       label: 'Businesses'        },
      { path: '/employees',          icon: Users,           label: 'Employees'         },
      { path: '/analytics',          icon: BarChart2,       label: 'Analytics'         },
      { path: '/notifications',      icon: Bell,            label: 'Notifications'     },
    ];
  }
  if (role === 'admin') {
    return [
      { path: '/admin',         icon: LayoutDashboard, label: 'Dashboard'    },
      { path: '/status',        icon: Activity,        label: 'Queue Monitor'},
      { path: '/employees',     icon: Users,           label: 'Employees'    },
      { path: '/appointments',  icon: Calendar,        label: 'Appointments' },
      { path: '/analytics',     icon: BarChart2,       label: 'Analytics'    },
      { path: '/support',       icon: HeadphonesIcon,  label: 'Support'      },
      { path: '/chat',          icon: MessageSquare,   label: 'Chat'         },
      { path: '/notifications', icon: Bell,            label: 'Notifications'},
    ];
  }
  if (role === 'staff') {
    return [
      { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'    },
      { path: '/staff',         icon: Users,           label: 'My Counter'   },
      { path: '/appointments',  icon: Calendar,        label: 'Appointments' },
      { path: '/chat',          icon: MessageSquare,   label: 'Chat'         },
      { path: '/notifications', icon: Bell,            label: 'Notifications'},
    ];
  }
  return [
    { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
    { path: '/services',     icon: ListOrdered,     label: 'Services'     },
    { path: '/status',       icon: Activity,        label: 'Queue Status' },
    { path: '/appointments', icon: Calendar,        label: 'Appointments' },
    { path: '/support',      icon: HeadphonesIcon,  label: 'Support'      },
    { path: '/notifications',icon: Bell,            label: 'Notifications'},
  ];
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCustomerMode, setIsCustomerMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    setIsCustomerMode(localStorage.getItem('sqms_customer_mode') === 'true');
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    ['sqms_logged_in','sqms_user_email','sqms_user_role','sqms_user_name','sqms_customer_mode'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const toggleCustomerMode = () => {
    const next = !isCustomerMode;
    setIsCustomerMode(next);
    localStorage.setItem('sqms_customer_mode', String(next));
    setProfileOpen(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>Q</span>
          </div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading SQMS…</p>
        </div>
      </div>
    );
  }

  const role = user?.role ?? 'customer';
  const navItems = getNavItems(role, isCustomerMode);
  const initials = user?.full_name ? user.full_name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : 'U';
  const displayRole = isCustomerMode ? 'Customer Mode' : role.charAt(0).toUpperCase() + role.slice(1);

  // Page title from path
  const pageTitle = navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.label
    ?? location.pathname.slice(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0, backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>Q</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: 0.5 }}>SQMS</p>
            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, margin: 0, letterSpacing: 0.5, textTransform: 'uppercase' }}>Smart Queue Manager</p>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: isCustomerMode ? '#f0fdf4' : role === 'superadmin' ? '#f5f3ff' : role === 'admin' ? '#eff6ff' : role === 'staff' ? '#ecfdf5' : '#f0f9ff', borderRadius: 8, padding: '5px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isCustomerMode ? '#059669' : role === 'superadmin' ? '#7c3aed' : role === 'admin' ? '#2563eb' : role === 'staff' ? '#059669' : '#0891b2' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isCustomerMode ? '#059669' : role === 'superadmin' ? '#7c3aed' : role === 'admin' ? '#2563eb' : role === 'staff' ? '#059669' : '#0891b2' }}>{displayRole}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 8px 4px', margin: 0 }}>Navigation</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10,
                  backgroundColor: active ? '#eff6ff' : 'transparent',
                  color: active ? '#2563eb' : '#64748b',
                  textDecoration: 'none', fontWeight: active ? 700 : 500,
                  fontSize: 14, transition: 'all 0.15s',
                }}
              >
                <Icon size={18} color={active ? '#2563eb' : '#94a3b8'} />
                {item.label}
                {active && <ChevronRight size={14} color="#2563eb" style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10, backgroundColor: '#f8fafc' }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{initials}</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name ?? 'User'}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginTop: 4, borderRadius: 8, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
            <LogOut size={15} color="#ef4444" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top header */}
        <header style={{
          height: 64, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 32px',
          position: 'sticky', top: 0, zIndex: 40,
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>{pageTitle}</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Customer mode toggle for staff/admin */}
            {(role === 'staff' || role === 'admin' || role === 'superadmin') && (
              <button
                onClick={toggleCustomerMode}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 10,
                  border: `1px solid ${isCustomerMode ? '#a7f3d0' : '#e2e8f0'}`,
                  backgroundColor: isCustomerMode ? '#ecfdf5' : '#f8fafc',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: isCustomerMode ? '#059669' : '#64748b',
                }}
              >
                <ShoppingBag size={15} />
                {isCustomerMode ? 'Customer Mode ON' : 'Customer Mode'}
              </button>
            )}

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={18} color="#475569" />
            </button>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{initials}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{user?.full_name?.split(' ')[0] ?? 'User'}</span>
                <ChevronDown size={14} color="#94a3b8" />
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 220, backgroundColor: '#ffffff', borderRadius: 14, boxShadow: '0 8px 32px rgba(15,23,42,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 100 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{user?.full_name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{user?.email}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#334155' }}>
                    <User size={15} /> My Profile
                  </button>
                  <button onClick={() => { setProfileOpen(false); handleLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#ef4444', borderTop: '1px solid #f1f5f9' }}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function MobileLayout() {
  return <Outlet />;
}
