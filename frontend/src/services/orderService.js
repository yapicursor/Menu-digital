import api from './api';

export const orderService = {
    create: (data) => api.post('/orders', data).then((r) => r.data),
    getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
    // Admin
    getAll: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
    remove: (id) => api.delete(`/admin/orders/${id}`).then((r) => r.data),
    accept: (id) => api.put(`/admin/orders/${id}/accept`).then((r) => r.data),
    cancel: (id, reason) => api.put(`/admin/orders/${id}/cancel`, { reason }).then((r) => r.data),
    updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
    getStats: () => api.get('/admin/stats').then((r) => r.data),
};
