import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Shield } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';

interface ChatMessage {
  id: string;
  from: string;
  message: string;
  time: string;
  isStaff: boolean;
}

export function Chat() {
  const { industry } = useIndustry();
  const [userRole, setUserRole] = useState('staff');
  const [userName, setUserName] = useState('');
  const [userIndustry, setUserIndustry] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'staff';
    const name = localStorage.getItem('sqms_user_name') || 'User';
    const staffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    const adminIndustry = localStorage.getItem('sqms_admin_industry') || '';

    setUserRole(role);
    setUserName(name);
    setUserIndustry(role === 'admin' ? adminIndustry : staffIndustry);

    // Load chat messages from localStorage (filtered by industry)
    const chatKey = `sqms_chat_${role === 'admin' ? adminIndustry : staffIndustry}`;
    const storedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    setChatMessages(storedMessages);

    // Listen for new messages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === chatKey && e.newValue) {
        setChatMessages(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: String(Date.now()),
      from: userName,
      message: chatMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isStaff: userRole === 'staff'
    };

    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);

    // Save to industry-specific chat
    const chatKey = `sqms_chat_${userIndustry}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setChatMessage('');
  };

  const IndustryIcon = industry?.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-slate-800 mb-2">Internal Chat</h1>
        <p className="text-slate-600">
          {userRole === 'admin' ? 'Communicate with your staff members' : 'Message your Manager/Admin for assistance'}
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

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col h-[calc(100%-120px)]">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {userRole === 'admin' ? 'Team Chat' : 'Manager/Admin'}
              </h2>
              <p className="text-sm text-white/80">{industry?.name || 'Department'} Management</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl text-slate-800 mb-2">No Messages Yet</h3>
              <p className="text-slate-600">Start a conversation with your manager or admin</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.isStaff
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-semibold">{msg.from}</span>
                  </div>
                  <p className="mb-2">{msg.message}</p>
                  <p
                    className={`text-xs ${
                      msg.isStaff ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={userRole === 'admin' ? 'Type your message to staff...' : 'Type your message to Manager/Admin...'}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>

          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
            <p><strong>Note:</strong> {userRole === 'admin'
              ? 'Use this chat to communicate with your staff, provide support, and coordinate operations.'
              : 'Use this chat to request help, report issues, or communicate with your department manager.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
