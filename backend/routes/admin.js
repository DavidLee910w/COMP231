const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/user'); 
const Recipe = require('../models/recipe'); 

// Get all users (admin only)
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);

// Toggle ban/unban user
router.put('/users/:id/ban', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.isDisabled = !user.isDisabled;
        await user.save();
        res.json({ msg: `User ${user.username} ${user.isDisabled ? 'disabled' : 'enabled'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a user
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent deletion of admin accounts
        if (user.admin) {
            return res.status(403).json({ msg: 'Cannot delete an admin account' });
        }

        await User.findByIdAndDelete(user._id);
        return res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;