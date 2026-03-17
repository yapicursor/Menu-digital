const pool = require('../config/db');

const getCategories = async (req, res) => {
    try {
        const restaurantId = req.query.restaurant_id;
        let result;
        if (restaurantId) {
            result = await pool.query('SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY name', [restaurantId]);
        } else {
            result = await pool.query('SELECT * FROM categories ORDER BY name');
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    try {
        const result = await pool.query(
            'INSERT INTO categories (name, restaurant_id) VALUES ($1, $2) RETURNING *',
            [name, req.restaurant.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 AND restaurant_id = $3 RETURNING *',
            [name, req.params.id, req.restaurant.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Catégorie introuvable' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND restaurant_id = $2',
            [req.params.id, req.restaurant.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Catégorie introuvable' });
        res.json({ message: 'Catégorie supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
