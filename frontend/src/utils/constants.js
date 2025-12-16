export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const USER_ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  BOTH: 'both',
  ADMIN: 'admin',
};

export const TASK_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TASK_TYPE = {
  PHYSICAL: 'Physical',
  DIGITAL: 'Digital',
  BOTH: 'Both',
  ONE_TIME: 'One Time',
  RECURRING: 'Recurring',
};

export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

// utils/constants.js
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  PROFILE: '/auth/profile/',
  CHANGE_PASSWORD: '/auth/profile/change-password/',
  TOKEN_REFRESH: '/auth/token/refresh/',
  CHECK_USERNAME: '/auth/check-username/',
  CHECK_EMAIL: '/auth/check-email/',
  GOOGLE_LOGIN: '/auth/google/login/',

  // Tasks
  TASKS: '/tasks/',
  TASKS_CREATE: '/tasks/create/',
  MY_TASKS: '/tasks/my-tasks/',
  TASK_DETAIL: (id) => `/tasks/${id}/`,
  TASK_UPDATE: (id) => `/tasks/${id}/update/`,
  TASK_DELETE: (id) => `/tasks/${id}/delete/`,
  TASK_COMPLETE: (id) => `/tasks/${id}/complete/`,
  TASK_CANCEL: (id) => `/tasks/${id}/cancel/`,
  TASK_APPLY: (id) => `/tasks/${id}/apply/`,
  TASK_APPLICATIONS: (id) => `/tasks/${id}/applications/`,
  MY_APPLICATIONS: '/tasks/my-applications/',
  APPLICATION_ACCEPT: (id) => `/tasks/applications/${id}/accept/`,
  APPLICATION_REJECT: (id) => `/tasks/applications/${id}/reject/`,
  CATEGORIES: '/tasks/categories/',
  MY_TASK_STATISTICS: '/tasks/my-statistics/',
  TASK_STATISTICS: '/tasks/statistics/',

  // Recommendations
  RECOMMENDED_TASKS: '/recommendations/tasks/',
  RECOMMENDED_FREELANCERS: (taskId) => `/recommendations/freelancers/${taskId}/`,
  USER_PREFERENCES: '/recommendations/preferences/',

  // Chatbot
  CHAT: '/chatbot/chat/',
  CHAT_SESSIONS: '/chatbot/sessions/',
  CHAT_SESSION_DETAIL: (id) => `/chatbot/sessions/${id}/`,
  EXTRACT_TASK: (id) => `/chatbot/sessions/${id}/extract-task/`,
  SUGGEST_CATEGORY: '/chatbot/suggest-category/',

  // Messaging
  CONVERSATIONS: '/messaging/conversations/',
  CONVERSATION_CREATE: '/messaging/conversations/create/',
  CONVERSATION_DETAIL: (id) => `/messaging/conversations/${id}/`,
  CONVERSATION_MESSAGES: (id) => `/messaging/conversations/${id}/messages/`,
  SEND_MESSAGE: (id) => `/messaging/conversations/${id}/messages/send/`,
  MARK_AS_READ: (id) => `/messaging/conversations/${id}/mark-read/`,

  // Reviews, stats, etc.
  TASK_REVIEW: (id) => `/tasks/${id}/review/`,
  TASK_REVIEWS: (id) => `/tasks/${id}/reviews/`,
  USER_REVIEWS: (username) => `/tasks/users/${username}/reviews/`,
};

export const CATEGORIES_ICONS = {
  'Cleaning & Home Services': '🧹',
  'Tutoring & Education': '📚',
  'Design & Creative': '🎨',
  'Programming & Tech': '💻',
  'Writing & Translation': '✍️',
  'Marketing & Business': '📊',
  'Personal Assistant': '👔',
  'Other Services': '🔧',
};

export const TASK_STATUS_COLORS = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const APPLICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
};