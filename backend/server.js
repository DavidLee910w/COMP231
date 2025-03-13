// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import route modules
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
mongoose
    .connect('mongodb://localhost:27017/dishcovery', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use(bodyParser.json());

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
