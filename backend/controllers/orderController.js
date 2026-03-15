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
    return `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;margin:12px 0">
            <thead>
                <tr style="background:#f97316">
                    <th style="padding:10px 14px;text-align:left;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Plat</th>
                    <th style="padding:10px 14px;text-align:center;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Qté</th>
                    <th style="padding:10px 14px;text-align:right;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Prix unit.</th>
                    <th style="padding:10px 14px;text-align:right;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Sous-total</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function emailWrapper(content) {
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1a1a24;border-radius:16px;border:1px solid #2e2e3e;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 32px">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px">🍽️ Restaurant</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#22222f;border-top:1px solid #2e2e3e;text-align:center">
            <p style="margin:0;font-size:12px;color:#8b8a9b">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function notifyCustomerOrderConfirmation({ customerEmail, order, items }) {
    if (!customerEmail) return;
    try {
        const total = Number(order.total_price).toFixed(2);
        const html = emailWrapper(`
            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#f1f0f5">Commande <span style="color:#f97316">#${order.id}</span> reçue ✅</p>
            <p style="margin:0 0 20px;font-size:14px;color:#8b8a9b">Bonjour <strong style="color:#f1f0f5">${order.customer_name}</strong>, votre commande a bien été enregistrée.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
                <tr>
                    <td style="padding:8px 12px;background:#22222f;border-radius:8px 8px 0 0;border:1px solid #2e2e3e;color:#8b8a9b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Téléphone</td>
                    <td style="padding:8px 12px;background:#22222f;border-radius:8px 8px 0 0;border:1px solid #2e2e3e;color:#f1f0f5;font-size:14px">${order.customer_phone}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;background:#1a1a24;border-radius:0 0 8px 8px;border:1px solid #2e2e3e;border-top:none;color:#8b8a9b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Table / Livraison</td>
                    <td style="padding:8px 12px;background:#1a1a24;border-radius:0 0 8px 8px;border:1px solid #2e2e3e;border-top:none;color:#f1f0f5;font-size:14px">${order.table_number || '—'}</td>
                </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#8b8a9b;text-transform:uppercase;letter-spacing:0.05em">Articles commandés</p>
            ${formatOrderItemsHtml(items)}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px">
                <tr>
                    <td style="padding:12px 14px;background:#f97316;border-radius:8px;text-align:right">
                        <span style="font-size:13px;color:rgba(255,255,255,0.8)">Total : </span>
                        <span style="font-size:18px;font-weight:700;color:#fff">${total} GNF</span>
                    </td>
                </tr>
            </table>
        `);
        await sendMail({
            to: customerEmail,
            subject: `✅ Commande #${order.id} confirmée – ${order.customer_name}`,
            text: `Bonjour ${order.customer_name},\n\nVotre commande #${order.id} a bien été reçue.\n\nTable/Livraison: ${order.table_number || '-'}\nTotal: ${total} GNF\n\nArticles:\n${formatOrderItemsText(items)}`,
            html,
        });
    } catch (err) {
        console.error('notifyCustomerOrderConfirmation failed:', err);
    }
}

