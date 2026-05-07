import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Ticket,
  Bell,
  Briefcase,
  Calendar,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  MessageCircle,
  Settings,
  Users,
  MessageSquare,
  Building2,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { IndustrySelector } from './IndustrySelector';
import type { Industry } from './IndustrySelector';

// Navigation items based on user roles
const getNavItems = (userRole: string) => {
  // Super admin has different navigation
  if (userRole === 'superadmin') {
    return [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['superadmin'] },
      { path: '/business-requests', icon: FileText, label: 'Requests', roles: ['superadmin'] },
      { path: '/businesses', icon: Building2, label: 'Businesses', roles: ['superadmin'] },
      { path: '/employees', icon: Users, label: 'Employees', roles: ['superadmin'] },
      { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['superadmin'] },
    ];
  }

  const baseItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'staff', 'customer'] },
    { path: '/admin', icon: Settings, label: 'Admin Panel', roles: ['admin'] },
    { path: '/staff', icon: Users, label: 'My Counter', roles: ['staff'] },
    { path: '/employees', icon: Users, label: 'Employees', roles: ['admin'] },
    { path: '/services', icon: Briefcase, label: 'Services', roles: ['customer'] },
    { path: '/status', icon: Bell, label: 'Queue Status', roles: ['admin', 'staff', 'customer'] },
    { path: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'staff', 'customer'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
    { path: '/support', icon: MessageCircle, label: 'Support', roles: ['admin', 'staff', 'customer'] },
    { path: '/chat', icon: MessageSquare, label: 'Chat', roles: ['admin', 'staff'] },
  ];

  return baseItems.filter(item => item.roles.includes(userRole));
};

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('customer');
  const [navItems, setNavItems] = useState<any[]>([]);
  const { industry, setIndustry } = useIndustry();
  const { user, signOut } = useAuth();
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);

  useEffect(() => {
    const email = user?.email || localStorage.getItem('sqms_user_email') || 'demo@sqms.com';
    const role = user?.role || localStorage.getItem('sqms_user_role') || 'customer';
    const name = user?.full_name || localStorage.getItem('sqms_user_name') || 'Demo User';

    setUserEmail(email);
    setUserRole(role);
    setUserName(name);
    setNavItems(getNavItems(role));

    // Show industry selector on first visit
    if (!industry) {
      setShowIndustrySelector(true);
    }
  }, [industry, user]);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');
    navigate('/login');
  };

  const handleIndustrySelect = (selectedIndustry: Industry) => {
    setIndustry(selectedIndustry);
    setShowIndustrySelector(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <Logo className="w-12" />
              <span className="text-xl font-bold text-slate-800">SQMS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Profile Menu & Mobile Button */}
            <div className="flex items-center gap-2">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm text-slate-700">{userName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm text-slate-800">{userName}</p>
                      <p className="text-xs text-slate-500">{userEmail}</p>
                      <p className="text-xs text-blue-600 mt-1 capitalize">{userRole}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </button>
                    {industry && userRole === 'customer' && (
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setShowIndustrySelector(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-all"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Change Service</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-600" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Industry Selector Modal */}
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