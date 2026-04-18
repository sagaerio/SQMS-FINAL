import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Clock, CheckCircle, XCircle, ArrowLeft, MapPin, Users, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { industries } from '../components/IndustrySelector';

interface BusinessRequest {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  requestedDate: string;
  description: string;
}

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'admin';
  counter?: string;
}

const mockRequests: BusinessRequest[] = [
  {
    id: '1',
    name: 'Metro Retail Store',
    contactName: 'John Smith',
    email: 'john.smith@metroretail.com',
    phone: '+1 (555) 789-0123',
    requestedDate: '2026-04-15',
    description: 'Large retail chain looking to implement queue management across 8 locations'
  },
  {
    id: '2',
    name: 'Greenwood Community Hospital',
    contactName: 'Dr. Sarah Williams',
    email: 'swilliams@greenwood.health',
    phone: '+1 (555) 456-7890',
    requestedDate: '2026-04-16',
    description: 'Community hospital seeking patient queue management for outpatient services'
  },
  {
    id: '3',
    name: 'University Admin Office',
    contactName: 'Michael Brown',
    email: 'mbrown@university.edu',
    phone: '+1 (555) 321-9876',
    requestedDate: '2026-04-17',
    description: 'University administration office needs student services queue management'
  },
];

export function BusinessRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BusinessRequest[]>(mockRequests);
  const [reviewingRequest, setReviewingRequest] = useState<BusinessRequest | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    industry: 'banking',
    location: '',
    branches: 1,
    numberOfEmployees: 0
  });
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'staff' | 'admin',
    counter: ''
  });

  const handleReviewRequest = (request: BusinessRequest) => {
    setReviewingRequest(request);
    setApprovalForm({
      industry: 'banking',
      location: '',
      branches: 1,
      numberOfEmployees: 0
    });
    setStaffAccounts([]);
  };

  const handleRejectRequest = (id: string) => {
    if (confirm('Are you sure you want to reject this business request?')) {
      setRequests(requests.filter(req => req.id !== id));
    }
  };

  const handleAddStaffAccount = () => {
    if (!staffFormData.name || !staffFormData.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check for duplicate email in staff accounts
    const emailExists = staffAccounts.some(acc => acc.email.toLowerCase() === staffFormData.email.toLowerCase());
    if (emailExists) {
      alert('This email is already used for another staff account');
      return;
    }

    const newAccount: StaffAccount = {
      id: Date.now().toString(),
      name: staffFormData.name,
      email: staffFormData.email.toLowerCase(),
      role: staffFormData.role,
      counter: staffFormData.role === 'staff' ? staffFormData.counter : undefined
    };

    setStaffAccounts([...staffAccounts, newAccount]);
    setStaffFormData({
      name: '',
      email: '',
      role: 'staff',
      counter: ''
    });
    setShowStaffForm(false);
  };

  const handleRemoveStaffAccount = (id: string) => {
    setStaffAccounts(staffAccounts.filter(acc => acc.id !== id));
  };

  const handleApproveRequest = () => {
    if (!reviewingRequest) return;

    if (!approvalForm.location) {
      alert('Please enter a location');
      return;
    }

    if (staffAccounts.length === 0) {
      alert('Please create at least one staff account for this business');
      return;
    }

    // Create the new business
    const newBusiness = {
      id: Date.now().toString(),
      name: reviewingRequest.name,
      industry: approvalForm.industry,
      email: reviewingRequest.email,
      phone: reviewingRequest.phone,
      address: approvalForm.location,
      branches: approvalForm.branches,
      employees: approvalForm.numberOfEmployees,
      status: 'active' as const,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    // In a real app, this would save to database
    // For now, we'll just show a success message
    alert(`Business Approved!\n\nBusiness: ${newBusiness.name}\nIndustry: ${industries.find(i => i.id === newBusiness.industry)?.name}\nLocation: ${newBusiness.address}\nEmployees: ${newBusiness.employees}\nStaff Accounts Created: ${staffAccounts.length}\n\nThe business has been added to your system.`);

    // Remove from pending requests
    setRequests(requests.filter(req => req.id !== reviewingRequest.id));
    setReviewingRequest(null);
    setStaffAccounts([]);
  };

  const getIndustryName = (industryId: string) => {
    return industries.find(ind => ind.id === industryId)?.name || industryId;
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
      <div className="mb-8">
        <h1 className="text-3xl text-slate-800 mb-2">Business Requests</h1>
        <p className="text-slate-600">Review and approve businesses requesting SQMS services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Pending Requests</p>
              <p className="text-3xl text-slate-800">{requests.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Approved This Month</p>
              <p className="text-3xl text-slate-800">12</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Rejected This Month</p>
              <p className="text-3xl text-slate-800">3</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl text-slate-800 mb-2">No Pending Requests</h3>
            <p className="text-slate-600">All business requests have been reviewed</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-slate-800">{request.name}</h3>
                      <p className="text-sm text-slate-600">Requested on {new Date(request.requestedDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <strong>Contact:</strong> {request.contactName}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {request.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2"><strong>Description:</strong></p>
                      <p className="text-sm text-slate-700">{request.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleReviewRequest(request)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Review & Approve
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review/Approval Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">Review Business Request</h2>
              <button
                onClick={() => {
                  setReviewingRequest(null);
                  setStaffAccounts([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Business Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg text-slate-800 mb-3">{reviewingRequest.name}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
                <p><strong>Contact:</strong> {reviewingRequest.contactName}</p>
                <p><strong>Email:</strong> {reviewingRequest.email}</p>
                <p><strong>Phone:</strong> {reviewingRequest.phone}</p>
                <p><strong>Requested:</strong> {new Date(reviewingRequest.requestedDate).toLocaleDateString()}</p>
                <p className="md:col-span-2"><strong>Description:</strong> {reviewingRequest.description}</p>
              </div>
            </div>

            {/* Approval Form */}
            <div className="space-y-6">
              <h3 className="text-lg text-slate-800">Business Details</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Assign to Industry</label>
                  <select
                    value={approvalForm.industry}
                    onChange={(e) => setApprovalForm({ ...approvalForm, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {industries.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Number of Branches</label>
                  <input
                    type="number"
                    min="1"
                    value={approvalForm.branches}
                    onChange={(e) => setApprovalForm({ ...approvalForm, branches: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-2">Location/Address</label>
                  <input
                    type="text"
                    value={approvalForm.location}
                    onChange={(e) => setApprovalForm({ ...approvalForm, location: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Number of Employees</label>
                  <input
                    type="number"
                    min="0"
                    value={approvalForm.numberOfEmployees}
                    onChange={(e) => setApprovalForm({ ...approvalForm, numberOfEmployees: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Total employees"
                  />
                </div>
              </div>

              {/* Staff Accounts Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-slate-800">Staff Accounts</h3>
                    <p className="text-sm text-slate-600">Create initial staff accounts for this business</p>
                  </div>
                  <button
                    onClick={() => setShowStaffForm(!showStaffForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </button>
                </div>

                {/* Staff Form */}
                {showStaffForm && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={staffFormData.name}
                          onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Staff name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={staffFormData.email}
                          onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="staff@business.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-700 mb-2">Role</label>
                        <select
                          value={staffFormData.role}
                          onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as 'staff' | 'admin' })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {staffFormData.role === 'staff' && (
                        <div>
                          <label className="block text-sm text-slate-700 mb-2">Counter</label>
                          <input
                            type="text"
                            value={staffFormData.counter}
                            onChange={(e) => setStaffFormData({ ...staffFormData, counter: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Counter number"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleAddStaffAccount}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Staff Account
                    </button>
                  </div>
                )}

                {/* Staff List */}
                {staffAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {staffAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-slate-800 font-medium">{account.name}</p>
                          <p className="text-xs text-slate-600">{account.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            account.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {account.role}
                          </span>
                          {account.counter && (
                            <span className="text-xs text-slate-600">Counter: {account.counter}</span>
                          )}
                          <button
                            onClick={() => handleRemoveStaffAccount(account.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-600">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No staff accounts created yet</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleApproveRequest}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Approve & Create Business
                </button>
                <button
                  onClick={() => {
                    setReviewingRequest(null);
                    setStaffAccounts([]);
                  }}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
