import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, XCircle, Hash, RefreshCw, Download, User, Mail, Briefcase, Users, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  getActiveTicket,
  getCustomerTickets,
  cancelTicket,
  subscribeToTicketUpdates
} from '../../services/queueService';
import type { QueueTicket } from '../../lib/supabase';
import { useNavigate } from 'react-router';
import { safeGetItem, safeSetItem } from '../../lib/storage';

interface NotificationItem {
  message: string;
  timestamp: string;
  type: 'called' | 'serving' | 'completed' | 'transferred';
  read: boolean;
}

export function QueueStatus() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { industry } = useIndustry();
  const { showNotification } = useNotification();
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [allTickets, setAllTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load notification history from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = safeGetItem<NotificationItem[]>(`sqms_notifications_${user.id}`, []);
    setNotifications(saved);
  }, [user]);

  // Save notification to history (useCallback to avoid recreating function)
  const saveNotificationToHistory = React.useCallback((notification: NotificationItem) => {
    if (!user) return;
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50); // Keep last 50
      safeSetItem(`sqms_notifications_${user.id}`, updated);
      return updated;
    });
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (!user) return;
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    safeSetItem(`sqms_notifications_${user.id}`, updated);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Immediate redirect for staff/admin - check on every render (unless in customer mode)
  useEffect(() => {
    // Check localStorage immediately for role (faster than waiting for user object)
    const userRole = localStorage.getItem('sqms_user_role');
    const isCustomerMode = localStorage.getItem('sqms_customer_mode') === 'true';

    // If in customer mode, allow access to this page
    if (!isCustomerMode) {
      if (userRole === 'staff') {
        navigate('/staff', { replace: true });
        return;
      }

      if (userRole === 'admin' || userRole === 'superadmin') {
        navigate('/admin', { replace: true });
        return;
      }
    }

    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Double-check with user object (only redirect if not in customer mode)
    if (!isCustomerMode) {
      if (user.role === 'staff') {
        navigate('/staff', { replace: true });
        return;
      }

      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin', { replace: true });
        return;
      }
    }

    loadTickets();
  }, [user, authLoading, navigate]);

  // Real-time updates for active ticket
  useEffect(() => {
    if (!activeTicket) return;

    const subscription = subscribeToTicketUpdates(activeTicket.id, (payload) => {
      if (payload.eventType === 'UPDATE') {
        const oldStatus = (activeTicket as any)?.status;
        const newTicket = payload.new as QueueTicket;
        setActiveTicket(newTicket);

        // Show in-app notification for status changes
        if (newTicket.status === 'called' && oldStatus !== 'called') {
          const counterInfo = (newTicket as any).counter?.number
            ? ` at Counter ${(newTicket as any).counter.number}`
            : '';
          showNotification(`🎉 Your turn is up! Please proceed${counterInfo}.`, 'success', 10000);

          // Save notification to history
          saveNotificationToHistory({
            message: `You were called${counterInfo}`,
            timestamp: new Date().toISOString(),
            type: 'called',
            read: false
          });
        } else if (newTicket.status === 'serving' && oldStatus !== 'serving') {
          showNotification('✅ You are now being served.', 'success');

          // Save notification to history
          saveNotificationToHistory({
            message: 'You are now being served',
            timestamp: new Date().toISOString(),
            type: 'serving',
            read: false
          });
        } else if (newTicket.status === 'completed' && oldStatus !== 'completed') {
          showNotification('✨ Service completed. Thank you!', 'success');

          // Save notification to history
          saveNotificationToHistory({
            message: 'Your service has been completed',
            timestamp: new Date().toISOString(),
            type: 'completed',
            read: false
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeTicket?.id, saveNotificationToHistory, showNotification]);

  const loadTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if demo user - load or create demo ticket
      if (user.id === 'demo-user-id') {
        const demoTicket = localStorage.getItem('sqms_demo_active_ticket');
        if (demoTicket) {
          const ticket = JSON.parse(demoTicket);
          setActiveTicket(ticket);
          setAllTickets([ticket]);
          setLoading(false);
          return;
        }
      }

      // Check for any demo ticket (for non-demo users using demo mode)
      const anyDemoTicket = localStorage.getItem('sqms_demo_active_ticket');
      if (anyDemoTicket) {
        const ticket = JSON.parse(anyDemoTicket);
        if (ticket.customer_id === user.id) {
          setActiveTicket(ticket);
          setAllTickets([ticket]);
          setLoading(false);
          return;
        }
      }

      // For real Supabase users
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
      // Handle demo user
      if (user?.id === 'demo-user-id') {
        localStorage.removeItem('sqms_demo_active_ticket');
        setActiveTicket(null);
        setAllTickets([]);
        setCancelling(false);
        return;
      }

      // Handle real Supabase user
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

  // Check if staff/admin and show redirect message (only if not in customer mode)
  const userRole = user?.role || localStorage.getItem('sqms_user_role');
  const isCustomerModeActive = localStorage.getItem('sqms_customer_mode') === 'true';

  if (!isCustomerModeActive && (userRole === 'staff' || userRole === 'admin' || userRole === 'superadmin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-2">Redirecting to your dashboard...</p>
          <p className="text-slate-500 text-sm">
            {userRole === 'staff' ? 'Staff members use the Staff Dashboard to manage queues.' : 'Admins use the Admin Dashboard for queue management.'}
          </p>
        </div>
      </div>
    );
  }

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

  // Get selected service name
  const getServiceName = () => {
    const savedService = localStorage.getItem('sqms_selected_service');
    if (savedService) {
      const service = JSON.parse(savedService);
      return service.name;
    }
    return 'General Service';
  };

  // Generate tickets behind the current user
  const getTicketsBehind = () => {
    if (!activeTicket) return [];

    const numTicketsBehind = Math.floor(Math.random() * 8) + 5;
    const tickets = [];

    // Get the letter prefix from current ticket (e.g., "A" from "A042")
    const currentPrefix = activeTicket.ticket_number.charAt(0);
    // Get the number part
    const currentNumber = parseInt(activeTicket.ticket_number.substring(1));

    for (let i = 1; i <= numTicketsBehind; i++) {
      const ticketNum = currentNumber + i;
      tickets.push({
        number: `${currentPrefix}${String(ticketNum).padStart(3, '0')}`,
        position: activeTicket.position + i
      });
    }

    return tickets;
  };

  const ticketsBehind = getTicketsBehind();
  const peopleBehind = ticketsBehind.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl text-slate-800 mb-3">Queue Status</h1>
            <p className="text-xl text-slate-600">Monitor your position in real-time</p>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-200"
          >
            <Bell className="w-6 h-6 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Panel */}
        {showNotifications && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-slate-800">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      notification.read
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-blue-50 border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ticket Number at Top */}
        {activeTicket && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-2xl p-8 mb-6 text-center">
            <p className="text-white text-lg mb-3 opacity-90">Your Ticket Number</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block mb-4">
              <div className="bg-white rounded-xl p-4 inline-block">
                <QRCodeSVG
                  id={`qr-code-top-${activeTicket.ticket_number}`}
                  value={`TICKET-${activeTicket.ticket_number}`}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-white text-7xl font-bold mb-2">{activeTicket.ticket_number}</p>

            {/* Show counter info when called or serving */}
            {(activeTicket.status === 'called' || activeTicket.status === 'serving') && (activeTicket as any).counter && (
              <div className="bg-yellow-400 text-yellow-900 rounded-2xl px-8 py-4 mb-4 inline-block animate-pulse">
                <p className="text-sm font-semibold mb-1">Please proceed to</p>
                <p className="text-3xl font-bold">Counter {(activeTicket as any).counter.number}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <p className="text-white text-sm opacity-90">Position</p>
                <p className="text-white text-3xl font-bold">#{activeTicket.position}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <p className="text-white text-sm opacity-90">Est. Wait</p>
                <p className="text-white text-3xl font-bold">{activeTicket.estimated_wait_time} min</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <p className="text-white text-sm opacity-90">Status</p>
                <p className="text-white text-xl font-bold capitalize">{activeTicket.status}</p>
              </div>
            </div>
            <button
              onClick={() => downloadQRCode(activeTicket.ticket_number)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          </div>
        )}

        {/* Customer Information Card */}
        {activeTicket && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-slate-200">
            <h2 className="text-2xl text-slate-800 mb-6">Your Information</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Customer Details */}
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-slate-600">Customer Name</span>
                </div>
                <p className="text-lg text-slate-800 font-semibold">{user?.full_name}</p>
              </div>

              {/* Email */}
              <div className="bg-purple-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 rounded-lg p-2">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-slate-600">Email Address</span>
                </div>
                <p className="text-lg text-slate-800 font-semibold truncate">{user?.email}</p>
              </div>

              {/* Selected Service */}
              <div className="bg-teal-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-teal-600 rounded-lg p-2">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-slate-600">Selected Service</span>
                </div>
                <p className="text-lg text-slate-800 font-semibold">{getServiceName()}</p>
              </div>

              {/* Branch Location */}
              <div className="bg-orange-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-600 rounded-lg p-2">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-slate-600">Branch Location</span>
                </div>
                <p className="text-lg text-slate-800 font-semibold">
                  {(activeTicket as any).branch?.name || 'Main Branch'}
                </p>
              </div>
            </div>

            {/* People Behind in Queue */}
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-lg p-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">People Behind You</p>
                    <p className="text-3xl text-green-600 font-bold">{peopleBehind}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Queue Position</p>
                  <p className="text-2xl text-blue-600 font-bold">#{activeTicket.position}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Ticket Actions */}
        {activeTicket ? (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl text-slate-800 mb-1">Ticket Actions</h2>
                <p className="text-sm text-slate-600">Manage your queue ticket</p>
              </div>
              <div className="flex gap-4">
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

            {/* Ticket Generation Time */}
            <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Ticket Generated At</p>
                  <p className="text-lg text-blue-600 font-bold">
                    {new Date(activeTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {activeTicket.counter_id && (
              <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">Assigned Counter</p>
                    <p className="text-2xl text-green-600 font-bold">Counter {activeTicket.counter_id}</p>
                  </div>
                </div>
              </div>
            )}
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
