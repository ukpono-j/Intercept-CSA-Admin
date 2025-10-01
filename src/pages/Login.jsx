import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import { Eye, EyeOff, Shield, ArrowRight, User, Lock } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage('');

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful! Welcome back!', {
          position: 'bottom-center',
          autoClose: 2000,
        });
        setLoginMessage('Login successful! Welcome back!');

        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      let message = 'Login failed. Please try again.';

      if (error.response) {
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
        message = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        message = error.message || 'An unexpected error occurred.';
      }

      toast.error(message, {
        position: 'bottom-center',
        autoClose: 5000,
      });
      setLoginMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 login">
      <ToastContainer position="bottom-center" />
      
      {/* Background decorative element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-[#FECB0A]/20 to-[#F97316]/20 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Login form card */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-xl bg-[#2A8E9D] text-white shadow-md mb-4">
              <Shield size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] mb-2">
              Admin Login
            </h1>
            <p className="text-sm text-[#1F2937] leading-relaxed">
              Sign in to access your dashboard and manage content.
            </p>
          </div>

          {/* Login message */}
          {loginMessage && (
            <div className={`mb-4 p-3 rounded-lg border ${loginMessage.includes('successful') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${loginMessage.includes('successful') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{loginMessage}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2 flex items-center text-[#1F2937]">
                <User size={16} className="mr-2 text-[#FECB0A]" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#2A8E9D] focus:border-[#F97316] focus:ring-0 transition-all duration-300 bg-white text-[#1F2937]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2 flex items-center text-[#1F2937]">
                <Lock size={16} className="mr-2 text-[#FECB0A]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-[#2A8E9D] focus:border-[#F97316] focus:ring-0 transition-all duration-300 bg-white text-[#1F2937]"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1F2937] hover:text-[#FECB0A] transition-colors duration-300"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2A8E9D] text-white font-semibold py-3 rounded-full hover:bg-[#2A8E9D]/90 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#1F2937]">
              Secure access to your admin dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;