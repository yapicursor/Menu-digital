import api from './api';

export const categoryService = {
    getAll: (restaurantId) =>
        api.get('/categories', { params: restaurantId ? { restaurant_id: restaurantId } : {} }).then((r) => r.data),
    create: (data) => api.post('/categories', data).then((r) => r.data),
    update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
    delete: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};
