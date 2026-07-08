import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    const message = err.response?.data?.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

// ── Auth ──
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/admin/login', { username, password }),
};

// ── Dashboard ──
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
};

// ── Users ──
export const usersApi = {
  list: (params?: any) => api.get('/admin/users', { params }),
  detail: (id: string) => api.get(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
};

// ── Products ──
export const productsApi = {
  list: (params?: any) => api.get('/admin/products', { params }),
  create: (data: any) => api.post('/admin/products', data),
  update: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  remove: (id: string) => api.delete(`/admin/products/${id}`),
};

// ── Orders ──
export const ordersApi = {
  list: (params?: any) => api.get('/admin/orders', { params }),
  detail: (id: string) => api.get(`/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
};

// ── Pets ──
export const petsApi = {
  list: (params?: any) => api.get('/admin/pets', { params }),
};

export default api;
