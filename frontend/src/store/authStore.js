import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

const useAuthStore = create(
    persist(
        (set) => ({
            session: null,
            restaurant: null,
            isAuthenticated: false,

            setSession: (session, restaurant) => {
                set({ session, restaurant, isAuthenticated: !!session });
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ session: null, restaurant: null, isAuthenticated: false });
            },

            setRestaurant: (restaurant) => set({ restaurant }),
        }),
        { name: 'auth-storage' }
    )
);

export default useAuthStore;
