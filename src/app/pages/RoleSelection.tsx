import React from 'react';
import { useNavigate } from 'react-router';
import { MobileContainer } from '../components/MobileContainer';
import { UserCircle, Briefcase, ShieldAlert, MonitorSmartphone } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <MobileContainer title="Select Your Role">
      <div className="p-6 flex flex-col items-center justify-center h-full min-h-[600px] bg-gradient-to-b from-blue-50 to-white">
        
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
          <MonitorSmartphone className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to SQMS</h2>
        <p className="text-slate-500 text-center mb-10 text-sm">
          Smart Queue Management System. Please select your role to continue.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={() => navigate('/customer')}
            className="w-full bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <UserCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Customer</h3>
              <p className="text-xs text-slate-500">Join queues and track status</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/staff')}
            className="w-full bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Briefcase className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Staff Counter</h3>
              <p className="text-xs text-slate-500">Manage your active queue</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <ShieldAlert className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Admin / Manager</h3>
              <p className="text-xs text-slate-500">System overview & analytics</p>
            </div>
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
