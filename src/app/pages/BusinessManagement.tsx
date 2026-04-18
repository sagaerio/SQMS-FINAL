import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Plus, Edit2, Trash2, X, ArrowLeft, BarChart3, Users, MapPin } from 'lucide-react';
import { industries } from '../components/IndustrySelector';

interface Business {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  branches: number;
  employees: number;
  status: 'active' | 'inactive';
  registrationDate: string;
}

const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'First National Bank',
    industry: 'banking',
    email: 'contact@firstnational.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY',
    branches: 5,
    employees: 45,
    status: 'active',
    registrationDate: '2026-01-15'
  },
  {
    id: '2',
    name: 'City Medical Center',
    industry: 'healthcare',
    email: 'info@citymedical.com',
    phone: '+1 (555) 234-5678',
    address: '456 Health Ave, Los Angeles, CA',
    branches: 3,
    employees: 78,
    status: 'active',
    registrationDate: '2026-02-20'
  },
];

export function BusinessManagement() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [employeeCountByIndustry, setEmployeeCountByIndustry] = useState<{ [key: string]: number }>({});

  // Calculate actual employee counts from EmployeeManagement
  useEffect(() => {
    // In a real app, this would come from a shared data source
    // For now, we'll use localStorage to sync with EmployeeManagement
    const calculateEmployeeCounts = () => {
      const counts: { [key: string]: number } = {};

      // This is a simplified version - in production, you'd fetch from a database
      industries.forEach(industry => {
        // Count employees by industry (this would come from actual employee data)
        counts[industry.id] = Math.floor(Math.random() * 20) + 10; // Placeholder
      });

      setEmployeeCountByIndustry(counts);
    };

    calculateEmployeeCounts();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    industry: 'banking',
    email: '',
    phone: '',
    address: '',
    branches: 1,
    employees: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const handleAddBusiness = () => {
    const newBusiness: Business = {
      id: Date.now().toString(),
      ...formData,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setBusinesses([...businesses, newBusiness]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateBusiness = () => {
    if (!editingBusiness) return;

    setBusinesses(businesses.map(bus =>
      bus.id === editingBusiness.id
        ? { ...bus, ...formData }
        : bus
    ));
    setEditingBusiness(null);
    resetForm();
  };

  const handleDeleteBusiness = (id: string) => {
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      setBusinesses(businesses.filter(bus => bus.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: 'banking',
      email: '',
      phone: '',
      address: '',
      branches: 1,
      employees: 0,
      status: 'active'
    });
  };

  const openEditModal = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      industry: business.industry,
      email: business.email,
      phone: business.phone,
      address: business.address,
      branches: business.branches,
      employees: business.employees,
      status: business.status
    });
  };

  const getIndustryName = (industryId: string) => {
    return industries.find(ind => ind.id === industryId)?.name || industryId;
  };

  const viewBusinessDetails = (business: Business) => {
    setSelectedBusiness(business);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-800 mb-2">Business Management</h1>
          <p className="text-slate-600">Register and manage businesses across all industries</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Register Business
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Businesses</p>
              <p className="text-3xl text-slate-800">{businesses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Branches</p>
              <p className="text-3xl text-slate-800">{businesses.reduce((sum, b) => sum + b.branches, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Employees</p>
              <p className="text-3xl text-slate-800">{businesses.reduce((sum, b) => sum + b.employees, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Business List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl text-slate-800 mb-1">{business.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getIndustryName(business.industry)}
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                business.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {business.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <p>📧 {business.email}</p>
              <p>📞 {business.phone}</p>
              <p>📍 {business.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-600 text-xs mb-1">Branches</p>
                <p className="text-slate-800 font-semibold">{business.branches}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-600 text-xs mb-1">Employees</p>
                <p className="text-slate-800 font-semibold">{business.employees}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => viewBusinessDetails(business)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </button>
              <button
                onClick={() => openEditModal(business)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteBusiness(business.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Business Modal */}
      {(showAddModal || editingBusiness) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">
                {editingBusiness ? 'Edit Business' : 'Register New Business'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBusiness(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {industries.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@business.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Number of Branches</label>
                <input
                  type="number"
                  min="1"
                  value={formData.branches}
                  onChange={(e) => setFormData({ ...formData, branches: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Number of Employees</label>
                <input
                  type="number"
                  min="0"
                  value={formData.employees}
                  onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={editingBusiness ? handleUpdateBusiness : handleAddBusiness}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {editingBusiness ? 'Update Business' : 'Register Business'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Details Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">{selectedBusiness.name} - Analytics</h2>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-slate-600 mb-6">
              <p className="text-lg mb-4">Industry: <span className="font-semibold text-slate-800">{getIndustryName(selectedBusiness.industry)}</span></p>
              <p className="text-sm">This would display comprehensive analytics for {selectedBusiness.name} including queue metrics, customer flow, employee performance, and more.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Analytics dashboard for {selectedBusiness.name} would be displayed here</p>
              <button
                onClick={() => {
                  // Navigate to analytics with business context
                  localStorage.setItem('sqms_viewing_business', selectedBusiness.id);
                  navigate('/analytics');
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
