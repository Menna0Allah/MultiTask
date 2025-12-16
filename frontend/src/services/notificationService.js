import api from './api';

const notificationService = {
  /**
   * Get all notifications
   */
  async getNotifications(params = {}) {
    const { data } = await api.get('/notifications/', { params });
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count/');
    return data.unread_count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    const { data } = await api.post(`/notifications/${notificationId}/read/`);
    return data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const { data } = await api.post('/notifications/mark-all-read/');
    return data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    const { data } = await api.delete(`/notifications/${notificationId}/delete/`);
    return data;
  },

  /**
   * Clear all read notifications
   */
  async clearAll() {
    const { data } = await api.delete('/notifications/clear-all/');
    return data;
  },

  /**
   * Get notification preferences
   */
  async getPreferences() {
    const { data } = await api.get('/notifications/preferences/');
    return data;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    const { data} = await api.patch('/notifications/preferences/', preferences);
    return data;
  },

  /**
   * Connect to notifications WebSocket
   */
  connectWebSocket(token, onMessage) {
    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Notifications WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      // Only log actual errors, not React Strict Mode double-mount closures
      if (ws.readyState !== WebSocket.CLOSED) {
        console.error('Notifications WebSocket error:', error);
      }
    };

    ws.onclose = (event) => {
      // Only log unexpected closures
      if (event.code !== 1000 && event.code !== 1001) {
        console.log('⚠️ Notifications WebSocket disconnected unexpectedly:', event.code, event.reason);
      }
    };

    return ws;
  },
};

export default notificationService;
