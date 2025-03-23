// backend/routes/recipes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware to check if user is the creator or admin
const isCreatorOrAdmin = async (req, res, next) => {
    try {
        const Recipe = require('../models/recipe'); // Ensure this import works
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        if (recipe.createdBy.toString() === req.user._id || req.user.admin) {
            next();
        } else {
            res.status(403).json({ msg: 'Not authorized to perform this action' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Routes...
//router.get('/user', recipeController.getUserRecipes);
router.get('/user', verifyToken, recipeController.getUserRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', verifyToken, recipeController.createRecipe);
router.put('/:id', verifyToken, isCreatorOrAdmin, recipeController.updateRecipe);
router.delete('/:id', verifyToken, isCreatorOrAdmin, recipeController.deleteRecipe);


module.exports = router;