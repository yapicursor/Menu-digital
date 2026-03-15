const pool = require('../config/db');

// GET /api/categories  (public – filtered by restaurant via query param or all)
const getCategories = async (req, res) => {
    try {
        const restaurantId = req.query.restaurant_id;
        let rows;
        if (restaurantId) {
            [rows] = await pool.query(
                'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY name',
                [restaurantId]
            );
        } else {
            [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// POST /api/categories  (admin)
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    try {
        const [result] = await pool.query(
            'INSERT INTO categories (name, restaurant_id) VALUES (?, ?)',
            [name, req.restaurant.id]
        );
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// PUT /api/categories/:id  (admin)
const updateCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    try {
        const [result] = await pool.query(
            'UPDATE categories SET name = ? WHERE id = ? AND restaurant_id = ?',
            [name, req.params.id, req.restaurant.id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Catégorie introuvable' });
        res.json({ id: Number(req.params.id), name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// DELETE /api/categories/:id  (admin)
const deleteCategory = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ? AND restaurant_id = ?',
            [req.params.id, req.restaurant.id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Catégorie introuvable' });
        res.json({ message: 'Catégorie supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
