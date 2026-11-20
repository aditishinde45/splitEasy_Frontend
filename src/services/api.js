import axios from 'axios';

// Backend server URL for calling backend routes
export const serverURL = import.meta.env.VITE_SERVER_URL || 'https://spliteasy-0l64.onrender.com';

// Create configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${serverURL}/api`,
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spliteasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred. Please try again.',
      errors: error.response?.data?.errors,
    };
    return Promise.reject(customError);
  }
);

export default api;
