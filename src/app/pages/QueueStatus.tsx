import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, XCircle, Play, Hash, RefreshCw, History, User, Mail, Phone, Download, Star } from 'lucide-react';
import { QueueStatusBar } from '../components/QueueStatusBar';
import { useIndustry } from '../contexts/IndustryContext';
import { industryServices } from '../data/industryServices';
import { QRCodeSVG } from 'qrcode.react';

interface QueueItem {
  id: string;
  ticketNumber: string;
  service: string;
  status: 'waiting' | 'serving' | 'completed';
  position: number;
  waitTime: string;
  counter?: number;
  servedAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const initialQueue: QueueItem[] = [
  { id: '1', ticketNumber: 'Q11-1023', service: 'Account Services', status: 'serving', position: 0, waitTime: 'Now serving', counter: 1, customerName: 'John Smith', customerEmail: 'john.smith@email.com', customerPhone: '+1 (555) 123-4567' },
  { id: '2', ticketNumber: 'Q21-1024', service: 'Loan Services', status: 'waiting', position: 1, waitTime: '5 min', customerName: 'Sarah Johnson', customerEmail: 'sarah.j@email.com', customerPhone: '+1 (555) 234-5678' },
  { id: '3', ticketNumber: 'Q31-1025', service: 'Card Services', status: 'waiting', position: 2, waitTime: '10 min', customerName: 'Michael Chen', customerEmail: 'mchen@email.com', customerPhone: '+1 (555) 345-6789' },
  { id: '4', ticketNumber: 'Q41-1026', service: 'Customer Support', status: 'waiting', position: 3, waitTime: '12 min', customerName: 'Emily Davis', customerEmail: 'emily.d@email.com', customerPhone: '+1 (555) 456-7890' },
  { id: '5', ticketNumber: 'Q11-1027', service: 'Account Services', status: 'waiting', position: 4, waitTime: '18 min', customerName: 'James Wilson', customerEmail: 'jwilson@email.com', customerPhone: '+1 (555) 567-8901' },
  { id: '6', ticketNumber: 'Q51-1028', service: 'Document Verification', status: 'serving', position: 0, waitTime: 'Now serving', counter: 3, customerName: 'Lisa Anderson', customerEmail: 'l.anderson@email.com', customerPhone: '+1 (555) 678-9012' },
  { id: '7', ticketNumber: 'Q21-1029', service: 'Loan Services', status: 'waiting', position: 5, waitTime: '25 min', customerName: 'Robert Brown', customerEmail: 'rbrown@email.com', customerPhone: '+1 (555) 789-0123' },
];

export function QueueStatus() {
  const { industry } = useIndustry();
  const [activeTab, setActiveTab] = useState<'waiting' | 'serving' | 'completed'>('waiting');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [completedQueue, setCompletedQueue] = useState<QueueItem[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [userRole, setUserRole] = useState('customer');
  const [customerTicket, setCustomerTicket] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Generate industry-specific initial queue
  useEffect(() => {
    if (!industry) return;

    const services = industryServices[industry.id as keyof typeof industryServices] || industryServices.banking;
    const initialQueue: QueueItem[] = [
      { id: '1', ticketNumber: 'Q11-1023', service: services[0]?.name || 'Service 1', status: 'serving', position: 0, waitTime: 'Now serving', counter: 1, customerName: 'John Smith', customerEmail: 'john.smith@email.com', customerPhone: '+1 (555) 123-4567' },
      { id: '2', ticketNumber: 'Q21-1024', service: services[1]?.name || 'Service 2', status: 'waiting', position: 1, waitTime: '5 min', customerName: 'Sarah Johnson', customerEmail: 'sarah.j@email.com', customerPhone: '+1 (555) 234-5678' },
      { id: '3', ticketNumber: 'Q31-1025', service: services[2]?.name || 'Service 3', status: 'waiting', position: 2, waitTime: '10 min', customerName: 'Michael Chen', customerEmail: 'mchen@email.com', customerPhone: '+1 (555) 345-6789' },
      { id: '4', ticketNumber: 'Q41-1026', service: services[5]?.name || 'Service 4', status: 'waiting', position: 3, waitTime: '12 min', customerName: 'Emily Davis', customerEmail: 'emily.d@email.com', customerPhone: '+1 (555) 456-7890' },
      { id: '5', ticketNumber: 'Q11-1027', service: services[0]?.name || 'Service 5', status: 'waiting', position: 4, waitTime: '18 min', customerName: 'James Wilson', customerEmail: 'jwilson@email.com', customerPhone: '+1 (555) 567-8901' },
      { id: '6', ticketNumber: 'Q51-1028', service: services[4]?.name || 'Service 6', status: 'serving', position: 0, waitTime: 'Now serving', counter: 3, customerName: 'Lisa Anderson', customerEmail: 'l.anderson@email.com', customerPhone: '+1 (555) 678-9012' },
      { id: '7', ticketNumber: 'Q21-1029', service: services[1]?.name || 'Service 7', status: 'waiting', position: 5, waitTime: '25 min', customerName: 'Robert Brown', customerEmail: 'rbrown@email.com', customerPhone: '+1 (555) 789-0123' },
    ];
    setQueue(initialQueue);
  }, [industry]);

  // Load user role and customer tickets
  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'customer';
    const staffCounter = localStorage.getItem('sqms_staff_counter') || '3';
    setUserRole(role);

    // Load customer's queue tickets
    if (role === 'customer') {
      const queueData = JSON.parse(localStorage.getItem('sqms_queue') || '[]');

      // Find active ticket (waiting or serving)
      const activeTicket = queueData.find((t: any) => t.status === 'waiting' || t.status === 'serving');
      if (activeTicket) {
        setCustomerTicket(activeTicket);
      }

      const customerTickets = queueData.map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber.toString(),
        service: ticket.service.name,
        status: ticket.status,
        position: ticket.position,
        waitTime: ticket.estimatedWait,
        counter: ticket.counter,
      }));
      setQueue((prev) => [...customerTickets, ...prev]);
    }
    // For staff, show all queue items in their department (no filtering)
    // Staff can see the entire department's queue status
  }, []);

  // Load ticket history
  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'customer';

    if (role === 'staff') {
      // Load staff's completed tickets for today
      const staffName = localStorage.getItem('sqms_user_name') || 'Staff';
      const today = new Date().toDateString();
      const completedTicketsKey = `sqms_completed_tickets_${staffName}_${today}`;
      const completedTickets = JSON.parse(localStorage.getItem(completedTicketsKey) || '[]');

      const completed = completedTickets.map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        service: ticket.service,
        status: 'completed' as const,
        position: 0,
        waitTime: '0 min',
        servedAt: ticket.servedAt,
        customerName: ticket.customerName,
      }));
      setCompletedQueue(completed);
    } else {
      // For customers and admins, load general history
      const history = JSON.parse(localStorage.getItem('sqms_ticket_history') || '[]');
      const completed = history.map((ticket: any, index: number) => ({
        id: `hist-${index}`,
        ticketNumber: ticket.ticketNumber,
        service: ticket.service.name,
        status: 'completed' as const,
        position: 0,
        waitTime: '0 min',
        servedAt: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }));
      setCompletedQueue(completed);
    }
  }, []);

  // Simulate real-time updates and notifications
  useEffect(() => {
    if (!customerTicket) return;

    const interval = setInterval(() => {
      const queueData = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
      const updatedTicket = queueData.find((t: any) => t.id === customerTicket.id);

      if (updatedTicket) {
        // Check for status changes
        if (updatedTicket.status !== customerTicket.status) {
          if (updatedTicket.status === 'serving') {
            addNotification('🎉 Your turn is up! Please proceed to counter #' + updatedTicket.counter);
            // Update the queue list to reflect serving status
            setQueue((prevQueue) =>
              prevQueue.map((item) =>
                item.id === updatedTicket.id
                  ? { ...item, status: 'serving', waitTime: 'Now serving', counter: updatedTicket.counter }
                  : item
              )
            );
          } else if (updatedTicket.status === 'completed') {
            addNotification('✅ Service completed! Thank you for visiting.');
            setShowRatingModal(true);
          }
        }

        // Check if turn is near (position 1 or 2)
        if (updatedTicket.position <= 2 && updatedTicket.position > 0 && customerTicket.position > 2) {
          addNotification('⏰ Your turn is near! Please be ready.');
        }

        setCustomerTicket(updatedTicket);
      }

      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];

        // Randomly progress queue
        if (Math.random() > 0.6 && newQueue.length > 0) {
          const waitingItems = newQueue.filter((item) => item.status === 'waiting');
          if (waitingItems.length > 0) {
            const randomItem = waitingItems[Math.floor(Math.random() * waitingItems.length)];
            const index = newQueue.findIndex((item) => item.id === randomItem.id);

            if (randomItem.position > 0) {
              newQueue[index].position -= 1;
              const currentWaitTime = randomItem.waitTime;
              const waitMinutes = parseInt(currentWaitTime);
              if (!isNaN(waitMinutes)) {
                const newWaitMinutes = Math.max(0, waitMinutes - 3);
                newQueue[index].waitTime = newWaitMinutes === 0 ? 'Next' : `${newWaitMinutes} min`;
              }

              // Update localStorage to sync
              const queueData = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
              const updatedQueueData = queueData.map((t: any) =>
                t.id === randomItem.id
                  ? { ...t, position: newQueue[index].position, estimatedWait: newQueue[index].waitTime }
                  : t
              );
              localStorage.setItem('sqms_queue', JSON.stringify(updatedQueueData));
            }
          }
        }

        return newQueue;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [customerTicket]);

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev].slice(0, 10));
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('customer-qr-code');
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
      downloadLink.download = `ticket-${customerTicket.ticketNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const submitRating = () => {
    const ratings = JSON.parse(localStorage.getItem('sqms_ratings') || '[]');
    ratings.push({
      ticketId: customerTicket.id,
      rating,
      feedback: ratingFeedback,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('sqms_ratings', JSON.stringify(ratings));

    // Update ticket status to completed
    const queueData = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
    const updatedQueue = queueData.map((t: any) =>
      t.id === customerTicket.id ? { ...t, status: 'completed' } : t
    );
    localStorage.setItem('sqms_queue', JSON.stringify(updatedQueue));

    setShowRatingModal(false);
    setRating(0);
    setRatingFeedback('');
    alert('Thank you for your feedback!');
  };

  const cancelTicket = () => {
    if (!customerTicket) return;

    if (confirm('Are you sure you want to cancel your ticket? You will be able to book a new ticket for a different service.')) {
      // Remove from localStorage
      const queueData = JSON.parse(localStorage.getItem('sqms_queue') || '[]');
      const updatedQueue = queueData.filter((t: any) => t.id !== customerTicket.id);
      localStorage.setItem('sqms_queue', JSON.stringify(updatedQueue));

      // Clear selected service so user can choose a new one
      localStorage.removeItem('sqms_selected_service');

      // Remove from UI
      setQueue((prevQueue) => prevQueue.filter((item) => item.id !== customerTicket.id));
      setCustomerTicket(null);

      addNotification('Your ticket has been cancelled. You can now book a new ticket for a different service.');

      // Redirect to dashboard to select new service
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    }
  };

  const updateStatus = (id: string, newStatus: QueueItem['status'], counter?: number) => {
    setQueue((prevQueue) => {
      const updatedQueue = prevQueue.map((item) => {
        if (item.id === id) {
          const updated = { ...item, status: newStatus };
          if (newStatus === 'serving' && counter) {
            updated.counter = counter;
            updated.waitTime = 'Now serving';
          }
          if (newStatus === 'completed') {
            updated.servedAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            // Move to completed
            setCompletedQueue((prev) => [updated, ...prev]);
            addNotification(`${item.ticketNumber} has been completed`);
            // Remove from active queue
            return null;
          }
          return updated;
        }
        return item;
      }).filter((item): item is QueueItem => item !== null);
      
      return updatedQueue;
    });

    const ticket = queue.find((item) => item.id === id);
    if (ticket && newStatus !== 'completed') {
      addNotification(`${ticket.ticketNumber} status updated to ${newStatus}`);
    }
  };

  const callNext = () => {
    const nextWaiting = queue.find((item) => item.status === 'waiting');
    if (nextWaiting) {
      const availableCounter = Math.floor(Math.random() * 5) + 1;
      updateStatus(nextWaiting.id, 'serving', availableCounter);
      addNotification(`Now calling ${nextWaiting.ticketNumber} to Counter ${availableCounter}`);
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'serving':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'waiting':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'serving':
        return <Play className="w-4 h-4" />;
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  // For customers, only show waiting and serving tabs
  const isCustomer = userRole === 'customer';

  // Filter queue by status
  let filteredQueue = queue.filter((item) => item.status === activeTab);

  // For customers, additionally filter by their service
  if (isCustomer && customerTicket) {
    filteredQueue = filteredQueue.filter((item) => item.service === customerTicket.service.name);
  }

  const displayQueue = activeTab === 'completed' ? completedQueue : filteredQueue;

  const IndustryIcon = industry?.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Customer Ticket Display */}
      {isCustomer && customerTicket && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl shadow-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Code and Ticket Number */}
            <div className="text-center text-white">
              <p className="text-sm opacity-90 mb-4">Your Ticket Number</p>
              <div className="bg-white p-6 rounded-2xl mb-4 inline-block">
                <QRCodeSVG
                  id="customer-qr-code"
                  value={`TICKET-${customerTicket.ticketNumber}-${customerTicket.id}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-6xl font-bold mb-4">{customerTicket.ticketNumber}</p>
              <button
                onClick={downloadQRCode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>

            {/* Ticket Details */}
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6">Queue Status</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-sm opacity-75 mb-1">Service</p>
                  <p className="text-xl font-semibold">{customerTicket.service.name}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-sm opacity-75 mb-1">Branch</p>
                  <p className="text-lg">{customerTicket.branch?.name || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-sm opacity-75 mb-1">Counter</p>
                    <p className="text-2xl font-bold">#{customerTicket.counter}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-sm opacity-75 mb-1">Position</p>
                    <p className="text-2xl font-bold">
                      {customerTicket.status === 'serving' ? 'Serving' : `#${customerTicket.position}`}
                    </p>
                  </div>
                  {customerTicket.status !== 'serving' && (
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <p className="text-sm opacity-75 mb-1">Est. Wait</p>
                      <p className="text-2xl font-bold">{customerTicket.estimatedWait}</p>
                    </div>
                  )}
                </div>
                <div className={`rounded-xl p-4 text-center font-semibold text-lg ${
                  customerTicket.status === 'serving'
                    ? 'bg-green-500'
                    : 'bg-white/10 backdrop-blur'
                }`}>
                  {customerTicket.status === 'serving' ? `🎉 Your turn! Please proceed to Counter #${customerTicket.counter}` : '⏳ Please wait for your turn'}
                </div>
                {customerTicket.status === 'waiting' && (
                  <button
                    onClick={cancelTicket}
                    className="w-full mt-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-800 mb-2">Queue Management</h1>
          <p className="text-slate-600">Real-time queue monitoring{isCustomer ? '' : ' and control'}</p>
          {industry && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className={`bg-gradient-to-r ${industry.color} rounded p-1.5`}>
                {IndustryIcon && <IndustryIcon className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-slate-700">{industry.name}</span>
            </div>
          )}
        </div>
        {!isCustomer && (
          <button
            onClick={callNext}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Call Next
          </button>
        )}
      </div>

      {/* Status Tabs - Now at the top, hide completed for customers */}
      {!isCustomer && (
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'waiting'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Waiting</span>
              <span className={`px-2 py-1 rounded-full text-sm ${activeTab === 'waiting' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                {queue.filter((q) => q.status === 'waiting').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('serving')}
              className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'serving'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Play className="w-5 h-5" />
              <span className="font-medium">Serving</span>
              <span className={`px-2 py-1 rounded-full text-sm ${activeTab === 'serving' ? 'bg-white/20' : 'bg-green-100 text-green-600'}`}>
                {queue.filter((q) => q.status === 'serving').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed</span>
              <span className={`px-2 py-1 rounded-full text-sm ${activeTab === 'completed' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                {completedQueue.length}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Hash className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl text-slate-800">
                  {activeTab === 'waiting' && 'Waiting Queue'}
                  {activeTab === 'serving' && 'Currently Serving'}
                  {activeTab === 'completed' && 'Completed Tickets'}
                </h2>
              </div>
              {activeTab !== 'completed' && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Updates
                </div>
              )}
            </div>

            {displayQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Hash className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No tickets in this queue</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {displayQueue.map((item, index) => {
                  // Calculate accurate position based on array index and status
                  const calculatedPosition = item.status === 'serving' ? 0 : index + 1 - displayQueue.filter((q, i) => i < index && q.status === 'serving').length;
                  return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      item.status === 'serving' ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl px-4 py-3 min-w-[140px] text-center">
                          <div className="text-xs opacity-80 mb-1">Ticket Number</div>
                          <div className="text-xl tracking-wider">{item.ticketNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Service</div>
                          <div className="text-lg text-slate-800">{item.service}</div>
                        </div>
                        {!isCustomer && (
                          <div>
                            <div className="text-sm text-slate-600">Counter</div>
                            <div className="text-lg text-slate-800 font-semibold">#{item.ticketNumber.match(/Q(\d+)/)?.[1] || item.counter || 'N/A'}</div>
                          </div>
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 text-sm flex items-center gap-2 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="font-medium">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </div>
                    </div>

                    {/* Customer Information - Only for staff/admin */}
                    {!isCustomer && item.customerName && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-semibold text-blue-900 mb-2">Customer Information</div>
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-blue-600">Name</div>
                              <div className="text-slate-800">{item.customerName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-blue-600">Email</div>
                              <div className="text-slate-800">{item.customerEmail}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-blue-600">Phone</div>
                              <div className="text-slate-800">{item.customerPhone}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {item.status !== 'completed' && (
                        <>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Position</div>
                            <div className="text-lg text-blue-600">
                              {item.status === 'serving' ? (item.counter ? `Counter ${item.counter}` : 'Serving') : `#${calculatedPosition}`}
                            </div>
                          </div>
                          {item.status !== 'serving' && (
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                              <div className="text-xs text-slate-500 mb-1">Wait Time</div>
                              <div className="text-lg text-teal-600">{item.waitTime}</div>
                            </div>
                          )}
                        </>
                      )}
                      {item.status === 'serving' && item.counter && (
                        <div className="text-center p-3 bg-green-100 rounded-lg col-span-2">
                          <div className="text-xs text-green-700 mb-1">Counter</div>
                          <div className="text-2xl text-green-700 font-bold">#{item.counter}</div>
                        </div>
                      )}
                      {item.status === 'completed' && item.servedAt && (
                        <div className="text-center p-3 bg-slate-50 rounded-lg col-span-3">
                          <div className="text-xs text-slate-500 mb-1">Completed At</div>
                          <div className="text-lg text-slate-800">{item.servedAt}</div>
                        </div>
                      )}
                    </div>

                    {/* Staff/Admin Actions */}
                    {item.status !== 'completed' && !isCustomer && (
                      <div className="flex gap-2">
                        {item.status === 'waiting' && (
                          <button
                            onClick={() => {
                              const counter = Math.floor(Math.random() * 5) + 1;
                              updateStatus(item.id, 'serving', counter);
                            }}
                            className="flex-1 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Start Serving
                          </button>
                        )}
                        {item.status === 'serving' && (
                          <button
                            onClick={() => updateStatus(item.id, 'completed')}
                            className="flex-1 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete Service
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-teal-600 rounded-lg p-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl text-slate-800">Live Updates</h2>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-2">Updates will appear here</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800 animate-fade-in"
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

            <div className="mt-6">
              <button
                onClick={() => setNotifications([])}
                className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl text-slate-800 mb-2">Service Completed!</h2>
              <p className="text-slate-600">How was your experience?</p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Optional Feedback */}
            <div className="mb-6">
              <label className="text-sm text-slate-600 mb-2 block">
                Additional feedback (optional)
              </label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
              >
                Skip
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
