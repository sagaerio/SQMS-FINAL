import React from 'react';
import { useNavigate } from 'react-router';
import { MobileContainer } from '../../components/MobileContainer';
import { Users, Clock, Building, TrendingUp, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');
    navigate('/login');
  };

  return (
    <MobileContainer title="Admin Overview">
      <div className="h-full bg-slate-50 overflow-y-auto pb-24">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">System Status</h2>
              <p className="text-slate-400 text-sm">All branches operating normally</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                <span>Total Waiting</span>
              </div>
              <p className="text-3xl font-bold">142</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Avg Wait</span>
              </div>
              <p className="text-3xl font-bold">18<span className="text-base font-normal text-slate-400 ml-1">min</span></p>
            </div>
          </div>
        </div>

        {/* Branches */}
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-400" />
            Branch Activity
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Downtown Main', waiting: 45, status: 'busy', color: 'text-rose-600', bg: 'bg-rose-50' },
              { name: 'Northside Branch', waiting: 12, status: 'normal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { name: 'West End Hub', waiting: 28, status: 'moderate', color: 'text-amber-600', bg: 'bg-amber-50' }
            ].map((branch, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{branch.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{branch.waiting} people waiting</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${branch.bg} ${branch.color} uppercase tracking-wider`}>
                  {branch.status}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h3 className="font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-2 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Manage Staff</span>
            </button>
            <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-2 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
