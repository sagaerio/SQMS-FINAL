import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function MobileContainer({ 
  title, 
  showBack = false, 
  children 
}: { 
  title?: string;
  showBack?: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[850px] sm:h-[850px] sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 relative overflow-hidden flex flex-col">
      {/* Top Status Bar Simulator (Decorative) */}
      <div className="w-full h-7 bg-slate-900/5 flex justify-between items-center px-6 pt-1 text-[10px] font-medium text-slate-800 z-50 shrink-0">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20V2z"/></svg>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
        </div>
      </div>

      {/* Dynamic Header */}
      {title && (
        <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 shrink-0 z-40 relative">
          {showBack && (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors absolute left-4"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-slate-800 text-center w-full">{title}</h1>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-slate-50">
        {children}
      </div>
    </div>
  );
}

export function MobileLayout() {
  return (
    <Outlet />
  );
}
