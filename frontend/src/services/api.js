import axios from 'axios'

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
}

export const contactService = {
  getAll: (type) => api.get(`/contacts?type=${type}`),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
}

export const itemService = {
  getAll: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  checkStock: (id) => api.get(`/items/${id}/stock`),
}

export const purchaseService = {
  getAll: () => api.get('/purchases'),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
}

export const saleService = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
}

export const reportService = {
  getDashboard: () => api.get('/reports/dashboard'),
  // Standardized custom report method used in Reports.jsx
  getCustomReport: (params) => api.get('/reports/profit-loss', { params }),
  getItemSalesReport: (startDate, endDate) => 
    api.get(`/reports/item-sales?start_date=${startDate}&end_date=${endDate}`),
  getItemPurchaseReport: (startDate, endDate) => 
    api.get(`/reports/item-purchases?start_date=${startDate}&end_date=${endDate}`),
  getProfitLoss: (startDate, endDate) => 
    api.get(`/reports/profit-loss?start_date=${startDate}&end_date=${endDate}`),
  getStockReport: () => api.get('/reports/stock'),
}

// Aliasing dashboardService for compatibility with Dashboard.jsx
export const dashboardService = {
  getStats: () => reportService.getDashboard()
}

export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  // Placeholder if backend reset is missing, or point to a valid maintenance route
  resetData: () => api.post('/settings'), 
}

export default api
