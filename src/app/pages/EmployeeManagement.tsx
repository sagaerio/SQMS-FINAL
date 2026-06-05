import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, Plus, Edit2, Trash2, X, ArrowLeft, Building2, UserCheck, Briefcase, Settings } from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { industries } from '../components/IndustrySelector';
import {
  getUsersByIndustry,
  getAllUsers,
  getBusinessesByIndustry,
  getAllBusinesses,
  getServicesByIndustry,
  getAllServices,
  assignStaffToBranch,
  getStaffServices,
  assignServiceToStaff,
  removeServiceFromStaff
} from '../../services/djangoService';
import { User, Business, Service } from '../../lib/supabase';

interface Employee extends User {
  branch?: Business;
  assigned_services?: Service[];
}

export function EmployeeManagement() {
  const navigate = useNavigate();
  const { industry } = useIndustry();
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managingStaffId, setManagingStaffId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('admin');
  const [adminIndustry, setAdminIndustry] = useState<string | null>(null);
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Business[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

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
    const role = localStorage.getItem('sqms_user_role') || 'admin';
    const savedAdminIndustry = localStorage.getItem('sqms_admin_industry');
    setUserRole(role);
    setAdminIndustry(savedAdminIndustry);

    // Set initial filter for super admin
    if (role === 'superadmin') {
      setSelectedIndustryFilter('all');
    }

    // Load employees and other data
    loadData(role, savedAdminIndustry);
  }, []);

  const loadData = async (role: string, industryId: string | null) => {
    setLoading(true);
    try {
      // Load employees
      if (role === 'superadmin') {
        const { data: allUsers } = await getAllUsers();
        if (allUsers) {
          const employeesWithDetails = await Promise.all(
            allUsers.map(async (emp) => {
              const { data: staffServices } = await getStaffServices(emp.id);
              return {
                ...emp,
                assigned_services: staffServices?.map(ss => ss.service).filter(Boolean) as Service[] || []
              };
            })
          );
          setEmployees(employeesWithDetails);
        }

        // Load all businesses and services
        const { data: allBusinesses } = await getAllBusinesses();
        const { data: allServices } = await getAllServices();
        if (allBusinesses) setBranches(allBusinesses);
        if (allServices) setServices(allServices);
      } else if (industryId) {
        const { data: industryUsers } = await getUsersByIndustry(industryId);
        if (industryUsers) {
          const employeesWithDetails = await Promise.all(
            industryUsers.map(async (emp) => {
              const { data: staffServices } = await getStaffServices(emp.id);
              return {
                ...emp,
                assigned_services: staffServices?.map(ss => ss.service).filter(Boolean) as Service[] || []
              };
            })
          );
          setEmployees(employeesWithDetails);
        }

        // Load industry-specific businesses and services
        const { data: industryBusinesses } = await getBusinessesByIndustry(industryId);
        const { data: industryServices } = await getServicesByIndustry(industryId);
        if (industryBusinesses) setBranches(industryBusinesses);
        if (industryServices) setServices(industryServices);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIndustryFilter && selectedIndustryFilter !== 'all') {
      loadIndustryData(selectedIndustryFilter);
    }
  }, [selectedIndustryFilter]);

  const loadIndustryData = async (industryId: string) => {
    try {
      const { data: industryBusinesses } = await getBusinessesByIndustry(industryId);
      const { data: industryServices } = await getServicesByIndustry(industryId);

      // Branches are already deduplicated by Supabase query
      if (industryBusinesses) setBranches(industryBusinesses);

      // Services are already deduplicated by getServicesByIndustry
      if (industryServices) setServices(industryServices);
    } catch (error) {
      console.error('Error loading industry data:', error);
    }
  };

  const isSuperAdmin = userRole === 'superadmin';

  const filteredEmployees = isSuperAdmin
    ? selectedIndustryFilter === 'all'
      ? employees
      : employees.filter(emp => emp.industry_id === selectedIndustryFilter)
    : employees.filter(emp => emp.industry_id === adminIndustry);

  const openManageStaff = async (employee: Employee) => {
    setManagingStaffId(employee.id);
    setSelectedBranchId(employee.branch_id || '');

    // Load staff's assigned services
    const { data: staffServices } = await getStaffServices(employee.id);
    const serviceIds = staffServices?.map(ss => ss.service_id) || [];
    setSelectedServiceIds(serviceIds);

    // Load data for this employee's industry
    if (employee.industry_id) {
      await loadIndustryData(employee.industry_id);
    }
  };

  const handleSaveBranchAssignment = async () => {
    if (!managingStaffId || !selectedBranchId) return;

    // Validate that the selected branch belongs to the staff's industry
    const staff = employees.find(e => e.id === managingStaffId);
    const selectedBranch = branches.find(b => b.id === selectedBranchId);

    if (staff && selectedBranch && staff.industry_id !== selectedBranch.industry_id) {
      alert(`Cannot assign this branch. Staff industry (${staff.industry_id}) must match branch industry (${selectedBranch.industry_id}).`);
      return;
    }

    try {
      await assignStaffToBranch(managingStaffId, selectedBranchId);

      // Reload employees
      await loadData(userRole, adminIndustry);
      alert('Branch assigned successfully!');
    } catch (error) {
      console.error('Error assigning branch:', error);
      alert('Failed to assign branch');
    }
  };

  const handleToggleService = async (serviceId: string) => {
    if (!managingStaffId) return;

    try {
      if (selectedServiceIds.includes(serviceId)) {
        // Remove service
        await removeServiceFromStaff(managingStaffId, serviceId);
        setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
      } else {
        // Add service
        await assignServiceToStaff(managingStaffId, serviceId);
        setSelectedServiceIds([...selectedServiceIds, serviceId]);
      }

      // Reload employees
      await loadData(userRole, adminIndustry);
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('Failed to update service assignment');
    }
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
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Managing Staff</h3>
              <p className="text-sm text-blue-700">
                All staff members with "staff" role appear here automatically. Click the <Settings className="w-3 h-3 inline" /> button to assign branches and services to any staff member.
              </p>
            </div>
          </div>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Employee List */}
      {!loading && (
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
                    Branch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Services
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
                        <span className="text-slate-800 font-medium">{employee.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {employee.email}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getIndustryName(employee.industry_id || '')}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        employee.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : employee.role === 'superadmin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {employee.role === 'admin' ? 'Admin' : employee.role === 'superadmin' ? 'Super Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 text-sm">
                          {employee.branch?.name || 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.assigned_services && employee.assigned_services.length > 0 ? (
                          employee.assigned_services.slice(0, 2).map(service => (
                            <span key={service.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              {service.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">None</span>
                        )}
                        {employee.assigned_services && employee.assigned_services.length > 2 && (
                          <span className="text-xs text-slate-500">+{employee.assigned_services.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {employee.role === 'staff' && (
                          <button
                            onClick={() => openManageStaff(employee)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Manage Branch & Services"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Staff Modal (Branch & Services) */}
      {managingStaffId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-slate-800">
                Manage Staff Assignments
              </h2>
              <button
                onClick={() => {
                  setManagingStaffId(null);
                  setSelectedBranchId('');
                  setSelectedServiceIds([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Branch Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Assign Branch</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Select which branch location this staff member will work at:
                </p>
                {branches.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-yellow-800">
                      No branches available for this staff member's industry. Please create a branch first or verify the staff member's industry assignment.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  >
                    <option value="">Select a branch...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - {branch.address}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleSaveBranchAssignment}
                  disabled={!selectedBranchId}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Save Branch
                </button>
              </div>

              {/* Service Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Assign Services</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Select which services this staff member will handle (these match what customers see):
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {services.map(service => (
                    <label
                      key={service.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => handleToggleService(service.id)}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{service.name}</div>
                        <div className="text-sm text-slate-600">{service.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedServiceIds.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ This staff member has no services assigned. They won't see any tickets on their dashboard.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
