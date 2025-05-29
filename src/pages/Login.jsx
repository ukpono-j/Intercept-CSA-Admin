import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '@/utils/axios'; // Use @ alias
import colors from '@/utils/colors';

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
      console.log('Attempting login with:', formData.email);
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!', { position: 'top-right' });
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message, { position: 'top-right' });
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