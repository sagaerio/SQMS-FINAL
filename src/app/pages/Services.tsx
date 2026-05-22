import { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  Ticket,
  Users,
  Navigation,
  Download,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { servicesByIndustry } from '../components/ServiceSelection';
import type { Service } from '../components/ServiceSelection';
import { QRCodeSVG } from 'qrcode.react';
import { createQueueTicket, getActiveTicket, getServicesByIndustry, getBusinessesByIndustry } from '../../services/queueService';
import type { QueueTicket, Business } from '../../lib/supabase';
import { industries } from '../components/IndustrySelector';
import type { Industry } from '../components/IndustrySelector';

export function Services() {
  const [step, setStep] = useState<'industry' | 'service' | 'branch' | 'confirmation'>('industry');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [queueTicket, setQueueTicket] = useState<QueueTicket | null>(null);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Business[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const { setIndustry } = useIndustry();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user already has an active ticket
    const checkActiveTicket = async () => {
      // Check for demo user
      if (user.id === 'demo-user-id') {
        const demoTicket = localStorage.getItem('sqms_demo_active_ticket');
        if (demoTicket) {
          setHasActiveTicket(true);
          setQueueTicket(JSON.parse(demoTicket));
        }
      } else {
        // Check Supabase for real users
        const { data } = await getActiveTicket(user.id);
        setHasActiveTicket(!!data);
        if (data) {
          setQueueTicket(data);
        }
      }
    };
    checkActiveTicket();
  }, [user, authLoading, navigate]);

  // Load services when industry is selected
  useEffect(() => {
    if (!selectedIndustry) return;

    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const { data } = await getServicesByIndustry(selectedIndustry.id);
        if (data && data.length > 0) {
          // Map to component format (deduplication already handled at query level)
          const mappedServices: Service[] = data.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            estimated_time: service.estimated_time
          }));
          setServices(mappedServices);
        } else {
          // Use fallback mock data only if no Supabase data
          setServices(servicesByIndustry[selectedIndustry.id] || []);
        }
      } catch (err) {
        console.warn('Failed to load services, using mock data:', err);
        setServices(servicesByIndustry[selectedIndustry.id] || []);
      }
      setLoadingServices(false);
    };

    loadServices();
  }, [selectedIndustry]);

  // Load branches when industry is selected
  useEffect(() => {
    if (!selectedIndustry) return;

    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const { data } = await getBusinessesByIndustry(selectedIndustry.id);
        if (data && data.length > 0) {
          setBranches(data);
        } else {
          console.warn('No branches found for industry:', selectedIndustry.id);
          setBranches([]);
        }
      } catch (err) {
        console.warn('Failed to load branches:', err);
        setBranches([]);
      }
      setLoadingBranches(false);
    };

    loadBranches();
  }, [selectedIndustry]);

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setIndustry(industry); // Save to context
    setStep('service');
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    localStorage.setItem('sqms_selected_service', JSON.stringify(service));
    setStep('branch');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `ticket-${queueTicket?.ticket_number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleJoinQueue = async () => {
    if (!selectedService || !selectedBranch || hasActiveTicket || !user || !selectedIndustry) return;

    setLoading(true);
    try {
      // Create demo ticket for all users (Supabase connection may be unavailable)
      const demoTicket: QueueTicket = {
        id: 'demo-ticket-' + Date.now(),
        ticket_number: 'A' + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0'),
        customer_id: user.id,
        industry_id: selectedIndustry.id,
        service_id: selectedService.id,
        branch_id: selectedBranch,
        status: 'waiting',
        position: Math.floor(Math.random() * 8) + 3,
        estimated_wait_time: Math.floor(Math.random() * 30) + 15,
        created_at: new Date().toISOString(),
      };

      // For demo user, save to localStorage
      if (user.id === 'demo-user-id') {
        localStorage.setItem('sqms_demo_active_ticket', JSON.stringify(demoTicket));
        setQueueTicket(demoTicket);
        setHasActiveTicket(true);
        setStep('confirmation');
        setLoading(false);
        return;
      }

      // For real Supabase users, try to create ticket in Supabase
      try {
        // Get the real service ID from Supabase
        let serviceId = selectedService.id;

        // Check if the service ID is a UUID (real Supabase ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);

        if (!isUUID) {
          // This is a mock ID, try to get the real service from Supabase
          if (services && services.length > 0) {
            // Find service by name
            const realService = services.find(s => s.name === selectedService.name);
            if (realService) {
              serviceId = realService.id;
            } else {
              // Use first service as fallback
              serviceId = services[0].id;
            }
          } else {
            // Supabase unavailable, use demo ticket
            throw new Error('Supabase unavailable');
          }
        }

        // Create queue ticket in Supabase
        const { data, error } = await createQueueTicket(
          user.id,
          selectedIndustry.id,
          serviceId,
          selectedBranch
        );

        if (error || !data) {
          console.warn('Queue creation error, using demo mode:', error);
          throw new Error('Supabase unavailable');
        }

        setQueueTicket(data);
        setHasActiveTicket(true);
        setStep('confirmation');
      } catch (supabaseError) {
        // Supabase failed, use demo ticket
        console.warn('Supabase unavailable, using demo ticket:', supabaseError);
        localStorage.setItem('sqms_demo_active_ticket', JSON.stringify(demoTicket));
        setQueueTicket(demoTicket);
        setHasActiveTicket(true);
        setStep('confirmation');
      }
    } catch (err: any) {
      console.error('Queue joining error:', err);
      alert(`An error occurred: ${err?.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Show queue confirmation
  if (step === 'confirmation' && queueTicket) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-blue-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl mb-4 text-slate-800">You're in the Queue!</h2>
            <div className="bg-blue-600 text-white rounded-2xl p-8 mb-6">
              <p className="text-sm opacity-90 mb-2">Your Ticket Number</p>
              <div className="bg-white p-6 rounded-xl mb-4 inline-block">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`TICKET-${queueTicket.ticket_number || ''}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-6xl mb-2">{queueTicket.ticket_number}</p>
              <p className="text-lg opacity-90 mb-4">Please wait for your turn</p>
              <button
                onClick={downloadQRCode}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-slate-800 mb-4">Queue Details:</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Industry:</strong> {selectedIndustry?.name}</p>
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Branch:</strong> {branches.find(b => b.id === selectedBranch)?.name}</p>
                <p><strong>Position:</strong> <span className="text-blue-600 font-semibold">#{queueTicket.position}</span></p>
                <p><strong>Estimated Wait:</strong> <span className="text-orange-600">{queueTicket.estimated_wait_time} min</span></p>
                <p><strong>Status:</strong> <span className="text-green-600 capitalize">{queueTicket.status}</span></p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/status')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                View Queue Status
              </button>
              <button
                onClick={() => {
                  setStep('industry');
                  setSelectedIndustry(null);
                  setSelectedService(null);
                  setSelectedBranch('');
                }}
                className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
              >
                Join Another Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Industry Selection
  if (step === 'industry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-4xl text-slate-800 mb-2">Choose Your Industry</h1>
            <p className="text-xl text-slate-600">Select the industry you need service from</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry)}
                  className="bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
                >
                  <div className={`bg-gradient-to-r ${industry.color} rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-slate-800 mb-2">{industry.name}</h3>
                  <p className="text-slate-600">{industry.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Service Selection
  if (step === 'service' && selectedIndustry) {
    const IndustryIcon = selectedIndustry.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setStep('industry')}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Industries</span>
            </button>
            <h1 className="text-4xl text-slate-800 mb-2">Select a Service</h1>
            <p className="text-xl text-slate-600">Choose the service you need</p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded-lg p-2`}>
                <IndustryIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-700">{selectedIndustry.name}</span>
            </div>
          </div>

          {loadingServices ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl text-slate-800 mb-2">No Services Available</h3>
              <p className="text-slate-600 mb-6">There are no services available for this industry at the moment.</p>
              <button
                onClick={() => setStep('industry')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Choose Different Industry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
                >
                  <h3 className="text-xl text-slate-800 mb-2">{service.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                  {service.estimated_time && (
                    <p className="text-xs text-blue-600">Est. time: {service.estimated_time} min</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Branch Selection
  if (step === 'branch' && selectedService && selectedIndustry) {
    const IndustryIcon = selectedIndustry.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setStep('service')}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Services</span>
            </button>

            <h1 className="text-4xl text-slate-800 mb-2">Select a Branch Location</h1>
            <p className="text-xl text-slate-600">Choose your preferred branch</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded-lg p-2`}>
                  <IndustryIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700">{selectedIndustry.name}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Ticket className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">{selectedService.name}</span>
              </div>
            </div>
          </div>

          {branches.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl text-slate-800 mb-2">No Branches Available</h3>
              <p className="text-slate-600 mb-6">There are no branch locations available for this industry at the moment.</p>
              <button
                onClick={() => setStep('service')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Choose Different Service
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {branches.map((branch) => {
                const isSelected = selectedBranch === branch.id;
                const trafficLevel = Math.floor(Math.random() * 3);
                const trafficColors = ['text-green-600 bg-green-50', 'text-yellow-600 bg-yellow-50', 'text-red-600 bg-red-50'];
                const trafficLabels = ['Low Traffic', 'Medium Traffic', 'High Traffic'];
                const customerCount = [3, 12, 25][trafficLevel];
                const avgWait = ['5-10 min', '15-25 min', '30-45 min'][trafficLevel];
                const distance = (Math.random() * 10 + 0.5).toFixed(1);

                return (
                  <div
                    key={branch.id}
                    className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 ring-4 ring-blue-100'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded-xl p-3 flex-shrink-0`}>
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-slate-800 mb-2">{branch.name}</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{branch.address}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{branch.phone}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{branch.hours}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className={`${trafficColors[trafficLevel]} rounded-lg p-2 text-center`}>
                        <Users className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs font-semibold">{trafficLabels[trafficLevel]}</p>
                        <p className="text-xs opacity-75">{customerCount} customers</p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 rounded-lg p-2 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs font-semibold">Avg Wait</p>
                        <p className="text-xs opacity-75">{avgWait}</p>
                      </div>
                      <div className="bg-purple-50 text-purple-600 rounded-lg p-2 text-center">
                        <Navigation className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs font-semibold">Distance</p>
                        <p className="text-xs opacity-75">{distance} km</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBranch(branch.id)}
                      disabled={hasActiveTicket}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        hasActiveTicket
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hasActiveTicket ? 'Ticket Already Active' : isSelected ? 'Selected' : 'Select Branch'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedBranch && (
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl text-slate-800 mb-2">Ready to Join the Queue?</h3>
                  <p className="text-slate-600">You'll receive a queue number and real-time updates</p>
                </div>
                <button
                  onClick={handleJoinQueue}
                  disabled={loading || hasActiveTicket}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ticket className="w-6 h-6" />
                  <span className="text-lg">{loading ? 'Joining Queue...' : 'Join Virtual Queue'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
