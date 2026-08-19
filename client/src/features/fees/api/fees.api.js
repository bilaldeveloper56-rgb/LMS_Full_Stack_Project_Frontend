import api from '@/config/api';

/**
 * Fetch fee categories.
 * @returns {Promise<Array>}
 */
export async function fetchFeeCategories() {
  const response = await api.get('/fees/categories');
  return response.data?.data?.categories || [];
}

/**
 * Create a new fee category.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createFeeCategory(payload) {
  const response = await api.post('/fees/categories', payload);
  return response.data?.data?.category;
}

/**
 * Fetch fee structures with optional filters.
 * @param {object} [params]
 * @returns {Promise<Array>}
 */
export async function fetchFeeStructures(params = {}) {
  const response = await api.get('/fees/structures', { params });
  return response.data?.data?.structures || [];
}

/**
 * Create a fee structure for a class and session.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createFeeStructure(payload) {
  const response = await api.post('/fees/structures', payload);
  return response.data?.data?.structure;
}

/**
 * Fetch fee concessions / discount policies.
 * @returns {Promise<Array>}
 */
export async function fetchFeeConcessions() {
  const response = await api.get('/fees/concessions');
  return response.data?.data?.concessions || [];
}

/**
 * Create a fee concession policy.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createFeeConcession(payload) {
  const response = await api.post('/fees/concessions', payload);
  return response.data?.data?.concession;
}

/**
 * Generate fee invoices for a class or single student.
 * @param {object} payload
 * @returns {Promise<{ invoices: Array, count: number }>}
 */
export async function generateInvoices(payload) {
  const response = await api.post('/fees/invoices/generate', payload);
  return response.data?.data;
}

/**
 * Fetch paginated fee invoices list.
 * @param {object} [params]
 * @returns {Promise<{ invoices: Array, pagination: object }>}
 */
export async function fetchInvoices(params = {}) {
  const response = await api.get('/fees/invoices', { params });
  return {
    invoices: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch a single fee invoice by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchInvoiceById(id) {
  const response = await api.get(`/fees/invoices/${id}`);
  return response.data?.data?.invoice;
}

/**
 * Record a fee payment against an invoice.
 * @param {object} payload
 * @returns {Promise<{ payment: object, invoice: object }>}
 */
export async function recordPayment(payload) {
  const response = await api.post('/fees/payments', payload);
  return response.data?.data;
}

/**
 * Fetch paginated payments list.
 * @param {object} [params]
 * @returns {Promise<{ payments: Array, pagination: object }>}
 */
export async function fetchPayments(params = {}) {
  const response = await api.get('/fees/payments', { params });
  return {
    payments: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch fee defaulters (overdue unpaid invoices).
 * @returns {Promise<Array>}
 */
export async function fetchFeeDefaulters() {
  const response = await api.get('/fees/defaulters');
  return response.data?.data?.defaulters || [];
}

/**
 * Fetch financial KPI overview and collection metrics.
 * @returns {Promise<object>}
 */
export async function fetchFinancialSummary() {
  const response = await api.get('/fees/reports/summary');
  return response.data?.data || response.data;
}
