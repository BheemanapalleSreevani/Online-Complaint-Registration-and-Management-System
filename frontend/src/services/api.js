import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
});

// Request Interceptor to attach token dynamically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin-login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
};

export const complaintsAPI = {
  create: (formData) =>
    API.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => API.get('/complaints', { params }),
  getDetails: (id) => API.get(`/complaints/${id}`),
  updateStatus: (id, formData) =>
    API.put(`/complaints/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  closeOrReopen: (id, data) => API.put(`/complaints/${id}/close-reopen`, data),
  getReceiptUrl: (id) => `http://localhost:5000/api/complaints/${id}/receipt`,
};

export const categoriesAPI = {
  getActive: () => API.get('/categories'),
  getAll: () => API.get('/categories/all'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const commentsAPI = {
  add: (data) => API.post('/comments', data),
  getByComplaint: (complaintId) => API.get(`/comments/complaint/${complaintId}`),
};

export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

export const feedbackAPI = {
  submit: (data) => API.post('/feedback', data),
  getByComplaint: (complaintId) => API.get(`/feedback/complaint/${complaintId}`),
};

export const dashboardAPI = {
  getCitizenStats: () => API.get('/dashboard/citizen'),
  getAdminStats: () => API.get('/dashboard/admin'),
};

export const adminAPI = {
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleBlock: (id) => API.put(`/admin/users/${id}/block`),
  changeRole: (id, data) => API.put(`/admin/users/${id}/role`, data),
};

export const reportsAPI = {
  getExportUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `http://localhost:5000/api/reports/export?${query}`;
  },
};

export default API;
