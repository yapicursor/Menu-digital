const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// GET /api/dishes  (public)
const getDishes = async (req, res) => {
    try {
        const restaurantId = req.query.restaurant_id;
        const categoryId = req.query.category_id;
        let query = `
      SELECT d.*, c.name AS category_name
      FROM dishes d
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (restaurantId) { query += ' AND d.restaurant_id = ?'; params.push(restaurantId); }
        if (categoryId) { query += ' AND d.category_id = ?'; params.push(categoryId); }
        query += ' ORDER BY d.created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// GET /api/dishes/:id (public)
const getDishById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT d.*, c.name AS category_name FROM dishes d
       LEFT JOIN categories c ON d.category_id = c.id
       WHERE d.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Plat introuvable' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

// POST /api/dishes  (admin)
const createDish = async (req, res) => {
    const { name, description, price, category_id, available } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Nom et prix requis' });
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const [result] = await pool.query(
            'INSERT INTO dishes (name, description, price, image, available, category_id, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description || null, price, image, available !== undefined ? (available === 'true' || available === true ? 1 : 0) : 1, category_id || null, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// PUT /api/dishes/:id  (admin)
const updateDish = async (req, res) => {
    const { name, description, price, category_id, available } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM dishes WHERE id = ? AND restaurant_id = ?', [req.params.id, req.restaurant.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Plat introuvable' });

        let image = existing[0].image;
        if (req.file) {
            // Delete old image
            if (image) {
                const rel = image.startsWith('/') ? image.slice(1) : image;
                const oldPath = path.join(__dirname, '..', rel);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            image = `/uploads/${req.file.filename}`;
        }

        await pool.query(
            'UPDATE dishes SET name=?, description=?, price=?, image=?, available=?, category_id=? WHERE id=? AND restaurant_id=?',
            [name || existing[0].name, description ?? existing[0].description, price || existing[0].price, image, available !== undefined ? (available === 'true' || available === true ? 1 : 0) : existing[0].available, category_id ?? existing[0].category_id, req.params.id, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// DELETE /api/dishes/:id  (admin)
const deleteDish = async (req, res) => {
    try {
        const [existing] = await pool.query('SELECT * FROM dishes WHERE id = ? AND restaurant_id = ?', [req.params.id, req.restaurant.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Plat introuvable' });
        if (existing[0].image) {
            const rel = existing[0].image.startsWith('/') ? existing[0].image.slice(1) : existing[0].image;
            const p = path.join(__dirname, '..', rel);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        await pool.query('DELETE FROM dishes WHERE id = ? AND restaurant_id = ?', [req.params.id, req.restaurant.id]);
        res.json({ message: 'Plat supprimé' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

// PATCH /api/dishes/:id/toggle  (admin) – toggle available
const toggleAvailable = async (req, res) => {
    try {
        await pool.query('UPDATE dishes SET available = NOT available WHERE id = ? AND restaurant_id = ?', [req.params.id, req.restaurant.id]);
        const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

module.exports = { getDishes, getDishById, createDish, updateDish, deleteDish, toggleAvailable };
