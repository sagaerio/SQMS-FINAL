import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, Plus, Edit2, Trash2, X, ArrowLeft, Building2, UserCheck } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { industries } from '../components/IndustrySelector';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'admin';
  industry: string;
  counter?: string;
  status: 'active' | 'inactive';
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'staff.banking@sqms.com',
    role: 'staff',
    industry: 'banking',
    counter: '3',
    status: 'active'
  },
  {
    id: '2',
    name: 'Banking Admin',
    email: 'admin.banking@sqms.com',
    role: 'admin',
    industry: 'banking',
    status: 'active'
  },
];

export function EmployeeManagement() {
  const navigate = useNavigate();
  const { industry } = useIndustry();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [userRole, setUserRole] = useState('admin');
  const [adminIndustry, setAdminIndustry] = useState<string | null>(null);
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('all');

  useEffect(() => {
    const role = localStorage.getItem('sqms_user_role') || 'admin';
    const savedAdminIndustry = localStorage.getItem('sqms_admin_industry');
    setUserRole(role);
    setAdminIndustry(savedAdminIndustry);

    // Set initial filter for super admin
    if (role === 'superadmin') {
      setSelectedIndustryFilter('all');
    }
  }, []);

  const isSuperAdmin = userRole === 'superadmin';

  const filteredEmployees = isSuperAdmin
    ? selectedIndustryFilter === 'all'
      ? employees
      : employees.filter(emp => emp.industry === selectedIndustryFilter)
    : employees.filter(emp => emp.industry === adminIndustry);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'staff' | 'admin',
    industry: adminIndustry || 'banking',
    counter: '',
    status: 'active' as 'active' | 'inactive'
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmployee = () => {
    // Validate email format
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    // Check for duplicate email across all employees
    const emailExists = employees.some(emp => emp.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      alert('This email is already in use. Please use a different email address.');
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email.toLowerCase(),
      role: formData.role,
      industry: formData.industry,
      counter: formData.role === 'staff' ? formData.counter : undefined,
      status: formData.status
    };

    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee) return;

    // Validate email format
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    // Check for duplicate email (excluding current employee)
    const emailExists = employees.some(emp =>
      emp.id !== editingEmployee.id && emp.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists) {
      alert('This email is already in use by another employee. Please use a different email address.');
      return;
    }

    setEmployees(employees.map(emp =>
      emp.id === editingEmployee.id
        ? { ...emp, ...formData, email: formData.email.toLowerCase() }
        : emp
    ));
    setEditingEmployee(null);
    resetForm();
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'staff',
      industry: adminIndustry || 'banking',
      counter: '',
      status: 'active'
    });
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      industry: employee.industry,
      counter: employee.counter || '',
      status: employee.status
    });
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Employee Management</h1>
            <p className="text-slate-600">
              {isSuperAdmin ? 'Manage employees across all industries' : `Manage ${getIndustryName(adminIndustry || '')} employees`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Industry Filter for Super Admin */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3">
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
            <span className="text-sm text-slate-600">
              Showing {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Industry
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Counter
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-800 font-medium">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {employee.email}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getIndustryName(employee.industry)}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      employee.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {employee.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {employee.counter || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Employee name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="employee@sqms.com"
                />
              </div>

              {isSuperAdmin && (
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
              )}

              <div>
                <label className="block text-sm text-slate-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'admin' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'staff' && (
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Counter</label>
                  <input
                    type="text"
                    value={formData.counter}
                    onChange={(e) => setFormData({ ...formData, counter: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Counter number"
                  />
                </div>
              )}

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

              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
