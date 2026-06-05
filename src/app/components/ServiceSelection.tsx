import { useState, useEffect } from 'react';
import { X, Briefcase, Heart, ShoppingBag, Landmark, GraduationCap, Building2 } from 'lucide-react';
import { getServicesByIndustry } from '../../services/queueService';

interface Service {
  id: string;
  name: string;
  description: string;
  estimated_time?: number;
}

// Fallback data used when Supabase has no records for the industry
const servicesByIndustry: Record<string, Service[]> = {
  banking: [
    { id: 'account-opening',   name: 'Account Opening',    description: 'Open a new savings or checking account',      estimated_time: 30 },
    { id: 'card-services',     name: 'Card Services',       description: 'Credit and debit card applications',           estimated_time: 20 },
    { id: 'customer-service',  name: 'Customer Service',    description: 'General banking enquiries and assistance',     estimated_time: 10 },
    { id: 'loan-consultation', name: 'Loan Consultation',   description: 'Personal and business loan consultation',      estimated_time: 45 },
    { id: 'teller-services',   name: 'Teller Services',     description: 'Cash deposits, withdrawals and transfers',     estimated_time: 10 },
  ],
  corporate: [
    { id: 'facilities',   name: 'Facilities',  description: 'Building maintenance and facilities requests', estimated_time: 10 },
    { id: 'hr-services',  name: 'HR Services', description: 'HR inquiries and employee services',           estimated_time: 20 },
    { id: 'it-support',   name: 'IT Support',  description: 'Technical support for hardware and software',  estimated_time: 15 },
    { id: 'reception',    name: 'Reception',   description: 'Visitor registration and general reception',   estimated_time: 5  },
  ],
  education: [
    { id: 'admissions',       name: 'Admissions',       description: 'New student enrollment consultation',      estimated_time: 20 },
    { id: 'financial-aid',    name: 'Financial Aid',    description: 'Student financial aid consultation',        estimated_time: 30 },
    { id: 'library-services', name: 'Library Services', description: 'Library access, books and resources',      estimated_time: 5  },
    { id: 'registrar',        name: 'Registrar',        description: 'Course registration and academic records', estimated_time: 15 },
  ],
  government: [
    { id: 'document-processing',   name: 'Document Processing',   description: 'Processing of official documents and forms', estimated_time: 40 },
    { id: 'general-inquiries',     name: 'General Inquiries',     description: 'General questions about public services',     estimated_time: 15 },
    { id: 'id-passport-renewal',   name: 'ID / Passport Renewal', description: 'Renew national ID or passport',               estimated_time: 45 },
    { id: 'permits-licenses',      name: 'Permits & Licenses',    description: 'Apply for business or building permits',       estimated_time: 35 },
  ],
  healthcare: [
    { id: 'blood-test-lab',      name: 'Blood Test / Lab',    description: 'Blood tests and diagnostic lab services',    estimated_time: 20 },
    { id: 'dental',              name: 'Dental',              description: 'Dental checkup and treatment',               estimated_time: 25 },
    { id: 'general-practitioner',name: 'General Practitioner',description: 'Routine consultation with a GP',             estimated_time: 30 },
    { id: 'pharmacy-pickup',     name: 'Pharmacy Pickup',     description: 'Prescription collection and dispensing',     estimated_time: 5  },
    { id: 'specialist-consult',  name: 'Specialist Consult',  description: 'Consultation with a medical specialist',     estimated_time: 40 },
  ],
  retail: [
    { id: 'click-collect',     name: 'Click & Collect',     description: 'Collect your online order in-store',          estimated_time: 5  },
    { id: 'customer-service',  name: 'Customer Service',    description: 'General customer service and enquiries',       estimated_time: 8  },
    { id: 'returns-exchanges', name: 'Returns & Exchanges', description: 'Return or exchange purchased items',           estimated_time: 12 },
    { id: 'tech-support',      name: 'Tech Support',        description: 'Technical help with electronics and devices',  estimated_time: 25 },
  ],
};

const industryIcons: Record<string, any> = {
  banking: Landmark,
  healthcare: Heart,
  retail: ShoppingBag,
  government: Building2,
  education: GraduationCap,
  corporate: Briefcase
};

const industryColors: Record<string, string> = {
  banking: 'from-blue-600 to-blue-700',
  healthcare: 'from-red-600 to-pink-600',
  retail: 'from-purple-600 to-purple-700',
  government: 'from-teal-600 to-teal-700',
  education: 'from-orange-600 to-orange-700',
  corporate: 'from-slate-600 to-slate-700'
};

interface ServiceSelectionProps {
  industryId: string;
  onSelect: (service: Service) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export function ServiceSelection({ industryId, onSelect, onClose, showClose = false }: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const Icon = industryIcons[industryId];
  const color = industryColors[industryId];

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);

      try {
        // Fetch services from Supabase (already deduplicated at query level)
        const { data, error } = await getServicesByIndustry(industryId);

        if (data && data.length > 0) {
          // Map to component format
          const mappedServices: Service[] = data.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            estimated_time: service.estimated_time
          }));
          setServices(mappedServices);
        } else {
          // Use fallback mock data only if no Supabase data
          setServices(servicesByIndustry[industryId] || []);
        }
      } catch (err) {
        // If Supabase fails, use mock data
        console.warn('Failed to load services from Supabase, using mock data:', err);
        setServices(servicesByIndustry[industryId] || []);
      }

      setLoading(false);
    };

    loadServices();
  }, [industryId]);

  const handleSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleConfirm = () => {
    if (selectedService) {
      onSelect(selectedService);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className={`bg-gradient-to-r ${color} rounded-lg p-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-3xl text-slate-800 mb-1">Select a location to join the virtual queue or schedule a visit.</h2>
                <p className="text-slate-600">Pick the service that best fits your needs</p>
              </div>
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

          <div className="grid grid-cols-1 gap-3 mb-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No services available for this industry.</p>
              </div>
            ) : (
              services.map((service) => {
                const isSelected = selectedService?.id === service.id;

                return (
                  <button
                    key={service.id}
                    onClick={() => handleSelect(service)}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg text-slate-800 mb-1">{service.name}</h3>
                        <p className="text-sm text-slate-600">{service.description}</p>
                        {service.estimated_time && (
                          <p className="text-xs text-blue-600 mt-2">Est. time: {service.estimated_time} min</p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm ml-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedService}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Continue with {selectedService?.name || 'Selected Service'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { servicesByIndustry };
export type { Service };
