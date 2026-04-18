import { useState, useEffect } from 'react';
import { Ticket, Clock, Users, CheckCircle, ArrowLeft, MapPin, Building2, QrCode, Navigation, ArrowRight } from 'lucide-react';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { services as allServices, branches as allBranches, businessTypes } from '../data/businessTypes';

interface QueueService {
  id: string;
  name: string;
  description: string;
  icon: string;
  avgWaitPerPerson: number; // minutes
}

interface QueueBranch {
  id: string;
  name: string;
  address: string;
  distance: string;
  currentQueue: number;
  countersOpen: number;
}

interface TicketData {
  ticketNumber: string;
  service: QueueService;
  branch: QueueBranch;
  position: number;
  estimatedWaitTime: string;
  timestamp: string;
}

export function VirtualQueue() {
  const [step, setStep] = useState<'service' | 'branch' | 'ticket'>('service');
  const [selectedService, setSelectedService] = useState<QueueService | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<QueueBranch | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<TicketData | null>(null);
  const [businessType, setBusinessType] = useState<string>('');
  const [services, setServices] = useState<QueueService[]>([]);
  const [branches, setBranches] = useState<QueueBranch[]>([]);

  useEffect(() => {
    const selectedBusinessType = localStorage.getItem('sqms_business_type') || 'bank';
    setBusinessType(selectedBusinessType);

    // Filter and transform services based on business type
    const filteredServices = allServices
      .filter(s => s.businessType === selectedBusinessType)
      .map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        avgWaitPerPerson: parseInt(s.estimatedTime.split('-')[0]) || 10
      }));

    // Filter and transform branches based on business type
    const filteredBranches = allBranches
      .filter(b => b.businessType === selectedBusinessType)
      .map((b, idx) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        distance: `${(idx * 1.3 + 0.5).toFixed(1)} km`,
        currentQueue: Math.floor(Math.random() * 8) + 2,
        countersOpen: Math.floor(Math.random() * 3) + 3
      }));

    setServices(filteredServices);
    setBranches(filteredBranches);
  }, []);

  const calculateWaitTime = (service: QueueService, branch: QueueBranch) => {
    const totalMinutes = service.avgWaitPerPerson * branch.currentQueue;
    if (totalMinutes < 5) return '< 5 min';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleServiceSelect = (service: QueueService) => {
    setSelectedService(service);
    setStep('branch');
  };

  const handleBranchSelect = (branch: QueueBranch) => {
    setSelectedBranch(branch);
  };

  const currentBusinessType = businessTypes.find(bt => bt.id === businessType);

  const handleGenerateTicket = () => {
    if (!selectedService || !selectedBranch) return;

    const ticket: TicketData = {
      ticketNumber: `Q${selectedService.id}${selectedBranch.id}-${Math.floor(1000 + Math.random() * 9000)}`,
      service: selectedService,
      branch: selectedBranch,
      position: selectedBranch.currentQueue + 1,
      estimatedWaitTime: calculateWaitTime(selectedService, selectedBranch),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to history
    const history = JSON.parse(localStorage.getItem('sqms_ticket_history') || '[]');
    history.unshift(ticket);
    localStorage.setItem('sqms_ticket_history', JSON.stringify(history.slice(0, 50))); // Keep last 50

    // Save active ticket
    localStorage.setItem('sqms_active_ticket', JSON.stringify(ticket));

    setGeneratedTicket(ticket);
    setStep('ticket');
  };

  const handleReset = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedBranch(null);
    setGeneratedTicket(null);
    localStorage.removeItem('sqms_active_ticket');
  };

  const handleBack = () => {
    if (step === 'branch') {
      setStep('service');
      setSelectedService(null);
    } else if (step === 'ticket') {
      setStep('branch');
      setGeneratedTicket(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Type Header */}
        {currentBusinessType && step === 'service' && (
          <div className={`bg-gradient-to-r ${currentBusinessType.gradient} rounded-3xl p-8 mb-8 text-white shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="text-6xl">{currentBusinessType.icon}</div>
              <div>
                <h1 className="text-4xl mb-2">{currentBusinessType.name} Queue</h1>
                <p className="text-white/90 text-lg">Get your virtual queue ticket and skip the wait</p>
              </div>
            </div>
          </div>
        )}

        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {step !== 'service' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
          </div>
          {step !== 'service' && (
            <>
              <h1 className="text-3xl text-slate-800 mb-2">Get Your Queue Ticket</h1>
              <p className="text-slate-600">
                {step === 'branch' && 'Step 2: Choose your branch'}
                {step === 'ticket' && 'Your ticket has been generated'}
              </p>
            </>
          )}
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'service' ? 'text-blue-600' : step === 'branch' || step === 'ticket' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'service' ? 'bg-blue-600 text-white' : step === 'branch' || step === 'ticket' ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                1
              </div>
              <span className="font-medium">Service</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-2 ${step === 'branch' ? 'text-blue-600' : step === 'ticket' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'branch' ? 'bg-blue-600 text-white' : step === 'ticket' ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                2
              </div>
              <span className="font-medium">Branch</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-2 ${step === 'ticket' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'ticket' ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                3
              </div>
              <span className="font-medium">Ticket</span>
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div>
            {services.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl text-slate-800 mb-2">No Services Available</h3>
                <p className="text-slate-600 mb-6">Please select a business type from the dashboard first.</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Service</h2>
                  <p className="text-lg text-slate-600">Select the service you need assistance with</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="group bg-white rounded-3xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all duration-300 text-left transform hover:-translate-y-2"
                    >
                      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{service.description}</p>
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium pt-4 border-t border-slate-100">
                        <Clock className="w-4 h-4" />
                        <span>~{service.avgWaitPerPerson} min per person</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Branch Selection */}
        {step === 'branch' && selectedService && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Branch Location</h2>
              <p className="text-lg text-slate-600">Choose your preferred location to get your queue ticket</p>
            </div>

            <div className={`bg-gradient-to-r ${currentBusinessType?.gradient} border-2 border-transparent rounded-3xl p-6 mb-8 shadow-lg`}>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedService.icon}</div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-1">{selectedService.name}</h3>
                  <p className="text-white/90">{selectedService.description}</p>
                </div>
              </div>
            </div>

{branches.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Branch Locations</h3>
                <p className="text-slate-600">There are no branches available for this service at the moment.</p>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {branches.map((branch) => {
                    const waitTime = calculateWaitTime(selectedService, branch);
                    const isSelected = selectedBranch?.id === branch.id;

                    return (
                      <div
                        key={branch.id}
                        className={`bg-white rounded-3xl shadow-lg p-8 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                          isSelected ? 'border-blue-600 ring-4 ring-blue-100 shadow-2xl' : 'border-slate-200 hover:shadow-xl'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`bg-gradient-to-r ${currentBusinessType?.gradient} rounded-2xl p-4`}>
                              <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-800 mb-2">{branch.name}</h3>
                              <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{branch.address}</span>
                              </div>
                              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                <Navigation className="w-3 h-3" />
                                {branch.distance} away
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-7 h-7 text-blue-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                            <div className="flex items-center justify-center mb-2">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-xs text-slate-600 mb-1">Wait Time</div>
                            <div className="text-xl font-bold text-blue-600">{waitTime}</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                            <div className="flex items-center justify-center mb-2">
                              <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="text-xs text-slate-600 mb-1">In Queue</div>
                            <div className="text-xl font-bold text-orange-600">{branch.currentQueue}</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                            <div className="flex items-center justify-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-xs text-slate-600 mb-1">Counters</div>
                            <div className="text-xl font-bold text-green-600">{branch.countersOpen}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBranchSelect(branch)}
                          className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                          }`}
                        >
                          {isSelected ? (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Selected
                            </span>
                          ) : (
                            'Select This Branch'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedBranch && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={handleGenerateTicket}
                      className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-16 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-xl font-bold transform hover:scale-105"
                    >
                      <Ticket className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                      Generate My Ticket
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Ticket Generated */}
        {step === 'ticket' && generatedTicket && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-white text-center">
                <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                <h2 className="text-3xl mb-2">Ticket Generated Successfully!</h2>
                <p className="text-white/90">Please arrive at the branch before your turn</p>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl px-8 py-6 mb-6">
                    <div className="text-sm text-white/80 mb-2">Your Ticket Number</div>
                    <div className="text-5xl text-white tracking-wider">{generatedTicket.ticketNumber}</div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <QrCode className="w-5 h-5 text-slate-600" />
                      <h3 className="text-lg text-slate-800">Scan to Check Status</h3>
                    </div>
                    <QRCodeGenerator
                      value={JSON.stringify({
                        ticketNumber: generatedTicket.ticketNumber,
                        service: generatedTicket.service.name,
                        branch: generatedTicket.branch.name,
                        timestamp: generatedTicket.timestamp
                      })}
                      size={200}
                      title="Show this QR code at the service center"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Service</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{generatedTicket.service.icon}</span>
                        <span className="text-slate-800">{generatedTicket.service.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Branch</div>
                      <div className="text-slate-800">{generatedTicket.branch.name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Queue Position</div>
                      <div className="text-3xl text-blue-600">#{generatedTicket.position}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Est. Wait Time</div>
                      <div className="text-2xl text-teal-600">{generatedTicket.estimatedWaitTime}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Generated At</div>
                      <div className="text-xl text-slate-800">{generatedTicket.timestamp}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Important Information:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Please arrive at the branch before your estimated time</li>
                        <li>Your ticket will be called in order</li>
                        <li>You'll receive SMS notifications when your turn is near</li>
                        <li>Keep this ticket number for reference</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Get Another Ticket
                  </button>
                  <button
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
                    onClick={() => (window.location.href = '/status')}
                  >
                    Track Queue Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}