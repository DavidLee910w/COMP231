// backend/routes/recipes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

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
router.post('/:recipeId/comments/:commentId/report', verifyToken, recipeController.reportComment);
router.get('/user', verifyToken, recipeController.getUserRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/saved', verifyToken, recipeController.getSavedRecipes);
router.get('/titles', recipeController.getRecipeTitles);
router.get('/:id/isSaved', verifyToken, recipeController.isRecipeSaved);
router.post('/save/:recipeId', verifyToken, recipeController.toggleSaveRecipe);
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);
router.post('/:id/comments', verifyToken, recipeController.addComment);
router.delete('/:recipeId/comments/:commentId', verifyToken, recipeController.deleteComment);
router.put('/:id', verifyToken, isCreatorOrAdmin, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', verifyToken, isCreatorOrAdmin, recipeController.deleteRecipe);
router.post('/:id/comments', verifyToken, recipeController.addComment);

router.get('/:id', recipeController.getRecipeById);//please keep this at the bottom


module.exports = router;