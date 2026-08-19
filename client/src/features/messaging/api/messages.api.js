import api from '@/config/api';

/**
 * Fetch user's conversation threads.
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @returns {Promise<{ conversations: Array, pagination: object }>}
 */
export async function fetchConversations(params = {}) {
  const response = await api.get('/messages/conversations', { params });
  return {
    conversations: response.data?.data?.conversations || [],
    pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch messages in a specific conversation thread.
 * @param {string} conversationId
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 * @returns {Promise<{ messages: Array, conversation: object, pagination: object }>}
 */
export async function fetchConversationMessages(conversationId, params = {}) {
  const response = await api.get(`/messages/conversations/${conversationId}`, { params });
  return {
    messages: response.data?.data?.messages || [],
    conversation: response.data?.conversation || response.data?.data?.conversation,
    pagination: response.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

/**
 * Start a new conversation with a permissible recipient.
 * @param {object} payload
 * @param {string} payload.recipientUserId
 * @param {string} payload.initialMessage
 * @param {string} [payload.title]
 * @param {Array} [payload.attachments]
 * @returns {Promise<{ conversation: object, message: object }>}
 */
export async function startConversation(payload) {
  const response = await api.post('/messages/conversations', payload);
  return response.data?.data;
}

/**
 * Send a reply message in an existing conversation.
 * @param {string} conversationId
 * @param {object} payload
 * @param {string} payload.content
 * @param {Array} [payload.attachments]
 * @returns {Promise<object>}
 */
export async function sendMessage(conversationId, payload) {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, payload);
  return response.data?.data?.message;
}
