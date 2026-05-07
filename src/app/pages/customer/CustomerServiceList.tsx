import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MobileContainer } from '../../components/MobileContainer';
import { Users, Clock, ArrowRight } from 'lucide-react';

const SERVICES: Record<string, { id: string; name: string; waitTime: number; peopleWaiting: number }[]> = {
  banking: [
    { id: 'teller', name: 'Teller Services', waitTime: 15, peopleWaiting: 4 },
    { id: 'loan', name: 'Loan Consultation', waitTime: 45, peopleWaiting: 2 },
    { id: 'cs', name: 'Customer Service', waitTime: 10, peopleWaiting: 1 },
  ],
  healthcare: [
    { id: 'general', name: 'General Practitioner', waitTime: 30, peopleWaiting: 6 },
    { id: 'pharmacy', name: 'Pharmacy Pickup', waitTime: 5, peopleWaiting: 2 },
    { id: 'lab', name: 'Blood Test / Lab', waitTime: 20, peopleWaiting: 3 },
  ],
};

export function CustomerServiceList() {
  const { industryId } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const services = SERVICES[industryId || 'banking'] || SERVICES['banking'];

  const handleJoinQueue = (serviceId: string) => {
    setIsJoining(true);
    setTimeout(() => {
      navigate(`/customer/ticket`);
    }, 800);
  };

  return (
    <MobileContainer title="Available Services" showBack={true}>
      <div className="p-6 pb-24 relative h-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6 capitalize">{industryId} Services</h2>

        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-base">{service.name}</h3>
                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-md">Open</span>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>~{service.waitTime} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{service.peopleWaiting} waiting</span>
                </div>
              </div>

              <button 
                onClick={() => handleJoinQueue(service.id)}
                disabled={isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {isJoining ? 'Joining...' : 'Join Queue'}
                {!isJoining && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </MobileContainer>
  );
}
