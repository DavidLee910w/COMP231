// backend/controllers/recipeController.js
const Recipe = require('../models/recipe');

// GET /api/recipes/search?ingredients=...&isVegan=true&excludeAllergens=...
exports.searchRecipes = async (req, res) => {
    const { ingredients, isVegan, excludeAllergens } = req.query;
    let query = {};

    if (ingredients) {
        const ingredientList = ingredients.split(',').map(i => i.trim());
        query['ingredients.name'] = { $in: ingredientList };
    }
    if (isVegan === 'true') {
        query.isVegan = true;
    }
    if (excludeAllergens) {
        const allergens = excludeAllergens.split(',').map(a => a.trim());
        query.allergens = { $nin: allergens };
    }

    try {
        const recipes = await Recipe.find(query).populate('createdBy', 'username');
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// POST /api/recipes (Upload new recipe)
exports.createRecipe = async (req, res) => {
    try {
        const recipeData = {
            ...req.body,
            createdBy: req.user._id // Set the creator to the logged-in user from JWT
        };
        const newRecipe = new Recipe(recipeData);
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// PUT /api/recipes/:id (Edit existing recipe)
exports.updateRecipe = async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('createdBy', 'username');
        if (!updatedRecipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json(updatedRecipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// DELETE /api/recipes/:id (Delete recipe)
exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json({ msg: 'Recipe deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/recipes/:id (Get a single recipe by ID)
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};