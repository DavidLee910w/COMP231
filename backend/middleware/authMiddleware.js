// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user data to request
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
    if (!req.user.admin) {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
};