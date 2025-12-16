import api from './api';

const onboardingService = {
  /**
   * Check if user has completed onboarding
   */
  async checkOnboardingStatus() {
    try {
      const response = await api.get('/recommendations/onboarding/status/');
      return response.data;
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      throw error;
    }
  },

  /**
   * Get all available skills
   */
  async getSkills(params = {}) {
    try {
      const response = await api.get('/recommendations/skills/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw error;
    }
  },

  /**
   * Get all categories for onboarding
   */
  async getCategories() {
    try {
      const response = await api.get('/recommendations/categories/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  /**
   * Complete onboarding
   * @param {Object} data - Onboarding data
   * @param {Array} data.interests - Array of category IDs
   * @param {Array} data.skills - Array of skill IDs
   * @param {Array} data.preferred_task_types - Array of task type preferences
   * @param {Boolean} data.prefer_remote - Remote work preference
   * @param {String} data.preferred_location - Preferred work location
   */
  async completeOnboarding(data) {
    try {
      const response = await api.post('/recommendations/onboarding/', data);
      return response.data;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  /**
   * Get user's current skills
   */
  async getUserSkills() {
    try {
      const response = await api.get('/recommendations/skills/my/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user skills:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    try {
      const response = await api.get('/recommendations/preferences/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      throw error;
    }
  }
};

export default onboardingService;
