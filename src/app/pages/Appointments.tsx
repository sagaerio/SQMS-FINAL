import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Building2, CheckCircle, Plus, X, ArrowLeft, Hash, Check, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { QueueStatusBar } from '../components/QueueStatusBar';
import { useIndustry } from '../contexts/IndustryContext';
import { industryServices, industryBranches } from '../data/industryServices';

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  branch: string;
  status: 'upcoming' | 'confirmed' | 'served' | 'cancelled';
  customerName: string;
  ticketNumber?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '2026-03-20',
    time: '10:00 AM',
    service: 'Account Opening',
    branch: 'New York - Manhattan',
    status: 'upcoming',
    customerName: 'John Doe'
  },
  {
    id: '2',
    date: '2026-03-22',
    time: '2:30 PM',
    service: 'Loan Services',
    branch: 'Los Angeles - Downtown',
    status: 'upcoming',
    customerName: 'Jane Smith'
  },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

export function Appointments() {
  const { industry } = useIndustry();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showBooking, setShowBooking] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [selectedServiceForView, setSelectedServiceForView] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    service: '',
    branch: '',
    date: '',
    time: ''
  });

  // Set industry-specific services and branches
  useEffect(() => {
    if (!industry) return;

    const industryKey = industry.id as keyof typeof industryServices;
    const servicesData = industryServices[industryKey] || industryServices.banking;
    const branchesData = industryBranches[industryKey] || industryBranches.banking;

    setServices(servicesData);
    setBranches(branchesData);
  }, [industry]);

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'customer';
    const staffIndustry = localStorage.getItem('sqms_staff_industry') || '';
    setUserRole(role);

    // Load appointments and filter by industry for staff
    const storedAppointments = JSON.parse(localStorage.getItem('sqms_appointments') || '[]');

    if (role === 'staff' && staffIndustry) {
      // Filter appointments by staff's industry
      const filteredAppointments = storedAppointments.filter((apt: any) => apt.industry === staffIndustry);
      setAppointments(filteredAppointments.length > 0 ? filteredAppointments : mockAppointments);
    } else {
      setAppointments(storedAppointments.length > 0 ? storedAppointments : mockAppointments);
    }
  }, []);

  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';
  const isCustomer = userRole === 'customer';

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: String(Date.now()),
      date: formData.date,
      time: formData.time,
      service: formData.service,
      branch: formData.branch,
      status: 'upcoming',
      customerName: formData.customerName
    };
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);

    // Save to localStorage
    localStorage.setItem('sqms_appointments', JSON.stringify(updatedAppointments));

    setShowBooking(false);
    setFormData({
      customerName: '',
      service: '',
      branch: '',
      date: '',
      time: ''
    });
  };

  const confirmAppointment = (id: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('sqms_appointments', JSON.stringify(updatedAppointments));
  };

  const markAsServed = (id: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'served' as const } : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('sqms_appointments', JSON.stringify(updatedAppointments));
  };

  const cancelAppointment = (id: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('sqms_appointments', JSON.stringify(updatedAppointments));
  };

  const handleReschedule = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
    setFormData({
      customerName: appointment.customerName,
      service: appointment.service,
      branch: appointment.branch,
      date: appointment.date,
      time: appointment.time
    });
    setShowBooking(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppointment) return;

    setAppointments(appointments.map(apt =>
      apt.id === rescheduleAppointment.id
        ? {
            ...apt,
            date: formData.date,
            time: formData.time,
            service: formData.service,
            branch: formData.branch,
            customerName: formData.customerName
          }
        : apt
    ));

    setShowBooking(false);
    setRescheduleAppointment(null);
    setFormData({
      customerName: '',
      service: '',
      branch: '',
      date: '',
      time: ''
    });
    alert('Appointment rescheduled successfully!');
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
    ? appointments.filter(apt => isFutureAppointment(apt.date, apt.time))
    : appointments;

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'served':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const navigate = useNavigate();
  const IndustryIcon = industry?.icon;

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
              const ServiceIcon = service.icon;
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
                  onClick={() => setSelectedServiceForView(service.name)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200 text-left"
                >
                  <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    {ServiceIcon && <ServiceIcon className="w-16 h-16 text-white" />}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl text-slate-800 mb-2">{service.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </div>
                      <span className="text-blue-600 text-sm font-medium">
                        {appointments.filter(apt => apt.service === service.name).length} appointments
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
            Appointments for {selectedServiceForView}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments
              .filter(apt => apt.service === selectedServiceForView)
              .map((appointment, index) => {
                // Generate ticket number if not exists
                const ticketNumber = appointment.ticketNumber || `APT-${selectedServiceForView.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`;
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

                      {/* Action Buttons for Staff/Admin */}
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        {appointment.status === 'upcoming' && (
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
                  <option key={service.id} value={service.name}>{service.name} - {service.duration}</option>
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
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
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
                <label className="text-sm text-slate-600 mb-2 block">Appointment Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Select Time Slot</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: slot })}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                      formData.time === slot
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
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