import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QueueStatusBar } from '../components/QueueStatusBar';
import { useIndustry } from '../contexts/IndustryContext';
import { industries } from '../components/IndustrySelector';

export function Analytics() {
  const { industry } = useIndustry();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyHourlyData, setDailyHourlyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);
  const [peakHourView, setPeakHourView] = useState<'hour' | 'day' | 'week' | 'month'>('hour');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState('0 min');
  const [userRole, setUserRole] = useState('admin');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('all');

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'admin';
    setUserRole(role);

    // Set initial filter for super admin
    if (role === 'superadmin') {
      setSelectedIndustryFilter('all');
    }

    // Load appointments from localStorage
    const storedBookings = JSON.parse(localStorage.getItem('sqms_bookings') || '[]');
    setAppointments(storedBookings);
    setTotalAppointments(storedBookings.length);

    // Also count queue history for total customers
    const queueHistory = JSON.parse(localStorage.getItem('sqms_ticket_history') || '[]');
    const totalCustomerCount = storedBookings.length + queueHistory.length;
    setTotalCustomers(totalCustomerCount);

    // Calculate average wait time (simulated based on service types)
    const avgMinutes = storedBookings.length > 0 ?
      Math.round(storedBookings.reduce((sum: number, booking: any) => {
        const serviceWaitTimes: { [key: string]: number } = {
          'Account Opening': 15,
          'Loan Services': 30,
          'Credit Card Services': 10,
          'Investment Consultation': 45,
          'General Consultation': 20,
          'Customer Support': 12,
          'Document Verification': 15,
          'Card Services': 10,
          'General Inquiry': 8,
          'Emergency Care': 5
        };
        return sum + (serviceWaitTimes[booking.service?.name] || 15);
      }, 0) / storedBookings.length) : 0;
    setAvgWaitTime(`${avgMinutes} min`);

    // Calculate service distribution
    const serviceCounts: { [key: string]: number } = {};
    storedBookings.forEach((booking: any) => {
      const serviceName = booking.service?.name || 'Unknown';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    const total = storedBookings.length || 1;
    const distribution = Object.entries(serviceCounts).map(([name, count], index) => ({
      id: `service-${index}-${name}`,
      name,
      value: Math.round((count as number / total) * 100),
      color: ['#2563EB', '#3B82F6', '#60A5FA', '#F97316', '#FB923C', '#10B981'][index % 6]
    }));

    setServiceDistribution(distribution);

    // Calculate weekly performance based on appointment dates
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts: { [key: string]: number } = {};
    const dayWaitTimes: { [key: string]: number[] } = {};

    storedBookings.forEach((booking: any) => {
      if (booking.preferredDate) {
        const date = new Date(booking.preferredDate);
        const dayName = dayNames[date.getDay()];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;

        const waitTime = 15; // Average wait
        if (!dayWaitTimes[dayName]) dayWaitTimes[dayName] = [];
        dayWaitTimes[dayName].push(waitTime);
      }
    });

    const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      customers: dayCounts[day] || 0,
      avgWait: dayWaitTimes[day] ?
        Math.round(dayWaitTimes[day].reduce((a, b) => a + b, 0) / dayWaitTimes[day].length) : 0
    }));
    setWeeklyData(weekly);

    // Calculate hourly distribution
    const hourCounts: { [key: string]: number } = {};
    storedBookings.forEach((booking: any) => {
      if (booking.preferredTime) {
        const hour = parseInt(booking.preferredTime.split(':')[0]);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const hourLabel = `${displayHour}${period}`;
        hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
      }
    });

    const hourly = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'].map(hour => ({
      hour,
      customers: hourCounts[hour] || 0
    }));
    setHourlyData(hourly);

    // Calculate daily hourly breakdown (last 7 days)
    const dailyHourly: { [key: string]: { [key: string]: number } } = {};
    storedBookings.forEach((booking: any) => {
      if (booking.preferredDate && booking.preferredTime) {
        const date = new Date(booking.preferredDate);
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const hour = parseInt(booking.preferredTime.split(':')[0]);
        const hourKey = `${hour}:00`;

        if (!dailyHourly[dayKey]) dailyHourly[dayKey] = {};
        dailyHourly[dayKey][hourKey] = (dailyHourly[dayKey][hourKey] || 0) + 1;
      }
    });

    const dailyHourlyArray = Object.entries(dailyHourly).map(([day, hours]) => ({
      day,
      ...hours
    }));
    setDailyHourlyData(dailyHourlyArray);

    // Calculate monthly data
    const monthCounts: { [key: string]: number } = {};
    storedBookings.forEach((booking: any) => {
      if (booking.preferredDate) {
        const date = new Date(booking.preferredDate);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });

    const monthly = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      month,
      customers: monthCounts[month] || 0
    }));
    setMonthlyData(monthly);

    // Calculate staff performance based on appointments
    const staffAssignments: { [key: string]: any } = {
      'Sarah Johnson': { served: 0, totalTime: 0, ratings: [], industry: '🏦 Banks' },
      'Michael Chen': { served: 0, totalTime: 0, ratings: [], industry: '🏥 Hospitals' },
      'Emily Davis': { served: 0, totalTime: 0, ratings: [], industry: '🏛️ Government' },
      'James Wilson': { served: 0, totalTime: 0, ratings: [], industry: '🏦 Banks' },
      'Lisa Anderson': { served: 0, totalTime: 0, ratings: [], industry: '🏪 Retail' }
    };

    const staffNames = Object.keys(staffAssignments);
    storedBookings.forEach((booking: any, index: number) => {
      const assignedStaff = staffNames[index % staffNames.length];
      staffAssignments[assignedStaff].served += 1;
      staffAssignments[assignedStaff].totalTime += 15; // Average service time
      staffAssignments[assignedStaff].ratings.push(4.5 + Math.random() * 0.5); // Random rating 4.5-5.0
    });

    const performance = Object.entries(staffAssignments)
      .map(([name, data]: [string, any]) => ({
        name,
        served: data.served,
        avgTime: data.served > 0 ? `${Math.round(data.totalTime / data.served)} min` : '0 min',
        rating: data.ratings.length > 0 ?
          (data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length).toFixed(1) : '0.0',
        industry: data.industry
      }))
      .sort((a, b) => b.served - a.served);

    setStaffPerformance(performance);
  }, []);

