import { supabase } from './supabase';

async function uploadImage(file) {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('dishes').upload(filename, file);
    if (error) throw error;
    const { data } = supabase.storage.from('dishes').getPublicUrl(filename);
    return data.publicUrl;
}

async function getRestaurantId() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single();
    return data.id;
}

export const dishService = {
    getAll: async (params = {}) => {
        let query = supabase.from('dishes').select('*, categories(name)').order('created_at', { ascending: false });
        if (params.restaurant_id) query = query.eq('restaurant_id', params.restaurant_id);
        if (params.category_id) query = query.eq('category_id', params.category_id);
        const { data, error } = await query;
        if (error) throw error;
        return data.map((d) => ({ ...d, category_name: d.categories?.name }));
    },

    getById: async (id) => {
        const { data, error } = await supabase.from('dishes').select('*, categories(name)').eq('id', id).single();
        if (error) throw error;
        return { ...data, category_name: data.categories?.name };
    },

    create: async (formData) => {
        const restaurantId = await getRestaurantId();
        const file = formData.get('image');
        const imageUrl = file && file.size > 0 ? await uploadImage(file) : null;
        const { data, error } = await supabase.from('dishes').insert({
            name: formData.get('name'),
            description: formData.get('description') || null,
            price: Number(formData.get('price')),
            image: imageUrl,
            available: formData.get('available') !== 'false',
            category_id: formData.get('category_id') ? Number(formData.get('category_id')) : null,
            restaurant_id: restaurantId,
        }).select('*, categories(name)').single();
        if (error) throw error;
        return { ...data, category_name: data.categories?.name };
    },

    update: async (id, formData) => {
        const file = formData.get('image');
        const updates = {
            name: formData.get('name'),
            description: formData.get('description') || null,
            price: Number(formData.get('price')),
            available: formData.get('available') !== 'false',
            category_id: formData.get('category_id') ? Number(formData.get('category_id')) : null,
        };
        if (file && file.size > 0) updates.image = await uploadImage(file);
        const { data, error } = await supabase.from('dishes').update(updates).eq('id', id).select('*, categories(name)').single();
        if (error) throw error;
        return { ...data, category_name: data.categories?.name };
    },

    delete: async (id) => {
        const { error } = await supabase.from('dishes').delete().eq('id', id);
        if (error) throw error;
        return { message: 'Plat supprimé' };
    },

    toggle: async (id) => {
        const { data: dish } = await supabase.from('dishes').select('available').eq('id', id).single();
        const { data, error } = await supabase.from('dishes').update({ available: !dish.available }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },
};
