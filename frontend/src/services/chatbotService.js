import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const chatbotService = {
  /**
   * Send message to chatbot
   */
  sendMessage: async (message, sessionId = null, context = {}) => {
    const response = await api.post(API_ENDPOINTS.CHAT, {
      message,
      session_id: sessionId,
      context
    });
    return response.data;
  },

  /**
   * Get chat sessions
   */
  getSessions: async () => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSIONS);
    return response.data;
  },

  /**
   * Get session detail
   */
  getSessionDetail: async (sessionId) => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSION_DETAIL(sessionId));
    return response.data;
  },

  /**
   * Extract task info from session
   */
  extractTaskInfo: async (sessionId) => {
    const response = await api.post(API_ENDPOINTS.EXTRACT_TASK(sessionId));
    return response.data;
  },

  /**
   * Get category suggestion
   */
  suggestCategory: async (description) => {
    const response = await api.post(API_ENDPOINTS.SUGGEST_CATEGORY, {
      description
    });
    return response.data;
  },

  /**
   * Get chatbot statistics
   */
  getStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.CHATBOT_STATS);
    return response.data;
  },
};

export default chatbotService;