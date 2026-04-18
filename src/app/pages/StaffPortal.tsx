import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { industries } from '../components/IndustrySelector';
import { ArrowRight, Building, LogIn, ArrowLeft } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';

export function StaffPortal() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState<'staff' | 'admin' | 'superadmin'>('staff');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIndustry } = useIndustry();

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('sqms_staff_remembered_email');
    const savedPassword = localStorage.getItem('sqms_staff_remembered_password');
    const savedIndustry = localStorage.getItem('sqms_staff_remembered_industry');
    const savedType = localStorage.getItem('sqms_staff_remembered_type') as 'staff' | 'admin' | 'superadmin' | null;

    if (savedEmail && savedPassword) {
      setLoginForm({ email: savedEmail, password: savedPassword });
      setRememberMe(true);

      if (savedIndustry && savedType) {
        setSelectedIndustry(savedIndustry);
        setLoginType(savedType);
        if (savedType !== 'superadmin') {
          const industry = industries.find(i => i.id === savedIndustry);
          if (industry) {
            setIndustry(industry);
          }
        }
      }
    }
  }, [setIndustry]);

  const handleIndustrySelect = (industryId: string, type: 'staff' | 'admin' | 'superadmin') => {
    setSelectedIndustry(industryId);
    setLoginType(type);
    const industry = industries.find(i => i.id === industryId);
    if (industry) {
      setIndustry(industry);
    }
    setShowLogin(true);
  };

  const handleSuperAdminSelect = () => {
    setLoginType('superadmin');
    setShowLogin(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Industry-specific credentials
    const staffAccounts: { [key: string]: { email: string; password: string; name: string; role: string } } = {
      banking: {
        email: 'staff.banking@sqms.com',
        password: 'banking123',
        name: 'Sarah Johnson',
        role: 'staff'
      },
      healthcare: {
        email: 'staff.healthcare@sqms.com',
        password: 'healthcare123',
        name: 'Dr. Michael Chen',
        role: 'staff'
      },
      retail: {
        email: 'staff.retail@sqms.com',
        password: 'retail123',
        name: 'Emily Rodriguez',
        role: 'staff'
      },
      government: {
        email: 'staff.government@sqms.com',
        password: 'government123',
        name: 'James Wilson',
        role: 'staff'
      },
      education: {
        email: 'staff.education@sqms.com',
        password: 'education123',
        name: 'Linda Martinez',
        role: 'staff'
      },
      corporate: {
        email: 'staff.corporate@sqms.com',
        password: 'corporate123',
        name: 'Robert Taylor',
        role: 'staff'
      }
    };

    const adminAccounts: { [key: string]: { email: string; password: string; name: string; role: string } } = {
      banking: {
        email: 'admin.banking@sqms.com',
        password: 'admin123',
        name: 'Banking Admin',
        role: 'admin'
      },
      healthcare: {
        email: 'admin.healthcare@sqms.com',
        password: 'admin123',
        name: 'Healthcare Admin',
        role: 'admin'
      },
      retail: {
        email: 'admin.retail@sqms.com',
        password: 'admin123',
        name: 'Retail Admin',
        role: 'admin'
      },
      government: {
        email: 'admin.government@sqms.com',
        password: 'admin123',
        name: 'Government Admin',
        role: 'admin'
      },
      education: {
        email: 'admin.education@sqms.com',
        password: 'admin123',
        name: 'Education Admin',
        role: 'admin'
      },
      corporate: {
        email: 'admin.corporate@sqms.com',
        password: 'admin123',
        name: 'Corporate Admin',
        role: 'admin'
      }
    };

    const email = loginForm.email.toLowerCase();
    const password = loginForm.password;

    // Super admin login
    if (loginType === 'superadmin') {
      if (email === 'superadmin@sqms.com' && password === 'super123') {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('sqms_staff_remembered_email', loginForm.email);
          localStorage.setItem('sqms_staff_remembered_password', loginForm.password);
          localStorage.setItem('sqms_staff_remembered_type', loginType);
          localStorage.setItem('sqms_staff_remembered_industry', '');
        } else {
          localStorage.removeItem('sqms_staff_remembered_email');
          localStorage.removeItem('sqms_staff_remembered_password');
          localStorage.removeItem('sqms_staff_remembered_type');
          localStorage.removeItem('sqms_staff_remembered_industry');
        }

        localStorage.setItem('sqms_user_role', 'superadmin');
        localStorage.setItem('sqms_user_email', email);
        localStorage.setItem('sqms_user_name', 'Super Admin');
        navigate('/admin');
      } else {
        setError('Invalid super admin credentials');
      }
      return;
    }

    // Admin login for specific industry
    if (loginType === 'admin') {
      const adminAccount = adminAccounts[selectedIndustry];
      if (adminAccount && email === adminAccount.email && password === adminAccount.password) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('sqms_staff_remembered_email', loginForm.email);
          localStorage.setItem('sqms_staff_remembered_password', loginForm.password);
          localStorage.setItem('sqms_staff_remembered_type', loginType);
          localStorage.setItem('sqms_staff_remembered_industry', selectedIndustry);
        } else {
          localStorage.removeItem('sqms_staff_remembered_email');
          localStorage.removeItem('sqms_staff_remembered_password');
          localStorage.removeItem('sqms_staff_remembered_type');
          localStorage.removeItem('sqms_staff_remembered_industry');
        }

        localStorage.setItem('sqms_user_role', adminAccount.role);
        localStorage.setItem('sqms_user_email', email);
        localStorage.setItem('sqms_user_name', adminAccount.name);
        localStorage.setItem('sqms_admin_industry', selectedIndustry);
        navigate('/admin');
      } else {
        setError('Invalid admin credentials for this industry');
      }
      return;
    }

    // Staff login for specific industry
    const staffAccount = staffAccounts[selectedIndustry];
    if (staffAccount && email === staffAccount.email && password === staffAccount.password) {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('sqms_staff_remembered_email', loginForm.email);
        localStorage.setItem('sqms_staff_remembered_password', loginForm.password);
        localStorage.setItem('sqms_staff_remembered_type', loginType);
        localStorage.setItem('sqms_staff_remembered_industry', selectedIndustry);
      } else {
        localStorage.removeItem('sqms_staff_remembered_email');
        localStorage.removeItem('sqms_staff_remembered_password');
        localStorage.removeItem('sqms_staff_remembered_type');
        localStorage.removeItem('sqms_staff_remembered_industry');
      }

      localStorage.setItem('sqms_user_role', staffAccount.role);
      localStorage.setItem('sqms_user_email', email);
      localStorage.setItem('sqms_user_name', staffAccount.name);
      localStorage.setItem('sqms_staff_industry', selectedIndustry);
      localStorage.setItem('sqms_staff_counter', '3');
      navigate('/staff');
    } else {
      setError('Invalid staff credentials for this industry');
    }
  };

  if (showLogin) {
    const selectedIndustryData = industries.find(i => i.id === selectedIndustry);
    const Icon = selectedIndustryData?.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-200">
            {/* Back Button */}
            <button
              onClick={() => setShowLogin(false)}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Industry Badge */}
            {loginType !== 'superadmin' && selectedIndustryData && Icon && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className={`bg-gradient-to-r ${selectedIndustryData.color} rounded-lg p-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg text-slate-800">{selectedIndustryData.name}</span>
                </div>
              </div>
            )}

            {/* Login Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl text-slate-800 mb-2">
                {loginType === 'superadmin' ? 'Super Admin Login' : loginType === 'admin' ? 'Admin Login' : 'Staff Login'}
              </h2>
              <p className="text-slate-600">
                {loginType === 'superadmin' ? 'Access all business analytics' : loginType === 'admin' ? 'Manage your industry' : 'Access your counter'}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="staff@sqms.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  maxLength={20}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Login
              </button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
              <p className="text-blue-900 font-semibold mb-2">
                Demo Credentials{loginType !== 'superadmin' && selectedIndustryData ? ` for ${selectedIndustryData.name}` : ''}:
              </p>
              <div className="space-y-1 text-blue-700">
                {loginType === 'superadmin' && (
                  <p><strong>Super Admin:</strong> superadmin@sqms.com / super123</p>
                )}
                {loginType === 'admin' && (
                  <p><strong>Admin:</strong> admin.{selectedIndustry}@sqms.com / admin123</p>
                )}
                {loginType === 'staff' && (
                  <p><strong>Staff:</strong> staff.{selectedIndustry}@sqms.com / {selectedIndustry}123</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Building className="w-4 h-4" />
            STAFF PORTAL
          </div>
          <h1 className="text-5xl text-slate-900 mb-4">Select Your Role</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your industry and role to access your dashboard
          </p>
        </div>

        {/* Super Admin Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl mb-2">Super Administrator</h2>
                <p className="text-white/90 mb-4">Manage all businesses and view analytics across all industries</p>
              </div>
              <button
                onClick={handleSuperAdminSelect}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Industry Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.id}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200"
              >
                <div className={`bg-gradient-to-r ${industry.color} rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2">
                  {industry.name}
                </h3>
                <p className="text-slate-600 mb-6 text-sm">{industry.description}</p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleIndustrySelect(industry.id, 'admin')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => handleIndustrySelect(industry.id, 'staff')}
                    className="w-full bg-slate-600 text-white py-2.5 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                  >
                    Staff Login
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
