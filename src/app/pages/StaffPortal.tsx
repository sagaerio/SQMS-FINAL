import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { industries } from '../components/IndustrySelector';
import { ArrowLeft, LogIn, Shield } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';

export function StaffPortal() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIndustry } = useIndustry();

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('sqms_staff_remembered_email');
    const savedPassword = localStorage.getItem('sqms_staff_remembered_password');

    if (savedEmail && savedPassword) {
      setLoginForm({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  // All staff accounts with industry and role info
  const allAccounts = [
    // Super Admin
    {
      email: 'superadmin@sqms.com',
      password: 'super123',
      name: 'Super Admin',
      role: 'superadmin',
      industry: null,
      displayRole: 'Super Administrator',
      description: 'Full system access'
    },
    // Industry Admins
    ...industries.map(ind => ({
      email: `admin.${ind.id}@sqms.com`,
      password: 'admin123',
      name: `${ind.name} Admin`,
      role: 'admin',
      industry: ind.id,
      displayRole: 'Admin',
      description: ind.name
    })),
    // Industry Staff
    ...industries.map(ind => {
      const staffNames: { [key: string]: string } = {
        banking: 'Sarah Johnson',
        healthcare: 'Dr. Michael Chen',
        retail: 'Emily Rodriguez',
        government: 'James Wilson',
        education: 'Linda Martinez',
        corporate: 'Robert Taylor'
      };
      return {
        email: `staff.${ind.id}@sqms.com`,
        password: `${ind.id}123`,
        name: staffNames[ind.id] || 'Staff Member',
        role: 'staff',
        industry: ind.id,
        displayRole: 'Staff',
        description: ind.name
      };
    })
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const email = loginForm.email.toLowerCase();
    const password = loginForm.password;

    // Find matching account
    const account = allAccounts.find(
      acc => acc.email === email && acc.password === password
    );

    if (!account) {
      setError('Invalid credentials. Please use one of the demo accounts listed below.');
      return;
    }

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('sqms_staff_remembered_email', loginForm.email);
      localStorage.setItem('sqms_staff_remembered_password', loginForm.password);
    } else {
      localStorage.removeItem('sqms_staff_remembered_email');
      localStorage.removeItem('sqms_staff_remembered_password');
    }

    // Set user data in localStorage
    localStorage.setItem('sqms_logged_in', 'true');
    localStorage.setItem('sqms_user_role', account.role);
    localStorage.setItem('sqms_user_email', email);
    localStorage.setItem('sqms_user_name', account.name);

    // Set industry context if applicable
    if (account.industry) {
      const industry = industries.find(i => i.id === account.industry);
      if (industry) {
        setIndustry(industry);
      }

      if (account.role === 'admin') {
        localStorage.setItem('sqms_admin_industry', account.industry);
      } else if (account.role === 'staff') {
        localStorage.setItem('sqms_staff_industry', account.industry);
        localStorage.setItem('sqms_staff_counter', '3');
      }
    }

    // Navigate to appropriate dashboard
    if (account.role === 'staff') {
      navigate('/staff');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-200">
            {/* Login Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl text-slate-800 mb-2">Staff Portal Login</h2>
              <p className="text-slate-600">Access your staff dashboard</p>
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
          </div>

          {/* Demo Credentials */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl text-slate-800">Demo Login Credentials</h3>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Use any of these demo accounts to login to the staff portal
            </p>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {/* Super Admin */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-600 rounded-lg px-3 py-1 text-xs text-white font-semibold">
                    SUPER ADMIN
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700">
                    <strong>Email:</strong> {allAccounts[0].email}
                  </p>
                  <p className="text-slate-700">
                    <strong>Password:</strong> {allAccounts[0].password}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">{allAccounts[0].description}</p>
                </div>
              </div>

              {/* Industry Admins */}
              <div className="border-t-2 border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase">Industry Admins</h4>
                <div className="space-y-3">
                  {allAccounts.slice(1, 7).map((account, index) => {
                    const industry = industries.find(i => i.id === account.industry);
                    const Icon = industry?.icon;
                    return (
                      <div key={index} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {Icon && (
                            <div className={`bg-gradient-to-r ${industry.color} rounded p-1`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="bg-blue-600 rounded-lg px-3 py-1 text-xs text-white font-semibold">
                            ADMIN
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-700">
                            <strong>Email:</strong> {account.email}
                          </p>
                          <p className="text-slate-700">
                            <strong>Password:</strong> {account.password}
                          </p>
                          <p className="text-xs text-slate-600 mt-2">{account.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Industry Staff */}
              <div className="border-t-2 border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase">Industry Staff</h4>
                <div className="space-y-3">
                  {allAccounts.slice(7).map((account, index) => {
                    const industry = industries.find(i => i.id === account.industry);
                    const Icon = industry?.icon;
                    return (
                      <div key={index} className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {Icon && (
                            <div className={`bg-gradient-to-r ${industry.color} rounded p-1`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="bg-slate-600 rounded-lg px-3 py-1 text-xs text-white font-semibold">
                            STAFF
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-700">
                            <strong>Email:</strong> {account.email}
                          </p>
                          <p className="text-slate-700">
                            <strong>Password:</strong> {account.password}
                          </p>
                          <p className="text-xs text-slate-600 mt-2">
                            {account.name} - {account.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
