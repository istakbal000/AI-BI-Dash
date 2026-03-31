import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-bi-dash-qt9v.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response (CORS/network issue)
      console.error('No response from server - check CORS/network');
      return Promise.reject({ response: { data: { error: 'Cannot connect to server. Please check your connection.' } } });
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

/**
 * Send a natural language query to the backend
 */
export const sendQuery = async (query, table = 'sales') => {
  const response = await api.post(`/query`, { query, table });
  return response.data;
};

/**
 * Upload one or more CSV files
 */
export const uploadCSV = async (files, onProgress) => {
  const formData = new FormData();
  
  if (Array.isArray(files)) {
    files.forEach(file => formData.append('file', file));
  } else {
    formData.append('file', files);
  }

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

/**
 * Send a follow-up message with conversation history to refine the current chart
 * @param {string} followUpQuery - the user's follow-up message
 * @param {Array<{query: string, sql: string}>} conversationHistory - previous turns
 * @param {string} table - active table name
 */
export const sendFollowUp = async (followUpQuery, conversationHistory = [], table = 'sales') => {
  const response = await api.post('/followup', { followUpQuery, conversationHistory, table });
  return response.data;
};

/**
 * Run full copilot analysis
 */
export const analyzeWithCopilot = async (params) => {
  const response = await api.post('/copilot/analyze', params);
  return response.data;
};

/**
 * Generate insights only
 */
export const generateInsights = async (params) => {
  const response = await api.post('/copilot/insights', params);
  return response.data;
};

/**
 * Perform root cause analysis
 */
export const analyzeRootCause = async (params) => {
  const response = await api.post('/copilot/root-cause', params);
  return response.data;
};

/**
 * Run what-if simulation
 */
export const runSimulation = async (params) => {
  const response = await api.post('/copilot/simulate', params);
  return response.data;
};

/**
 * Generate recommendations
 */
export const generateRecommendations = async (params) => {
  const response = await api.post('/copilot/recommendations', params);
  return response.data;
};

export default api;

