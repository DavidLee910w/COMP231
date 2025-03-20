// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Recipe = require('../models/recipe'); // Ensure this import works

// Routes...
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);
router.put('/users/:id/ban', verifyToken, isAdmin, userController.toggleBanUser);
router.delete('/recipes/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Recipe deleted by admin' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;