const dailyData = [
  { day: 'Mon', customers: 45, avgWait: 12 },
  { day: 'Tue', customers: 52, avgWait: 15 },
  { day: 'Wed', customers: 68, avgWait: 18 },
  { day: 'Thu', customers: 71, avgWait: 20 },
  { day: 'Fri', customers: 89, avgWait: 25 },
  { day: 'Sat', customers: 62, avgWait: 16 },
  { day: 'Sun', customers: 34, avgWait: 10 },
];

const hourlyDataStatic = [
  { hour: '9AM', customers: 5 },
  { hour: '10AM', customers: 12 },
  { hour: '11AM', customers: 18 },
  { hour: '12PM', customers: 25 },
  { hour: '1PM', customers: 22 },
  { hour: '2PM', customers: 28 },
  { hour: '3PM', customers: 20 },
  { hour: '4PM', customers: 15 },
];

const staffPerformanceStatic = [
  { name: 'Sarah Johnson', served: 45, avgTime: '8 min', rating: 4.8, industry: '🏦 Banks' },
  { name: 'Michael Chen', served: 42, avgTime: '9 min', rating: 4.7, industry: '🏥 Hospitals' },
  { name: 'Emily Davis', served: 38, avgTime: '10 min', rating: 4.6, industry: '🏛️ Government' },
  { name: 'James Wilson', served: 35, avgTime: '11 min', rating: 4.5, industry: '🏦 Banks' },
  { name: 'Lisa Anderson', served: 32, avgTime: '12 min', rating: 4.4, industry: '🏪 Retail' },
];

  const getPeakHourData = () => {
    switch (peakHourView) {
      case 'hour':
        return hourlyData.length > 0 ? hourlyData : hourlyDataStatic;
      case 'day':
        return weeklyData.length > 0 ? weeklyData.map(d => ({ hour: d.day, customers: d.customers })) :
          dailyData.map(d => ({ hour: d.day, customers: d.customers }));
      case 'week':
        return dailyHourlyData.slice(0, 7);
      case 'month':
        return monthlyData.filter(m => m.customers > 0).slice(0, 12);
      default:
        return hourlyData;
    }
  };

  const IndustryIcon = industry?.icon;
  const isSuperAdmin = userRole === 'superadmin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-slate-800 mb-2">Analytics & Reports</h1>
        <p className="text-slate-600">Comprehensive insights into queue performance and customer flow</p>
        {industry && !isSuperAdmin && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className={`bg-gradient-to-r ${industry.color} rounded p-1.5`}>
              {IndustryIcon && <IndustryIcon className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm text-slate-700">{industry.name}</span>
          </div>
        )}

        {/* Industry Filter for Super Admin */}
        {isSuperAdmin && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Filter by Industry:</label>
            <select
              value={selectedIndustryFilter}
              onChange={(e) => setSelectedIndustryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Industries</option>
              {industries.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{Math.round((totalCustomers / Math.max(totalCustomers - 50, 1)) * 100 - 100)}%
            </div>
          </div>
          <div className="text-3xl text-slate-800 mb-1">{totalCustomers}</div>
          <div className="text-sm text-slate-600">Total Customers Served</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              -8%
            </div>
          </div>
          <div className="text-3xl text-slate-800 mb-1">{avgWaitTime}</div>
          <div className="text-sm text-slate-600">Avg Wait Time</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +5%
            </div>
          </div>
          <div className="text-3xl text-slate-800 mb-1">{totalAppointments > 0 ? '89%' : 'N/A'}</div>
          <div className="text-sm text-slate-600">Customer Satisfaction</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{totalAppointments > 0 ? '15' : '0'}%
            </div>
          </div>
          <div className="text-3xl text-slate-800 mb-1">{totalAppointments}</div>
          <div className="text-sm text-slate-600">Appointments Scheduled</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Customers & Wait Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl text-slate-800 mb-6">Weekly Performance</h2>
          {weeklyData.length > 0 && weeklyData.some(d => d.customers > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="customers" fill="#2563EB" name="Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgWait" fill="#F97316" name="Avg Wait (min)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No weekly data available yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-slate-800">Peak Hours Analysis</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeakHourView('hour')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${peakHourView === 'hour' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Hour
              </button>
              <button
                onClick={() => setPeakHourView('day')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${peakHourView === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Day
              </button>
              <button
                onClick={() => setPeakHourView('week')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${peakHourView === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Week
              </button>
              <button
                onClick={() => setPeakHourView('month')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${peakHourView === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Month
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getPeakHourData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey={peakHourView === 'hour' ? 'hour' : peakHourView === 'month' ? 'month' : 'hour'}
                stroke="#64748b"
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#2563EB"
                strokeWidth={3}
                name="Customer Flow"
                dot={{ fill: '#2563EB', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>View:</strong> {peakHourView === 'hour' ? 'Hourly breakdown of customer visits' :
                peakHourView === 'day' ? 'Daily customer flow throughout the week' :
                  peakHourView === 'week' ? 'Weekly trends over the past weeks' :
                    'Monthly customer distribution'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Service Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl text-slate-800 mb-6">Service Distribution</h2>
          {serviceDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceDistribution.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {serviceDistribution.map((service) => (
                  <div key={service.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }}></div>
                      <span className="text-slate-600">{service.name}</span>
                    </div>
                    <span className="text-slate-800">{service.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No appointment data available yet</p>
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 rounded-lg p-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl text-slate-800">Staff Performance</h2>
          </div>
          {staffPerformance.length > 0 && staffPerformance.some(s => s.served > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Staff Member</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-600">Industry</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-600">Customers Served</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-600">Avg Service Time</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-600">Rating</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-600">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.map((staff, index) => (
                    <tr key={staff.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white">
                            {staff.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm text-slate-800">{staff.name}</div>
                            {index === 0 && staff.served > 0 && (
                              <div className="text-xs text-yellow-600 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Top Performer
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          {staff.industry}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-slate-800">{staff.served}</td>
                      <td className="py-4 px-4 text-center text-slate-800">{staff.avgTime}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-slate-800">{staff.rating}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full"
                            style={{ width: `${Math.min((staff.served / Math.max(...staffPerformance.map(s => s.served), 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No staff performance data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Export & Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-xl mb-4">Generate Reports</h2>
          <p className="text-white/90 mb-6">
            Export detailed analytics and performance reports for your records
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                // Generate PDF report data
                const reportData = {
                  title: 'SQMS Analytics Report',
                  date: new Date().toLocaleDateString(),
                  metrics: {
                    totalCustomers: totalCustomers,
                    avgWaitTime: avgWaitTime,
                    satisfaction: totalAppointments > 0 ? '89%' : 'N/A',
                    appointments: totalAppointments
                  },
                  weeklyData: weeklyData,
                  hourlyData: hourlyData,
                  services: serviceDistribution,
                  staff: staffPerformance,
                  appointmentDetails: appointments
                };
                alert(`PDF Report Generated!\n\nReport Details:\n- Total Customers: ${reportData.metrics.totalCustomers}\n- Avg Wait Time: ${reportData.metrics.avgWaitTime}\n- Satisfaction: ${reportData.metrics.satisfaction}\n- Appointments: ${reportData.metrics.appointments}\n- Services Tracked: ${serviceDistribution.length}\n- Staff Members: ${staffPerformance.length}\n\nGenerated on: ${reportData.date}\n\n(In production, this would download a PDF file)`);
              }}
              className="flex-1 py-3 bg-white text-blue-600 rounded-xl hover:bg-white/90 transition-all"
            >
              Export PDF
            </button>
            <button 
              onClick={() => {
                // Generate Excel report data
                const reportData = {
                  date: new Date().toLocaleDateString(),
                  totalRecords: weeklyData.length + serviceDistribution.length + staffPerformance.length + appointments.length
                };
                alert(`Excel Report Generated!\n\nReport includes:\n- Weekly Performance Data (${weeklyData.length} records)\n- Service Distribution (${serviceDistribution.length} services)\n- Staff Performance (${staffPerformance.length} staff members)\n- Appointment Details (${appointments.length} appointments)\n- Peak Hours Analysis\n\nGenerated on: ${reportData.date}\n\n(In production, this would download an Excel file)`);
              }}
              className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl text-slate-800 mb-4">Key Insights</h2>
          <ul className="space-y-3">
            {totalCustomers > 0 ? (
              <>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm text-slate-600">
                    Total of <strong className="text-slate-800">{totalCustomers} customers</strong> served through appointments and queue
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-slate-600">
                    Average wait time of <strong className="text-slate-800">{avgWaitTime}</strong> across all services
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong className="text-slate-800">{totalAppointments} appointments</strong> scheduled by customers
                  </div>
                </li>
                {staffPerformance.length > 0 && staffPerformance[0].served > 0 && (
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-sm text-slate-600">
                      Top performer: <strong className="text-slate-800">{staffPerformance[0].name}</strong> with {staffPerformance[0].served} customers served
                    </div>
                  </li>
                )}
              </>
            ) : (
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm text-slate-600">
                  No data available yet. Insights will appear as customers book appointments and use the queue system.
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}