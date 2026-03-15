import api from './api';

export const dishService = {
    getAll: (params) => api.get('/dishes', { params }).then((r) => r.data),
    getById: (id) => api.get(`/dishes/${id}`).then((r) => r.data),
    create: (formData) =>
        api.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    update: (id, formData) =>
        api.put(`/dishes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    delete: (id) => api.delete(`/dishes/${id}`).then((r) => r.data),
    toggle: (id) => api.patch(`/dishes/${id}/toggle`).then((r) => r.data),
};
