import { supabase } from './supabase';

export const authService = {
    register: async ({ name, email, password, phone, address }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Créer le profil restaurant
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .insert({ user_id: data.user.id, name, phone: phone || null, address: address || null })
            .select()
            .single();
        if (restError) throw restError;

        return { session: data.session, restaurant };
    },

    login: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw { response: { data: { message: 'Identifiants incorrects' } } };

        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
        if (restError) throw restError;

        return { session: data.session, restaurant };
    },

    getMe: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Non connecté');
        const { data, error } = await supabase.from('restaurants').select('*').eq('user_id', user.id).single();
        if (error) throw error;
        return data;
    },

    forgotPassword: async ({ email }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
        return { message: 'Email envoyé' };
    },

    resetPassword: async ({ password }) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        return { message: 'Mot de passe modifié' };
    },

    updateProfile: async ({ name, phone, address }) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('restaurants')
            .update({ name, phone: phone || null, address: address || null })
            .eq('user_id', user.id)
            .select()
            .single();
        if (error) throw error;
        return { restaurant: data };
    },

    updatePassword: async ({ new_password, current_password }) => {
        // Supabase gère ça via resetPasswordForEmail ou updateUser
        const { error } = await supabase.auth.updateUser({ password: new_password });
        if (error) throw { response: { data: { message: error.message } } };
        return { message: 'Mot de passe modifié' };
    },
};
