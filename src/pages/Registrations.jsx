import { useState, useEffect } from 'react';
import { Search, Filter, Download, Users, TrendingUp, Calendar, Phone, MapPin, Eye, Edit, Trash2, Plus, X, ChevronDown, MoreVertical, UserPlus, FileText, Mail, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import colors from '/src/utils/colors.js';
import debounce from 'lodash/debounce';

// Enhanced Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Registration Form
const RegistrationForm = ({ registration, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: registration?.name || '',
    email: registration?.email || '',
    phone: registration?.phone || '',
    location: registration?.location || '',
    package: registration?.package || 'Basic',
    status: registration?.status || 'pending',
    totalSpent: registration?.totalSpent || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (registration) {
        await axiosInstance.put(`/users/${registration._id}`, formData);
        toast.success('User updated successfully!');
      } else {
        await axiosInstance.post('/users', formData);
        toast.success('User created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            className={`${inputClass} ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            className={`${inputClass} ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Phone *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            className={`${inputClass} ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
            className={`${inputClass} ${errors.location ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Package</label>
          <select
            name="package"
            value={formData.package}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        
        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              {registration ? 'Update User' : 'Create User'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Enhanced View Registration Component
const ViewRegistration = ({ registration, onClose, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPackageColor = (pkg) => {
    switch (pkg) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Premium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Standard': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl border">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
          {registration.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">{registration.name}</h3>
          <p className="text-gray-600 flex items-center gap-2">
            <Mail size={16} />
            {registration.email}
          </p>
        </div>
        <button
          onClick={() => onEdit(registration)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-xl border shadow-sm transition-all duration-200"
        >
          <Edit size={18} />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-semibold text-gray-900">{registration.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">{registration.location}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Package</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getPackageColor(registration.package)}`}>
                {registration.package}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Join Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(registration.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Status</p>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(registration.status)}`}>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Member for</p>
          <p className="font-semibold text-gray-900">
            {Math.floor((new Date() - new Date(registration.createdAt)) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}% this month
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={28} className="text-white" />
      </div>
    </div>
  </div>
);

// Main Component
const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [viewRegistration, setViewRegistration] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter, sortBy]);

  useEffect(() => {
    const debouncedFetch = debounce(fetchRegistrations, 500);
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [searchTerm]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/users', {
        params: { search: searchTerm, status: statusFilter, sortBy },
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error('Fetch registrations error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        toast.success('User deleted successfully!');
        fetchRegistrations();
      } catch (error) {
        console.error('Delete user error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Package', 'Status', 'Joined'];
    const rows = registrations.map((reg) => [
      `"${reg.name.replace(/"/g, '""')}"`,
      reg.email,
      reg.phone,
      `"${reg.location.replace(/"/g, '""')}"`,
      reg.package,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'registrations.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: registrations.length,
    active: registrations.filter(r => r.status === 'active').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    thisMonth: registrations.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      
      {/* Modals */}
      <Modal
        isOpen={selectedRegistration !== null || showCreateForm}
        onClose={() => {
          setSelectedRegistration(null);
          setShowCreateForm(false);
        }}
        title={selectedRegistration ? 'Edit User' : 'Create New User'}
      >
        <RegistrationForm
          registration={selectedRegistration}
          onClose={() => {
            setSelectedRegistration(null);
            setShowCreateForm(false);
          }}
          onSuccess={fetchRegistrations}
        />
      </Modal>

      <Modal
        isOpen={viewRegistration !== null}
        onClose={() => setViewRegistration(null)}
        title="User Details"
      >
        {viewRegistration && (
          <ViewRegistration
            registration={viewRegistration}
            onClose={() => setViewRegistration(null)}
            onEdit={(user) => {
              setViewRegistration(null);
              setSelectedRegistration(user);
            }}
          />
        )}
      </Modal>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-lg text-gray-600 mt-2">Manage and monitor your registered users</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Users" 
            value={stats.total} 
            icon={Users} 
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={12}
          />
          <StatsCard 
            title="Active Users" 
            value={stats.active} 
            icon={UserPlus} 
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={8}
          />
          <StatsCard 
            title="Pending" 
            value={stats.pending} 
            icon={AlertCircle} 
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            trend={-3}
          />
          <StatsCard 
            title="This Month" 
            value={stats.thisMonth} 
            icon={Calendar} 
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={15}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="createdAt">Sort by Join Date</option>
                <option value="name">Sort by Name</option>
              </select>
              
              <button
                onClick={exportToCSV}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading users...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first user</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
            >
              Create New User
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900">User</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Contact</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Package</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Joined</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {reg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{reg.name}</p>
                            <p className="text-sm text-gray-500">{reg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            {reg.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            {reg.location}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {reg.package}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reg.status)}`}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewRegistration(reg)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedRegistration(reg)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(reg._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;