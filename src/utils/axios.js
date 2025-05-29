import axios from 'axios';
import axiosRetry from 'axios-retry';

// Get the API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://intercept-csa-backend.onrender.com/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  withCredentials: true,
});

axiosRetry(axiosInstance, {
  retries: 2,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status === 408 || !error.response,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: config.baseURL + config.url,
      method: config.method,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization ? 'Bearer [TOKEN]' : 'None'
      },
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      hasToken: !!response.data.token
    });
    return response;
  },
  (error) => {
    console.error('Axios response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url
    });
    
    // Only redirect to login if:
    // 1. We get a 401 AND
    // 2. We're not already on the login page AND
    // 3. The request is not to the login endpoint
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') &&
        !error.config?.url?.includes('/auth/login')) {
      
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;