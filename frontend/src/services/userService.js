import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const userService = {
  /**
   * Get users list
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
};

export default userService;