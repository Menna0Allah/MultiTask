import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const authService = {
  /**
   * Login user
   */
  login: async (usernameOrEmail, password) => {
    const payload = { password };
    if (usernameOrEmail.includes('@')) {
      payload.email = usernameOrEmail;
    } else {
      payload.username = usernameOrEmail;
    }

    const response = await api.post(API_ENDPOINTS.LOGIN, payload);
    const { access, refresh, user } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, access, refresh };
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    
    // Auto login after registration
    if (response.data.tokens) {
      const { access, refresh } = response.data.tokens;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post(API_ENDPOINTS.LOGOUT, {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.patch(API_ENDPOINTS.PROFILE, profileData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
    return response.data;
  },

  /**
   * Check username availability
   */
  checkUsername: async (username) => {
    const response = await api.get(`${API_ENDPOINTS.CHECK_USERNAME}?username=${username}`);
    return response.data.available;
  },

  /**
   * Check email availability
   */
  checkEmail: async (email) => {
    const response = await api.get(`${API_ENDPOINTS.CHECK_EMAIL}?email=${email}`);
    return response.data.available;
  },
};

export default authService;