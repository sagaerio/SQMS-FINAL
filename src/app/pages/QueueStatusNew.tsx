import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, XCircle, Hash, RefreshCw, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import {
  getActiveTicket,
  getCustomerTickets,
  cancelTicket,
  subscribeToTicketUpdates
} from '../../services/queueService';
import type { QueueTicket } from '../../lib/supabase';
import { useNavigate } from 'react-router';

export function QueueStatus() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { industry } = useIndustry();
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [allTickets, setAllTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    loadTickets();
  }, [user, authLoading, navigate]);

  // Real-time updates for active ticket
  useEffect(() => {
    if (!activeTicket) return;

    const subscription = subscribeToTicketUpdates(activeTicket.id, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setActiveTicket(payload.new as QueueTicket);

        // Show notification for status changes
        if (payload.new.status === 'called') {
          showNotification('🎉 Your turn is up! Please proceed to your assigned counter.');
        } else if (payload.new.status === 'serving') {
          showNotification('✅ You are now being served.');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeTicket?.id]);

  const loadTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [activeResult, allResult] = await Promise.all([
        getActiveTicket(user.id),
        getCustomerTickets(user.id)
      ]);

      if (activeResult.data) {
        setActiveTicket(activeResult.data);
      }

      if (allResult.data) {
        setAllTickets(allResult.data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeTicket || !window.confirm('Are you sure you want to cancel this ticket?')) return;

    setCancelling(true);
    try {
      const { error } = await cancelTicket(activeTicket.id);
      if (error) {
        alert('Failed to cancel ticket. Please try again.');
        return;
      }

      setActiveTicket(null);
      loadTickets();
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SQMS Queue Update', { body: message });
    }
  };

  const downloadQRCode = (ticketNumber: string) => {
    const svg = document.getElementById(`qr-code-${ticketNumber}`);
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
      downloadLink.download = `ticket-${ticketNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-600';
      case 'called':
        return 'bg-blue-100 text-blue-600';
      case 'serving':
        return 'bg-green-100 text-green-600';
      case 'completed':
        return 'bg-slate-100 text-slate-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your queue status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl text-slate-800 mb-3">Queue Status</h1>
        <p className="text-xl text-slate-600 mb-8">Monitor your position in real-time</p>

        {/* Active Ticket */}
        {activeTicket ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">Active Ticket</h2>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(activeTicket.status)}`}>
                {activeTicket.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code & Ticket Number */}
              <div className="text-center">
                <div className="bg-blue-600 rounded-2xl p-6 inline-block mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      id={`qr-code-${activeTicket.ticket_number}`}
                      value={`TICKET-${activeTicket.ticket_number}`}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-6xl text-white mt-4">{activeTicket.ticket_number}</p>
                </div>
                <button
                  onClick={() => downloadQRCode(activeTicket.ticket_number)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>

              {/* Ticket Details */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Position in Queue</span>
                  </div>
                  <p className="text-3xl text-blue-600">{activeTicket.position}</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-slate-600">Estimated Wait Time</span>
                  </div>
                  <p className="text-3xl text-orange-600">{activeTicket.estimated_wait_time} min</p>
                </div>

                {activeTicket.counter_id && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-slate-600">Assigned Counter</span>
                    </div>
                    <p className="text-3xl text-green-600">Counter {activeTicket.counter_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={loadTickets}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Status
              </button>

              {activeTicket.status === 'waiting' && (
                <button
                  onClick={handleCancelTicket}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  {cancelling ? 'Cancelling...' : 'Cancel Ticket'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center mb-8 border border-slate-200">
            <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl text-slate-800 mb-2">No Active Ticket</h3>
            <p className="text-slate-600 mb-6">You don't have any active tickets in the queue.</p>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Join a Queue
            </button>
          </div>
        )}

        {/* Ticket History */}
        {allTickets.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl text-slate-800 mb-6">Ticket History</h2>
            <div className="space-y-4">
              {allTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <div>
                    <p className="text-lg text-slate-800 font-semibold">{ticket.ticket_number}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                      {new Date(ticket.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
