import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send password reset email via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        setEmailSent(true);
        showNotification('Password reset email sent! Check your inbox.', 'success', 10000);
      }
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
      showNotification('Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-200">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          {!emailSent ? (
            <>
              <h2 className="text-3xl mb-2 text-slate-800">Reset Password</h2>
              <p className="text-slate-600 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSendResetEmail} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl mb-2 text-slate-800">Check Your Email</h2>
              <p className="text-slate-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset password link</li>
                  <li>Create your new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setError('');
                }}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Send Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