async function notifyRestaurantNewOrder({ restaurantEmail, restaurantName, order, items }) {
    if (!restaurantEmail) return;
    try {
        const total = Number(order.total_price).toFixed(2);
        const html = emailWrapper(`
            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#f1f0f5">Nouvelle commande <span style="color:#f97316">#${order.id}</span></p>
            <p style="margin:0 0 20px;font-size:14px;color:#8b8a9b">Reçue pour <strong style="color:#f1f0f5">${restaurantName || ''}</strong></p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
                <tr>
                    <td style="padding:8px 12px;background:#22222f;border-radius:8px 8px 0 0;border:1px solid #2e2e3e;color:#8b8a9b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Client</td>
                    <td style="padding:8px 12px;background:#22222f;border-radius:8px 8px 0 0;border:1px solid #2e2e3e;color:#f1f0f5;font-size:14px;font-weight:600">${order.customer_name}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;background:#1a1a24;border:1px solid #2e2e3e;border-top:none;color:#8b8a9b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Téléphone</td>
                    <td style="padding:8px 12px;background:#1a1a24;border:1px solid #2e2e3e;border-top:none;color:#f1f0f5;font-size:14px">${order.customer_phone}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;background:#22222f;border-radius:0 0 8px 8px;border:1px solid #2e2e3e;border-top:none;color:#8b8a9b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Table / Livraison</td>
                    <td style="padding:8px 12px;background:#22222f;border-radius:0 0 8px 8px;border:1px solid #2e2e3e;border-top:none;color:#f1f0f5;font-size:14px">${order.table_number || '—'}</td>
                </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#8b8a9b;text-transform:uppercase;letter-spacing:0.05em">Articles commandés</p>
            ${formatOrderItemsHtml(items)}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px">
                <tr>
                    <td style="padding:12px 14px;background:#f97316;border-radius:8px;text-align:right">
                        <span style="font-size:13px;color:rgba(255,255,255,0.8)">Total : </span>
                        <span style="font-size:18px;font-weight:700;color:#fff">${total} GNF</span>
                    </td>
                </tr>
            </table>
        `);
        await sendMail({
            to: restaurantEmail,
            subject: `🛎️ Nouvelle commande #${order.id} – ${order.customer_name}`,
            text: `Nouvelle commande #${order.id}\n\nClient: ${order.customer_name}\nTéléphone: ${order.customer_phone}\nTable/Livraison: ${order.table_number || '-'}\nTotal: ${total} GNF\n\nArticles:\n${formatOrderItemsText(items)}`,
            html,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('notifyRestaurantNewOrder failed:', err);
    }
}

async function notifyCustomerStatusChange({ customerEmail, order, items }) {
    if (!customerEmail) return;

    const statusLabels = {
        en_attente: 'En attente',
        acceptee: 'Acceptée',
        refusee: 'Refusée',
        en_preparation: 'En préparation',
        terminee: 'Terminée',
    };

    const label = statusLabels[order.status] || order.status;
    const refusedExtra = order.status === 'refusee' && order.cancel_reason ? `\nMotif: ${order.cancel_reason}` : '';
    const refusedExtraHtml = order.status === 'refusee' && order.cancel_reason
        ? `<div style="margin-top:10px;color:#b91c1c"><strong>Motif:</strong> ${order.cancel_reason}</div>`
        : '';

    try {
        await sendMail({
            to: customerEmail,
            subject: `Mise à jour de votre commande #${order.id} : ${label}`,
            text: `Bonjour ${order.customer_name},\n\nLe statut de votre commande #${order.id} a changé: ${label}.${refusedExtra}\n\nTotal: ${Number(order.total_price).toFixed(2)} GNF\n\nArticles:\n${formatOrderItemsText(items)}\n`,
            html: `
                <div style="font-family:Arial,sans-serif">
                    <h3 style="margin:0 0 10px">Commande #${order.id} – ${label}</h3>
                    <div style="margin:0 0 6px">Bonjour <strong>${order.customer_name}</strong>,</div>
                    <div style="margin:0 0 10px">Le statut de votre commande vient d’être mis à jour : <strong>${label}</strong>.</div>
                    ${refusedExtraHtml}
                    <div style="margin:12px 0"><strong>Total:</strong> ${Number(order.total_price).toFixed(2)} GNF</div>
                    <div style="font-weight:700;margin-top:10px">Articles</div>
                    ${formatOrderItemsHtml(items)}
                </div>
            `,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('notifyCustomerStatusChange failed:', err);
    }
}

// POST /api/orders  (client)
const createOrder = async (req, res) => {
    console.log('[ORDER] createOrder appelé, body:', JSON.stringify(req.body));
    const { customer_name, customer_email, customer_phone, table_number, comment, items, restaurant_id } = req.body;
    if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: 'Données de commande incomplètes' });

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Calculate total
        let total = 0;
        const enrichedItems = [];
        for (const item of items) {
            const [dishRows] = await conn.query('SELECT * FROM dishes WHERE id = ? AND available = 1', [item.dish_id]);
            if (dishRows.length === 0) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: `Plat ID ${item.dish_id} indisponible` });
            }
            const dish = dishRows[0];
            const qty = Number(item.quantity) || 1;
            total += dish.price * qty;
            enrichedItems.push({ dish, qty });
        }

        const ridRaw = Number(restaurant_id);
        const rid = Number.isFinite(ridRaw) && ridRaw > 0 ? ridRaw : enrichedItems[0].dish.restaurant_id;

        const [restaurantRows] = await conn.query('SELECT id FROM restaurants WHERE id = ?', [rid]);
        if (restaurantRows.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ message: `Restaurant introuvable (id: ${rid})` });
        }

        let orderResult;
        try {
            [orderResult] = await conn.query(
                `INSERT INTO orders (customer_name, customer_email, customer_phone, table_number, comment, status, total_price, restaurant_id)
       VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?)`,
                [customer_name, customer_email || null, customer_phone, table_number || null, comment || null, total, rid]
            );
        } catch (err) {
            const rawMsg = String(err?.sqlMessage || err?.message || '');
            const isBadField = err && err.code === 'ER_BAD_FIELD_ERROR';
            const missingComment = isBadField && rawMsg.toLowerCase().includes('comment');
            const missingCustomerEmail = isBadField && rawMsg.toLowerCase().includes('customer_email');

            // Backward compatibility for old schemas
            if (missingComment && missingCustomerEmail) {
                [orderResult] = await conn.query(
                    `INSERT INTO orders (customer_name, customer_phone, table_number, status, total_price, restaurant_id)
       VALUES (?, ?, ?, 'en_attente', ?, ?)`,
                    [customer_name, customer_phone, table_number || null, total, rid]
                );
            } else if (missingCustomerEmail) {
                [orderResult] = await conn.query(
                    `INSERT INTO orders (customer_name, customer_phone, table_number, comment, status, total_price, restaurant_id)
       VALUES (?, ?, ?, ?, 'en_attente', ?, ?)`,
                    [customer_name, customer_phone, table_number || null, comment || null, total, rid]
                );
            } else if (missingComment) {
                [orderResult] = await conn.query(
                    `INSERT INTO orders (customer_name, customer_email, customer_phone, table_number, status, total_price, restaurant_id)
       VALUES (?, ?, ?, ?, 'en_attente', ?, ?)`,
                    [customer_name, customer_email || null, customer_phone, table_number || null, total, rid]
                );
            } else {
                throw err;
            }
        }
        const orderId = orderResult.insertId;

        for (const { dish, qty } of enrichedItems) {
            await conn.query(
                'INSERT INTO order_items (order_id, dish_id, dish_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderId, dish.id, dish.name, qty, dish.price]
            );
        }

        await conn.commit();
        conn.release();

        const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        // Répondre immédiatement au client
        res.status(201).json({ ...orderRows[0], items: itemRows });

        // Envoyer les mails en arrière-plan (sans bloquer)
        pool.query('SELECT name, email FROM restaurants WHERE id = ?', [rid]).then(([rRows]) => {
            const r = rRows && rRows[0];
            notifyRestaurantNewOrder({ restaurantEmail: r?.email, restaurantName: r?.name, order: orderRows[0], items: itemRows })
                .catch((e) => console.error('Restaurant notification email skipped:', e));
        }).catch((e) => console.error('Restaurant query failed:', e));

        notifyCustomerOrderConfirmation({ customerEmail: orderRows[0]?.customer_email, order: orderRows[0], items: itemRows })
            .catch((e) => console.error('Customer confirmation email skipped:', e));
    } catch (err) {
        try {
            if (conn) await conn.rollback();
        } catch (e) {
            // ignore
        }
        try {
            if (conn) conn.release();
        } catch (e) {
            // ignore
        }
        console.error(err);

        const rawMsg = String(err?.sqlMessage || err?.message || '');
        const isMissingCommentColumn = err?.code === 'ER_BAD_FIELD_ERROR' && rawMsg.toLowerCase().includes("comment");
        const isMissingCustomerEmailColumn = err?.code === 'ER_BAD_FIELD_ERROR' && rawMsg.toLowerCase().includes("customer_email");

        res.status(500).json({
            message: isMissingCommentColumn
                ? "Schéma DB incomplet: colonne orders.comment manquante (exécuter: ALTER TABLE orders ADD COLUMN comment TEXT NULL)"
                : isMissingCustomerEmailColumn
                    ? "Schéma DB incomplet: colonne orders.customer_email manquante (exécuter: ALTER TABLE orders ADD COLUMN customer_email VARCHAR(190) NULL)"
                    : 'Erreur serveur',
            details: process.env.NODE_ENV === 'production' ? undefined : (err.sqlMessage || err.message || String(err)),
        });
    }
};

