import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            restaurant: null,
            isAuthenticated: false,

            login: (token, restaurant) => {
                localStorage.setItem('token', token);
                set({ token, restaurant, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ token: null, restaurant: null, isAuthenticated: false });
            },

            setRestaurant: (restaurant) => set({ restaurant }),
        }),
        { name: 'auth-storage' }
    )
);

export default useAuthStore;
