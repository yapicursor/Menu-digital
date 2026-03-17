const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

function formatOrderItemsText(items) {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map((it) => `- ${it.dish_name} x${it.quantity} (${Number(it.price).toFixed(2)} GNF)`).join('\n');
}

function formatOrderItemsHtml(items) {
    if (!Array.isArray(items) || items.length === 0) return '';
    const rows = items.map((it, i) => `
        <tr style="background:${i % 2 === 0 ? '#1a1a24' : '#22222f'}">
            <td style="padding:10px 14px;color:#f1f0f5;font-size:14px">${it.dish_name}</td>
            <td style="padding:10px 14px;text-align:center;color:#f1f0f5;font-size:14px">${it.quantity}</td>
            <td style="padding:10px 14px;text-align:right;color:#f97316;font-size:14px;font-weight:600">${Number(it.price).toFixed(2)} GNF</td>
            <td style="padding:10px 14px;text-align:right;color:#f97316;font-size:14px;font-weight:600">${(Number(it.price) * Number(it.quantity)).toFixed(2)} GNF</td>
        </tr>
    `).join('');
    return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
        <thead><tr style="background:#f97316">
            <th style="padding:10px 14px;text-align:left;color:#fff;font-size:13px">Plat</th>
            <th style="padding:10px 14px;text-align:center;color:#fff;font-size:13px">Qté</th>
            <th style="padding:10px 14px;text-align:right;color:#fff;font-size:13px">Prix unit.</th>
            <th style="padding:10px 14px;text-align:right;color:#fff;font-size:13px">Sous-total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

async function notifyRestaurantNewOrder({ restaurantEmail, restaurantName, order, items }) {
    if (!restaurantEmail) return;
    try {
        const total = Number(order.total_price).toFixed(2);
        await sendMail({
            to: restaurantEmail,
            subject: `🛎️ Nouvelle commande #${order.id} – ${order.customer_name}`,
            text: `Nouvelle commande #${order.id}\nClient: ${order.customer_name}\nTél: ${order.customer_phone}\nTable: ${order.table_number || '-'}\nTotal: ${total} GNF\n\n${formatOrderItemsText(items)}`,
            html: `<div style="font-family:Arial,sans-serif"><h3>Nouvelle commande #${order.id}</h3><p>Client: <strong>${order.customer_name}</strong></p><p>Tél: ${order.customer_phone}</p><p>Table: ${order.table_number || '—'}</p>${formatOrderItemsHtml(items)}<p><strong>Total: ${total} GNF</strong></p></div>`,
        });
    } catch (err) { console.error('notifyRestaurantNewOrder failed:', err); }
}

async function notifyCustomerOrderConfirmation({ customerEmail, order, items }) {
    if (!customerEmail) return;
    try {
        const total = Number(order.total_price).toFixed(2);
        await sendMail({
            to: customerEmail,
            subject: `✅ Commande #${order.id} confirmée`,
            text: `Bonjour ${order.customer_name},\n\nVotre commande #${order.id} a bien été reçue.\nTotal: ${total} GNF\n\n${formatOrderItemsText(items)}`,
            html: `<div style="font-family:Arial,sans-serif"><h3>Commande #${order.id} reçue ✅</h3><p>Bonjour <strong>${order.customer_name}</strong>,</p>${formatOrderItemsHtml(items)}<p><strong>Total: ${total} GNF</strong></p></div>`,
        });
    } catch (err) { console.error('notifyCustomerOrderConfirmation failed:', err); }
}

async function notifyCustomerStatusChange({ customerEmail, order, items }) {
    if (!customerEmail) return;
    const statusLabels = { en_attente: 'En attente', acceptee: 'Acceptée', refusee: 'Refusée', en_preparation: 'En préparation', terminee: 'Terminée' };
    const label = statusLabels[order.status] || order.status;
    try {
        await sendMail({
            to: customerEmail,
            subject: `Commande #${order.id} : ${label}`,
            text: `Bonjour ${order.customer_name},\n\nStatut de votre commande #${order.id} : ${label}.\nTotal: ${Number(order.total_price).toFixed(2)} GNF`,
            html: `<div style="font-family:Arial,sans-serif"><h3>Commande #${order.id} – ${label}</h3><p>Bonjour <strong>${order.customer_name}</strong>,</p><p>Statut : <strong>${label}</strong></p>${order.cancel_reason ? `<p>Motif : ${order.cancel_reason}</p>` : ''}</div>`,
        });
    } catch (err) { console.error('notifyCustomerStatusChange failed:', err); }
}

// POST /api/orders
const createOrder = async (req, res) => {
    const { customer_name, customer_email, customer_phone, table_number, comment, items, restaurant_id } = req.body;
    if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: 'Données de commande incomplètes' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let total = 0;
        const enrichedItems = [];
        for (const item of items) {
            const dishResult = await client.query('SELECT * FROM dishes WHERE id = $1 AND available = true', [item.dish_id]);
            if (dishResult.rows.length === 0) {
                await client.query('ROLLBACK');
                client.release();
                return res.status(400).json({ message: `Plat ID ${item.dish_id} indisponible` });
            }
            const dish = dishResult.rows[0];
            const qty = Number(item.quantity) || 1;
            total += Number(dish.price) * qty;
            enrichedItems.push({ dish, qty });
        }

        const ridRaw = Number(restaurant_id);
        const rid = Number.isFinite(ridRaw) && ridRaw > 0 ? ridRaw : enrichedItems[0].dish.restaurant_id;

        const restResult = await client.query('SELECT id FROM restaurants WHERE id = $1', [rid]);
        if (restResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ message: `Restaurant introuvable (id: ${rid})` });
        }

        const orderResult = await client.query(
            `INSERT INTO orders (customer_name, customer_email, customer_phone, table_number, comment, status, total_price, restaurant_id)
             VALUES ($1, $2, $3, $4, $5, 'en_attente', $6, $7) RETURNING id`,
            [customer_name, customer_email || null, customer_phone, table_number || null, comment || null, total, rid]
        );
        const orderId = orderResult.rows[0].id;

        for (const { dish, qty } of enrichedItems) {
            await client.query(
                'INSERT INTO order_items (order_id, dish_id, dish_name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
                [orderId, dish.id, dish.name, qty, dish.price]
            );
        }

        await client.query('COMMIT');
        client.release();

        const orderRows = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        const itemRows = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

        try {
            const rRows = await pool.query('SELECT name, email FROM restaurants WHERE id = $1', [rid]);
            const r = rRows.rows[0];
            await notifyRestaurantNewOrder({ restaurantEmail: r?.email, restaurantName: r?.name, order: orderRows.rows[0], items: itemRows.rows });
        } catch (e) { console.error('Restaurant notification skipped:', e); }

        try {
            await notifyCustomerOrderConfirmation({ customerEmail: orderRows.rows[0]?.customer_email, order: orderRows.rows[0], items: itemRows.rows });
        } catch (e) { console.error('Customer confirmation skipped:', e); }

        res.status(201).json({ ...orderRows.rows[0], items: itemRows.rows });
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        try { client.release(); } catch (e) { /* ignore */ }
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Commande introuvable' });
        const items = await pool.query(
            'SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = $1',
            [req.params.id]
        );
        res.json({ ...result.rows[0], items: items.rows });
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// GET /api/customer/orders - Get orders by customer phone
const getCustomerOrders = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Numéro de téléphone requis' });
    
    try {
        const orders = await pool.query(
            'SELECT * FROM orders WHERE customer_phone = $1 ORDER BY created_at DESC',
            [phone]
        );
        
        const result = await Promise.all(orders.rows.map(async (order) => {
            const items = await pool.query(
                'SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = $1',
                [order.id]
            );
            return { ...order, items: items.rows };
        }));
        
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// GET /api/admin/orders
const getAdminOrders = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = 'SELECT * FROM orders WHERE restaurant_id = $1';
        const params = [req.restaurant.id];
        let i = 2;
        if (status) { query += ` AND status = $${i++}`; params.push(status); }
        if (date) { query += ` AND DATE(created_at) = $${i++}`; params.push(date); }
        query += ' ORDER BY created_at DESC';
        const orders = await pool.query(query, params);
        const result = await Promise.all(orders.rows.map(async (order) => {
            const items = await pool.query(
                'SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = $1',
                [order.id]
            );
            return { ...order, items: items.rows };
        }));
        res.json(result);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/accept
const acceptOrder = async (req, res) => {
    try {
        await pool.query("UPDATE orders SET status = 'acceptee' WHERE id = $1 AND restaurant_id = $2", [req.params.id, req.restaurant.id]);
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: order.rows[0]?.customer_email, order: order.rows[0], items: items.rows });
        res.json(order.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/cancel
const cancelOrder = async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Motif d\'annulation requis' });
    try {
        await pool.query("UPDATE orders SET status = 'refusee', cancel_reason = $1 WHERE id = $2 AND restaurant_id = $3", [reason, req.params.id, req.restaurant.id]);
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: order.rows[0]?.customer_email, order: order.rows[0], items: items.rows });
        res.json(order.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['en_attente', 'acceptee', 'refusee', 'en_preparation', 'terminee'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Statut invalide' });
    try {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2 AND restaurant_id = $3', [status, req.params.id, req.restaurant.id]);
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: order.rows[0]?.customer_email, order: order.rows[0], items: items.rows });
        res.json(order.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// DELETE /api/admin/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 AND restaurant_id = $2', [req.params.id, req.restaurant.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Commande introuvable' });
        res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const rid = req.restaurant.id;
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = $2", [rid, today]);
        const pending = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = $1 AND status = 'en_attente'", [rid]);
        const revenue = await pool.query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = $2 AND status != 'refusee'", [rid, today]);
        const dishCount = await pool.query("SELECT COUNT(*) AS count FROM dishes WHERE restaurant_id = $1", [rid]);
        const totalOrders = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = $1", [rid]);
        const totalRevenue = await pool.query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = $1 AND status != 'refusee'", [rid]);
        const monthOrders = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())", [rid]);
        const lastMonthOrders = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW() - INTERVAL '1 month') AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month')", [rid]);
        const monthRevenue = await pool.query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW()) AND status != 'refusee'", [rid]);
        const lastMonthRevenue = await pool.query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW() - INTERVAL '1 month') AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month') AND status != 'refusee'", [rid]);
        const ordersByDay = await pool.query("SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total_price),0) AS revenue FROM orders WHERE restaurant_id = $1 AND DATE(created_at) >= NOW() - INTERVAL '14 days' AND status != 'refusee' GROUP BY DATE(created_at) ORDER BY DATE(created_at)", [rid]);
        const statusBreakdown = await pool.query("SELECT status, COUNT(*) AS count FROM orders WHERE restaurant_id = $1 GROUP BY status", [rid]);
        const topDishes = await pool.query("SELECT oi.dish_name AS name, SUM(oi.quantity) AS quantity, COALESCE(SUM(oi.quantity * oi.price),0) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.restaurant_id = $1 AND o.status != 'refusee' GROUP BY oi.dish_name ORDER BY quantity DESC LIMIT 5", [rid]);

        const mo = Number(monthOrders.rows[0].count);
        const lmo = Number(lastMonthOrders.rows[0].count);
        const mr = Number(monthRevenue.rows[0].total);
        const lmr = Number(lastMonthRevenue.rows[0].total);

        res.json({
            todayOrders: todayOrders.rows[0].count,
            pendingOrders: pending.rows[0].count,
            todayRevenue: revenue.rows[0].total,
            dishCount: dishCount.rows[0].count,
            totalOrders: totalOrders.rows[0].count,
            totalRevenue: totalRevenue.rows[0].total,
            monthOrders: mo,
            lastMonthOrders: lmo,
            monthRevenue: mr,
            lastMonthRevenue: lmr,
            ordersMoMPercent: lmo > 0 ? ((mo - lmo) / lmo) * 100 : null,
            revenueMoMPercent: lmr > 0 ? ((mr - lmr) / lmr) * 100 : null,
            ordersByDay: ordersByDay.rows,
            statusBreakdown: statusBreakdown.rows,
            topDishes: topDishes.rows,
        });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

module.exports = { createOrder, getOrderById, getCustomerOrders, getAdminOrders, acceptOrder, cancelOrder, updateOrderStatus, deleteOrder, getStats };
