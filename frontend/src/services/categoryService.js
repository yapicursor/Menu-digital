import { supabase } from './supabase';

export const categoryService = {
    getAll: async (restaurantId) => {
        let query = supabase.from('categories').select('*').order('name');
        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: restaurant } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single();
                if (restaurant) query = query.eq('restaurant_id', restaurant.id);
            }
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    create: async ({ name }) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single();
        const { data, error } = await supabase.from('categories').insert({ name, restaurant_id: restaurant.id }).select().single();
        if (error) throw error;
        return data;
    },

    update: async (id, { name }) => {
        const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        return { message: 'Catégorie supprimée' };
    },
};
