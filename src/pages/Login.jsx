import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '@/utils/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // console.log('=== LOGIN ATTEMPT ===');
      // console.log('Email:', formData.email);
      // console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
      // console.log('Axios base URL:', axiosInstance.defaults.baseURL);
      
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // console.log('=== LOGIN SUCCESS ===');
      // console.log('Full response:', response);
      // console.log('Response data:', response.data);
      // console.log('Token received:', !!response.data.token);
      
      // Check if we actually got a token
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        // console.log('Token stored in localStorage');
        
        toast.success('Login successful!', { 
          position: 'top-right',
          autoClose: 2000
        });
        
        // Add a small delay before navigation to let user see the success message
        setTimeout(() => {
          // console.log('Navigating to /admin');
          navigate('/admin');
        }, 1000);
      } else {
        console.error('No token in response:', response.data);
        throw new Error('No token received from server');
      }
      
    } catch (error) {
      // console.log('=== LOGIN ERROR ===');
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error config:', error.config);
      console.error('Request URL that failed:', error.config?.baseURL + error.config?.url);
      
      let message = 'Login failed. Please try again.';
      
      if (error.response) {
        // console.log('Server responded with error status:', error.response.status);
        // console.log('Server error data:', error.response.data);
        
        // Server responded with error status
        switch (error.response.status) {
          case 400:
            message = error.response.data?.message || 'Invalid email or password format.';
            break;
          case 401:
            message = error.response.data?.message || 'Invalid email or password.';
            break;
          case 403:
            message = 'Access forbidden. Please check your credentials.';
            break;
          case 404:
            message = 'Login endpoint not found. Please contact support.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = error.response.data?.message || `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        // console.log('Network error - no response received');
        message = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        // console.log('Other error:', error.message);
        message = error.message || 'An unexpected error occurred.';
      }
      
      toast.error(message, { 
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center">
      <ToastContainer />
      <div
        className="rounded-lg p-8 border max-w-md w-full"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-medium)',
        }}
      >
        <h1
          className="text-3xl font-semibold mb-6 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          Admin Login
        </h1>
        
        {/* Debug info */}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div>API URL: {import.meta.env.VITE_API_URL || 'undefined'}</div>
          <div>Base URL: {axiosInstance.defaults.baseURL}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--primary)',
              color: 'var(--text-white)',
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;