// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Import route modules
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Middleware
app.use(cors()); // Enable CORS if needed
app.use(bodyParser.json());

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});