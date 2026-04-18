import { useState, useEffect } from 'react';
import { Send, MessageCircle, CheckCircle, Clock, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useIndustry } from '../contexts/IndustryContext';
import { industrySupportTopics } from '../data/industryServices';

interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  industry?: string;
}

export function Support() {
  const { industry } = useIndustry();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('customer');
  const [userEmail, setUserEmail] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [supportTopics, setSupportTopics] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  // Set industry-specific support topics
  useEffect(() => {
    if (!industry) return;

    const industryKey = industry.id as keyof typeof industrySupportTopics;
    const topics = industrySupportTopics[industryKey] || industrySupportTopics.banking;
    setSupportTopics(topics);
  }, [industry]);

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'customer';
    const email = localStorage.getItem('sqms_user_email') || '';
    const staffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    setUserRole(role);
    setUserEmail(email);

    // Load tickets from localStorage
    const storedTickets = JSON.parse(localStorage.getItem('sqms_support_tickets') || '[]');

    if (role === 'staff' && staffIndustry) {
      // Filter tickets by staff's industry
      const filteredTickets = storedTickets.filter((ticket: any) => ticket.industry === staffIndustry);
      setTickets(filteredTickets);
    } else {
      setTickets(storedTickets);
    }
  }, []);

  const isCustomer = userRole === 'customer';

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();

    const userName = localStorage.getItem('sqms_user_name') || 'Customer';
    const userIndustry = localStorage.getItem('sqms_staff_industry') || localStorage.getItem('sqms_industry') || 'banking';

    const newTicket: SupportTicket = {
      id: String(Date.now()),
      customerName: userName,
      customerEmail: userEmail,
      subject: formData.subject,
      message: formData.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      industry: userIndustry
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updatedTickets));

    alert('Support ticket submitted successfully! You will receive a response soon.');
    setFormData({ subject: '', message: '' });
    setShowNewTicket(false);
  };

  const handleReplyTicket = (ticketId: string) => {
    if (!replyText.trim()) return;

    const staffName = localStorage.getItem('sqms_user_name') || 'Support Staff';

    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: 'replied' as const,
            reply: replyText,
            repliedAt: new Date().toISOString(),
            repliedBy: staffName
          }
        : ticket
    );

    setTickets(updatedTickets);
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updatedTickets));
    setReplyText('');
    setSelectedTicket(null);
    alert('Reply sent successfully!');
  };

  const handleResolveTicket = (ticketId: string) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'resolved' as const }
        : ticket
    );

    setTickets(updatedTickets);
    localStorage.setItem('sqms_support_tickets', JSON.stringify(updatedTickets));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'replied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const userTickets = isCustomer
    ? tickets.filter(t => t.customerEmail === userEmail)
    : tickets;

  const IndustryIcon = industry?.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-800 mb-2">
            {isCustomer ? 'Contact Support' : 'Support Tickets'}
          </h1>
          <p className="text-slate-600">
            {isCustomer
              ? 'Get help from our support team'
              : 'View and respond to customer support requests'}
          </p>
          {industry && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className={`bg-gradient-to-r ${industry.color} rounded p-1.5`}>
                {IndustryIcon && <IndustryIcon className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-slate-700">{industry.name}</span>
            </div>
          )}
        </div>
        {isCustomer && !showNewTicket && !selectedTicket && (
          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            New Ticket
          </button>
        )}
      </div>

      {/* New Ticket Form (Customers Only) */}
      {isCustomer && showNewTicket && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-slate-800">Submit Support Ticket</h2>
            <button
              onClick={() => setShowNewTicket(false)}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-6">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Topic Category</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a topic</option>
                {supportTopics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-2 block">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your issue in detail..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewTicket(false)}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket Details View */}
      {selectedTicket && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <button
            onClick={() => setSelectedTicket(null)}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tickets
          </button>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-slate-800">{selectedTicket.subject}</h2>
              <div className={`px-4 py-2 rounded-full border-2 text-sm ${getStatusColor(selectedTicket.status)}`}>
                {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{selectedTicket.customerName} ({selectedTicket.customerEmail})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{formatDate(selectedTicket.createdAt)}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 mb-1">Customer Message:</p>
              <p className="text-slate-800">{selectedTicket.message}</p>
            </div>

            {selectedTicket.reply && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-600 mb-1">
                  Response from {selectedTicket.repliedBy} - {formatDate(selectedTicket.repliedAt!)}
                </p>
                <p className="text-slate-800">{selectedTicket.reply}</p>
              </div>
            )}
          </div>

          {!isCustomer && selectedTicket.status !== 'resolved' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  {selectedTicket.status === 'replied' ? 'Add Another Reply' : 'Reply to Customer'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReplyTicket(selectedTicket.id)}
                  disabled={!replyText.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Reply
                </button>
                <button
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tickets List */}
      {!showNewTicket && !selectedTicket && (
        <div>
          <h2 className="text-2xl text-slate-800 mb-6">
            {isCustomer ? 'Your Support Tickets' : 'All Support Tickets'}
          </h2>

          {userTickets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl text-slate-800 mb-2">No Support Tickets</h3>
              <p className="text-slate-600 mb-6">
                {isCustomer
                  ? "You haven't submitted any support tickets yet"
                  : 'No customer support requests at this time'}
              </p>
              {isCustomer && (
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Submit Your First Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full border-2 text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </div>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>

                  <h3 className="text-lg text-slate-800 mb-2 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{ticket.message}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.customerName}
                    </span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>

                  {ticket.reply && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-blue-600 mb-1">Reply received</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{ticket.reply}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
