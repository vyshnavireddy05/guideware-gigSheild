import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  register: (data) => api.post('/api/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/api/auth/login', data).then((r) => r.data),
}

export const policy = {
  getQuote: (userId) => api.get(`/api/policy/quote/${userId}`).then((r) => r.data),
  purchase: (userId) => api.post('/api/policy/purchase', { userId }).then((r) => r.data),
  getActive: (userId) => api.get(`/api/policy/active/${userId}`).then((r) => r.data),
  getHistory: (userId) => api.get(`/api/policy/history/${userId}`).then((r) => r.data),
}

export const claims = {
  getMyClaims: (userId) => api.get(`/api/claims/my/${userId}`).then((r) => r.data),
  getAllClaims: () => api.get('/api/claims/all').then((r) => r.data),
  processClaim: (claimId, action, reason) =>
    api.post(`/api/claims/process/${claimId}`, { action, reason }).then((r) => r.data),
}

export const disruptions = {
  getActive: (city) => api.get(`/api/disruptions/active/${encodeURIComponent(city)}`).then((r) => r.data),
  mockTrigger: (data) => api.post('/api/disruptions/mock-trigger', data).then((r) => r.data),
  getAll: () => api.get('/api/disruptions/all').then((r) => r.data),
}

export const payouts = {
  getMyPayouts: (userId) => api.get(`/api/payouts/my/${userId}`).then((r) => r.data),
}

export const dashboard = {
  getWorkerDashboard: (userId) => api.get(`/api/dashboard/worker/${userId}`).then((r) => r.data),
  getAdminDashboard: () => api.get('/api/dashboard/admin').then((r) => r.data),
}

export default api
