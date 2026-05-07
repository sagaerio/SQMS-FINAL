import React from 'react';
import { useNavigate } from 'react-router';
import { MobileContainer } from '../../components/MobileContainer';
import { QRCodeSVG } from 'qrcode.react';
import { Bell, MapPin, X } from 'lucide-react';
import { motion } from 'motion/react';

export function CustomerQueueTicket() {
  const navigate = useNavigate();

  return (
    <MobileContainer title="Your Ticket" showBack={false}>
      <div className="p-6 h-full flex flex-col bg-slate-50">
        
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/customer')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="bg-blue-100 text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-full">Active Status</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col relative"
        >
          {/* Ticket Header */}
          <div className="bg-blue-600 text-white p-6 text-center">
            <p className="text-blue-200 text-sm font-medium mb-1">Banking • Teller Services</p>
            <h1 className="text-5xl font-black tracking-tight mb-2">A-042</h1>
            <p className="text-sm opacity-90">Please wait for your number to be called</p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 flex flex-col items-center flex-1">
            <div className="flex w-full justify-between mb-8 border-b border-slate-100 pb-6">
              <div className="text-center">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Wait Time</p>
                <p className="text-2xl font-bold text-slate-800">~15 <span className="text-sm font-normal text-slate-500">min</span></p>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ahead of You</p>
                <p className="text-2xl font-bold text-slate-800">4 <span className="text-sm font-normal text-slate-500">people</span></p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-8">
              <QRCodeSVG value="sqms-ticket-A042" size={160} level="H" fgColor="#0f172a" />
            </div>

            <div className="mt-auto w-full">
              <div className="bg-teal-50 text-teal-800 p-4 rounded-xl flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Assigned Area</h4>
                  <p className="text-xs text-teal-600/80">Please wait in the Main Lobby seating area. We will notify you when it's your turn.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ticket perforated edge effect */}
          <div className="absolute top-[138px] left-0 w-4 h-8 bg-slate-50 rounded-r-full"></div>
          <div className="absolute top-[138px] right-0 w-4 h-8 bg-slate-50 rounded-l-full"></div>
        </motion.div>

        <button className="mt-6 w-full bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5" />
          Turn on Notifications
        </button>
      </div>
    </MobileContainer>
  );
}
