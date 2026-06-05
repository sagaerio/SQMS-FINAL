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
import type { Industry } from '../components/IndustrySelector';
import { useIndustry } from '../contexts/IndustryContext';

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
  const { industries, setIndustry } = useIndustry();
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
        // Check Django backend for real users
        const { data } = await getActiveTicket();
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
      // Convert service ID to number for Django backend
      const serviceId = typeof selectedService.id === 'string' ? parseInt(selectedService.id) : selectedService.id;
      const branchId = typeof selectedBranch === 'string' ? parseInt(selectedBranch) : selectedBranch;

      if (isNaN(serviceId) || isNaN(branchId)) {
        alert('Invalid service or branch selected. Please try again.');
        setLoading(false);
        return;
      }

      // Create queue ticket in Django backend
      const { data, error } = await createQueueTicket(
        serviceId,
        branchId
      );

      if (error) {
        console.error('Queue creation error:', error);
        alert(`Failed to join queue: ${error.message}. Please try again.`);
        setLoading(false);
        return;
      }

      if (!data) {
        alert('Failed to create ticket. Please try again.');
        setLoading(false);
        return;
      }

      // Success - ticket created in Django backend
      setQueueTicket(data);
      setHasActiveTicket(true);
      setStep('confirmation');
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
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '48px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
          <div style={{ width: 72, height: 72, backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle style={{ width: 40, height: 40, color: '#059669' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>You're in the Queue!</h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px' }}>Your virtual queue ticket has been created successfully</p>

          <div style={{ backgroundColor: '#1e40af', borderRadius: 16, padding: '32px', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', fontWeight: 500 }}>YOUR TICKET NUMBER</p>
            <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, display: 'inline-block', marginBottom: 16 }}>
              <QRCodeSVG
                id="qr-code-svg"
                value={`TICKET-${queueTicket.ticket_number || ''}`}
                size={140}
                level="H"
                includeMargin={true}
              />
            </div>
            <p style={{ fontSize: 56, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-1px' }}>{queueTicket.ticket_number}</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 20px' }}>Please wait for your turn</p>
            <button
              onClick={downloadQRCode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}
            >
              <Download style={{ width: 15, height: 15 }} />
              Download QR Code
            </button>
          </div>

          <div style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: '20px 24px', marginBottom: 28, textAlign: 'left', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Queue Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {[
                ['Industry', selectedIndustry?.name],
                ['Service', selectedService?.name],
                ['Branch', branches.find(b => String(b.id) === String(selectedBranch))?.name || 'Selected Branch'],
                ['Position', `#${queueTicket.position}`],
                ['Est. Wait', `${queueTicket.estimated_wait_time} min`],
                ['Status', queueTicket.status],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/status')}
              style={{ flex: 1, padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              View Queue Status
            </button>
            <button
              onClick={() => { setStep('industry'); setSelectedIndustry(null); setSelectedService(null); setSelectedBranch(''); }}
              style={{ flex: 1, padding: '14px', backgroundColor: '#fff', color: '#2563eb', border: '2px solid #2563eb', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              Join Another Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Industry Selection
  if (step === 'industry') {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 12, padding: 0 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Dashboard
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Choose Your Industry</h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Select the industry you need service from</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry)}
                style={{ backgroundColor: '#fff', padding: '28px 24px', borderRadius: 16, border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div className={`bg-gradient-to-r ${industry.color} rounded-lg p-3 w-14 h-14 flex items-center justify-center mb-4`}>
                  <Icon style={{ width: 26, height: 26, color: '#fff' }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{industry.name}</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{industry.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 2: Service Selection
  if (step === 'service' && selectedIndustry) {
    const IndustryIcon = selectedIndustry.icon;

    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => setStep('industry')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 12, padding: 0 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Industries
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Select a Service</h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 16px' }}>Choose the service you need</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded p-1.5`}>
              <IndustryIcon style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{selectedIndustry.name}</span>
          </div>
        </div>

        {loadingServices ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '60px 40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Briefcase style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>No Services Available</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>There are no services available for this industry at the moment.</p>
            <button
              onClick={() => setStep('industry')}
              style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              Choose Different Industry
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                style={{ backgroundColor: '#fff', padding: '22px 20px', borderRadius: 14, border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{service.name}</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>{service.description}</p>
                {service.estimated_time && (
                  <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                    Est. {service.estimated_time} min
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 3: Branch Selection
  if (step === 'branch' && selectedService && selectedIndustry) {
    const IndustryIcon = selectedIndustry.icon;

    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => setStep('service')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 12, padding: 0 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Services
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Select a Branch Location</h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 16px' }}>Choose your preferred branch</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded p-1.5`}>
                <IndustryIcon style={{ width: 14, height: 14, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{selectedIndustry.name}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', backgroundColor: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <Ticket style={{ width: 14, height: 14, color: '#2563eb' }} />
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>{selectedService.name}</span>
            </div>
          </div>
        </div>

        {branches.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '60px 40px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
            <MapPin style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>No Branches Available</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>There are no branch locations available for this industry at the moment.</p>
            <button
              onClick={() => setStep('service')}
              style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              Choose Different Service
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {branches.map((branch) => {
              const isSelected = selectedBranch === branch.id;
              const trafficLevel = Math.floor(Math.random() * 3);
              const trafficBg = ['#f0fdf4', '#fffbeb', '#fff1f2'][trafficLevel];
              const trafficColor = ['#059669', '#d97706', '#e11d48'][trafficLevel];
              const trafficLabel = ['Low Traffic', 'Medium Traffic', 'High Traffic'][trafficLevel];
              const customerCount = [3, 12, 25][trafficLevel];
              const avgWait = ['5-10 min', '15-25 min', '30-45 min'][trafficLevel];
              const distance = (Math.random() * 10 + 0.5).toFixed(1);

              return (
                <div
                  key={branch.id}
                  style={{
                    backgroundColor: '#fff', borderRadius: 16, padding: '22px 20px',
                    border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    boxShadow: isSelected ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div className={`bg-gradient-to-r ${selectedIndustry.color} rounded-xl p-2.5 flex-shrink-0`}>
                      <MapPin style={{ width: 20, height: 20, color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{branch.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin style={{ width: 12, height: 12 }} />{branch.address}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone style={{ width: 12, height: 12 }} />{branch.phone}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock style={{ width: 12, height: 12 }} />{branch.hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    <div style={{ backgroundColor: trafficBg, borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <Users style={{ width: 14, height: 14, color: trafficColor, margin: '0 auto 4px' }} />
                      <p style={{ fontSize: 10, fontWeight: 700, color: trafficColor, margin: '0 0 2px' }}>{trafficLabel}</p>
                      <p style={{ fontSize: 10, color: trafficColor, margin: 0, opacity: 0.75 }}>{customerCount} in queue</p>
                    </div>
                    <div style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <Clock style={{ width: 14, height: 14, color: '#2563eb', margin: '0 auto 4px' }} />
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', margin: '0 0 2px' }}>Avg Wait</p>
                      <p style={{ fontSize: 10, color: '#2563eb', margin: 0, opacity: 0.75 }}>{avgWait}</p>
                    </div>
                    <div style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <Navigation style={{ width: 14, height: 14, color: '#7c3aed', margin: '0 auto 4px' }} />
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', margin: '0 0 2px' }}>Distance</p>
                      <p style={{ fontSize: 10, color: '#7c3aed', margin: 0, opacity: 0.75 }}>{distance} km</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBranch(branch.id)}
                    disabled={hasActiveTicket}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: hasActiveTicket ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontWeight: 700,
                      backgroundColor: hasActiveTicket ? '#e2e8f0' : isSelected ? '#2563eb' : '#f1f5f9',
                      color: hasActiveTicket ? '#94a3b8' : isSelected ? '#fff' : '#475569',
                    }}
                  >
                    {hasActiveTicket ? 'Ticket Already Active' : isSelected ? 'Selected ✓' : 'Select Branch'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedBranch && (
          <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Ready to Join the Queue?</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>You'll receive a queue number and real-time updates</p>
            </div>
            <button
              onClick={handleJoinQueue}
              disabled={loading || hasActiveTicket}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px',
                backgroundColor: loading || hasActiveTicket ? '#94a3b8' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: 12, cursor: loading || hasActiveTicket ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              <Ticket style={{ width: 20, height: 20 }} />
              {loading ? 'Joining Queue...' : 'Join Virtual Queue'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
