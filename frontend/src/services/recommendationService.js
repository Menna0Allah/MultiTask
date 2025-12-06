import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const recommendationService = {
  // Get personalized task recommendations for freelancers
  getRecommendedTasks: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.RECOMMENDED_TASKS, { params });
    return response.data;
  },

  // Get recommended freelancers for a specific task (for clients)
  getRecommendedFreelancers: async (taskId) => {
    const response = await api.get(API_ENDPOINTS.RECOMMENDED_FREELANCERS(taskId));
    return response.data;
  },

  // Get/Update user preferences
  getUserPreferences: async () => {
    const response = await api.get(API_ENDPOINTS.USER_PREFERENCES);
    return response.data;
  },

  updateUserPreferences: async (preferences) => {
    const response = await api.post(API_ENDPOINTS.USER_PREFERENCES, preferences);
    return response.data;
  },
};

export default recommendationService;
