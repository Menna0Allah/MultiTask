import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const recommendationService = {
  /**
   * Get recommended tasks for freelancer
   */
  getRecommendedTasks: async (limit = 10) => {
    const response = await api.get(API_ENDPOINTS.RECOMMENDED_TASKS, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get recommended freelancers for task
   */
  getRecommendedFreelancers: async (taskId, limit = 10) => {
    const response = await api.get(API_ENDPOINTS.RECOMMENDED_FREELANCERS(taskId), {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get user preferences
   */
  getPreferences: async () => {
    const response = await api.get(API_ENDPOINTS.USER_PREFERENCES);
    return response.data;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences) => {
    const response = await api.patch(API_ENDPOINTS.USER_PREFERENCES, preferences);
    return response.data;
  },
};

export default recommendationService;