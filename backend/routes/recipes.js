// backend/routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');

// GET /api/recipes/search?ingredients=...&isVegan=true&excludeAllergens=...
router.get('/search', async (req, res) => {
    const { ingredients, isVegan, excludeAllergens } = req.query;
    let query = {};

    if (ingredients) {
        // Split ingredients by comma and find recipes containing all
        query.ingredients = { $all: ingredients.split(',').map(i => i.trim()) };
    }
    if (isVegan === 'true') {
        query.isVegan = true;
    }
    if (excludeAllergens) {
        const allergens = excludeAllergens.split(',').map(a => a.trim());
        query.allergens = { $nin: allergens };
    }

    try {
        const recipes = await Recipe.find(query);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/recipes (Upload new recipe)
router.post('/', async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.json(newRecipe);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/recipes/:id (Edit existing recipe)
router.put('/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRecipe);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/recipes/:id (Delete recipe)
router.delete('/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Recipe deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
