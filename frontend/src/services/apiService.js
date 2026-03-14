import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Send a natural language query to the backend
 */
export const sendQuery = async (query, table = 'sales') => {
  const response = await api.post(`/query`, { query, table });
  return response.data;
};

/**
 * Upload a CSV file
 */
export const uploadCSV = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

/**
 * Get database schema
 */
export const getSchema = async () => {
  const response = await api.get(`/schema`);
  return response.data;
};
