import { useState } from 'react';
import { Building2, Heart, ShoppingBag, Landmark, GraduationCap, Briefcase, X } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const industries: Industry[] = [
  {
    id: 'banking',
    name: 'Banking & Finance',
    icon: Landmark,
    color: 'from-blue-600 to-blue-700',
    description: 'Account services, loans, investments'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'from-red-600 to-pink-600',
    description: 'Medical appointments, consultations'
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: ShoppingBag,
    color: 'from-purple-600 to-purple-700',
    description: 'Customer service, returns, support'
  },
  {
    id: 'government',
    name: 'Government Services',
    icon: Building2,
    color: 'from-teal-600 to-teal-700',
    description: 'Public services, permits, documentation'
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: 'from-orange-600 to-orange-700',
    description: 'Admissions, counseling, registration'
  },
  {
    id: 'corporate',
    name: 'Corporate Office',
    icon: Briefcase,
    color: 'from-slate-600 to-slate-700',
    description: 'HR, IT support, facilities management'
  }
];

interface IndustrySelectorProps {
  onSelect: (industry: Industry) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export function IndustrySelector({ onSelect, onClose, showClose = false }: IndustrySelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  const handleSelect = (industry: Industry) => {
    setSelectedIndustry(industry);
  };

  const handleConfirm = () => {
    if (selectedIndustry) {
      onSelect(selectedIndustry);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl text-slate-800 mb-2">Choose a Business</h2>
              <p className="text-slate-600">Pick a service that makes your day simpler</p>
            </div>
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {industries.map((industry) => {
              const Icon = industry.icon;
              const isSelected = selectedIndustry?.id === industry.id;

              return (
                <button
                  key={industry.id}
                  onClick={() => handleSelect(industry)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${industry.color} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg text-slate-800 mb-2">{industry.name}</h3>
                  <p className="text-sm text-slate-600">{industry.description}</p>

                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedIndustry}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Continue with {selectedIndustry?.name || 'Selected Industry'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { industries };
export type { Industry };
