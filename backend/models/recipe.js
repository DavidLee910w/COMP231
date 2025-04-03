// backend/models/recipe.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: false },
    rating: { type: Number, min: 1, max: 5, required: false },
    createdAt: { type: Date, default: Date.now }
});

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
    comments: [CommentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: String,
    createdAt: { type: Date, default: Date.now },
    seoTags: [{ type: String, trim: true }],
});

module.exports = mongoose.model('Recipe', RecipeSchema);
