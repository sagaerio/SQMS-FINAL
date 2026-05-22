import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { industries } from '../components/IndustrySelector';
import { ArrowLeft, LogIn, Shield } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function StaffPortal() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIndustry } = useIndustry();
  const { signIn } = useAuth();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = loginForm.email.toLowerCase().trim();
    const password = loginForm.password;

    try {
      // First, try demo accounts for quick testing
      const demoAccount = allAccounts.find(
        acc => acc.email === email && acc.password === password
      );

      if (demoAccount) {
        // Handle demo account login
        handleDemoLogin(demoAccount);
        return;
      }

      // Try Supabase authentication for real users
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError('Invalid email or password. If you created an account through sign-up, make sure your role has been set to staff/admin in the database.');
        setLoading(false);
        return;
      }

      // Wait a bit for AuthContext to populate localStorage
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get user data from localStorage (set by AuthContext after successful login)
      let userRole = localStorage.getItem('sqms_user_role');
      let userName = localStorage.getItem('sqms_user_name');
      let userEmail = localStorage.getItem('sqms_user_email');

      // If not in localStorage yet, fetch from Supabase directly
      if (!userRole) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (userError) throw userError;

          if (userData) {
            userRole = userData.role;
            userName = userData.full_name;
            userEmail = userData.email;

            // Save to localStorage
            localStorage.setItem('sqms_user_role', userData.role);
            localStorage.setItem('sqms_user_name', userData.full_name);
            localStorage.setItem('sqms_user_email', userData.email);
            localStorage.setItem('sqms_logged_in', 'true');

            // Save industry data if available
            if (userData.industry_id) {
              if (userData.role === 'admin') {
                localStorage.setItem('sqms_admin_industry', userData.industry_id);
              } else if (userData.role === 'staff') {
                localStorage.setItem('sqms_staff_industry', userData.industry_id);
              }
            }

            // Save counter ID for staff
            if (userData.role === 'staff' && userData.counter_id) {
              localStorage.setItem('sqms_staff_counter', userData.counter_id);
            }

            // Save business ID for admins
            if (userData.role === 'admin' && userData.business_id) {
              localStorage.setItem('sqms_admin_business', userData.business_id);
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user profile. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Verify the user has staff/admin/superadmin role
      if (!userRole || !['staff', 'admin', 'superadmin'].includes(userRole)) {
        setError('Access denied. This account does not have staff or admin privileges. Please contact your administrator.');
        setLoading(false);
        // Sign them out
        localStorage.removeItem('sqms_logged_in');
        return;
      }

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('sqms_staff_remembered_email', email);
        localStorage.setItem('sqms_staff_remembered_password', password);
      } else {
        localStorage.removeItem('sqms_staff_remembered_email');
        localStorage.removeItem('sqms_staff_remembered_password');
      }

      setLoading(false);

      // Navigate to appropriate dashboard
      if (userRole === 'staff') {
        navigate('/staff');
      } else {
        navigate('/admin');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof allAccounts[0]) => {
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
    localStorage.setItem('sqms_user_email', account.email);
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

    setLoading(false);

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

        <div className="max-w-md mx-auto">
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
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
