import { useRouteError, useNavigate } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';

export function ErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl text-slate-800 mb-3">Oops! Something went wrong</h1>
        
        <p className="text-slate-600 mb-6">
          {error?.statusText || error?.message || 'An unexpected error occurred'}
        </p>

        {error?.status === 404 && (
          <p className="text-slate-500 mb-6">
            The page you're looking for doesn't exist.
          </p>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
