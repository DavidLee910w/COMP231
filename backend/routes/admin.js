// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Recipe = require('../models/recipe');

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/admin/users/:id/ban - Toggle ban/unban (simplified)
router.put('/users/:id/ban', async (req, res) => {
    try {
        // In a complete implementation, update a user status field
        res.json({ msg: `User ${req.params.id} ban/unban toggled` });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/admin/recipes/:id - Admin moderation: delete inappropriate content
router.delete('/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Recipe deleted by admin' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
