import { useState, useEffect } from 'react';
import { Bell, Play, CheckCircle, User, Clock, Hash, AlertTriangle, Building2, Briefcase, Calendar, Plus, X, UserX, RefreshCw, ArrowRightLeft, QrCode, Smartphone, Globe, MessageSquare, Send, UserPlus, Coffee, History, FileText } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { industryServices } from '../data/industryServices';
import { useRealtimeQueue } from '../../hooks/useRealtimeQueue';
import type { QueueTicket } from '../../lib/supabase';

interface CustomerHistory {
  visitDate: string;
  service: string;
  status: string;
  notes: string;
}

interface TransferInfo {
  fromCounter: string;
  fromDepartment: string;
  reason: string;
  transferredBy: string;
  transferredAt: string;
}

interface QueueItem {
  id: string;
  ticketNumber: string;
  service: string;
  customerName: string;
  waitTime: string;
  totalWaitMins: number;
  status: 'waiting' | 'serving' | 'completed';
  origin: 'QR Code' | 'Mobile App' | 'Web';
  joinedAt: string;
  customerEmail?: string;
  isReturningCustomer?: boolean;
  previousVisits?: number;
  transferInfo?: TransferInfo;
  history?: CustomerHistory[];
  staffNotes?: string;
}

export function StaffDashboard() {
  const { industry } = useIndustry();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [assignedCounter, setAssignedCounter] = useState(3);
  const [staffIndustry, setStaffIndustry] = useState('');
  const [staffInfo, setStaffInfo] = useState({
    name: 'John Smith',
    branch: 'Downtown Main Branch',
    position: 'Customer Service Representative',
    department: 'Retail Banking',
    employeeId: 'EMP-2024-1156',
    handlingServices: [] as string[]
  });
  const [currentlyServing, setCurrentlyServing] = useState<QueueItem | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [completedToday, setCompletedToday] = useState(12);
  const [avgServiceTime, setAvgServiceTime] = useState('8 min');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<QueueItem | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferDepartment, setTransferDepartment] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({
    customerName: '',
    service: ''
  });
  const [customerViewTab, setCustomerViewTab] = useState<'details' | 'history'>('details');
  const [customerNotes, setCustomerNotes] = useState('');

  // Get staff's industry from localStorage
  const staffIndustryId = localStorage.getItem('sqms_staff_industry') || localStorage.getItem('sqms_admin_industry') || '';

  // Real-time subscription to queue tickets for this industry
  const { tickets: realtimeTickets, loading: ticketsLoading } = useRealtimeQueue(staffIndustryId || undefined);

  // Check authentication
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff-portal');
      return;
    }

    // Only allow staff and admin to access this page
    if (user.role !== 'staff' && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, authLoading, navigate]);

  // Set industry-specific initial queue and services
  useEffect(() => {
    // Load staff info from localStorage
    const storedStaffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    const storedStaffName = localStorage.getItem('sqms_user_name') || 'John Smith';
    const storedCounter = localStorage.getItem('sqms_staff_counter') || '3';

    setStaffIndustry(storedStaffIndustry);
    setAssignedCounter(Number(storedCounter));

    // Set industry-specific staff info
    const industryStaffInfo: { [key: string]: any } = {
      banking: {
        name: storedStaffName,
        branch: 'Manhattan Financial Center',
        position: 'Customer Service Representative',
        department: 'Account Services',
        employeeId: 'BNK-2024-1156',
        handlingServices: ['Account Opening', 'General Banking Inquiry', 'Document Verification']
      },
      healthcare: {
        name: storedStaffName,
        branch: 'Main Hospital - Downtown',
        position: 'Medical Services Coordinator',
        department: 'Medical Services',
        employeeId: 'HLC-2024-2487',
        handlingServices: ['General Consultation', 'Specialist Appointment', 'Lab Tests']
      },
      retail: {
        name: storedStaffName,
        branch: 'Flagship Store - Downtown',
        position: 'Customer Service Associate',
        department: 'Customer Support',
        employeeId: 'RTL-2024-3891',
        handlingServices: ['Product Return', 'Customer Service', 'Product Consultation']
      },
      government: {
        name: storedStaffName,
        branch: 'City Hall - Main Office',
        position: 'Public Services Officer',
        department: 'Licensing Services',
        employeeId: 'GOV-2024-5623',
        handlingServices: ['License Renewal', 'Permit Application', 'General Inquiry']
      },
      education: {
        name: storedStaffName,
        branch: 'Main Campus - Admissions',
        position: 'Student Services Advisor',
        department: 'Admissions',
        employeeId: 'EDU-2024-7845',
        handlingServices: ['Student Admissions', 'Academic Counseling', 'Registration Support']
      },
      corporate: {
        name: storedStaffName,
        branch: 'Headquarters - Main Building',
        position: 'Service Desk Specialist',
        department: 'IT Services',
        employeeId: 'CRP-2024-9012',
        handlingServices: ['IT Support', 'Meeting Room Booking', 'General Admin Support']
      }
    };

    if (storedStaffIndustry && industryStaffInfo[storedStaffIndustry]) {
      setStaffInfo(industryStaffInfo[storedStaffIndustry]);
    }

    if (!industry) return;

    const industryKey = industry.id as keyof typeof industryServices;
    const servicesData = industryServices[industryKey] || industryServices.banking;
    setServices(servicesData);

    // Generate demo customers based on available services
    const demoCustomers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        mins: 5,
        origin: 'Mobile App' as const,
        isReturning: true,
        previousVisits: 3,
        history: [
          { visitDate: '2026-03-15', service: servicesData[0]?.name || 'Service 1', status: 'Completed', notes: 'Customer needed help with account setup. Very patient and cooperative.' },
          { visitDate: '2026-02-28', service: servicesData[1]?.name || 'Service 2', status: 'Completed', notes: 'Follow-up visit for loan application. All documents verified.' },
          { visitDate: '2026-01-10', service: servicesData[0]?.name || 'Service 1', status: 'Completed', notes: 'Initial consultation completed successfully.' }
        ]
      },
      {
        name: 'Michael Chen',
        email: 'michael.c@email.com',
        mins: 10,
        origin: 'QR Code' as const,
        isReturning: false,
        transferred: true,
        transferInfo: {
          fromCounter: '5',
          fromDepartment: 'Loan Services',
          reason: 'Customer needs account opening assistance which is handled by this department',
          transferredBy: 'Jane Smith',
          transferredAt: new Date(Date.now() - 3 * 60000).toISOString()
        }
      },
      {
        name: 'Emily Davis',
        email: 'emily.d@email.com',
        mins: 15,
        origin: 'Web' as const,
        isReturning: false
      },
      {
        name: 'Robert Martinez',
        email: 'robert.m@email.com',
        mins: 8,
        origin: 'Mobile App' as const,
        isReturning: true,
        previousVisits: 1,
        history: [
          { visitDate: '2026-03-20', service: servicesData[2]?.name || 'Service 3', status: 'Completed', notes: 'Quick service. Customer was satisfied.' }
        ]
      },
      {
        name: 'Jessica Williams',
        email: 'jessica.w@email.com',
        mins: 12,
        origin: 'QR Code' as const,
        isReturning: false
      }
    ];

    const handlingServicesForIndustry = industryStaffInfo[storedStaffIndustry]?.handlingServices || [];

    const initialQueue: QueueItem[] = demoCustomers.slice(0, 5).map((customer, index) => ({
      id: String(index + 1),
      ticketNumber: `${industry?.id?.toUpperCase().substring(0, 3) || 'GEN'}-${1024 + index}`,
      service: servicesData[index % servicesData.length]?.name || 'General Service',
      customerName: customer.name,
      waitTime: `${customer.mins} min`,
      totalWaitMins: customer.mins,
      status: 'waiting',
      origin: customer.origin,
      joinedAt: new Date(Date.now() - customer.mins * 60000).toISOString(),
      customerEmail: customer.email,
      isReturningCustomer: customer.isReturning,
      previousVisits: customer.previousVisits || 0,
      transferInfo: customer.transferred ? customer.transferInfo : undefined,
      history: customer.history || [],
      staffNotes: ''
    }));

    // Filter queue to only show services this staff handles
    const filteredQueue = initialQueue.filter(item =>
      handlingServicesForIndustry.includes(item.service)
    );
    setWaitingQueue(filteredQueue);

    // Load completed count from localStorage
    const today = new Date().toDateString();
    const completedKey = `sqms_completed_${storedStaffName}_${today}`;
    const savedCompleted = localStorage.getItem(completedKey);
    if (savedCompleted) {
      setCompletedToday(parseInt(savedCompleted));
    } else {
      setCompletedToday(0);
    }

    // Listen for new customers joining queue for services this staff handles
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sqms_queue' && e.newValue) {
        const queueData = JSON.parse(e.newValue);
        // Filter by services this staff handles
        const serviceQueue = queueData.filter((ticket: any) =>
          handlingServicesForIndustry.includes(ticket.service)
        );

        // Check for new tickets
        const existingIds = waitingQueue.map(item => item.id);
        const newTickets = serviceQueue.filter((ticket: any) => !existingIds.includes(ticket.id));

        if (newTickets.length > 0) {
          newTickets.forEach((ticket: any) => {
            addNotification(`New customer joined: ${ticket.ticketNumber} - ${ticket.customerName} for ${ticket.service}`);
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [industry, assignedCounter]);

  // Process real-time tickets from Supabase and update waiting queue
  useEffect(() => {
    if (ticketsLoading || !realtimeTickets) return;

    // Get services this staff handles
    const storedStaffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    const industryStaffInfo: { [key: string]: any } = {
      banking: {
        handlingServices: ['Account Opening', 'General Banking Inquiry', 'Document Verification']
      },
      healthcare: {
        handlingServices: ['General Consultation', 'Specialist Appointment', 'Lab Tests']
      },
      retail: {
        handlingServices: ['Product Return', 'Customer Service', 'Product Consultation']
      },
      government: {
        handlingServices: ['License Renewal', 'Permit Application', 'General Inquiry']
      },
      education: {
        handlingServices: ['Student Admissions', 'Academic Counseling', 'Registration Support']
      },
      corporate: {
        handlingServices: ['IT Support', 'Meeting Room Booking', 'General Admin Support']
      }
    };

    const handlingServices = industryStaffInfo[storedStaffIndustry]?.handlingServices || [];

    // Convert Supabase tickets to QueueItem format
    const formattedTickets: QueueItem[] = realtimeTickets
      .filter(ticket => ticket.status === 'waiting' || ticket.status === 'called')
      .map(ticket => {
        const joinTime = new Date(ticket.created_at).getTime();
        const now = Date.now();
        const mins = Math.floor((now - joinTime) / 60000);

        // Access joined customer and service data
        const customer = (ticket as any).customer;
        const service = (ticket as any).service;

        return {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          service: service?.name || services.find(s => s.id === ticket.service_id)?.name || 'General Service',
          customerName: customer?.full_name || 'Customer',
          waitTime: `${mins} min`,
          totalWaitMins: mins,
          status: ticket.status === 'waiting' ? 'waiting' : 'serving',
          origin: 'Mobile App' as const,
          joinedAt: ticket.created_at,
          customerEmail: customer?.email || '',
          isReturningCustomer: false,
          previousVisits: 0,
          history: [],
          staffNotes: ''
        };
      });

    // Filter by services this staff handles if configured
    const filteredTickets = handlingServices.length > 0
      ? formattedTickets.filter(item => handlingServices.includes(item.service))
      : formattedTickets;

    // Update waiting queue with real-time tickets
    setWaitingQueue(filteredTickets);

    // Check for new tickets and notify
    const previousIds = waitingQueue.map(item => item.id);
    const newTickets = filteredTickets.filter(ticket => !previousIds.includes(ticket.id));

    if (newTickets.length > 0) {
      newTickets.forEach(ticket => {
        addNotification(`New customer joined: ${ticket.ticketNumber} for ${ticket.service}`);
      });
    }
  }, [realtimeTickets, ticketsLoading, services]);

  // Update wait times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingQueue(prevQueue =>
        prevQueue.map(item => {
          const joinTime = new Date(item.joinedAt).getTime();
          const now = Date.now();
          const mins = Math.floor((now - joinTime) / 60000);
          return {
            ...item,
            totalWaitMins: mins,
            waitTime: `${mins} min`
          };
        })
      );

      if (currentlyServing) {
        const joinTime = new Date(currentlyServing.joinedAt).getTime();
        const now = Date.now();
        const mins = Math.floor((now - joinTime) / 60000);
        setCurrentlyServing({
          ...currentlyServing,
          totalWaitMins: mins,
          waitTime: `${mins} min`
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentlyServing]);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  const handleRecall = (customer: QueueItem) => {
    addNotification(`🔔 RECALL: ${customer.ticketNumber} - ${customer.customerName}. Customer re-notified!`);
    alert(`Recall notification sent to ${customer.customerName} (${customer.ticketNumber})`);
  };

  const handleNoShow = (customer: QueueItem) => {
    if (confirm(`Mark ${customer.customerName} (${customer.ticketNumber}) as NO-SHOW?`)) {
      setWaitingQueue(waitingQueue.filter(item => item.id !== customer.id));
      addNotification(`❌ NO-SHOW: ${customer.ticketNumber} - ${customer.customerName} removed from queue`);
    }
  };

  const handleTransfer = () => {
    if (!currentlyServing || !transferDepartment || !transferNotes) {
      alert('Please fill in all transfer details');
      return;
    }

    addNotification(`🔄 TRANSFER: ${currentlyServing.ticketNumber} transferred to ${transferDepartment}. Notes: ${transferNotes}`);
    alert(`Customer ${currentlyServing.customerName} transferred to ${transferDepartment}`);

    setCurrentlyServing(null);
    setShowTransferModal(false);
    setTransferNotes('');
    setTransferDepartment('');
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const newTicket: QueueItem = {
      id: String(Date.now()),
      ticketNumber: `Q${assignedCounter}1-${1000 + waitingQueue.length + 1}`,
      service: manualEntryForm.service,
      customerName: manualEntryForm.customerName,
      waitTime: '0 min',
      totalWaitMins: 0,
      status: 'waiting',
      origin: 'Web',
      joinedAt: new Date().toISOString()
    };

    setWaitingQueue([...waitingQueue, newTicket]);
    addNotification(`➕ Manual Entry: ${newTicket.ticketNumber} - ${manualEntryForm.customerName} added to queue`);

    setManualEntryForm({ customerName: '', service: '' });
    setShowManualEntry(false);
  };

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'QR Code':
        return <QrCode className="w-4 h-4" />;
      case 'Mobile App':
        return <Smartphone className="w-4 h-4" />;
      case 'Web':
        return <Globe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleCallNext = () => {
    if (!isAvailable) {
      alert('You are currently on break. Please set status to Available first.');
      return;
    }

    if (waitingQueue.length === 0) {
      alert('No customers waiting in queue for services you handle');
      return;
    }

    // Call next customer from any service this staff handles
    const nextCustomer = waitingQueue[0];

    // Verify this staff can handle this service
    if (!staffInfo.handlingServices.includes(nextCustomer.service)) {
      alert(`You cannot handle ${nextCustomer.service}. Your services: ${staffInfo.handlingServices.join(', ')}`);
      return;
    }

    setCurrentlyServing(nextCustomer);
    setWaitingQueue(waitingQueue.slice(1));
    addNotification(`Now calling ${nextCustomer.ticketNumber} - ${nextCustomer.customerName} for ${nextCustomer.service}`);
  };

  const handleCompleteService = () => {
    if (!currentlyServing) return;

    const newCompleted = completedToday + 1;
    setCompletedToday(newCompleted);

    // Save completed count to localStorage
    const today = new Date().toDateString();
    const completedKey = `sqms_completed_${staffInfo.name}_${today}`;
    localStorage.setItem(completedKey, String(newCompleted));

    // Save completed ticket to history for this staff member
    const completedTicketsKey = `sqms_completed_tickets_${staffInfo.name}_${today}`;
    const existingCompleted = JSON.parse(localStorage.getItem(completedTicketsKey) || '[]');
    const completedTicket = {
      ...currentlyServing,
      status: 'completed',
      completedAt: new Date().toISOString(),
      servedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem(completedTicketsKey, JSON.stringify([...existingCompleted, completedTicket]));

    addNotification(`Completed service for ${currentlyServing.ticketNumber}`);
    setCurrentlyServing(null);
  };

  const handleSkipCustomer = () => {
    if (!currentlyServing) return;

    // Put customer back at end of queue
    setWaitingQueue([...waitingQueue, currentlyServing]);
    addNotification(`${currentlyServing.ticketNumber} moved to end of queue`);
    setCurrentlyServing(null);
  };

  const stats = [
    {
      label: 'Assigned Counter',
      value: String(assignedCounter),
      icon: Hash,
      color: 'from-blue-600 to-blue-700'
    },
    {
      label: 'In Queue',
      value: String(waitingQueue.length),
      icon: User,
      color: 'from-orange-600 to-orange-700'
    },
    {
      label: 'Completed Today',
      value: String(completedToday),
      icon: CheckCircle,
      color: 'from-green-600 to-green-700'
    },
    {
      label: 'Avg Service Time',
      value: avgServiceTime,
      icon: Clock,
      color: 'from-purple-600 to-purple-700'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Status Toggle */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-slate-800 mb-2">Staff Dashboard</h1>
          <p className="text-slate-600">Manage your assigned counter and serve customers</p>
        </div>

        {/* Status Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Status:</span>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-green-500' : 'bg-orange-500'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-semibold">Available</span>
                </>
              ) : (
                <>
                  <Coffee className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-600 font-semibold">On Break</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Information Card */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{staffInfo.name}</h2>
              <p className="text-white/90 mb-4">{staffInfo.position}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-white/80" />
                  <div>
                    <div className="text-xs text-white/70">Branch</div>
                    <div className="font-semibold">{staffInfo.branch}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-white/80" />
                  <div>
                    <div className="text-xs text-white/70">Department</div>
                    <div className="font-semibold">{staffInfo.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-white/80" />
                  <div>
                    <div className="text-xs text-white/70">Employee ID</div>
                    <div className="font-semibold">{staffInfo.employeeId}</div>
                  </div>
                </div>
              </div>

              {industry && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <div className="text-xs text-white/70">Industry:</div>
                  <div className="font-semibold">{industry.name}</div>
                </div>
              )}

              {staffInfo.handlingServices && staffInfo.handlingServices.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-white/70 mb-2">Handling Services:</div>
                  <div className="flex flex-wrap gap-2">
                    {staffInfo.handlingServices.map((service: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 rounded-lg text-sm backdrop-blur-sm border border-white/30"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className={`bg-gradient-to-r ${stat.color} rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl text-slate-800 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Currently Serving */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 mb-6">
            <h2 className="text-2xl text-slate-800 mb-6">Currently Serving</h2>

            {currentlyServing ? (
              <div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-600 text-white rounded-xl px-4 py-2">
                      <div className="text-sm">Counter {assignedCounter}</div>
                      <div className="text-2xl tracking-wider">{currentlyServing.ticketNumber}</div>
                    </div>
                    <div className="bg-green-600 rounded-full p-3 animate-pulse">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-green-700">Customer Name</div>
                      <div className="text-xl text-slate-800">{currentlyServing.customerName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-700">Service</div>
                      <div className="text-lg text-slate-800">{currentlyServing.service}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-green-700">Total Wait</div>
                        <div className="text-lg text-slate-800 font-semibold">{currentlyServing.totalWaitMins} mins</div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700">Origin</div>
                        <div className="flex items-center gap-2 text-slate-800">
                          {getOriginIcon(currentlyServing.origin)}
                          <span className="text-sm">{currentlyServing.origin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={handleCompleteService}
                    className="py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete
                  </button>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfer
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRecall(currentlyServing)}
                    className="flex-1 py-3 border-2 border-orange-300 text-orange-600 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Recall
                  </button>
                  <button
                    onClick={() => handleNoShow(currentlyServing)}
                    className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <UserX className="w-5 h-5" />
                    No-Show
                  </button>
                  <button
                    onClick={handleSkipCustomer}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl text-slate-800 mb-2">No Customer Being Served</h3>
                <p className="text-slate-600 mb-6">Call the next customer to start serving</p>
                <button
                  onClick={handleCallNext}
                  disabled={waitingQueue.length === 0 || !isAvailable}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="w-5 h-5" />
                  {isAvailable ? 'Call Next Customer' : 'On Break - Unavailable'}
                </button>
              </div>
            )}
          </div>

          {/* Waiting Queue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">Waiting Queue</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Walk-In
                </button>
                <button
                  onClick={handleCallNext}
                  disabled={waitingQueue.length === 0 || currentlyServing !== null || !isAvailable}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Bell className="w-4 h-4" />
                  Call Next
                </button>
              </div>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No customers in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingQueue.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCustomer(item)}
                    className="w-full border-2 border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white rounded-lg px-3 py-2 min-w-[100px] text-center">
                          <div className="text-xs opacity-80">Position {index + 1}</div>
                          <div className="text-sm tracking-wider">{item.ticketNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Service</div>
                          <div className="text-slate-800">{item.service}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Counter</div>
                          <div className="text-slate-800 font-semibold">#{item.ticketNumber.match(/Q(\d+)/)?.[1] || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">Total Wait</div>
                        <div className="text-lg font-semibold text-orange-600">{item.totalWaitMins} mins</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{item.customerName}</span>
                        {item.isReturningCustomer && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold ml-2">
                            Returning
                          </span>
                        )}
                        {item.transferInfo && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold ml-2">
                            Transferred
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {getOriginIcon(item.origin)}
                        <span>{item.origin}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-teal-600 rounded-lg p-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl text-slate-800">Activity Log</h2>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800"
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p>{notification}</p>
                        <div className="text-xs text-teal-600 mt-1">Just now</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Counter Status */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mt-6">
            <h3 className="text-xl mb-4">Your Counter Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Counter Number</span>
                <span className="text-2xl">{assignedCounter}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Status</span>
                <span className="text-green-300">● Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Shift</span>
                <span>9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && currentlyServing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl text-slate-800">Transfer Customer</h2>
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Customer: {currentlyServing.customerName}</p>
                  <p>Ticket: {currentlyServing.ticketNumber}</p>
                  <p>Service: {currentlyServing.service}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Transfer to Department *</label>
                  <select
                    value={transferDepartment}
                    onChange={(e) => setTransferDepartment(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select department</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Staff Notes *</label>
                  <textarea
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Provide context for the next staff member..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleTransfer}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfer
                  </button>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 rounded-lg p-3">
                    <UserPlus className="w-6 h-6 text-teal-600" />
                  </div>
                  <h2 className="text-2xl text-slate-800">Walk-In Customer</h2>
                </div>
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleManualEntry} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Customer Name *</label>
                  <input
                    type="text"
                    value={manualEntryForm.customerName}
                    onChange={(e) => setManualEntryForm({ ...manualEntryForm, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Service *</label>
                  <select
                    value={manualEntryForm.service}
                    onChange={(e) => setManualEntryForm({ ...manualEntryForm, service: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p>This ticket will be added to your counter's queue for customers without mobile access.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Quick View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl text-slate-800">{selectedCustomer.customerName}</h2>
                      {selectedCustomer.isReturningCustomer && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                          Returning Customer
                        </span>
                      )}
                      {selectedCustomer.transferInfo && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                          Transferred
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{selectedCustomer.ticketNumber}</p>
                    {selectedCustomer.isReturningCustomer && selectedCustomer.previousVisits && (
                      <p className="text-xs text-blue-600 mt-1">
                        Previous visits: {selectedCustomer.previousVisits}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerViewTab('details');
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Transfer Info Alert */}
              {selectedCustomer.transferInfo && (
                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-purple-800 mb-1">Transferred from Counter {selectedCustomer.transferInfo.fromCounter}</h3>
                      <p className="text-sm text-purple-700 mb-2">
                        <span className="font-semibold">Department:</span> {selectedCustomer.transferInfo.fromDepartment}
                      </p>
                      <p className="text-sm text-purple-700 mb-2">
                        <span className="font-semibold">Reason:</span> {selectedCustomer.transferInfo.reason}
                      </p>
                      <p className="text-xs text-purple-600">
                        Transferred by {selectedCustomer.transferInfo.transferredBy} at{' '}
                        {new Date(selectedCustomer.transferInfo.transferredAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setCustomerViewTab('details')}
                    className={`pb-3 px-2 border-b-2 transition-colors ${
                      customerViewTab === 'details'
                        ? 'border-blue-600 text-blue-600 font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Details
                    </div>
                  </button>
                  <button
                    onClick={() => setCustomerViewTab('history')}
                    className={`pb-3 px-2 border-b-2 transition-colors ${
                      customerViewTab === 'history'
                        ? 'border-blue-600 text-blue-600 font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      History & Notes
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {customerViewTab === 'details' ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">Service</div>
                      <div className="text-lg text-slate-800 font-semibold">{selectedCustomer.service}</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-sm text-orange-600 mb-1">Total Wait Duration</div>
                      <div className="text-lg text-orange-800 font-semibold">{selectedCustomer.totalWaitMins} minutes</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 mb-1">Origin</div>
                      <div className="flex items-center gap-2 text-lg text-blue-800 font-semibold">
                        {getOriginIcon(selectedCustomer.origin)}
                        {selectedCustomer.origin}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm text-green-600 mb-1">Joined At</div>
                      <div className="text-lg text-green-800 font-semibold">
                        {new Date(selectedCustomer.joinedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleRecall(selectedCustomer);
                        setSelectedCustomer(null);
                      }}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Recall Customer
                    </button>
                    <button
                      onClick={() => {
                        handleNoShow(selectedCustomer);
                        setSelectedCustomer(null);
                      }}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <UserX className="w-5 h-5" />
                      Mark No-Show
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* History & Notes Tab */}
                  <div className="space-y-4">
                    {/* Visit History */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Previous Visits
                      </h3>
                      {selectedCustomer.history && selectedCustomer.history.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCustomer.history.map((visit, index) => (
                            <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="font-semibold text-slate-800">{visit.service}</div>
                                  <div className="text-sm text-slate-600">
                                    {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  visit.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {visit.status}
                                </span>
                              </div>
                              {visit.notes && (
                                <div className="text-sm text-slate-700 bg-white rounded-lg p-3 mt-2">
                                  <span className="font-semibold">Notes:</span> {visit.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-6 text-center">
                          <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">No previous visit history found</p>
                        </div>
                      )}
                    </div>

                    {/* Staff Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Staff Notes
                      </h3>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Add notes about this customer's visit..."
                        className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button
                        onClick={() => {
                          if (customerNotes.trim()) {
                            alert('Notes saved successfully!');
                            setCustomerNotes('');
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
