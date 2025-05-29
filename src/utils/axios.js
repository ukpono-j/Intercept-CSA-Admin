import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://intercept-csa-backend.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  withCredentials: true, // Ensure credentials are sent
});

axiosRetry(axiosInstance, {
  retries: 2,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status === 408 || !error.response,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Axios request:', {
      url: config.baseURL + config.url,
      method: config.method,
      headers: config.headers,
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
  (response) => response,
  (error) => {
    console.error('Axios response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;