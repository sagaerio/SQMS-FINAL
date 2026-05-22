import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Ticket,
  Bell,
  MapPin,
  Calendar,
  BarChart3,
  ArrowRight,
  Settings,
  Users,
  Clock,
  CheckCircle,
  QrCode,
  Smartphone,
  Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceSelection } from '../components/ServiceSelection';
import type { Service } from '../components/ServiceSelection';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { industry } = useIndustry();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Load saved service if exists (but don't show selection modal on login)
    if (user.role === 'customer') {
      const savedService = localStorage.getItem('sqms_selected_service');
      if (savedService) {
        setSelectedService(JSON.parse(savedService));
      }
    }
  }, [user, loading, navigate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    localStorage.setItem('sqms_selected_service', JSON.stringify(service));
    setShowServiceSelection(false);
  };

  const menuItems = [
    {
      id: 'admin-panel',
      title: 'Admin Panel',
      description: 'Manage services, branches, and queue rules',
      icon: Settings,
      path: '/admin',
      color: 'from-purple-500 to-purple-600',
      stats: 'Full control',
      roles: ['admin']
    },
    {
      id: 'staff-counter',
      title: 'My Counter',
      description: 'Manage your assigned counter and serve customers',
      icon: Users,
      path: '/staff',
      color: 'from-orange-500 to-orange-600',
      stats: 'Active counter',
      roles: ['staff']
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Overview of your queue management system',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'from-blue-500 to-blue-600',
      stats: 'Real-time insights',
      roles: ['admin', 'staff', 'customer']
    },
    {
      id: 'queue-status',
      title: 'Queue Status',
      description: 'Monitor real-time queue status and notifications',
      icon: Bell,
      path: '/status',
      color: 'from-green-500 to-green-600',
      stats: 'Live updates',
      roles: ['admin', 'staff', 'customer']
    },
    {
      id: 'multi-branch',
      title: 'Multi-Branch',
      description: 'Manage multiple locations and branches',
      icon: MapPin,
      path: '/branches',
      color: 'from-blue-500 to-blue-600',
      stats: 'All locations',
      roles: ['admin', 'customer']
    },
    {
      id: 'appointments',
      title: 'Appointments',
      description: 'Schedule and manage customer appointments',
      icon: Calendar,
      path: '/appointments',
      color: 'from-teal-500 to-teal-600',
      stats: 'Book services',
      roles: ['admin', 'staff', 'customer']
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View reports and performance metrics',
      icon: BarChart3,
      path: '/analytics',
      color: 'from-blue-600 to-teal-600',
      stats: 'Data insights',
      roles: ['admin']
    }
  ];

  // Customer-specific features
  const customerFeatures = [
    {
      id: 'skip-wait',
      title: 'Skip the Wait',
      description: 'Join virtual queues from anywhere and get real-time updates on your position',
      icon: Clock,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'easy-booking',
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments at your convenience without calling or visiting in person',
      icon: Calendar,
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'qr-access',
      title: 'QR Code Access',
      description: 'Simply scan a QR code at the location to join the queue instantly',
      icon: QrCode,
      color: 'from-blue-600 to-teal-600'
    },
    {
      id: 'notifications',
      title: 'Live Notifications',
      description: 'Get notified when it\'s your turn so you can use your time productively',
      icon: Bell,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'multi-branch',
      title: 'Multiple Locations',
      description: 'Access services across all branches and choose the most convenient one',
      icon: MapPin,
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 'track-status',
      title: 'Track Your Status',
      description: 'Monitor your queue position and estimated wait time in real-time',
      icon: CheckCircle,
      color: 'from-teal-600 to-blue-600'
    }
  ];

  const IndustryIcon = industry?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-slate-800 mb-3">
            {user?.role === 'customer' ? `Welcome, ${user?.full_name}` : 'Dashboard'}
          </h1>
          <p className="text-xl text-slate-600">
            {user?.role === 'customer'
              ? 'Your time is valuable. We help you skip the wait.'
              : 'Smart Queue Management System'}
          </p>
        </div>

        {/* Customer Features or Menu Grid */}
        {user?.role === 'customer' ? (
          <>
            {/* Customer Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Ticket className="w-10 h-10 mb-4" />
                <h3 className="text-xl mb-2">Join Virtual Queue</h3>
                <p className="text-white/90 text-sm">Get your ticket now</p>
              </button>

              <button
                onClick={() => navigate('/appointments')}
                className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Calendar className="w-10 h-10 mb-4" />
                <h3 className="text-xl mb-2">Book Appointment</h3>
                <p className="text-white/90 text-sm">Schedule a service</p>
              </button>

              <button
                onClick={() => navigate('/status')}
                className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Bell className="w-10 h-10 mb-4" />
                <h3 className="text-xl mb-2">Queue Status</h3>
                <p className="text-white/90 text-sm">Check your position</p>
              </button>
            </div>

            {/* Why SQMS Section */}
            <div className="mb-8">
              <h2 className="text-3xl text-slate-800 mb-6">Why Use SQMS?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customerFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
                    >
                      <div className={`bg-gradient-to-r ${feature.color} rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-xl text-slate-800 mb-2">
                        {feature.title}
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.filter(item => {
              if (!item.roles) return true;
              return user?.role && item.roles.includes(user.role);
            }).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group"
                >
                  <div className={`bg-gradient-to-r ${item.color} rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{item.stats}</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl mb-3">Need Help?</h3>
          <p className="text-white/90 mb-6">
            Our support team is here to assist you with any questions
          </p>
          <button
            onClick={() => navigate('/support')}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-blue-50 transition-all"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Service Selection Modal */}
      {showServiceSelection && industry && (
        <ServiceSelection
          industryId={industry.id}
          onSelect={handleServiceSelect}
          onClose={() => setShowServiceSelection(false)}
          showClose={!!selectedService}
        />
      )}
    </div>
  );
}