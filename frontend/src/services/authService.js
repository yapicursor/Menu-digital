import api from './api';

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data).then((r) => r.data),
    getMe: () => api.get('/auth/me').then((r) => r.data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
    resetPassword: (data) => api.post('/auth/reset-password', data).then((r) => r.data),
    updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
    updatePassword: (data) => api.put('/auth/password', data).then((r) => r.data),
};
