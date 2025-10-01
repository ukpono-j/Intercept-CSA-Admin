import { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, Edit, Trash2, Plus, X, ChevronDown, MoreVertical, AlertCircle, Mic, Calendar } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import debounce from 'lodash/debounce';

// Modal Component
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

// Podcast Form Component
const PodcastForm = ({ podcast, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: podcast?.title || '',
    excerpt: podcast?.excerpt || '',
    description: podcast?.description || '',
    category: podcast?.category || '',
    tags: podcast?.tags?.join(',') || '',
    status: podcast?.status || 'draft',
    featured: podcast?.featured || false,
    author: podcast?.author?._id || '',
    duration: podcast?.duration || '',
    scheduledAt: podcast?.scheduledAt ? new Date(podcast.scheduledAt).toISOString().slice(0, 16) : '',
    image: null,
    audio: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setAuthors(response.data);
      } catch (error) {
        toast.error('Failed to fetch authors');
      }
    };
    fetchAuthors();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.author) newErrors.author = 'Author is required';
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'Schedule date is required for scheduled podcasts';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'tags') {
        data.append(key, JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      } else if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    try {
      if (podcast) {
        const response = await axiosInstance.put(`/podcast/${podcast._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Podcast updated:', response.data); // LOG UPDATED DATA
        console.log('New updatedAt:', response.data.updatedAt); // LOG UPDATE TIMESTAMP
        toast.success('Podcast updated successfully!');
      } else {
        const response = await axiosInstance.post('/podcast', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Podcast created:', response.data); // LOG CREATED DATA
        toast.success('Podcast created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error.response?.data); // BETTER ERROR LOGGING
      toast.error(error.response?.data?.message || 'Failed to save podcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter podcast title"
            className={`${inputClass} ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className={labelClass}>Author *</label>
          <select
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className={`${inputClass} ${errors.author ? 'border-red-300 focus:ring-red-500' : ''}`}
          >
            <option value="">Select author</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>{author.name}</option>
            ))}
          </select>
          {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Excerpt</label>
          <input
            type="text"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Enter short excerpt"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter podcast description"
            className={`${inputClass} min-h-[100px] ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select category</option>
            <option value="advocacy">Advocacy</option>
            <option value="survivor-stories">Survivor Stories</option>
            <option value="prevention">Prevention</option>
            <option value="education">Education</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g. mental health, awareness"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Schedule Date</label>
          <input
            type="datetime-local"
            name="scheduledAt"
            value={formData.scheduledAt}
            onChange={handleInputChange}
            className={`${inputClass} ${errors.scheduledAt ? 'border-red-300 focus:ring-red-500' : ''}`}
            disabled={formData.status !== 'scheduled'}
          />
          {errors.scheduledAt && <p className="text-red-500 text-sm mt-1">{errors.scheduledAt}</p>}
        </div>

        <div>
          <label className={labelClass}>Duration (e.g., 30:15)</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 30:15"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Featured</label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
            className="h-5 w-5 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
          />
        </div>

        <div>
          <label className={labelClass}>Cover Image</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className={inputClass}
          />
          {podcast?.image && <p className="text-sm text-gray-500 mt-1">Current: {podcast.image}</p>}
        </div>

        <div>
          <label className={labelClass}>Audio File (MP3)</label>
          <input
            type="file"
            name="audio"
            accept="audio/mp3"
            onChange={handleFileChange}
            className={inputClass}
          />
          {podcast?.audioUrl && <p className="text-sm text-gray-500 mt-1">Current: {podcast.audioUrl}</p>}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Mic size={18} />
              {podcast ? 'Update Podcast' : 'Create Podcast'}
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

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
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
const PodcastAdmin = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchPodcasts();
  }, [statusFilter, sortBy]);

  useEffect(() => {
    const debouncedFetch = debounce(fetchPodcasts, 500);
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [searchTerm]);

  const fetchPodcasts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/podcast', {
        params: { search: searchTerm, status: statusFilter, sortBy },
      });
      setPodcasts(response.data);
    } catch (error) {
      console.error('Fetch podcasts error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch podcasts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this podcast?')) {
      try {
        await axiosInstance.delete(`/podcast/${id}`);
        toast.success('Podcast deleted successfully!');
        fetchPodcasts();
      } catch (error) {
        console.error('Delete podcast error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete podcast');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: podcasts.length,
    published: podcasts.filter(p => p.status === 'published').length,
    scheduled: podcasts.filter(p => p.status === 'scheduled').length,
    thisMonth: podcasts.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length,
  };

  return (
    <div className="podcasts min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Modals */}
      <Modal
        isOpen={selectedPodcast !== null || showCreateForm}
        onClose={() => {
          setSelectedPodcast(null);
          setShowCreateForm(false);
        }}
        title={selectedPodcast ? 'Edit Podcast' : 'Create New Podcast'}
        size="large"
      >
        <PodcastForm
          podcast={selectedPodcast}
          onClose={() => {
            setSelectedPodcast(null);
            setShowCreateForm(false);
          }}
          onSuccess={fetchPodcasts}
        />
      </Modal>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Podcast Management</h1>
            <p className="text-lg text-gray-600 mt-2">Manage and organize podcast episodes</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            New Podcast
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Podcasts"
            value={stats.total}
            icon={Mic}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={12}
          />
          <StatsCard
            title="Published"
            value={stats.published}
            icon={PlayCircle}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={8}
          />
          <StatsCard
            title="Scheduled"
            value={stats.scheduled}
            icon={Calendar}
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
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="md:flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="views">Sort by Views</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading podcasts...</p>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Mic size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No podcasts found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first podcast</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
            >
              Create New Podcast
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900">Podcast</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Category</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Created</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Views</th>
                    <th className="text-left p-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {podcasts.map((podcast) => (
                    <tr key={podcast._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {podcast.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{podcast.title}</p>
                            <p className="text-sm text-gray-500">{podcast.author?.name || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {podcast.category || 'None'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(podcast.status)}`}>
                          {podcast.status.charAt(0).toUpperCase() + podcast.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {new Date(podcast.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-gray-600">{podcast.views}</td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPodcast(podcast)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit Podcast"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(podcast._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Podcast"
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

export default PodcastAdmin;