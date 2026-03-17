const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const register = async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
    try {
        const existing = await pool.query('SELECT id FROM restaurants WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(409).json({ message: 'Email déjà utilisé' });
        const hashed = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO restaurants (name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, email, hashed, phone || null, address || null]
        );
        const token = jwt.sign({ id: result.rows[0].id, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, restaurant: { id: result.rows[0].id, name, email } });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    try {
        const result = await pool.query('SELECT * FROM restaurants WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Identifiants incorrects' });
        const restaurant = result.rows[0];
        const valid = await bcrypt.compare(password, restaurant.password);
        if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' });
        const token = jwt.sign({ id: restaurant.id, email: restaurant.email, name: restaurant.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, restaurant: { id: restaurant.id, name: restaurant.name, email: restaurant.email, phone: restaurant.phone, address: restaurant.address } });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const getMe = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, address, created_at FROM restaurants WHERE id = $1', [req.restaurant.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Restaurant introuvable' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });
    try {
        const result = await pool.query('SELECT id FROM restaurants WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.json({ message: 'Si ce compte existe, un email a été envoyé.' });
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000);
        await pool.query('UPDATE restaurants SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', [token, expires, email]);
        const link = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;
        await sendMail({ to: email, subject: 'Réinitialisation de votre mot de passe', text: `Lien : ${link}\n\nExpire dans 1 heure.`, html: `<p><a href="${link}">${link}</a></p><p>Expire dans 1 heure.</p>` });
        res.json({ message: 'Si ce compte existe, un email a été envoyé.' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token et mot de passe requis' });
    try {
        const result = await pool.query('SELECT id FROM restaurants WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
        if (result.rows.length === 0) return res.status(400).json({ message: 'Lien invalide ou expiré' });
        const hashed = await bcrypt.hash(password, 12);
        await pool.query('UPDATE restaurants SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashed, result.rows[0].id]);
        res.json({ message: 'Mot de passe réinitialisé' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const updateProfile = async (req, res) => {
    const { name, email, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Nom et email requis' });
    try {
        const existing = await pool.query('SELECT id FROM restaurants WHERE email = $1 AND id != $2', [email, req.restaurant.id]);
        if (existing.rows.length > 0) return res.status(409).json({ message: 'Email déjà utilisé' });
        await pool.query('UPDATE restaurants SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5', [name, email, phone || null, address || null, req.restaurant.id]);
        const updated = await pool.query('SELECT id, name, email, phone, address FROM restaurants WHERE id = $1', [req.restaurant.id]);
        res.json({ restaurant: updated.rows[0] });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

const updatePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ message: 'Champs requis' });
    try {
        const result = await pool.query('SELECT password FROM restaurants WHERE id = $1', [req.restaurant.id]);
        const valid = await bcrypt.compare(current_password, result.rows[0].password);
        if (!valid) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        const hashed = await bcrypt.hash(new_password, 12);
        await pool.query('UPDATE restaurants SET password = $1 WHERE id = $2', [hashed, req.restaurant.id]);
        res.json({ message: 'Mot de passe modifié' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Erreur serveur' }); }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile, updatePassword };
