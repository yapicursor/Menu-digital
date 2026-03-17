import { supabase } from './supabase';

async function getRestaurantId() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single();
    return data.id;
}

export const orderService = {
    create: async ({ customer_name, customer_email, customer_phone, table_number, comment, items, restaurant_id }) => {
        // Calculer le total
        let total = 0;
        const enrichedItems = [];
        for (const item of items) {
            const { data: dish } = await supabase.from('dishes').select('*').eq('id', item.dish_id).eq('available', true).single();
            if (!dish) throw new Error(`Plat ID ${item.dish_id} indisponible`);
            const qty = Number(item.quantity) || 1;
            total += Number(dish.price) * qty;
            enrichedItems.push({ dish, qty });
        }

        const { data: order, error } = await supabase.from('orders').insert({
            customer_name, customer_email: customer_email || null,
            customer_phone, table_number: table_number || null,
            comment: comment || null, status: 'en_attente',
            total_price: total, restaurant_id,
        }).select().single();
        if (error) throw error;

        for (const { dish, qty } of enrichedItems) {
            await supabase.from('order_items').insert({
                order_id: order.id, dish_id: dish.id,
                dish_name: dish.name, quantity: qty, price: dish.price,
            });
        }

        const { data: orderItems } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        return { ...order, items: orderItems };
    },

    getById: async (id) => {
        const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error) throw error;
        const { data: items } = await supabase.from('order_items').select('*, dishes(image)').eq('order_id', id);
        return { ...order, items: items.map((i) => ({ ...i, image: i.dishes?.image })) };
    },

    getByPhone: async (phone) => {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_phone', phone)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return await Promise.all(orders.map(async (order) => {
            const { data: items } = await supabase
                .from('order_items')
                .select('*, dishes(image)')
                .eq('order_id', order.id);
            return { ...order, items: items?.map((i) => ({ ...i, image: i.dishes?.image })) || [] };
        }));
    },

    getAll: async (params = {}) => {
        const restaurantId = await getRestaurantId();
        let query = supabase.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });
        if (params.status) query = query.eq('status', params.status);
        if (params.date) query = query.gte('created_at', params.date).lt('created_at', params.date + 'T23:59:59');
        const { data: orders, error } = await query;
        if (error) throw error;
        return await Promise.all(orders.map(async (order) => {
            const { data: items } = await supabase.from('order_items').select('*, dishes(image)').eq('order_id', order.id);
            return { ...order, items: items?.map((i) => ({ ...i, image: i.dishes?.image })) || [] };
        }));
    },

    remove: async (id) => {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    accept: async (id) => {
        const { data, error } = await supabase.from('orders').update({ status: 'acceptee' }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    cancel: async (id, reason) => {
        const { data, error } = await supabase.from('orders').update({ status: 'refusee', cancel_reason: reason }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    updateStatus: async (id, status) => {
        const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    getStats: async () => {
        const restaurantId = await getRestaurantId();
        const today = new Date().toISOString().slice(0, 10);

        const { data: allOrders, error: ordersError } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId);
        if (ordersError) throw ordersError;
        
        const orderIds = allOrders ? allOrders.map(o => o.id) : [];
        const { data: allItems, error: itemsError } = await supabase.from('order_items').select('dish_name, quantity, price, order_id').in('order_id', orderIds);
        if (itemsError) throw itemsError;

        const todayOrders = allOrders?.filter((o) => o.created_at?.slice(0, 10) === today) || [];
        const pendingOrders = allOrders?.filter((o) => o.status === 'en_attente') || [];
        const notRefused = allOrders?.filter((o) => o.status !== 'refusee') || [];
        const todayRevenue = todayOrders.filter((o) => o.status !== 'refusee').reduce((s, o) => s + Number(o.total_price), 0);
        const totalRevenue = notRefused.reduce((s, o) => s + Number(o.total_price), 0);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const monthOrders = notRefused.filter((o) => { const d = new Date(o.created_at); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
        const lastMonthOrdersList = notRefused.filter((o) => { const d = new Date(o.created_at); return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; });

        const { data: dishes } = await supabase.from('dishes').select('id').eq('restaurant_id', restaurantId);

        // Calculate orders by day (last 14 days)
        const ordersByDayMap = new Map();
        allOrders?.forEach(order => {
            const date = order.created_at?.slice(0, 10);
            if (date) {
                const existing = ordersByDayMap.get(date) || { orders: 0, revenue: 0 };
                existing.orders += 1;
                existing.revenue += Number(order.total_price || 0);
                ordersByDayMap.set(date, existing);
            }
        });
        
        const ordersByDay = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().slice(0, 10);
            const data = ordersByDayMap.get(dateKey) || { orders: 0, revenue: 0 };
            ordersByDay.push({
                date: dateKey,
                orders: data.orders,
                revenue: data.revenue,
            });
        }

        // Calculate status breakdown
        const statusMap = {};
        allOrders?.forEach(order => {
            const status = order.status || 'unknown';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
            status,
            count,
        }));

        // Calculate top dishes
        const dishMap = {};
        allItems?.forEach(item => {
            const name = item.dish_name || 'Unknown';
            if (!dishMap[name]) {
                dishMap[name] = { name, quantity: 0, revenue: 0 };
            }
            dishMap[name].quantity += Number(item.quantity || 0);
            dishMap[name].revenue += Number(item.price || 0) * Number(item.quantity || 0);
        });
        const topDishes = Object.values(dishMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            todayOrders: todayOrders.length,
            pendingOrders: pendingOrders.length,
            todayRevenue,
            dishCount: dishes?.length || 0,
            totalOrders: allOrders?.length || 0,
            totalRevenue,
            monthOrders: monthOrders.length,
            lastMonthOrders: lastMonthOrdersList.length,
            monthRevenue: monthOrders.reduce((s, o) => s + Number(o.total_price), 0),
            lastMonthRevenue: lastMonthOrdersList.reduce((s, o) => s + Number(o.total_price), 0),
            ordersMoMPercent: lastMonthOrdersList.length > 0 ? ((monthOrders.length - lastMonthOrdersList.length) / lastMonthOrdersList.length) * 100 : null,
            revenueMoMPercent: null,
            ordersByDay,
            statusBreakdown,
            topDishes,
        };
    },
};
