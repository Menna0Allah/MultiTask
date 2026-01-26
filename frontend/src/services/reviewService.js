import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const reviewService = {
  /**
   * Get reviews for a specific task
   */
  getTaskReviews: async (taskId) => {
    const response = await api.get(API_ENDPOINTS.TASK_REVIEWS(taskId));
    return response.data;
  },

  /**
   * Get reviews for a specific user
   */
  getUserReviews: async (username) => {
    const response = await api.get(API_ENDPOINTS.USER_REVIEWS(username));
    return response.data;
  },

  /**
   * Submit a review for a task
   */
  submitTaskReview: async (taskId, reviewData) => {
    const response = await api.post(API_ENDPOINTS.TASK_REVIEW(taskId), reviewData);
    return response.data;
  },

  /**
   * Mark a review as helpful/not helpful
   */
  markReviewHelpful: async (reviewId, isHelpful) => {
    // This endpoint might need to be added to the backend
    // For now, this is a placeholder
    const response = await api.post(`/reviews/${reviewId}/helpful/`, {
      is_helpful: isHelpful,
    });
    return response.data;
  },
};

export default reviewService;
