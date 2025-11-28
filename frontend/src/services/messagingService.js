import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const messagingService = {
  /**
   * Get all conversations
   */
  getConversations: async () => {
    const response = await api.get(API_ENDPOINTS.CONVERSATIONS);
    return response.data;
  },

  /**
   * Get conversation detail
   */
  getConversation: async (id) => {
    const response = await api.get(API_ENDPOINTS.CONVERSATION_DETAIL(id));
    return response.data;
  },

  /**
   * Create new conversation
   */
  createConversation: async (participantId, taskId = null, initialMessage = '') => {
    const response = await api.post(API_ENDPOINTS.CONVERSATION_CREATE, {
      participant_id: participantId,
      task_id: taskId,
      initial_message: initialMessage
    });
    return response.data;
  },

  /**
   * Get messages in conversation
   */
  getMessages: async (conversationId) => {
    const response = await api.get(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
    return response.data;
  },

  /**
   * Send message
   */
  sendMessage: async (conversationId, content, messageType = 'TEXT') => {
    const response = await api.post(API_ENDPOINTS.SEND_MESSAGE(conversationId), {
      content,
      message_type: messageType
    });
    return response.data;
  },

  /**
   * Mark conversation as read
   */
  markAsRead: async (conversationId) => {
    const response = await api.post(API_ENDPOINTS.MARK_AS_READ(conversationId));
    return response.data;
  },

  /**
   * Get messaging statistics
   */
  getStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.MESSAGING_STATS);
    return response.data;
  },
};

export default messagingService;