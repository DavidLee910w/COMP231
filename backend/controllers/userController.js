// backend/controllers/userController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        // Create new user
        user = new User({
            email,
            password,
            username
        });

        await user.save();

        // Generate JWT
        const payload = {
            user: {
                _id: user._id,
                admin: user.admin
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ msg: 'User registered successfully', token, user: { _id: user._id, username: user.username, admin: user.admin } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Toggle ban/unban user (for admin)
exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.isDisabled = !user.isDisabled;
        await user.save();
        res.json({ msg: `User ${user.username} ${user.isDisabled ? 'banned' : 'unbanned'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};