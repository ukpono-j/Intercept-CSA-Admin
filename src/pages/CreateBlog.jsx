import { useState } from 'react';
import { Upload, Eye, Save, Image, X, Plus, Tag, Clock, Calendar, FileText, Send, BookOpen, Users, TrendingUp, Star, AlertCircle } from 'lucide-react';

// Mock axios instance for demo
const axiosInstance = {
  defaults: { baseURL: 'http://localhost:3000/api' },
  post: async (url, data) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: { success: true } }), 1000);
    });
  }
};

// Mock toast for demo
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.log('❌ Error:', message)
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}% this month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    featured: true,
    status: 'published',
    scheduledAt: '',
  });
  const [currentTag, setCurrentTag] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock user data
  const user = { _id: 'user123' };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'Schedule date is required for scheduled posts';
    }
    if (formData.scheduledAt && new Date(formData.scheduledAt) <= new Date()) {
      newErrors.scheduledAt = 'Schedule date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG, or WebP images are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addTag = (e) => {
    if (e) e.preventDefault();
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      if (formData.tags.length >= 10) {
        toast.error('Maximum 10 tags allowed');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('author', user._id);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await axiosInstance.post('/blogs', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Article created successfully!');
      console.log('Navigation to /admin/manage-blog would happen here');
    } catch (error) {
      console.error('Create article error:', error);
      toast.error('Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'advocacy': 'bg-red-100 text-red-800',
      'survivor-stories': 'bg-purple-100 text-purple-800',
      'prevention': 'bg-blue-100 text-blue-800',
      'education': 'bg-green-100 text-green-800',
      'policy': 'bg-orange-100 text-orange-800',
      'community': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Article Preview</h1>
              <p className="text-lg text-gray-600 mt-2">See how your article will appear to readers</p>
            </div>
            <button
              onClick={() => setIsPreview(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <X size={16} />
              Exit Preview
            </button>
          </div>

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {previewImage && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={previewImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {formData.category && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(formData.category)}`}>
                      {formData.category}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </span>
                  {formData.featured && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star size={12} />
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {formData.title || 'Untitled Article'}
                </h1>
                {formData.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {formData.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString()}
                  </span>
                  {formData.status === 'scheduled' && formData.scheduledAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Scheduled for {new Date(formData.scheduledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg max-w-none text-gray-900">
                {formData.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Create Article</h1>
            <p className="text-lg text-gray-600 mt-2">Share impactful content to raise awareness and support your mission</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Publish Article
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Articles" 
            value="24" 
            icon={FileText} 
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={8}
          />
          <StatsCard 
            title="Published" 
            value="18" 
            icon={BookOpen} 
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={12}
          />
          <StatsCard 
            title="Draft Articles" 
            value="6" 
            icon={AlertCircle} 
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            trend={-2}
          />
          <StatsCard 
            title="Total Views" 
            value="1.2k" 
            icon={Users} 
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={25}
          />
        </div>

        <div onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Article Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a compelling title that captures attention"
                className={`${inputClass} ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.title}</p>}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Article Summary</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Write a brief summary that will appear in article previews and search results"
                rows="4"
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-gray-500 mt-2">Optional but recommended for better SEO and user engagement</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Article Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Share your story, insights, or resources here. Write naturally and authentically to connect with your readers."
                rows="16"
                className={`${inputClass} resize-none ${errors.content ? 'border-red-300 focus:ring-red-500' : ''}`}
                required
              />
              {errors.content && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.content}</p>}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">Write clearly and engagingly to maximize impact</p>
                <p className="text-xs text-gray-500">{formData.content.length} characters</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Featured Image</label>
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setImageFile(null);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
                    <Image size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Upload an image</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, or WebP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Select a category</option>
                <option value="advocacy">Advocacy & Awareness</option>
                <option value="survivor-stories">Survivor Stories</option>
                <option value="prevention">Prevention & Safety</option>
                <option value="education">Education & Resources</option>
                <option value="policy">Policy & Legislation</option>
                <option value="community">Community Support</option>
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Tags</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add relevant tags"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={formData.tags.length >= 10}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 p-1 hover:bg-orange-200 rounded-full transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">Maximum 10 tags • Press Enter or click + to add</p>
            </div>

            {/* Publication Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className={labelClass}>Publication Settings</label>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>
                
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Schedule Date *</label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.scheduledAt ? 'border-red-300 focus:ring-red-500' : ''}`}
                      min={new Date().toISOString().slice(0, 16)}
                      required={formData.status === 'scheduled'}
                    />
                    {errors.scheduledAt && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.scheduledAt}</p>}
                  </div>
                )}
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Feature on Homepage</span>
                    <p className="text-xs text-gray-500">Featured articles get more visibility</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-600" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use compelling headlines to grab attention</li>
                <li>• Add relevant tags for better discoverability</li>
                <li>• Include a featured image for social sharing</li>
                <li>• Write a clear summary for better SEO</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;