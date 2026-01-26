import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const taskService = {
  /**
   * Get all tasks with filters
   */
  getTasks: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.TASKS, { params });
    return response.data;
  },

  /**
   * Get task by ID
   */
  getTask: async (id) => {
    const response = await api.get(API_ENDPOINTS.TASK_DETAIL(id));
    return response.data;
  },

  /**
   * Create new task
   */
  createTask: async (taskData) => {
    const response = await api.post(API_ENDPOINTS.TASKS_CREATE, taskData);
    return response.data;
  },

  /**
   * Update task
   */
  updateTask: async (id, taskData) => {
    const response = await api.patch(API_ENDPOINTS.TASK_UPDATE(id), taskData);
    return response.data;
  },

  /**
   * Delete task
   */
  deleteTask: async (id) => {
    const response = await api.delete(API_ENDPOINTS.TASK_DELETE(id));
    return response.data;
  },

  /**
   * Get my tasks
   */
  getMyTasks: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.MY_TASKS, { params });
    return response.data;
  },

  /**
   * Complete task
   */
  completeTask: async (id) => {
    const response = await api.post(API_ENDPOINTS.TASK_COMPLETE(id));
    return response.data;
  },

  /**
   * Cancel task
   */
  cancelTask: async (id) => {
    const response = await api.post(API_ENDPOINTS.TASK_CANCEL(id));
    return response.data;
  },

  /**
   * Apply to task
   */
  applyToTask: async (id, applicationData) => {
    const response = await api.post(API_ENDPOINTS.TASK_APPLY(id), applicationData);
    return response.data;
  },

  /**
   * Get task applications
   */
  getTaskApplications: async (id) => {
    const response = await api.get(API_ENDPOINTS.TASK_APPLICATIONS(id));
    return response.data;
  },

  /**
   * Get my applications
   */
  getMyApplications: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.MY_APPLICATIONS, { params });
    return response.data;
  },

  /**
   * Accept application
   */
  acceptApplication: async (id) => {
    const response = await api.post(API_ENDPOINTS.APPLICATION_ACCEPT(id));
    return response.data;
  },

  /**
   * Reject application
   */
  rejectApplication: async (id) => {
    const response = await api.post(API_ENDPOINTS.APPLICATION_REJECT(id));
    return response.data;
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  /**
   * Create review
   */
  createReview: async (taskId, reviewData) => {
    const response = await api.post(API_ENDPOINTS.TASK_REVIEW(taskId), reviewData);
    return response.data;
  },

  /**
   * Get task reviews
   */
  getTaskReviews: async (taskId) => {
    const response = await api.get(API_ENDPOINTS.TASK_REVIEWS(taskId));
    return response.data;
  },

  /**
   * Get user reviews
   */
  getUserReviews: async (username) => {
    const response = await api.get(API_ENDPOINTS.USER_REVIEWS(username));
    return response.data;
  },

  /**
   * Get task statistics
   */
  getStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.TASK_STATISTICS);
    return response.data;
  },

  /**
   * Get my task statistics
   */
  getMyStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.MY_TASK_STATISTICS);
    return response.data;
  },

  /**
   * Get saved tasks
   */
  getSavedTasks: async () => {
    const response = await api.get('/tasks/saved/');
    return response.data;
  },

  /**
   * Toggle save/unsave task
   */
  toggleSaveTask: async (taskId, note = '') => {
    const response = await api.post(`/tasks/${taskId}/save/`, { note });
    return response.data;
  },

  /**
   * Check if task is saved
   */
  checkTaskSaved: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/saved/`);
    return response.data;
  },

  /**
   * Unsave a task
   */
  unsaveTask: async (taskId) => {
    const response = await api.delete(`/tasks/saved/${taskId}/`);
    return response.data;
  },
};

export default taskService;