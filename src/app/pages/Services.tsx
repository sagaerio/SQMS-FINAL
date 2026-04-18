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
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useIndustry } from '../contexts/IndustryContext';
import { ServiceSelection, servicesByIndustry } from '../components/ServiceSelection';
import type { Service } from '../components/ServiceSelection';
import { branches as allBranches } from '../data/businessTypes';
import { QRCodeSVG } from 'qrcode.react';

export function Services() {
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showQueueConfirmation, setShowQueueConfirmation] = useState(false);
  const [queueNumber, setQueueNumber] = useState(0);
  const [counterNumber, setCounterNumber] = useState(0);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);
  const { industry } = useIndustry();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already has an active ticket
    const queue = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
    const activeTicket = queue.find((t: any) =>
      t.status === 'waiting' || t.status === 'serving'
    );
    setHasActiveTicket(!!activeTicket);

    // Check if user already has a selected service from dashboard
    const savedService = localStorage.getItem('sqms_selected_service');
    if (savedService) {
      setSelectedService(JSON.parse(savedService));
    }
    // Don't show service selection here - user must select from dashboard first
  }, []);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    localStorage.setItem('sqms_selected_service', JSON.stringify(service));
    setShowServiceSelection(false);
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
      downloadLink.download = `ticket-${queueNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleJoinQueue = () => {
    if (!selectedService || !selectedBranch || hasActiveTicket) return;

    // Generate a random queue number and counter/room
    const ticketNumber = Math.floor(Math.random() * 900) + 100;
    const counter = Math.floor(Math.random() * 10) + 1;
    const position = Math.floor(Math.random() * 10) + 1;
    const estimatedWait = `${Math.floor(Math.random() * 30) + 10} min`;

    setQueueNumber(ticketNumber);
    setCounterNumber(counter);

    // Save to queue
    const queueEntry = {
      id: Date.now().toString(),
      ticketNumber,
      counter,
      service: selectedService,
      branch: allBranches.find(b => b.id === selectedBranch),
      timestamp: new Date().toISOString(),
      status: 'waiting',
      position,
      estimatedWait
    };

    const existingQueue = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
    existingQueue.push(queueEntry);
    localStorage.setItem('sqms_queue', JSON.stringify(existingQueue));

    setHasActiveTicket(true);
    setShowQueueConfirmation(true);
  };

  const branches = allBranches.filter(b => b.businessType === industry?.id);

  // If no service selected, redirect to dashboard
  if (!selectedService && !showServiceSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200">
            <Ticket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl text-slate-800 mb-2">No Service Selected</h3>
            <p className="text-slate-600 mb-6">Please select a service from the dashboard first.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show queue confirmation
  if (showQueueConfirmation) {
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
                  value={`TICKET-${queueNumber}-${Date.now()}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-6xl mb-2">{queueNumber}</p>
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
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Branch:</strong> {allBranches.find(b => b.id === selectedBranch)?.name}</p>
                <p><strong>Counter/Room:</strong> <span className="text-blue-600 font-semibold">#{counterNumber}</span></p>
                <p><strong>Status:</strong> <span className="text-green-600">Waiting</span></p>
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
                  setShowQueueConfirmation(false);
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

  const IndustryIcon = industry?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl text-slate-800 mb-2">Virtual Queue</h1>
              <p className="text-xl text-slate-600">Join the queue for your selected service</p>
            </div>
            {selectedService && (
              <button
                onClick={() => setShowServiceSelection(true)}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
              >
                Change Service
              </button>
            )}
          </div>

          {industry && selectedService && (
            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className={`bg-gradient-to-r ${industry.color} rounded-lg p-2`}>
                  {IndustryIcon && <IndustryIcon className="w-4 h-4 text-white" />}
                </div>
                <span className="text-slate-700">{industry.name}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Ticket className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">{selectedService.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Branch Selection */}
        <div>
          <h2 className="text-3xl text-slate-800 mb-6">Select a Branch Location</h2>

          {branches.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-slate-200">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl text-slate-800 mb-2">No Branches Available</h3>
              <p className="text-slate-600 mb-6">There are no branch locations available for this industry at the moment.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {branches.map((branch) => {
                const isSelected = selectedBranch === branch.id;
                const trafficLevel = Math.floor(Math.random() * 3); // 0: Low, 1: Medium, 2: High
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
                      <div className={`bg-gradient-to-r ${industry?.color || 'from-blue-600 to-blue-700'} rounded-xl p-3 flex-shrink-0`}>
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

                    {/* Traffic and Wait Time Info */}
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

          {/* Join Queue Button */}
          {selectedBranch && (
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl text-slate-800 mb-2">Ready to Join the Queue?</h3>
                  <p className="text-slate-600">You'll receive a queue number and real-time updates</p>
                </div>
                <button
                  onClick={handleJoinQueue}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-2xl transition-all flex items-center gap-3"
                >
                  <Ticket className="w-6 h-6" />
                  <span className="text-lg">Join Virtual Queue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Selection Modal */}
      {showServiceSelection && industry && (
        <ServiceSelection
          industryId={industry.id}
          onSelect={handleServiceSelect}
          onClose={() => setShowServiceSelection(false)}
          showClose={true}
        />
      )}
    </div>
  );
}