import axios from 'axios'

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.endsWith('/login')) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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
  getCustomReport: async (params) => {
    const [profitLossRes, itemSalesRes, itemPurchasesRes] = await Promise.all([
      api.get('/reports/profit-loss', { params }),
      api.get('/reports/item-sales', { params }),
      api.get('/reports/item-purchases', { params })
    ]);
    
    return {
      data: {
        summary: {
           total_sales: profitLossRes.data.revenue,
           total_purchases: profitLossRes.data.cost_of_goods_sold,
           net_profit: profitLossRes.data.profit,
           profit_margin: profitLossRes.data.profit_margin_percent
        },
        item_sales: itemSalesRes.data.map(item => ({
             sale_number: 'SALE',
             sale_date: item.date,
             item_name: item.item_name,
             item_id: item.item_id,
             quantity: parseInt(item.total_quantity),
             unit_price: item.total_quantity > 0 ? (item.total_amount / item.total_quantity) : 0,
             subtotal: parseFloat(item.total_amount)
        })),
        item_purchases: itemPurchasesRes.data.map(item => ({
             purchase_date: item.date,
             item_name: item.item_name,
             item_id: item.item_id,
             quantity: parseInt(item.total_quantity),
             unit_price: item.total_quantity > 0 ? (item.total_amount / item.total_quantity) : 0,
             subtotal: parseFloat(item.total_amount)
        }))
      }
    };
  },  getItemSalesReport: (startDate, endDate) => 
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
