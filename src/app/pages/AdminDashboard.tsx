import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Briefcase,
  Clock,
  Users,
  Save,
  X,
  MapPin,
  Bell,
  Calendar,
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Activity,
  MessageCircle,
  HelpCircle,
  PhoneCall,
  FileText
} from 'lucide-react';
import { industries } from '../components/IndustrySelector';
import { services as defaultServices, branches as defaultBranches } from '../data/businessTypes';

interface Service {
  id: string;
  name: string;
  description: string;
  avgWaitPerPerson: number;
  icon: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  countersOpen: number;
}

interface QueueRule {
  id: string;
  name: string;
  value: string;
  description: string;
}

// Helper function to convert estimated time to minutes
const getAvgWaitTime = (estimatedTime: string): number => {
  const match = estimatedTime.match(/(\d+)-?(\d+)?/);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return Math.ceil((min + max) / 2);
  }
  return 15; // default
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState('admin');
  const [activeSection, setActiveSection] = useState<'main' | 'admin-panel' | 'queue-status' | 'appointments' | 'analytics' | 'support'>('main');
  const [activeTab, setActiveTab] = useState<'services' | 'branches' | 'rules' | 'industry'>('services');
  const [businessType, setBusinessType] = useState('');
  const [queueStatusBusinessType, setQueueStatusBusinessType] = useState('');
  const [appointmentsBusinessType, setAppointmentsBusinessType] = useState('');
  const [analyticsBusinessType, setAnalyticsBusinessType] = useState('');
  const [supportBusinessType, setSupportBusinessType] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [queueRules, setQueueRules] = useState<QueueRule[]>([
    { id: '1', name: 'Max Queue Size', value: '50', description: 'Maximum customers in queue' },
    { id: '2', name: 'Average Service Time', value: '5', description: 'Minutes per customer' },
    { id: '3', name: 'Auto Close Queue', value: '40', description: 'Close when reaching this number' },
  ]);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingRule, setEditingRule] = useState<QueueRule | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff-portal');
      return;
    }

    // Only allow admin and superadmin to access this page
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const role = user?.role || localStorage.getItem('sqms_user_role') || 'admin';
    setUserRole(role);
    const selectedBusinessType = localStorage.getItem('sqms_business_type') || 'bank';
    setBusinessType(selectedBusinessType);
    loadServicesAndBranches(selectedBusinessType);
  }, [user]);

  const loadServicesAndBranches = (type: string) => {
    // Load services for the selected business type
    const typeServices = defaultServices
      .filter(s => s.businessType === type)
      .map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        avgWaitPerPerson: getAvgWaitTime(s.estimatedTime)
      }));
    setServices(typeServices);

    // Load branches for the selected business type
    const typeBranches = defaultBranches
      .filter(b => b.businessType === type)
      .map(b => ({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        hours: b.hours,
        countersOpen: Math.floor(Math.random() * 3) + 3 // Random 3-5 counters
      }));
    setBranches(typeBranches);
  };

  const handleBusinessTypeChange = (newType: string) => {
    localStorage.setItem('sqms_business_type', newType);
    setBusinessType(newType);
    loadServicesAndBranches(newType);
  };

  const handleQueueStatusBusinessTypeChange = (newType: string) => {
    setQueueStatusBusinessType(newType);
    loadServicesAndBranches(newType);
  };

  const handleAppointmentsBusinessTypeChange = (newType: string) => {
    setAppointmentsBusinessType(newType);
    loadServicesAndBranches(newType);
  };

  const handleAnalyticsBusinessTypeChange = (newType: string) => {
    setAnalyticsBusinessType(newType);
    loadServicesAndBranches(newType);
  };

  const currentBusinessType = industries.find(bt => bt.id === businessType);
  const currentQueueStatusBusinessType = industries.find(bt => bt.id === queueStatusBusinessType);
  const currentAppointmentsBusinessType = industries.find(bt => bt.id === appointmentsBusinessType);
  const currentAnalyticsBusinessType = industries.find(bt => bt.id === analyticsBusinessType);

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  const handleSaveService = (service: Service) => {
    if (service.id) {
      setServices(services.map(s => s.id === service.id ? service : s));
    } else {
      setServices([...services, { ...service, id: String(Date.now()) }]);
    }
    setEditingService(null);
    setShowAddService(false);
  };

  const handleSaveBranch = (branch: Branch) => {
    if (branch.id) {
      setBranches(branches.map(b => b.id === branch.id ? branch : b));
    } else {
      setBranches([...branches, { ...branch, id: String(Date.now()) }]);
    }
    setEditingBranch(null);
    setShowAddBranch(false);
  };

  const handleSaveRule = (rule: QueueRule) => {
    setQueueRules(queueRules.map(r => r.id === rule.id ? rule : r));
    setEditingRule(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main View */}
      {activeSection === 'main' && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl text-slate-800 mb-3">
              {userRole === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-xl text-slate-600">
              {userRole === 'superadmin' ? 'Manage all businesses and analytics' : 'Manage your queue management system'}
            </p>
          </div>

          {/* Main Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Business Requests - Super Admin Only */}
            {userRole === 'superadmin' && (
              <button
                onClick={() => navigate('/business-requests')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                  Business Requests
                </h3>
                <p className="text-slate-600 mb-4">
                  Review and approve businesses requesting SQMS services
                </p>
                <div className="text-sm text-slate-500">Review • Approve • Setup</div>
              </button>
            )}

            {/* Businesses - Super Admin Only */}
            {userRole === 'superadmin' && (
              <button
                onClick={() => navigate('/businesses')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                  Businesses
                </h3>
                <p className="text-slate-600 mb-4">
                  Register and manage businesses across all industries
                </p>
                <div className="text-sm text-slate-500">Register • Manage • Overview</div>
              </button>
            )}

            {/* Employees */}
            <button
              onClick={() => navigate('/employees')}
              className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Employees
              </h3>
              <p className="text-slate-600 mb-4">
                {userRole === 'superadmin' ? 'Manage employees across all businesses' : 'Manage your staff and admins'}
              </p>
              <div className="text-sm text-slate-500">Add • Edit • Assign Roles</div>
            </button>

            {/* Admin Panel - Regular Admin Only */}
            {userRole !== 'superadmin' && (
              <button
                onClick={() => setActiveSection('admin-panel')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                  Admin Panel
                </h3>
                <p className="text-slate-600 mb-4">
                  Manage services, branches, industry settings, and queue rules
                </p>
                <div className="text-sm text-slate-500">Services • Branches • Industry • Rules</div>
              </button>
            )}

            {/* Queue Status - Regular Admin Only */}
            {userRole !== 'superadmin' && (
              <button
                onClick={() => setActiveSection('queue-status')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-green-600 transition-colors">
                  Queue Status
                </h3>
                <p className="text-slate-600 mb-4">
                  Monitor real-time queue status and customer flow
                </p>
                <div className="text-sm text-slate-500">Live monitoring • Notifications</div>
              </button>
            )}

            {/* Appointments - Regular Admin Only */}
            {userRole !== 'superadmin' && (
              <button
                onClick={() => setActiveSection('appointments')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">
                  Appointments
                </h3>
                <p className="text-slate-600 mb-4">
                  Manage scheduled appointments and bookings
                </p>
                <div className="text-sm text-slate-500">Schedule • Manage • Overview</div>
              </button>
            )}

            {/* Analytics */}
            <button
              onClick={() => setActiveSection('analytics')}
              className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Analytics
              </h3>
              <p className="text-slate-600 mb-4">
                {userRole === 'superadmin' ? 'View analytics across all businesses' : 'View reports and performance metrics'}
              </p>
              <div className="text-sm text-slate-500">Reports • Insights • Performance</div>
            </button>

            {/* Support - Regular Admin Only */}
            {userRole !== 'superadmin' && (
              <button
                onClick={() => setActiveSection('support')}
                className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
              >
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                  Support
                </h3>
                <p className="text-slate-600 mb-4">
                  Customer support tickets and help desk management
                </p>
                <div className="text-sm text-slate-500">Tickets • FAQ • Resources</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel Section */}
      {activeSection === 'admin-panel' && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl text-slate-800 mb-2">Admin Panel</h1>
            <p className="text-slate-600">Select your industry to manage settings</p>
          </div>

          {/* Business Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl text-slate-800 mb-6">Select Your Industry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBusinessTypeChange(type.id)}
                  className={`group rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    businessType === type.id
                      ? `bg-gradient-to-r ${type.gradient} text-white shadow-xl ring-4 ring-purple-200`
                      : 'bg-white text-slate-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-400'
                  }`}
                >
                  <div className={`text-4xl mb-3 ${businessType === type.id ? '' : 'group-hover:scale-110 transition-transform'} flex justify-center`}>
                    {(() => { const Icon = type.icon; return <Icon className="w-[1em] h-[1em] mx-auto" /> })()}
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${businessType === type.id ? 'text-white' : 'text-slate-800 group-hover:text-purple-600'}`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${businessType === type.id ? 'text-white/90' : 'text-slate-600'}`}>
                    {type.description.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Details Only After Business Type is Selected */}
          {businessType && currentBusinessType && (
            <div>
              {/* Current Business Type Display */}
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {(() => { const Icon = currentBusinessType.icon; return <Icon className="w-[1em] h-[1em]" /> })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Current Industry: {currentBusinessType.name}
                    </h3>
                    <p className="text-slate-600">{currentBusinessType.description}</p>
                  </div>
                </div>
              </div>

              {/* Admin Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Services</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{services.length}</div>
                  <p className="text-sm text-slate-600">Configured services</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{branches.length}</div>
                  <p className="text-sm text-slate-600">Active locations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 rounded-lg p-3">
                      <Settings className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Queue Rules</h3>
                  </div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{queueRules.length}</div>
                  <p className="text-sm text-slate-600">Configuration rules</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'services'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Services</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('branches')}
                    className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'branches'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Branches</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rules')}
                    className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'rules'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Queue Rules</span>
                  </button>
                </div>
              </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-slate-800">Manage Services</h2>
            <button
              onClick={() => setShowAddService(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          </div>

          {/* Add/Edit Service Form */}
          {(showAddService || editingService) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
              <h3 className="text-xl text-slate-800 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveService({
                  id: editingService?.id || '',
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  icon: formData.get('icon') as string,
                  avgWaitPerPerson: Number(formData.get('avgWaitPerPerson'))
                });
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Service Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingService?.name}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Icon (Emoji)</label>
                    <input
                      type="text"
                      name="icon"
                      defaultValue={editingService?.icon}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="🏦"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Description</label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingService?.description}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Average Wait Time (minutes per person)</label>
                  <input
                    type="number"
                    name="avgWaitPerPerson"
                    defaultValue={editingService?.avgWaitPerPerson}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(null);
                      setShowAddService(false);
                    }}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Services List */}
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{service.icon}</div>
                    <div>
                      <h3 className="text-xl text-slate-800 mb-1">{service.name}</h3>
                      <p className="text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>~{service.avgWaitPerPerson} min per person</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingService(service)}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-slate-800">Manage Branches</h2>
            <button
              onClick={() => setShowAddBranch(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Branch
            </button>
          </div>

          {/* Add/Edit Branch Form */}
          {(showAddBranch || editingBranch) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
              <h3 className="text-xl text-slate-800 mb-4">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveBranch({
                  id: editingBranch?.id || '',
                  name: formData.get('name') as string,
                  address: formData.get('address') as string,
                  phone: formData.get('phone') as string,
                  hours: formData.get('hours') as string,
                  countersOpen: Number(formData.get('countersOpen'))
                });
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Branch Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingBranch?.name}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingBranch?.phone}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingBranch?.address}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Operating Hours</label>
                    <input
                      type="text"
                      name="hours"
                      defaultValue={editingBranch?.hours}
                      placeholder="9:00 AM - 6:00 PM"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">Number of Counters</label>
                    <input
                      type="number"
                      name="countersOpen"
                      defaultValue={editingBranch?.countersOpen}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Branch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBranch(null);
                      setShowAddBranch(false);
                    }}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Branches List */}
          <div className="grid md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl text-slate-800 mb-1">{branch.name}</h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{branch.address}</span>
                        </div>
                        <p>📞 {branch.phone}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{branch.hours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{branch.countersOpen} counters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBranch(branch)}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Rules Tab */}
      {activeTab === 'rules' && (
        <div>
          <h2 className="text-2xl text-slate-800 mb-6">Queue Configuration Rules</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {queueRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                {editingRule?.id === rule.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveRule({
                      ...rule,
                      value: formData.get('value') as string
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">{rule.name}</label>
                      <input
                        type="number"
                        name="value"
                        defaultValue={rule.value}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-sm text-slate-500 mt-2">{rule.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRule(null)}
                        className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-all flex items-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg text-slate-800 mb-1">{rule.name}</h3>
                      <p className="text-sm text-slate-600">{rule.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl text-blue-600">{rule.value}</div>
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
            </div>
          )}
        </div>
      )}

      {/* Queue Status Section */}
      {activeSection === 'queue-status' && (
        <div>
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl text-slate-800 mb-2">Queue Status</h1>
            <p className="text-slate-600">Select your industry to monitor queue status</p>
          </div>

          {/* Business Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl text-slate-800 mb-6">Select Your Industry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleQueueStatusBusinessTypeChange(type.id)}
                  className={`group rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    queueStatusBusinessType === type.id
                      ? `bg-gradient-to-r ${type.gradient} text-white shadow-xl ring-4 ring-green-200`
                      : 'bg-white text-slate-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-400'
                  }`}
                >
                  <div className={`text-4xl mb-3 ${queueStatusBusinessType === type.id ? '' : 'group-hover:scale-110 transition-transform'} flex justify-center`}>
                    {(() => { const Icon = type.icon; return <Icon className="w-[1em] h-[1em] mx-auto" /> })()}
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${queueStatusBusinessType === type.id ? 'text-white' : 'text-slate-800 group-hover:text-green-600'}`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${queueStatusBusinessType === type.id ? 'text-white/90' : 'text-slate-600'}`}>
                    {type.description.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Queue Details Only After Business Type is Selected */}
          {queueStatusBusinessType && currentQueueStatusBusinessType && (
            <div>
              {/* Current Business Type Display */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{currentQueueStatusBusinessType.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Monitoring: {currentQueueStatusBusinessType.name}
                    </h3>
                    <p className="text-slate-600">{currentQueueStatusBusinessType.description}</p>
                  </div>
                </div>
              </div>

              {/* Queue Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Services</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{services.length}</div>
                  <p className="text-sm text-slate-600">Configured services</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{branches.length}</div>
                  <p className="text-sm text-slate-600">Active locations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 rounded-lg p-3">
                      <Settings className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Queue Rules</h3>
                  </div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{queueRules.length}</div>
                  <p className="text-sm text-slate-600">Configuration rules</p>
                </div>
              </div>

              {/* Available Services */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Available Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{service.icon}</div>
                          <div>
                            <h3 className="text-xl text-slate-800 mb-1">{service.name}</h3>
                            <p className="text-sm text-slate-600">{service.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-4">
                        <Clock className="w-4 h-4" />
                        <span>~{service.avgWaitPerPerson} min per person</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Locations */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Branch Locations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl text-slate-800 mb-2">{branch.name}</h3>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{branch.address}</span>
                            </div>
                            <p>📞 {branch.phone}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{branch.hours}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{branch.countersOpen} counters open</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointments Section */}
      {activeSection === 'appointments' && (
        <div>
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl text-slate-800 mb-2">Appointments</h1>
            <p className="text-slate-600">Select your industry to manage appointments</p>
          </div>

          {/* Business Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl text-slate-800 mb-6">Select Your Industry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAppointmentsBusinessTypeChange(type.id)}
                  className={`group rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    appointmentsBusinessType === type.id
                      ? `bg-gradient-to-r ${type.gradient} text-white shadow-xl ring-4 ring-teal-200`
                      : 'bg-white text-slate-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-teal-400'
                  }`}
                >
                  <div className={`text-4xl mb-3 ${appointmentsBusinessType === type.id ? '' : 'group-hover:scale-110 transition-transform'} flex justify-center`}>
                    {(() => { const Icon = type.icon; return <Icon className="w-[1em] h-[1em] mx-auto" /> })()}
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${appointmentsBusinessType === type.id ? 'text-white' : 'text-slate-800 group-hover:text-teal-600'}`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${appointmentsBusinessType === type.id ? 'text-white/90' : 'text-slate-600'}`}>
                    {type.description.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Appointment Details Only After Business Type is Selected */}
          {appointmentsBusinessType && currentAppointmentsBusinessType && (
            <div>
              {/* Current Business Type Display */}
              <div className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{currentAppointmentsBusinessType.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Managing Appointments: {currentAppointmentsBusinessType.name}
                    </h3>
                    <p className="text-slate-600">{currentAppointmentsBusinessType.description}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Services</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{services.length}</div>
                  <p className="text-sm text-slate-600">Configured services</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{branches.length}</div>
                  <p className="text-sm text-slate-600">Active locations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 rounded-lg p-3">
                      <Settings className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Queue Rules</h3>
                  </div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{queueRules.length}</div>
                  <p className="text-sm text-slate-600">Configuration rules</p>
                </div>
              </div>

              {/* Available Services for Appointments */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Book Appointments for These Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{service.icon}</div>
                          <div>
                            <h3 className="text-xl text-slate-800 mb-1">{service.name}</h3>
                            <p className="text-sm text-slate-600">{service.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-4">
                        <Clock className="w-4 h-4" />
                        <span>~{service.avgWaitPerPerson} min appointment</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Locations for Appointments */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Available Locations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-teal-100 rounded-lg p-3">
                          <Building2 className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl text-slate-800 mb-2">{branch.name}</h3>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{branch.address}</span>
                            </div>
                            <p>📞 {branch.phone}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{branch.hours}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <div>
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl text-slate-800 mb-2">Analytics & Reports</h1>
            <p className="text-slate-600">Select your industry to view performance metrics</p>
          </div>

          {/* Business Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl text-slate-800 mb-6">Select Your Industry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAnalyticsBusinessTypeChange(type.id)}
                  className={`group rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    analyticsBusinessType === type.id
                      ? `bg-gradient-to-r ${type.gradient} text-white shadow-xl ring-4 ring-blue-200`
                      : 'bg-white text-slate-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-400'
                  }`}
                >
                  <div className={`text-4xl mb-3 ${analyticsBusinessType === type.id ? '' : 'group-hover:scale-110 transition-transform'} flex justify-center`}>
                    {(() => { const Icon = type.icon; return <Icon className="w-[1em] h-[1em] mx-auto" /> })()}
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${analyticsBusinessType === type.id ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${analyticsBusinessType === type.id ? 'text-white/90' : 'text-slate-600'}`}>
                    {type.description.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Analytics Details Only After Business Type is Selected */}
          {analyticsBusinessType && currentAnalyticsBusinessType && (
            <div>
              {/* Current Business Type Display */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{currentAnalyticsBusinessType.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Analytics: {currentAnalyticsBusinessType.name}
                    </h3>
                    <p className="text-slate-600">{currentAnalyticsBusinessType.description}</p>
                  </div>
                </div>
              </div>

              {/* Analytics Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Services</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{services.length}</div>
                  <p className="text-sm text-slate-600">Configured services</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{branches.length}</div>
                  <p className="text-sm text-slate-600">Active locations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 rounded-lg p-3">
                      <Settings className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Queue Rules</h3>
                  </div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{queueRules.length}</div>
                  <p className="text-sm text-slate-600">Configuration rules</p>
                </div>
              </div>

              {/* Service Performance Analytics */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Service Performance</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{service.icon}</div>
                          <div>
                            <h3 className="text-xl text-slate-800 mb-1">{service.name}</h3>
                            <p className="text-sm text-slate-600">{service.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Avg Wait:</span>
                          <span className="font-semibold text-slate-800">{service.avgWaitPerPerson} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Today's Served:</span>
                          <span className="font-semibold text-slate-800">{Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Efficiency:</span>
                          <span className="font-semibold text-green-600">{Math.floor(Math.random() * 15) + 85}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Performance Analytics */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Branch Performance</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl text-slate-800 mb-2">{branch.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Customers Today:</span>
                              <span className="font-semibold text-slate-800">{Math.floor(Math.random() * 100) + 50}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Counters Open:</span>
                              <span className="font-semibold text-slate-800">{branch.countersOpen}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Avg Wait Time:</span>
                              <span className="font-semibold text-orange-600">{Math.floor(Math.random() * 10) + 5}m</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Satisfaction:</span>
                              <span className="font-semibold text-green-600">{(Math.random() * 0.5 + 4.5).toFixed(1)}★</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Support Section */}
      {activeSection === 'support' && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl text-slate-800 mb-2">Support & Help Desk</h1>
            <p className="text-slate-600">Manage customer support tickets and resources</p>
          </div>

          {/* Industry Selection */}
          {!supportBusinessType ? (
            <div>
              <h2 className="text-2xl text-slate-800 mb-6">Select Industry</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {industries.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSupportBusinessType(type.id)}
                    className="bg-white rounded-3xl shadow-xl p-8 border-2 border-slate-200 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 text-left group"
                  >
                    <div className="text-5xl mb-4 flex justify-center">
                      {(() => { const Icon = type.icon; return <Icon className="w-[1em] h-[1em]" /> })()}
                    </div>
                    <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-slate-600 text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Industry Header with Change Button */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {industries.find((t) => t.id === supportBusinessType) && (() => {
                    const Icon = industries.find((t) => t.id === supportBusinessType)!.icon;
                    return <Icon className="w-12 h-12 text-slate-700" />;
                  })()}
                  <div>
                    <h2 className="text-3xl text-slate-800">
                      {industries.find((t) => t.id === supportBusinessType)?.name} Support
                    </h2>
                    <p className="text-slate-600">Customer support and help resources</p>
                  </div>
                </div>
                <button
                  onClick={() => setSupportBusinessType('')}
                  className="px-6 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-semibold"
                >
                  Back to Selection
                </button>
              </div>

              {/* Support Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Services</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{services.length}</div>
                  <p className="text-sm text-slate-600">Configured services</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{branches.length}</div>
                  <p className="text-sm text-slate-600">Active locations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 rounded-lg p-3">
                      <Settings className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Queue Rules</h3>
                  </div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{queueRules.length}</div>
                  <p className="text-sm text-slate-600">Configuration rules</p>
                </div>
              </div>

              {/* Support Tickets */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Recent Support Tickets</h2>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Ticket ID</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Customer</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Issue</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Priority</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Status</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Assigned To</th>
                          <th className="text-left py-4 px-6 text-sm text-slate-600">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {[
                          { id: '#T-1024', customer: 'John Doe', issue: 'Account access issue', priority: 'High', status: 'Open', assignedTo: 'Sarah Johnson', time: '5 min ago' },
                          { id: '#T-1023', customer: 'Jane Smith', issue: 'Payment not processed', priority: 'Critical', status: 'In Progress', assignedTo: 'Michael Chen', time: '15 min ago' },
                          { id: '#T-1022', customer: 'Robert Brown', issue: 'Service inquiry', priority: 'Medium', status: 'Open', assignedTo: 'Emily Davis', time: '22 min ago' },
                          { id: '#T-1021', customer: 'Emily Wilson', issue: 'Appointment rescheduling', priority: 'Low', status: 'Resolved', assignedTo: 'James Wilson', time: '1 hour ago' },
                          { id: '#T-1020', customer: 'David Martinez', issue: 'Technical support needed', priority: 'High', status: 'In Progress', assignedTo: 'Lisa Anderson', time: '2 hours ago' }
                        ].map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-semibold text-slate-800">{ticket.id}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-700">{ticket.customer}</td>
                            <td className="py-4 px-6 text-slate-700">{ticket.issue}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-700">{ticket.assignedTo}</td>
                            <td className="py-4 px-6 text-slate-600 text-sm">{ticket.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* FAQ & Resources */}
              <div className="mb-8">
                <h2 className="text-2xl text-slate-800 mb-6">Help Resources</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                      <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl text-slate-800 mb-2">FAQ Database</h3>
                    <p className="text-slate-600 mb-4">Common questions and answers for quick resolution</p>
                    <div className="text-sm text-slate-500">
                      {Math.floor(Math.random() * 50) + 100} articles available
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="bg-green-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                      <PhoneCall className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl text-slate-800 mb-2">Contact Support</h3>
                    <p className="text-slate-600 mb-4">Direct line to technical support team</p>
                    <div className="text-sm text-slate-500">Available 24/7</div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl text-slate-800 mb-2">Service Status</h3>
                    <p className="text-slate-600 mb-4">Real-time system status and updates</p>
                    <div className="text-sm text-green-600 font-semibold">All systems operational</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
