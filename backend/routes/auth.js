// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');
const User = require('../models/user');

// POST /api/auth/register
router.post('/register', userController.registerUser);

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (user.isDisabled) {
            return res.status(403).json({ msg: 'Account is disabled' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT
        const payload = {
            user: {
                _id: user._id,
                admin: user.admin
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.json({ msg: 'Login successful', token, user: { _id: user._id, username: user.username, admin: user.admin } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;