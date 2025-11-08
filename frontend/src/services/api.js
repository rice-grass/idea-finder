import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('🔧 [Frontend] API_BASE_URL:', API_BASE_URL);
console.log('🔧 [Frontend] VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// GitHub API endpoints
export const githubAPI = {
  getTrending: (language = '', days = 7) =>
    api.get('/api/github/trending', { params: { language, days } }),

  analyzeTrends: (language = '', days = 7) =>
    api.get('/api/github/analyze', { params: { language, days } }),

  searchByTopic: (topic) =>
    api.get('/api/github/search', { params: { topic } })
};

// Ideas API endpoints
export const ideasAPI = {
  generateIdeas: (language = '', days = 7) =>
    api.post('/api/ideas/generate', { language, days }),

  analyzeIdea: (ideaDescription) =>
    api.post('/api/ideas/analyze', { ideaDescription })
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
