import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  BellDot,
  Calendar,
  HeadphonesIcon,
  PersonStanding,
  Bell,
  MessageSquare,
  ListOrdered,
  ChartBar,
  FileText,
  Building2,
  Users,
  Gauge,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Tab = {
  key: string;
  label: string;
  icon: React.ElementType;
  route: string;
};

const CUSTOMER_TABS: Tab[] = [
  { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard,  route: '/dashboard'   },
  { key: 'services',     label: 'Services',     icon: BriefcaseBusiness,route: '/services'    },
  { key: 'queue-status', label: 'Queue Status', icon: BellDot,          route: '/status'      },
  { key: 'appointments', label: 'Appointments', icon: Calendar,         route: '/appointments'},
  { key: 'support',      label: 'Support',      icon: HeadphonesIcon,   route: '/support'     },
];

const STAFF_TABS: Tab[] = [
  { key: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, route: '/dashboard'   },
  { key: 'my-counter',    label: 'My Counter',    icon: PersonStanding,  route: '/staff'       },
  { key: 'appointments',  label: 'Appointments',  icon: Calendar,        route: '/appointments'},
  { key: 'notifications', label: 'Alerts',        icon: Bell,            route: '/notifications'},
  { key: 'chat',          label: 'Chat',          icon: MessageSquare,   route: '/chat'        },
];

const ADMIN_TABS: Tab[] = [
  { key: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, route: '/admin'       },
  { key: 'appointments',  label: 'Appointments',  icon: Calendar,        route: '/appointments'},
  { key: 'queue',         label: 'Queue',         icon: ListOrdered,     route: '/status'      },
  { key: 'notifications', label: 'Alerts',        icon: Bell,            route: '/notifications'},
  { key: 'chat',          label: 'Chat',          icon: MessageSquare,   route: '/chat'        },
];

const SUPERADMIN_TABS: Tab[] = [
  { key: 'dashboard',  label: 'Dashboard',  icon: Gauge,          route: '/admin'              },
  { key: 'requests',   label: 'Requests',   icon: FileText,       route: '/business-requests'  },
  { key: 'businesses', label: 'Businesses', icon: Building2,      route: '/businesses'         },
  { key: 'employees',  label: 'Employees',  icon: Users,          route: '/employees'          },
  { key: 'analytics',  label: 'Analytics',  icon: ChartBar,       route: '/analytics'          },
];

interface BottomNavProps {
  unreadCount?: number;
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role || 'customer';
  const isCustomerMode = typeof window !== 'undefined' && localStorage.getItem('sqms_customer_mode') === 'true';

  let tabs: Tab[];
  if (isCustomerMode && (role === 'staff' || role === 'admin' || role === 'superadmin')) {
    tabs = CUSTOMER_TABS;
  } else if (role === 'superadmin') {
    tabs = SUPERADMIN_TABS;
  } else if (role === 'admin') {
    tabs = ADMIN_TABS;
  } else if (role === 'staff') {
    tabs = STAFF_TABS;
  } else {
    tabs = CUSTOMER_TABS;
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 8,
        flexShrink: 0,
      }}
    >
      {tabs.map(tab => {
        const active = location.pathname === tab.route || location.pathname.startsWith(tab.route + '/');
        const showBadge = tab.key === 'notifications' && unreadCount > 0;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.route)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              paddingTop: 4,
              paddingBottom: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? '#eff6ff' : 'transparent',
                position: 'relative',
              }}
            >
              <Icon size={20} color={active ? '#2563eb' : '#94a3b8'} />
              {showBadge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
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
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: active ? '#2563eb' : '#94a3b8',
                letterSpacing: 0.2,
                textTransform: 'uppercase',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
