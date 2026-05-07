import React from 'react';
import { useNavigate } from 'react-router';
import { MobileContainer } from '../components/MobileContainer';
import { Building2, HeartPulse, ShoppingBag, Landmark, GraduationCap, Building } from 'lucide-react';

const INDUSTRIES = [
  { id: 'banking', name: 'Banking', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'healthcare', name: 'Healthcare', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'retail', name: 'Retail', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'government', name: 'Government', icon: Landmark, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
  { id: 'corporate', name: 'Corporate', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

export function CustomerHome() {
  const navigate = useNavigate();

  return (
    <MobileContainer title="Select Service" showBack={true}>
      <div className="p-6 pb-24">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Where do you need to go?</h2>
        <p className="text-sm text-slate-500 mb-6">Choose an industry to join the queue.</p>

        <div className="grid grid-cols-2 gap-4">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => navigate(`/customer/service/${ind.id}`)}
              className={`flex flex-col items-center justify-center p-6 rounded-3xl border ${ind.border} bg-white shadow-sm hover:shadow-md transition-all active:scale-95`}
            >
              <div className={`w-14 h-14 rounded-full ${ind.bg} flex items-center justify-center mb-3`}>
                <ind.icon className={`w-7 h-7 ${ind.color}`} />
              </div>
              <span className="font-semibold text-slate-700 text-sm">{ind.name}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileContainer>
  );
}
