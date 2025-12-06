import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const chatbotService = {
  // Chat sessions
  getChatSessions: async () => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSIONS);
    return response.data;
  },

  getChatSession: async (id) => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSION_DETAIL(id));
    return response.data;
  },

  endChatSession: async (sessionId) => {
    const response = await api.post(`/chatbot/sessions/${sessionId}/end/`);
    return response.data;
  },

  // Send chat message
  sendMessage: async (message, sessionId = null) => {
    const response = await api.post(API_ENDPOINTS.CHAT, {
      message,
      session_id: sessionId,
    });
    return response.data;
  },

  // Extract task information from chat
  extractTaskInfo: async (sessionId) => {
    const response = await api.post(API_ENDPOINTS.EXTRACT_TASK(sessionId));
    return response.data;
  },

  // Get category suggestions
  suggestCategory: async (description) => {
    const response = await api.post(API_ENDPOINTS.SUGGEST_CATEGORY, { description });
    return response.data;
  },

  // Rate a message
  rateMessage: async (messageId, rating) => {
    const response = await api.post(`/chatbot/messages/${messageId}/rate/`, { rating });
    return response.data;
  },
};

export default chatbotService;
