import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Building2, CheckCircle, Plus, X, ArrowLeft, Hash, Check, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { QueueStatusBar } from '../components/QueueStatusBar';
import { DatePicker } from '../components/DatePicker';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { industryServices, industryBranches } from '../data/industryServices';
import {
  createAppointment,
  getCustomerAppointments,
  updateAppointmentStatus,
  cancelAppointment as cancelSupabaseAppointment,
  getServicesByIndustry
} from '../../services/queueService';
import type { Appointment as SupabaseAppointment, Service } from '../../lib/supabase';

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  branch: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  customerName: string;
  ticketNumber?: string;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

export function Appointments() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { industry } = useIndustry();
  const [appointments, setAppointments] = useState<SupabaseAppointment[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedServiceForView, setSelectedServiceForView] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<SupabaseAppointment | null>(null);
  const [formData, setFormData] = useState({
    customerName: user?.full_name || '',
    service: '',
    branch: '',
    date: '',
    time: '',
    notes: ''
  });

  // Update customer name when user loads
  useEffect(() => {
    if (user && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: user.full_name }));
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load services from Supabase
  useEffect(() => {
    if (!industry) return;

    const loadServices = async () => {
      const { data } = await getServicesByIndustry(industry.id);
      if (data) {
        setServices(data);
      }
    };

    loadServices();

    // Still use mock branches for now
    const industryKey = industry.id as keyof typeof industryBranches;
    const branchesData = industryBranches[industryKey] || industryBranches.banking;
    setBranches(branchesData);
  }, [industry]);

  // Load appointments from Supabase
  useEffect(() => {
    if (!user) return;

    const loadAppointments = async () => {
      setLoading(true);

      // For staff and admin, show all appointments for their industry
      if (user.role === 'staff' || user.role === 'admin' || user.role === 'superadmin') {
        // Load all appointments for the industry
        const industryKey = industry?.id as keyof typeof industryServices;
        const servicesForIndustry = services.length > 0 ? services : (industryServices[industryKey] || []);

        // Generate demo appointments - ONE per service (not repeated 3 times)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const allIndustryAppointments: SupabaseAppointment[] = servicesForIndustry.map((service, idx) => ({
          id: `staff-view-${idx}`,
          customer_id: `customer-${idx}`,
          industry_id: industry?.id || 'banking',
          service_id: typeof service === 'string' ? service : service.id,
          appointment_date: tomorrowStr,
          appointment_time: ['09:00', '10:00', '11:00', '14:00', '15:00'][idx % 5],
          status: ['scheduled', 'confirmed', 'completed'][idx % 3] as any,
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer: {
            full_name: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Emily Brown'][idx % 5],
            email: `customer${idx}@email.com`
          }
        } as any));

        setAppointments(allIndustryAppointments);
        setLoading(false);
        return;
      }

      // For customers, show only their appointments
      const { data, error } = await getCustomerAppointments(user.id);

      if (data) {
        // Add demo appointments to show slot blocking functionality
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

        // Create demo booked appointments for demonstration
        const demoAppointments: SupabaseAppointment[] = [
          {
            id: 'demo-1',
            customer_id: 'demo-customer-1',
            industry_id: industry?.id || 'banking',
            service_id: services[0]?.id || 'service-1',
            appointment_date: tomorrowStr,
            appointment_time: '09:00',
            status: 'scheduled',
            notes: 'Demo appointment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any,
          {
            id: 'demo-2',
            customer_id: 'demo-customer-2',
            industry_id: industry?.id || 'banking',
            service_id: services[0]?.id || 'service-1',
            appointment_date: tomorrowStr,
            appointment_time: '10:00',
            status: 'confirmed',
            notes: 'Demo appointment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any,
          {
            id: 'demo-3',
            customer_id: 'demo-customer-3',
            industry_id: industry?.id || 'banking',
            service_id: services[1]?.id || 'service-2',
            appointment_date: dayAfterTomorrowStr,
            appointment_time: '14:00',
            status: 'scheduled',
            notes: 'Demo appointment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any,
          {
            id: 'demo-4',
            customer_id: 'demo-customer-4',
            industry_id: industry?.id || 'banking',
            service_id: services[0]?.id || 'service-1',
            appointment_date: dayAfterTomorrowStr,
            appointment_time: '15:00',
            status: 'confirmed',
            notes: 'Demo appointment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any
        ];

        // Combine user appointments with demo appointments
        setAppointments([...data, ...demoAppointments]);
      }
      setLoading(false);
    };

    loadAppointments();
  }, [user, services, industry]);

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !industry) return;

    setSubmitting(true);

    const selectedService = services.find(s => s.name === formData.service);
    if (!selectedService) {
      alert('Please select a valid service');
      setSubmitting(false);
      return;
    }

    const { data, error } = await createAppointment(
      user.id,
      industry.id,
      selectedService.id,
      formData.date,
      formData.time,
      formData.notes
    );

    if (error) {
      alert('Failed to book appointment. Please try again.');
      setSubmitting(false);
      return;
    }

    // Reload appointments
    const result = await getCustomerAppointments(user.id);
    if (result.data) {
      setAppointments(result.data);
    }

    setShowBooking(false);
    setSubmitting(false);
    setFormData({
      customerName: '',
      service: '',
      branch: '',
      date: '',
      time: '',
      notes: ''
    });

    alert('Appointment booked successfully!');
  };

  const confirmAppointment = async (id: string) => {
    const { error } = await updateAppointmentStatus(id, 'confirmed');
    if (error) {
      alert('Failed to confirm appointment');
      return;
    }

    // Reload appointments
    if (user) {
      const result = await getCustomerAppointments(user.id);
      if (result.data) {
        setAppointments(result.data);
      }
    }
  };

  const markAsServed = async (id: string) => {
    const { error } = await updateAppointmentStatus(id, 'completed');
    if (error) {
      alert('Failed to mark as served');
      return;
    }

    // Reload appointments
    if (user) {
      const result = await getCustomerAppointments(user.id);
      if (result.data) {
        setAppointments(result.data);
      }
    }
  };

  const cancelAppointment = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) return;

    const { error } = await cancelSupabaseAppointment(id);
    if (error) {
      alert('Failed to cancel appointment');
      return;
    }

    // Reload appointments
    if (user) {
      const result = await getCustomerAppointments(user.id);
      if (result.data) {
        setAppointments(result.data);
      }
    }

    alert('Appointment cancelled successfully');
  };

  const handleReschedule = (appointment: SupabaseAppointment) => {
    setRescheduleAppointment(appointment);
    const service = services.find(s => s.id === appointment.service_id);
    setFormData({
      customerName: user?.full_name || '',
      service: service?.name || '',
      branch: '',
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      notes: appointment.notes || ''
    });
    setShowBooking(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppointment) return;

    // For now, cancel old and create new
    await cancelSupabaseAppointment(rescheduleAppointment.id);
    await handleBookAppointment(e);

    setRescheduleAppointment(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isFutureAppointment = (dateString: string, timeString: string) => {
    const appointmentDate = new Date(`${dateString} ${timeString}`);
    return appointmentDate > new Date();
  };

  const filteredAppointments = isCustomer
    ? appointments.filter(apt => isFutureAppointment(apt.appointment_date, apt.appointment_time))
    : appointments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const IndustryIcon = industry?.icon;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-slate-800 mb-2">
            {isStaffOrAdmin ? 'Customer Appointments' : 'My Appointments'}
          </h1>
          <p className="text-slate-600">
            {isStaffOrAdmin
              ? 'View and manage customer appointments by service'
              : 'View your upcoming appointments'}
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
        {isCustomer && (
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Book Appointment
          </button>
        )}
        {isStaffOrAdmin && (
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Book Appointment for Customer
          </button>
        )}
      </div>

      {/* For Staff/Admin: Show Services Grid to View Appointments */}
      {isStaffOrAdmin && !selectedServiceForView && (
        <div className="mb-8">
          <h2 className="text-2xl text-slate-800 mb-6">Select Service to View Appointments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-teal-500 to-teal-600',
                'from-orange-500 to-orange-600',
                'from-green-500 to-green-600',
                'from-pink-500 to-pink-600'
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedServiceForView(service.id)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200 text-left"
                >
                  <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl text-slate-800 mb-2">{service.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">{service.description || 'Service available'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {service.estimated_time} min
                      </div>
                      <span className="text-blue-600 text-sm font-medium">
                        {appointments.filter(apt => apt.service_id === service.id).length} appointments
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Staff/Admin: Show Appointments for Selected Service */}
      {isStaffOrAdmin && selectedServiceForView && (
        <div>
          <button
            onClick={() => setSelectedServiceForView(null)}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Services
          </button>
          <h2 className="text-2xl text-slate-800 mb-6">
            Appointments for {services.find(s => s.id === selectedServiceForView)?.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments
              .filter(apt => apt.service_id === selectedServiceForView)
              .map((appointment, index) => {
                const service = services.find(s => s.id === appointment.service_id);
                const customerName = (appointment as any).customer?.full_name || 'Customer';
                // Generate ticket number if not exists
                const ticketNumber = `APT-${service?.name.substring(0, 3).toUpperCase() || 'GEN'}-${String(index + 1).padStart(4, '0')}`;
                return (
                  <div key={appointment.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`px-3 py-1 rounded-full border-2 text-sm ${getStatusColor(appointment.status)} bg-white`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </div>
                      </div>
                      {/* Ticket Number Display */}
                      <div className="flex items-center gap-2 mb-2 bg-white/20 rounded-lg px-3 py-2">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm font-mono">{ticketNumber}</span>
                      </div>
                      <h3 className="text-xl mb-1">{customerName}</h3>
                      <p className="text-white/80 text-sm">{service?.name}</p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 rounded-lg p-2">
                          <CalendarIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Date</div>
                          <div className="text-sm text-slate-800">{formatDate(appointment.appointment_date)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 rounded-lg p-2">
                          <Clock className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Time</div>
                          <div className="text-sm text-slate-800">{formatTime(appointment.appointment_time)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 rounded-lg p-2">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Customer Email</div>
                          <div className="text-sm text-slate-800">{(appointment as any).customer?.email || 'N/A'}</div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Notes</div>
                          <div className="text-sm text-slate-700">{appointment.notes}</div>
                        </div>
                      )}

                      {/* Action Buttons for Staff/Admin */}
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => confirmAppointment(appointment.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Confirm
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => markAsServed(appointment.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                          >
                            <UserCheck className="w-4 h-4" />
                            Mark as Served
                          </button>
                        )}
                        {(appointment.status === 'upcoming' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {showBooking && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-2xl text-slate-800 mb-6">
            {rescheduleAppointment ? 'Reschedule Appointment' : 'Book Your Appointment'}
          </h2>
          <form onSubmit={rescheduleAppointment ? handleRescheduleSubmit : handleBookAppointment} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Selected Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.name}>{service.name} - {service.estimated_time} min</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                    readOnly
                  />
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Branch Location</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <DatePicker
                  label="Appointment Date"
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  minDate={new Date().toISOString().split('T')[0]}
                  placeholder="Select appointment date"
                  icon={<CalendarIcon className="w-5 h-5 text-slate-400" />}
                />
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Select Time Slot</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {timeSlots.map(slot => {
                  // Check if this slot is already booked for the selected date and service
                  const isBooked = formData.date && formData.service && appointments.some(apt =>
                    apt.appointment_date === formData.date &&
                    apt.appointment_time === slot &&
                    services.find(s => s.id === apt.service_id)?.name === formData.service &&
                    apt.status !== 'cancelled' &&
                    apt.status !== 'completed'
                  );

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => !isBooked && setFormData({ ...formData, time: slot })}
                      disabled={isBooked}
                      className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                        isBooked
                          ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : formData.time === slot
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                      {isBooked && <span className="block text-xs">Booked</span>}
                    </button>
                  );
                })}
              </div>
              {formData.date && formData.service && (
                <p className="text-xs text-slate-500 mt-2">
                  Grey slots are already booked. Please select an available time.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowBooking(false);
                  setRescheduleAppointment(null);
                  setFormData({
                    customerName: '',
                    service: '',
                    branch: '',
                    date: '',
                    time: ''
                  });
                }}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                {rescheduleAppointment ? 'Confirm Reschedule' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List - Only show for customers */}
      {isCustomer && !showBooking && !selectedServiceForView && (
        <div>
          <h2 className="text-2xl text-slate-800 mb-6">Your Upcoming Appointments</h2>
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl text-slate-800 mb-2">No Upcoming Appointments</h3>
              <p className="text-slate-600 mb-6">You don't have any appointments scheduled</p>
              <button
                onClick={() => setShowBooking(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`px-3 py-1 rounded-full border-2 text-sm ${getStatusColor(appointment.status)} bg-white`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                    </div>
                    <h3 className="text-xl mb-1">{appointment.customerName}</h3>
                    <p className="text-white/80 text-sm">{appointment.service}</p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 rounded-lg p-2">
                        <CalendarIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="text-sm text-slate-800">{formatDate(appointment.date)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 rounded-lg p-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Time</div>
                        <div className="text-sm text-slate-800">{appointment.time}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 rounded-lg p-2">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Location</div>
                        <div className="text-sm text-slate-800">{appointment.branch}</div>
                      </div>
                    </div>

                    {appointment.status === 'upcoming' && (
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="flex-1 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReschedule(appointment)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                        >
                          Reschedule
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}