import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Upload, Eye, Save, Image, X, Plus, Tag, Clock, Grid, List, Edit, Trash2, Menu, Search, Download, FileText, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

// Backend base URLs from environment variables
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || 'http://localhost:3000';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ManageBlog ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Reusable Modal Component (Aligned with Registrations)
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
            aria-label="Close modal"
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

// Get user from JWT token
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload._id || payload.userId || payload.id;
    if (!userId) {
      console.warn('No user ID found in token payload');
      return null;
    }
    return { _id: userId };
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Stats Card Component (Inspired by Registrations)
const StatsCard = ({ title, value, icon: Icon, trend }) => (
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
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-500">
        <Icon size={28} className="text-white" />
      </div>
    </div>
  </div>
);

const ManageBlog = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getUserFromToken(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [editPost, setEditPost] = useState(null);
  const [viewPost, setViewPost] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [error, setError] = useState(null);

  // Debounced fetchBlogs
  const fetchBlogs = useCallback(
    debounce(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/blogs', {
          params: { search: searchTerm, status: selectedFilter, sortBy },
        });
        setBlogPosts(Array.isArray(response.data) ? response.data : []);
        setImageErrors({});
      } catch (error) {
        console.error('Fetch blogs error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        const errorMessage =
          error.response?.status === 408
            ? 'Request timed out while fetching blogs. Please try again.'
            : error.response?.data?.message || 'Failed to fetch blog posts';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [searchTerm, selectedFilter, sortBy]
  );

  useEffect(() => {
    if (!user || !user._id) {
      toast.error('Please log in to manage blog posts');
      navigate('/login');
      return;
    }
    fetchBlogs();
  }, [fetchBlogs, navigate, user]);

  const handleDelete = useCallback(async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axiosInstance.delete(`/blogs/${postId}`);
      toast.success('Blog post deleted successfully!');
      fetchBlogs();
    } catch (error) {
      console.error('Delete blog error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete blog post');
    }
  }, [fetchBlogs]);

  const exportToCSV = () => {
    const headers = ['Title', 'Excerpt', 'Category', 'Status', 'Created At', 'Views', 'Comments'];
    const rows = blogPosts.map((post) => [
      `"${post.title.replace(/"/g, '""')}"`,
      `"${post.excerpt?.replace(/"/g, '""') || ''}"`,
      post.category || 'Uncategorized',
      post.status,
      new Date(post.createdAt).toLocaleDateString(),
      post.views || 0,
      post.comments?.length || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'blog_posts.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <Save size={16} />;
      case 'draft': return <Tag size={16} />;
      case 'scheduled': return <Clock size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const EditPostForm = ({ post, onClose }) => {
    const [formData, setFormData] = useState({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || '',
      tags: Array.isArray(post.tags) ? post.tags : [],
      featured: !!post.featured,
      status: post.status || 'draft',
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
    });
    const [currentTag, setCurrentTag] = useState('');
    const [previewImage, setPreviewImage] = useState(post.image ? `${STATIC_BASE_URL}${post.image}` : null);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          toast.error('Only JPEG or PNG images are allowed');
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
      if (!user || !user._id) {
        toast.error('You must be logged in to update a blog post');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (formData.status === 'scheduled' && !formData.scheduledAt) {
        toast.error('Please select a schedule date for the post');
        return;
      }
      if (formData.scheduledAt && new Date(formData.scheduledAt) <= new Date()) {
        toast.error('Schedule date must be in the future');
        return;
      }
      if (!formData.title || !formData.content) {
        toast.error('Title and content are required');
        return;
      }

      setIsSubmitting(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('excerpt', formData.excerpt);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('tags', JSON.stringify(formData.tags));
        formDataToSend.append('status', formData.status);
        formDataToSend.append('featured', formData.featured);
        if (formData.scheduledAt) {
          formDataToSend.append('scheduledAt', formData.scheduledAt);
        }
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        await axiosInstance.put(`/blogs/${post._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success('Blog post updated successfully!');
        fetchBlogs();
        onClose();
      } catch (error) {
        console.error('Update blog error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        let errorMessage = error.response?.data?.message || 'Failed to update blog post';
        if (error.response?.status === 408) {
          errorMessage = 'Request timed out while updating blog post. Please try again.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login');
        }
        toast.error(errorMessage);
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
            <label className={labelClass}>Post Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a captivating title"
              className={inputClass}
              required
            />
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
              <option value="technology">Technology</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Business</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Cooking</option>
              <option value="health">Health & Fitness</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Write a brief summary to engage readers"
              rows="3"
              className={inputClass}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{formData.excerpt.length}/200</p>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your blog post content here"
              rows="6"
              className={inputClass}
              required
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{formData.content.length}/5000</p>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Featured Image</label>
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl transition-all duration-200 hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                    setImageErrors((prev) => ({ ...prev, [post._id]: previewImage }));
                    console.error(`Failed to load edit preview image: ${previewImage}`);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-90 transition-all duration-200"
                  aria-label="Remove image"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-yellow-500 bg-gradient-to-br from-yellow-50/10 to-gray-50/10 transition-all duration-200">
                  <Image size={24} className="mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium text-gray-700">Upload an image</p>
                  <p className="text-xs text-gray-500">JPEG or PNG, max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload image"
                />
              </label>
            )}
          </div>
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                className={inputClass}
                onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white rounded-xl transition-all duration-200"
                aria-label="Add tag"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={`tag-${index}-${tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 p-1 rounded-full hover:bg-blue-200"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Publication Status</label>
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
            {formData.status === 'scheduled' && (
              <div className="mt-4">
                <label className={labelClass}>Schedule Date *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  className={inputClass}
                  min={new Date().toISOString().slice(0, 16)}
                  required={formData.status === 'scheduled'}
                />
              </div>
            )}
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-200 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">Featured Post</span>
            </label>
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
                <Save size={18} />
                Save Changes
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

  const ViewPost = ({ post, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) {
        toast.error('Comment cannot be empty');
        return;
      }
      setIsSubmittingComment(true);
      try {
        await axiosInstance.post(`/blogs/${post._id}/comments`, { text: commentText });
        toast.success('Comment added successfully!');
        setCommentText('');
        fetchBlogs();
      } catch (error) {
        console.error('Comment error:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to add comment');
      } finally {
        setIsSubmittingComment(false);
      }
    };

    const handleCommentDelete = async (commentId) => {
      if (!window.confirm('Are you sure you want to delete this comment?')) return;
      try {
        await axiosInstance.delete(`/blogs/${post._id}/comments/${commentId}`);
        toast.success('Comment deleted successfully!');
        fetchBlogs();
      } catch (error) {
        console.error('Delete comment error:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to delete comment');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-yellow-50 rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {post.title?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{post.title || 'Untitled'}</h3>
            <p className="text-gray-600 flex items-center gap-2">
              <Tag size={16} />
              {post.category || 'Uncategorized'}
            </p>
          </div>
          <button
            onClick={() => {
              setViewPost(null);
              setEditPost(post);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-xl border shadow-sm transition-all duration-200"
          >
            <Edit size={18} />
          </button>
        </div>
        {post.image ? (
          <div className="mb-4 rounded-xl overflow-hidden relative">
            <img
              src={`${STATIC_BASE_URL}${post.image}`}
              alt={post.title || 'Post'}
              className="w-full h-48 object-cover rounded-xl transition-all duration-200 hover:scale-105"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
                setImageErrors((prev) => ({
                  ...prev,
                  [post._id]: post.image,
                }));
                console.error(`Failed to load view image: ${STATIC_BASE_URL}${post.image}`);
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center bg-gradient-to-br from-yellow-50/10 to-gray-50/10">
            <Image size={24} className="mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-600">No image available</p>
          </div>
        )}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{post.excerpt || 'No excerpt available'}</p>
          <div className="prose max-w-none text-gray-900">
            {(post.content || '').split('\n').map((paragraph, index) => (
              <p key={`content-${index}`} className="mb-3 text-sm">
                {paragraph || <br />}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900">{post.category || 'Uncategorized'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-semibold text-gray-900">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No date'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p className="font-semibold text-gray-900">{post.views || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comments</p>
                  <p className="font-semibold text-gray-900">{post.comments?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(post.status)}`}>
                {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Unknown'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Author</p>
              <p className="font-semibold text-gray-900">{post.author?.name || 'Unknown'}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Comments</h3>
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmittingComment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">{commentText.length}/500</p>
            </form>
            {post.comments?.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment, index) => (
                  <div
                    key={`comment-${comment._id || index}`}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">
                          {comment.user?.user?.name || comment.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'No date'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{comment.text || 'No comment text'}</p>
                    </div>
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-all duration-200"
                      aria-label="Delete comment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No comments yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="rounded-2xl p-6 border border-gray-100 shadow-sm bg-white animate-pulse flex flex-col">
      <div className="mb-4 rounded-xl bg-gray-200 h-48"></div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
      <div className="flex gap-2 flex-wrap mt-auto">
        <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter(p => p.status === 'published').length,
    draft: blogPosts.filter(p => p.status === 'draft').length,
    thisMonth: blogPosts.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Blog Post Management</h1>
              <p className="text-lg text-gray-600 mt-2">Manage and monitor your blog posts</p>
            </div>
            <button
              onClick={() => navigate('/create-blog')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              New Post
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Posts"
              value={stats.total}
              icon={FileText}
              trend={10}
            />
            <StatsCard
              title="Published Posts"
              value={stats.published}
              icon={Save}
              trend={5}
            />
            <StatsCard
              title="Drafts"
              value={stats.draft}
              icon={Tag}
              trend={-2}
            />
            <StatsCard
              title="This Month"
              value={stats.thisMonth}
              icon={Calendar}
              trend={15}
            />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="md:flex items-center gap-4">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="views">Sort by Views</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl border border-gray-200 hover:bg-yellow-50 ${viewMode === 'grid' ? 'bg-yellow-100' : ''} transition-all duration-200`}
                    aria-label="Grid view"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl border border-gray-200 hover:bg-yellow-50 ${viewMode === 'list' ? 'bg-yellow-100' : ''} transition-all duration-200`}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {error ? (
            <div className="bg-white rounded-2xl p-16 text-center">
              <p className="text-lg text-red-600">{error}</p>
              <button
                onClick={fetchBlogs}
                className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <FileText size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first post</p>
              <button
                onClick={() => navigate('/create-blog')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
              >
                Create New Post
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {blogPosts.map((post, index) => (
                <div
                  key={post._id || `post-${index}`}
                  className="group rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col"
                >
                  {post.image ? (
                    <div className="mb-4 rounded-xl overflow-hidden relative">
                      <img
                        src={`${STATIC_BASE_URL}${post.image}`}
                        alt={post.title || 'Post'}
                        className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (!imageErrors[post._id]) {
                            e.target.src = '/placeholder-image.jpg';
                            setImageErrors((prev) => ({
                              ...prev,
                              [post._id]: post.image,
                            }));
                            console.error(`Failed to load list image: ${STATIC_BASE_URL}${post.image}`);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl flex items-center justify-center h-40 bg-gradient-to-br from-yellow-50/10 to-gray-50/10">
                      <Image size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                      {getStatusIcon(post.status)}
                      {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Unknown'}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-purple-200">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-yellow-600 transition-colors duration-200 line-clamp-2">
                    {post.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{post.excerpt || 'No excerpt available'}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>By {post.author?.name || 'Unknown'}</span>
                      <span>{post.views || 0} views</span>
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                  {viewMode === 'grid' ? (
                    <div className="flex gap-2 flex-wrap mt-auto">
                      <button
                        onClick={() => setViewPost(post)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white transition-all duration-200"
                        aria-label={`View post ${post.title || 'Untitled'}`}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditPost(post)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white transition-all duration-200"
                        aria-label={`Edit post ${post.title || 'Untitled'}`}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white transition-all duration-200"
                        aria-label={`Delete post ${post.title || 'Untitled'}`}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="relative mt-auto">
                      <button
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white w-full transition-all duration-200"
                        aria-label="Open post actions"
                      >
                        <Menu size={14} />
                        Actions
                      </button>
                      <div className="absolute bottom-full left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-20">
                        <button
                          onClick={() => setViewPost(post)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-yellow-50 text-gray-900 transition-all duration-200"
                          aria-label={`View post ${post.title || 'Untitled'}`}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => setEditPost(post)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-blue-50 text-gray-900 transition-all duration-200"
                          aria-label={`Edit post ${post.title || 'Untitled'}`}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-red-50 text-red-600 transition-all duration-200"
                          aria-label={`Delete post ${post.title || 'Untitled'}`}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Modal isOpen={!!editPost} onClose={() => setEditPost(null)} title="Edit Blog Post" size="large">
            {editPost && <EditPostForm post={editPost} onClose={() => setEditPost(null)} />}
          </Modal>
          <Modal isOpen={!!viewPost} onClose={() => setViewPost(null)} title="View Blog Post" size="large">
            {viewPost && <ViewPost post={viewPost} onClose={() => setViewPost(null)} />}
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ManageBlog;