import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Upload, Eye, Save, Image, X, Plus, Tag, Clock, Grid, List, Edit, Trash, Menu } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import colors from '../utils/colors';
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
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100 origin-center animate-slide-in"
        style={{
          boxShadow: 'var(--shadow-heavy)',
          border: '1px solid var(--border-light)',
          zIndex: 60,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {children}
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
        console.log('Fetching blogs with params:', { search: searchTerm, status: selectedFilter, sortBy });
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
      toast.success('Blog post deleted sharp sharp!');
      fetchBlogs();
    } catch (error) {
      console.error('Delete blog error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete blog post');
    }
  }, [fetchBlogs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'var(--success)';
      case 'draft':
        return 'var(--warning)';
      case 'scheduled':
        return 'var(--info)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <Save size={16} />;
      case 'draft':
        return <Tag size={16} />;
      case 'scheduled':
        return <Clock size={16} />;
      default:
        return <Tag size={16} />;
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

        toast.success('Blog post updated sharp sharp!');
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

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label
            className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Post Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a captivating title"
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:scale-[1.01]"
            style={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
              background: 'var(--card-bg)',
            }}
            required
          />
        </div>
        <div className="relative">
          <label
            className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Write a brief summary to engage readers"
            rows="3"
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none focus:scale-[1.01]"
            style={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
              background: 'var(--card-bg)',
            }}
            maxLength={200}
          />
          <p className="text-xs text-right mt-1" style={{ color: 'var(--text-secondary)' }}>
            {formData.excerpt.length}/200
          </p>
        </div>
        <div className="relative">
          <label
            className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your blog post content here"
            rows="6"
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none focus:scale-[1.01]"
            style={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
              background: 'var(--card-bg)',
            }}
            required
            maxLength={5000}
          />
          <p className="text-xs text-right mt-1" style={{ color: 'var(--text-secondary)' }}>
            {formData.content.length}/5000
          </p>
        </div>
        <div className="relative">
          <label
            className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Featured Image
          </label>
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg transition-all duration-200 hover:scale-105"
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
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-90 transition-all duration-200 z-10"
                style={{ color: 'var(--text-white)' }}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 hover:border-[var(--primary)] bg-gradient-to-br from-[var(--primary-light)]/10 to-[var(--accent-light)]/10"
                style={{
                  borderColor: 'var(--border-light)',
                }}
              >
                <Image size={24} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Upload an image
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  JPEG or PNG, max 5MB
                </p>
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
        <div className="relative">
          <label
            className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:scale-[1.01]"
            style={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
              background: 'var(--card-bg)',
            }}
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
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:scale-[1.01]"
              style={{
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
                background: 'var(--card-bg)',
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] min-w-[48px] hover:shadow-md"
              style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
              aria-label="Add tag"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={`tag-${index}-${tag}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--text-white)',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 p-1 rounded-full hover:bg-[var(--accent-dark)]"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Publication Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:scale-[1.01]"
            style={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)',
              background: 'var(--card-bg)',
            }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          {formData.status === 'scheduled' && (
            <div className="relative">
              <label
                className="absolute -top-2 left-4 bg-white px-2 text-sm font-medium transition-all duration-200"
                style={{ color: 'var(--text-primary)' }}
              >
                Schedule Date *
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:scale-[1.01]"
                style={{
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  background: 'var(--card-bg)',
                }}
                min={new Date().toISOString().slice(0, 16)}
                required={formData.status === 'scheduled'}
              />
            </div>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-[var(--border-light)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Featured Post
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--primary)]/20"
          style={{
            background: 'var(--primary)',
            color: 'var(--text-white)',
          }}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
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
        toast.success('Comment added sharp sharp!');
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
        toast.success('Comment deleted sharp sharp!');
        fetchBlogs();
      } catch (error) {
        console.error('Delete comment error:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to delete comment');
      }
    };

    return (
      <div className="space-y-4">
        {post.image ? (
          <div className="mb-4 rounded-lg overflow-hidden relative">
            <img
              src={`${STATIC_BASE_URL}${post.image}`}
              alt={post.title || 'Post'}
              className="w-full h-40 object-cover rounded-lg transition-all duration-200 hover:scale-105"
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
          <div className="rounded-lg p-6 text-center bg-gradient-to-br from-[var(--primary-light)]/10 to-[var(--accent-light)]/10">
            <Image size={24} style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No image available</p>
          </div>
        )}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {post.title || 'Untitled'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt || 'No excerpt available'}
          </p>
          <div className="prose max-w-none" style={{ color: 'var(--text-primary)' }}>
            {(post.content || '').split('\n').map((paragraph, index) => (
              <p key={`content-${index}`} className="mb-3 text-sm">
                {paragraph || <br />}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{post.category || 'Uncategorized'}</span>
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}</span>
            <span>{post.views || 0} views</span>
            <span>{post.comments?.length || 0} comments</span>
            <span>By {post.author?.name || 'Unknown'}</span>
            {post.status === 'scheduled' && post.scheduledAt && (
              <span>Scheduled for {new Date(post.scheduledAt).toLocaleString()}</span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Comments
            </h3>
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none focus:scale-[1.01]"
                  style={{
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)',
                    background: 'var(--card-bg)',
                  }}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] disabled:opacity-50 min-w-[80px] hover:shadow-md"
                  style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
                >
                  {isSubmittingComment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
              <p className="text-xs text-right mt-1" style={{ color: 'var(--text-secondary)' }}>
                {commentText.length}/500
              </p>
            </form>
            {post.comments?.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment, index) => (
                  <div
                    key={`comment-${comment._id || index}`}
                    className="flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-[var(--card-bg)]/80"
                    style={{
                      borderColor: 'var(--border-light)',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {comment.user?.user?.name || comment.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'No date'}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {comment.text || 'No comment text'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="p-1 rounded-full hover:bg-red-100 transition-all duration-200 flex-shrink-0 z-10"
                      style={{ color: 'red' }}
                      aria-label="Delete comment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No comments yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="rounded-xl p-6 border shadow-lg bg-[var(--card-bg)] animate-pulse flex flex-col">
      <div className="mb-4 rounded-xl bg-gray-200 h-48"></div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-auto">
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen pt-16 bg-gradient-to-br from-[var(--bg-light)] via-[var(--primary-light)]/20 to-[var(--accent-light)]/20 overflow-hidden">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${(colors.primary || '#FF5733').replace('#', '')}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div
            className="bg-[var(--glass-bg)] backdrop-blur-lg rounded-xl shadow-lg border p-6 sm:p-8 mb-6 sticky top-4 z-20"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Manage Blog Posts
            </h1>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] peer"
                    style={{
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)',
                      background: 'var(--card-bg)',
                    }}
                  />
                  <label
                    htmlFor="search"
                    className="absolute -top-2 left-4 bg-[var(--card-bg)] px-2 text-sm font-medium transition-all duration-200 peer-focus:text-[var(--primary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Search
                  </label>
                </div>
                <div className="relative flex-1 sm:w-40">
                  <select
                    id="filter"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] peer"
                    style={{
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <label
                    htmlFor="filter"
                    className="absolute -top-2 left-4 bg-[var(--card-bg)] px-2 text-sm font-medium transition-all duration-200 peer-focus:text-[var(--primary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Status
                  </label>
                </div>
                <div className="relative flex-1 sm:w-40">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] peer"
                    style={{
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="views">Sort by Views</option>
                  </select>
                  <label
                    htmlFor="sort"
                    className="absolute -top-2 left-4 bg-[var(--card-bg)] px-2 text-sm font-medium transition-all duration-200 peer-focus:text-[var(--primary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Sort
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 border hover:bg-[var(--primary-light)]/20 ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--text-white)]' : 'bg-[var(--card-bg)]'
                    }`}
                  style={{ borderColor: 'var(--border-light)' }}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 border hover:bg-[var(--primary-light)]/20 ${viewMode === 'list' ? 'bg-[var(--primary-light)] text-[var(--text-white)]' : 'bg-[var(--card-bg)]'
                    }`}
                  style={{ borderColor: 'var(--border-light)' }}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
          {error ? (
            <div className="text-center py-8">
              <p className="text-lg text-red-600">{error}</p>
              <button
                onClick={fetchBlogs}
                className="mt-4 px-6 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] hover:shadow-md"
                style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
                aria-label="Retry fetching posts"
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
            <div className="text-center py-8">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                No blog posts found
              </p>
              <button
                onClick={fetchBlogs}
                className="mt-4 px-6 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] hover:shadow-md"
                style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
                aria-label="Retry fetching posts"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {blogPosts.map((post, index) => (
                <div
                  key={post._id || `post-${index}`}
                  className="group rounded-xl p-5 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:rotate-1 bg-[var(--card-bg)] flex flex-col animate-fade-in"
                  style={{ borderColor: 'var(--border-light)', animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--primary)]/50 rounded-xl transition-all duration-300 z-0"></div>
                  {post.image ? (
                    <div className="mb-3 rounded-lg overflow-hidden relative">
                      <img
                        src={`${STATIC_BASE_URL}${post.image}`}
                        alt={post.title || 'Post'}
                        className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
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
                    <div className="mb-3 rounded-lg flex items-center justify-center h-40 bg-gradient-to-br from-[var(--primary-light)]/10 to-[var(--accent-light)]/10">
                      <Image size={24} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: getStatusColor(post.status), color: 'var(--text-white)' }}
                    >
                      {getStatusIcon(post.status)}
                      {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Unknown'}
                    </span>
                    {post.featured && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'var(--accent)', color: 'var(--text-white)' }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-bold mb-2 text-base group-hover:text-[var(--primary)] transition-colors duration-200 line-clamp-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {post.title || 'Untitled'}
                  </h3>
                  <p className="text-xs mb-3 line-clamp-2 flex-grow" style={{ color: 'var(--text-secondary)' }}>
                    {post.excerpt || 'No excerpt available'}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>By {post.author?.name || 'Unknown'}</span>
                      <span>{post.views || 0} views</span>
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                  {viewMode === 'grid' ? (
                    <div className="flex gap-2 flex-wrap mt-auto">
                      <button
                        onClick={() => setViewPost(post)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] min-w-[100px] hover:shadow-md z-10"
                        style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
                        aria-label={`View post ${post.title || 'Untitled'}`}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditPost(post)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--info-dark)] min-w-[100px] hover:shadow-md z-10"
                        style={{ background: 'var(--info)', color: 'var(--text-white)' }}
                        aria-label={`Edit post ${post.title || 'Untitled'}`}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-600 min-w-[100px] hover:shadow-md z-10"
                        style={{ background: 'red', color: 'var(--text-white)' }}
                        aria-label={`Delete post ${post.title || 'Untitled'}`}
                      >
                        <Trash size={14} />
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="relative mt-auto">
                      <button
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] w-full hover:shadow-md z-10"
                        style={{ background: 'var(--primary)', color: 'var(--text-white)' }}
                        aria-label="Open post actions"
                      >
                        <Menu size={14} />
                        Actions
                      </button>
                      <div className="absolute bottom-full left-0 w-full bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-light)] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-20">
                        <button
                          onClick={() => setViewPost(post)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-[var(--primary-light)]/20 transition-all duration-200"
                          style={{ color: 'var(--text-primary)' }}
                          aria-label={`View post ${post.title || 'Untitled'}`}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => setEditPost(post)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-[var(--info-light)]/20 transition-all duration-200"
                          style={{ color: 'var(--text-primary)' }}
                          aria-label={`Edit post ${post.title || 'Untitled'}`}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-red-100 transition-all duration-200"
                          style={{ color: 'red' }}
                          aria-label={`Delete post ${post.title || 'Untitled'}`}
                        >
                          <Trash size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Modal isOpen={!!editPost} onClose={() => setEditPost(null)} title="Edit Blog Post">
            {editPost && <EditPostForm post={editPost} onClose={() => setEditPost(null)} />}
          </Modal>
          <Modal isOpen={!!viewPost} onClose={() => setViewPost(null)} title="View Blog Post">
            {viewPost && <ViewPost post={viewPost} onClose={() => setViewPost(null)} />}
          </Modal>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default ManageBlog;