// GET /api/orders/:id  (client – track order)
const getOrderById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Commande introuvable' });
        const [items] = await pool.query(
            'SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?',
            [req.params.id]
        );
        res.json({ ...rows[0], items });
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// ===== ADMIN =====

// GET /api/admin/orders
const getAdminOrders = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = 'SELECT * FROM orders WHERE restaurant_id = ?';
        const params = [req.restaurant.id];
        if (status) { query += ' AND status = ?'; params.push(status); }
        if (date) { query += ' AND DATE(created_at) = ?'; params.push(date); }
        query += ' ORDER BY created_at DESC';
        const [orders] = await pool.query(query, params);

        // attach items with dish image
        const result = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query(
                'SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?',
                [order.id]
            );
            return { ...order, items };
        }));
        res.json(result);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/accept
const acceptOrder = async (req, res) => {
    try {
        await pool.query(
            "UPDATE orders SET status = 'acceptee' WHERE id = ? AND restaurant_id = ?",
            [req.params.id, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: rows[0]?.customer_email, order: rows[0], items });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/cancel
const cancelOrder = async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Motif d\'annulation requis' });
    try {
        await pool.query(
            "UPDATE orders SET status = 'refusee', cancel_reason = ? WHERE id = ? AND restaurant_id = ?",
            [reason, req.params.id, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: rows[0]?.customer_email, order: rows[0], items });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['en_attente', 'acceptee', 'refusee', 'en_preparation', 'terminee'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Statut invalide' });
    try {
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?',
            [status, req.params.id, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        await notifyCustomerStatusChange({ customerEmail: rows[0]?.customer_email, order: rows[0], items });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// DELETE /api/admin/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM orders WHERE id = ? AND restaurant_id = ?',
            [req.params.id, req.restaurant.id]
        );
        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const rid = req.restaurant.id;
        const today = new Date().toISOString().slice(0, 10);
        const [[todayOrders]] = await pool.query(
            "SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = ? AND DATE(created_at) = ?", [rid, today]
        );
        const [[pending]] = await pool.query(
            "SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = ? AND status = 'en_attente'", [rid]
        );
        const [[revenue]] = await pool.query(
            "SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = ? AND DATE(created_at) = ? AND status != 'refusee'", [rid, today]
        );
        const [[dishCount]] = await pool.query(
            "SELECT COUNT(*) AS count FROM dishes WHERE restaurant_id = ?",
            [rid]
        );

        const [[totalOrders]] = await pool.query(
            "SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = ?",
            [rid]
        );

        const [[totalRevenue]] = await pool.query(
            "SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = ? AND status != 'refusee'",
            [rid]
        );

        const [[monthOrders]] = await pool.query(
            "SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())",
            [rid]
        );
        const [[lastMonthOrders]] = await pool.query(
            "SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = ? AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))",
            [rid]
        );

        const [[monthRevenue]] = await pool.query(
            "SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status != 'refusee'",
            [rid]
        );
        const [[lastMonthRevenue]] = await pool.query(
            "SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE restaurant_id = ? AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND status != 'refusee'",
            [rid]
        );

        const ordersMoMPercent = Number(lastMonthOrders.count) > 0
            ? ((Number(monthOrders.count) - Number(lastMonthOrders.count)) / Number(lastMonthOrders.count)) * 100
            : null;
        const revenueMoMPercent = Number(lastMonthRevenue.total) > 0
            ? ((Number(monthRevenue.total) - Number(lastMonthRevenue.total)) / Number(lastMonthRevenue.total)) * 100
            : null;

        const [ordersByDayRows] = await pool.query(
            "SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total_price),0) AS revenue FROM orders WHERE restaurant_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND status != 'refusee' GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
            [rid]
        );

        const [statusBreakdownRows] = await pool.query(
            "SELECT status, COUNT(*) AS count FROM orders WHERE restaurant_id = ? GROUP BY status",
            [rid]
        );

        const [topDishesRows] = await pool.query(
            "SELECT oi.dish_name AS name, SUM(oi.quantity) AS quantity, COALESCE(SUM(oi.quantity * oi.price),0) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.restaurant_id = ? AND o.status != 'refusee' GROUP BY oi.dish_name ORDER BY quantity DESC LIMIT 5",
            [rid]
        );

        res.json({
            todayOrders: todayOrders.count,
            pendingOrders: pending.count,
            todayRevenue: revenue.total,
            dishCount: dishCount.count,
            totalOrders: totalOrders.count,
            totalRevenue: totalRevenue.total,
            monthOrders: monthOrders.count,
            lastMonthOrders: lastMonthOrders.count,
            monthRevenue: monthRevenue.total,
            lastMonthRevenue: lastMonthRevenue.total,
            ordersMoMPercent,
            revenueMoMPercent,
            ordersByDay: ordersByDayRows,
            statusBreakdown: statusBreakdownRows,
            topDishes: topDishesRows,
        });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

module.exports = {
    createOrder, getOrderById,
    getAdminOrders, acceptOrder, cancelOrder, updateOrderStatus, deleteOrder, getStats,
};
