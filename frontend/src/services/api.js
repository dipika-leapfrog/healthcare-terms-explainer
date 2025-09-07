import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Initialize system
export const initializeSystem = async () => {
  try {
    const response = await api.post('/initialize');
    return response.data;
  } catch (error) {
    throw new Error('Failed to initialize system');
  }
};

// Ask a question
export const askQuestion = async (question, mode = 'standard') => {
  try {
    const response = await api.post('/ask', {
      question,
      mode,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to get answer');
  }
};

// Compare terms
export const compareTerms = async (term1, term2) => {
  try {
    const response = await api.post('/compare', {
      term1,
      term2,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to compare terms');
  }
};

// Upload document
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload document');
  }
};

// Get documents list
export const getDocuments = async () => {
  try {
    const response = await api.get('/documents');
    return response.data;
  } catch (error) {
    throw new Error('Failed to get documents');
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Health check failed');
  }
};

export default api;
