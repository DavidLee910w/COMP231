// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ msg: 'Invalid credentials' });

        // (In production, use JWT or session management)
        res.json({ msg: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
