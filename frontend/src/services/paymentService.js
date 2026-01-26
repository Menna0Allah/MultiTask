import api from './api';

const paymentService = {
  // ==================== Stripe Connect ====================

  /**
   * Create Stripe Connect account for freelancer
   */
  createConnectAccount: async () => {
    const response = await api.post('/payments/connect/create/');
    return response.data;
  },

  /**
   * Get Stripe onboarding link
   */
  getOnboardingLink: async () => {
    const response = await api.post('/payments/connect/onboarding/');
    return response.data;
  },

  /**
   * Get Stripe account status
   */
  getConnectStatus: async () => {
    const response = await api.get('/payments/connect/status/');
    return response.data;
  },

  // ==================== Payment Intents ====================

  /**
   * Create payment intent for escrow
   * @param {number} applicationId - The accepted application ID
   */
  createPaymentIntent: async (applicationId) => {
    const response = await api.post('/payments/intents/create/', {
      application_id: applicationId
    });
    return response.data;
  },

  /**
   * Confirm payment intent
   * @param {string} paymentIntentId - Stripe payment intent ID
   */
  confirmPaymentIntent: async (paymentIntentId) => {
    const response = await api.post(`/payments/intents/${paymentIntentId}/confirm/`);
    return response.data;
  },

  // ==================== Escrow Management ====================

  /**
   * Get escrow details
   * @param {string} escrowId - Escrow ID
   */
  getEscrow: async (escrowId) => {
    const response = await api.get(`/payments/escrow/${escrowId}/`);
    return response.data;
  },

  /**
   * Release escrow to freelancer
   * @param {string} escrowId - Escrow ID
   */
  releaseEscrow: async (escrowId) => {
    const response = await api.post(`/payments/escrow/${escrowId}/release/`);
    return response.data;
  },

  /**
   * Refund escrow to client
   * @param {string} escrowId - Escrow ID
   * @param {string} reason - Refund reason
   * @param {number} amount - Optional partial refund amount
   */
  refundEscrow: async (escrowId, reason, amount = null) => {
    const response = await api.post(`/payments/escrow/${escrowId}/refund/`, {
      reason,
      ...(amount && { amount })
    });
    return response.data;
  },

  // ==================== Wallet ====================

  /**
   * Get user wallet balance
   */
  getWallet: async () => {
    const response = await api.get('/payments/wallet/');
    return response.data;
  },

  /**
   * Get wallet transaction history
   * @param {object} params - Query parameters (page, limit, transaction_type, etc.)
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/payments/wallet/transactions/', { params });
    return response.data;
  },

  // ==================== Withdrawals ====================

  /**
   * Get withdrawal history
   * @param {object} params - Query parameters (page, limit, status, etc.)
   */
  getWithdrawals: async (params = {}) => {
    const response = await api.get('/payments/withdrawals/', { params });
    return response.data;
  },

  /**
   * Create withdrawal request
   * @param {number} amount - Amount to withdraw
   */
  createWithdrawal: async (amount) => {
    const response = await api.post('/payments/withdrawals/create/', { amount });
    return response.data;
  },

  // ==================== Payment Methods ====================

  /**
   * Get saved payment methods
   */
  getPaymentMethods: async () => {
    const response = await api.get('/payments/payment-methods/');
    return response.data;
  },

  /**
   * Add payment method
   * @param {string} paymentMethodId - Stripe payment method ID
   */
  addPaymentMethod: async (paymentMethodId) => {
    const response = await api.post('/payments/payment-methods/create/', {
      payment_method_id: paymentMethodId
    });
    return response.data;
  },

  /**
   * Delete payment method
   * @param {number} id - Payment method ID
   */
  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/payments/payment-methods/${id}/delete/`);
    return response.data;
  },

  /**
   * Set default payment method
   * @param {number} id - Payment method ID
   */
  setDefaultPaymentMethod: async (id) => {
    const response = await api.post(`/payments/payment-methods/${id}/set-default/`);
    return response.data;
  }
};

export default paymentService;
