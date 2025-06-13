import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import { Eye, EyeOff, Shield, ArrowRight, Sparkles, Lock, User } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          position: 'top-right',
          autoClose: 2000,
        });
        setLoginMessage('Login successful! Welcome back!');

        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        console.error('No token in response:', response.data);
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error config:', error.config);
      console.error('Request URL that failed:', error.config?.baseURL + error.config?.url);

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
        position: 'top-right',
        autoClose: 5000,
      });
      setLoginMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/30 flex items-center justify-center p-8">
      <ToastContainer />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Centered Login form card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-purple-500/20 opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-200/50 p-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg mb-6">
                <Shield size={32} />
              </div>
              
              <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Welcome back!
              </h1>
              <p className="text-slate-600 font-light leading-relaxed mb-3">
                Sign in to access your dashboard and manage your content.
              </p>
              
              <div className="text-center mb-6">
                <div className="text-orange-400 text-sm font-semibold">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-slate-600 text-xl font-mono mt-1">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Debug info */}
            {/* <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50/50 border border-slate-200">
              <div className="flex items-center mb-2">
                <Sparkles size={16} className="text-orange-500 mr-2" />
                <span className="text-sm font-semibold text-slate-700">Connection Info</span>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div>API URL: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{import.meta.env.VITE_API_URL || 'undefined'}</span></div>
                <div>Base URL: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{axiosInstance.defaults.baseURL}</span></div>
              </div>
            </div> */}

            {/* Login message */}
            {loginMessage && (
              <div className={`mb-6 p-4 rounded-2xl border ${loginMessage.includes('successful') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${loginMessage.includes('successful') ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium">{loginMessage}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-3 flex items-center text-slate-700">
                  <User size={16} className="mr-2 text-orange-500" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 bg-white/50 backdrop-blur-sm text-slate-700"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password field */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-3 flex items-center text-slate-700">
                  <Lock size={16} className="mr-2 text-orange-500" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-slate-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 bg-white/50 backdrop-blur-sm text-slate-700"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
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
                </div>
              </button>
            </form>

            {/* Footer text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Secure access to your admin dashboard
              </p>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-600 font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full opacity-60 animate-bounce delay-0"></div>
        <div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full opacity-60 animate-bounce delay-300"></div>
        <div className="absolute -bottom-4 -right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-40 animate-bounce delay-700"></div>
      </div>
    </div>
  );
};

export default Login;