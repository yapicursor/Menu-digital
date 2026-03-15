const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Non autorisé – token manquant' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.restaurant = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};

module.exports = { protect };
