const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const getDishes = async (req, res) => {
    try {
        const restaurantId = req.query.restaurant_id;
        const categoryId = req.query.category_id;
        let query = `SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE 1=1`;
        const params = [];
        let i = 1;
        if (restaurantId) { query += ` AND d.restaurant_id = $${i++}`; params.push(restaurantId); }
        if (categoryId) { query += ` AND d.category_id = $${i++}`; params.push(categoryId); }
        query += ' ORDER BY d.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const getDishById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Plat introuvable' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

const createDish = async (req, res) => {
    const { name, description, price, category_id, available } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Nom et prix requis' });
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const availableBool = !(available === 'false' || available === false || available === '0' || available === 0);
    try {
        const result = await pool.query(
            'INSERT INTO dishes (name, description, price, image, available, category_id, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [name, description || null, price, image, availableBool, category_id || null, req.restaurant.id]
        );
        const dish = await pool.query(
            'SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = $1',
            [result.rows[0].id]
        );
        res.status(201).json(dish.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const updateDish = async (req, res) => {
    const { name, description, price, category_id, available } = req.body;
    try {
        const existing = await pool.query('SELECT * FROM dishes WHERE id = $1 AND restaurant_id = $2', [req.params.id, req.restaurant.id]);
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Plat introuvable' });
        const e = existing.rows[0];
        const image = req.file ? `/uploads/${req.file.filename}` : e.image;
        const availableBool = available === undefined ? e.available : !(available === 'false' || available === false || available === '0' || available === 0);
        await pool.query(
            'UPDATE dishes SET name=$1, description=$2, price=$3, image=$4, available=$5, category_id=$6 WHERE id=$7 AND restaurant_id=$8',
            [name || e.name, description ?? e.description, price || e.price, image, availableBool, category_id ?? e.category_id, req.params.id, req.restaurant.id]
        );
        const dish = await pool.query('SELECT d.*, c.name AS category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = $1', [req.params.id]);
        res.json(dish.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const deleteDish = async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM dishes WHERE id = $1 AND restaurant_id = $2', [req.params.id, req.restaurant.id]);
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Plat introuvable' });
        if (existing.rows[0].image) {
            const rel = existing.rows[0].image.startsWith('/') ? existing.rows[0].image.slice(1) : existing.rows[0].image;
            const p = path.join(__dirname, '..', rel);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        await pool.query('DELETE FROM dishes WHERE id = $1 AND restaurant_id = $2', [req.params.id, req.restaurant.id]);
        res.json({ message: 'Plat supprimé' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const toggleAvailable = async (req, res) => {
    try {
        await pool.query('UPDATE dishes SET available = NOT available WHERE id = $1 AND restaurant_id = $2', [req.params.id, req.restaurant.id]);
        const result = await pool.query('SELECT * FROM dishes WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

module.exports = { getDishes, getDishById, createDish, updateDish, deleteDish, toggleAvailable };
