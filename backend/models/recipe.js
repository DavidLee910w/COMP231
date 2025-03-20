// backend/models/recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ingredients: [{
        name: { type: String, required: true, trim: true },
        quantity: { type: String, required: true, trim: true }
    }],
    steps: [{ type: String, trim: true }],
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    isVegan: { type: Boolean, default: false },
    allergens: [{ type: String, trim: true }],
    servings: { type: Number, required: true },
    commentsEnabled: { type: Boolean, default: true },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true, trim: true },
        date: { type: Date, default: Date.now }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe; // Export the model