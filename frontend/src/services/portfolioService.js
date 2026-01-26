import api from './api';

const portfolioService = {
  /**
   * Get all portfolio items for the authenticated user
   */
  getMyPortfolio: async () => {
    const response = await api.get('/auth/portfolio/');
    return response.data;
  },

  /**
   * Get portfolio items for a specific user
   * @param {string} username - Username of the user
   */
  getUserPortfolio: async (username) => {
    const response = await api.get(`/auth/users/${username}/portfolio/`);
    return response.data;
  },

  /**
   * Get a single portfolio item
   * @param {number} id - Portfolio item ID
   */
  getPortfolioItem: async (id) => {
    const response = await api.get(`/auth/portfolio/${id}/`);
    return response.data;
  },

  /**
   * Create a new portfolio item
   * @param {FormData} data - Portfolio item data (supports file upload)
   */
  createPortfolioItem: async (data) => {
    const response = await api.post('/auth/portfolio/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update a portfolio item
   * @param {number} id - Portfolio item ID
   * @param {FormData} data - Updated portfolio item data
   */
  updatePortfolioItem: async (id, data) => {
    const response = await api.patch(`/auth/portfolio/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a portfolio item
   * @param {number} id - Portfolio item ID
   */
  deletePortfolioItem: async (id) => {
    const response = await api.delete(`/auth/portfolio/${id}/`);
    return response.data;
  },
};

export default portfolioService;
