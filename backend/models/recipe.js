// backend/models/recipe.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: [String],
    instructions: String,
    isVegan: { type: Boolean, default: false },
    allergens: [String],
    seoTags: [String],
    commentsEnabled: { type: Boolean, default: true },
    comments: [CommentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);

