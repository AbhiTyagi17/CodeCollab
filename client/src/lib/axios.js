import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',   // ← Make sure this is correct
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;