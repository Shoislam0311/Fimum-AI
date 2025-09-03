import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  return api.post('/token', formData);
};

export const signup = (email, password) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  return api.post('/signup', formData);
};

// Chat endpoints
export const sendMessage = (message, conversationId = null, imageUrl = null) => {
  return api.post('/chat', {
    message,
    conversation_id: conversationId,
    image_url: imageUrl
  });
};

// File upload
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// User preferences
export const getUserPreferences = () => {
  return api.get('/preferences');
};

export const updateUserPreferences = (preferences) => {
  return api.post('/preferences', preferences);
};

// Chat history
export const getChatHistory = () => {
  return api.get('/history');
};

export const getConversation = (conversationId) => {
  return api.get(`/history/${conversationId}`);
};

export const deleteConversation = (conversationId) => {
  return api.delete(`/history/${conversationId}`);
};

export const deleteMessage = (conversationId, messageId) => {
  return api.delete(`/history/${conversationId}/message/${messageId}`);
};

export default api;