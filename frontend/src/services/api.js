import axios from 'axios';

// Determine API base URL based on environment
// Development: use Vite proxy (empty string)
// Production: use environment variable or backend URL
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || 'https://your-backend-app.onrender.com'
  : '';

console.log('🔧 [Frontend] Environment:', import.meta.env.MODE);
console.log('🔧 [Frontend] Production:', import.meta.env.PROD);
console.log('🔧 [Frontend] API_BASE_URL:', API_BASE_URL || '(using Vite proxy)');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
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
  // Get student levels
  getStudentLevels: () =>
    api.get('/api/ideas/student-levels'),

  // Get developer types
  getDeveloperTypes: () =>
    api.get('/api/ideas/developer-types'),

  // Get tech stacks for a developer type
  getTechStacks: (devType) =>
    api.get(`/api/ideas/tech-stacks/${devType}`),

  // Generate ideas (enhanced version with developer profile)
  generateIdeas: (params = {}) => {
    // Support both old and new formats
    // Old: { language, days }
    // New: { devType, techStacks, days, studentLevel }
    const payload = {
      language: params.language || '',
      days: params.days || 7,
      devType: params.devType || null,
      techStacks: params.techStacks || [],
      studentLevel: params.studentLevel || 'university'
    };
    return api.post('/api/ideas/generate', payload);
  },

  analyzeIdea: (ideaDescription) =>
    api.post('/api/ideas/analyze', { ideaDescription }),

  // Refine an existing idea
  refineIdea: (idea, refinementType, context = {}) =>
    api.post('/api/ideas/refine', {
      idea,
      refinementType,
      devType: context.devType || 'fullstack',
      techStacks: context.techStacks || [],
      studentLevel: context.studentLevel || 'university'
    }),

  // Chat with AI about selected ideas
  chatWithIdeas: (ideas, message, conversationHistory = []) =>
    api.post('/api/ideas/chat', {
      ideas,
      message,
      conversationHistory
    })
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
