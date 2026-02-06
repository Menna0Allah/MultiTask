/**
 * Skills Service - Structured Skill Management
 *
 * Professional approach: Work with Skill IDs, not free text
 */

import api from './api';

const skillService = {
  /**
   * Get all available skills (optionally filtered by category)
   */
  getAllSkills: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/recommendations/skills/', { params });
    return response.data;
  },
  /**
   * Backward-compatible alias used by some components
   */
  getSkills: async (category = null) => {
    return skillService.getAllSkills(category);
  },

  /**
   * Get current user's skills (with proficiency levels)
   */
  getUserSkills: async () => {
    const response = await api.get('/recommendations/skills/my/');
    return response.data;
  },

  /**
   * Update user's skills using structured Skill IDs
   *
   * @param {Array<number>} skillIds - Array of skill IDs
   * @returns {Promise} Response with updated skills
   */
  updateUserSkills: async (skillIds) => {
    const response = await api.post('/recommendations/skills/update/', {
      skill_ids: skillIds
    });
    return response.data;
  }
};

export default skillService;
