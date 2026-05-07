import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileContainer } from '../../components/MobileContainer';
import { User, CheckCircle2, ArrowRightCircle, Clock, Search, LogOut } from 'lucide-react';

export function StaffDashboard() {
  const navigate = useNavigate();
  const [currentTicket, setCurrentTicket] = useState('A-040');
  const [status, setStatus] = useState<'serving' | 'idle'>('serving');

  const handleNext = () => {
    setStatus('serving');
    setCurrentTicket(prev => {
      const num = parseInt(prev.split('-')[1]) + 1;
      return `A-${num.toString().padStart(3, '0')}`;
    });
  };

  const handleComplete = () => {
    setStatus('idle');
  };

  return (
    <MobileContainer title="Counter 3 • Teller">
      <div className="h-full flex flex-col bg-slate-50 relative">
        
        {/* Header Profile / Actions */}
        <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Sarah Jenkins</p>
              <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Main Dashboard Area */}
        <div className="p-6 flex-1 flex flex-col">
          
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Current Serving</h2>
              <p className="text-sm text-slate-500">Queue: General Teller</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-800">4</p>
              <p className="text-xs text-slate-500 font-medium">WAITING</p>
            </div>
          </div>

          {/* Active Ticket Card */}
          <div className={`flex-1 rounded-3xl border-2 transition-all flex flex-col items-center justify-center p-8 text-center mb-6 shadow-sm
            ${status === 'serving' ? 'bg-white border-blue-500 shadow-blue-100' : 'bg-slate-100 border-slate-200 border-dashed'}
          `}>
            {status === 'serving' ? (
              <>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Now Serving</p>
                <h1 className="text-6xl font-black text-slate-900 mb-6">{currentTicket}</h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>Waiting time: 14m</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Counter Idle</h3>
                <p className="text-sm text-slate-500">Call the next customer when you are ready.</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-auto">
            {status === 'serving' ? (
              <>
                <button className="col-span-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                  <Search className="w-5 h-5" />
                  View Customer Info
                </button>
                <button 
                  onClick={handleComplete}
                  className="col-span-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-teal-200"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Complete Serving
                </button>
              </>
            ) : (
              <button 
                onClick={handleNext}
                className="col-span-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200"
              >
                Call Next Customer
                <ArrowRightCircle className="w-6 h-6" />
              </button>
            )}
          </div>

        </div>
      </div>
    </MobileContainer>
  );
}
