import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const userService = {
  /**
   * Get users list with optional filters
   */
  getUsers: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.USERS, { params });
    return response.data;
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username) => {
    const response = await api.get(`${API_ENDPOINTS.USERS}${username}/`);
    return response.data;
  },

  /**
   * Get freelancers list
   */
  getFreelancers: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.USERS, {
      params: { ...params, user_type: 'freelancer' }
    });
    return response.data;
  },

  /**
   * Get user portfolio items
   */
  getUserPortfolio: async (username) => {
    const response = await api.get(`${API_ENDPOINTS.USERS}${username}/portfolio/`);
    return response.data;
  },

  /**
   * Search users
   */
  searchUsers: async (query, params = {}) => {
    const response = await api.get(API_ENDPOINTS.USERS, {
      params: { search: query, ...params }
    });
    return response.data;
  },
};

export default userService;