import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔍 Frontend API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.baseURL + config.url,
    data: config.data,
    headers: config.headers
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  signup: async (name, email, password) => {
    const response = await api.post('/signup', { name, email, password });
    return response.data;
  }
};

export const sensorService = {
  getSensorData: async () => {
    const response = await api.get('/sensor');
    return response.data;
  },
};

export const controlService = {
  getControlData: async () => {
    const response = await api.get('/control');
    return response.data;
  },
  
  updateControl: async (data) => {
    const response = await api.post('/control', data);
    return response.data;
  },
};
