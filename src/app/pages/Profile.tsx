import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Calendar, Shield, Edit2, Save, X, LogOut, Lock, Eye, EyeOff } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('demo@sqms.com');
  const [userRole, setUserRole] = useState('customer');
  const [formData, setFormData] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@sqms.com',
    dateOfBirth: '1990-01-01',
    phone: '+1 (555) 123-4567',
    role: 'Customer',
    department: '',
    branch: '',
    position: '',
    employeeId: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const email = localStorage.getItem('sqms_user_email') || 'demo@sqms.com';
    const role = localStorage.getItem('sqms_user_role') || 'customer';
    const name = localStorage.getItem('sqms_user_name') || 'Demo User';
    const staffIndustry = localStorage.getItem('sqms_staff_industry') || '';

    setUserEmail(email);
    setUserRole(role);

    const nameParts = name.split(' ');
    const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

    // Set staff-specific information based on industry
    let staffDetails = {
      department: '',
      branch: '',
      position: '',
      employeeId: ''
    };

    if (role === 'staff' && staffIndustry) {
      const industryStaffInfo: { [key: string]: any } = {
        banking: {
          branch: 'Manhattan Financial Center',
          position: 'Customer Service Representative',
          department: 'Account Services',
          employeeId: 'BNK-2024-1156'
        },
        healthcare: {
          branch: 'Main Hospital - Downtown',
          position: 'Medical Services Coordinator',
          department: 'Medical Services',
          employeeId: 'HLC-2024-2487'
        },
        retail: {
          branch: 'Flagship Store - Downtown',
          position: 'Customer Service Associate',
          department: 'Customer Support',
          employeeId: 'RTL-2024-3891'
        },
        government: {
          branch: 'City Hall - Main Office',
          position: 'Public Services Officer',
          department: 'Licensing Services',
          employeeId: 'GOV-2024-5623'
        },
        education: {
          branch: 'Main Campus - Admissions',
          position: 'Student Services Advisor',
          department: 'Admissions',
          employeeId: 'EDU-2024-7845'
        },
        corporate: {
          branch: 'Headquarters - Main Building',
          position: 'Service Desk Specialist',
          department: 'IT Services',
          employeeId: 'CRP-2024-9012'
        }
      };

      if (industryStaffInfo[staffIndustry]) {
        staffDetails = industryStaffInfo[staffIndustry];
      }
    }

    setFormData(prev => ({
      ...prev,
      email: email,
      firstName: nameParts[0] || 'Demo',
      lastName: nameParts[1] || 'User',
      role: roleDisplay,
      ...staffDetails
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    alert('Profile updated successfully!');
    setIsEditing(false);
  };
  
  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    // Get current stored password
    const storedPassword = localStorage.getItem(`sqms_password_${userEmail}`);

    // Validate current password
    if (storedPassword && passwordData.currentPassword !== storedPassword) {
      alert('Current password is incorrect!');
      return;
    }

    // Store the new password
    localStorage.setItem(`sqms_password_${userEmail}`, passwordData.newPassword);

    // Update remembered password if remember me was enabled
    const rememberedEmail = localStorage.getItem('sqms_remembered_email');
    if (rememberedEmail === userEmail) {
      localStorage.setItem('sqms_remembered_password', passwordData.newPassword);
    }

    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sqms_logged_in');
    localStorage.removeItem('sqms_user_email');
    localStorage.removeItem('sqms_user_role');
    localStorage.removeItem('sqms_user_name');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-slate-800 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-200 text-center">
              {/* Avatar */}
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-2xl text-slate-800 mb-1">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-slate-600 mb-2">{formData.email}</p>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm mb-6">
                <Shield className="w-4 h-4" />
                {formData.role}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl text-slate-800">Account Details</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-slate-50 text-slate-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-slate-50 text-slate-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-slate-50 text-slate-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-slate-50 text-slate-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-slate-50 text-slate-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.role}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>

                {/* Staff-specific fields */}
                {userRole === 'staff' && formData.department && (
                  <>
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Department</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.department}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Branch</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.branch}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Position</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.position}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Employee ID</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.employeeId}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-6">
              <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg text-slate-800 mb-1">Change Password</h4>
                    <p className="text-sm text-slate-600">Update your password to keep your account secure</p>
                  </div>
                  {!isChangingPassword && (
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Change Password
                    </button>
                  )}
                </div>
                
                {isChangingPassword && (
                  <div className="space-y-4 mt-4">
                    {/* Current Password */}
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handlePasswordSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        Save Password
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}