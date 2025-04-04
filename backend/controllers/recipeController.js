// backend/controllers/recipeController.js
const Recipe = require('../models/recipe');
const keywordExtractor = require('keyword-extractor');
const User = require('../models/user');

// GET /api/recipes/search?ingredients=...&isVegan=true&excludeAllergens=...
exports.searchRecipes = async (req, res) => {
    const { searchedItem, isVegan, excludeAllergens } = req.query;
    let query = {};
    //filtering in title; case insensitive
    if (searchedItem) {
        query.title = { $regex: searchedItem, $options: 'i' };
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
        const { title, description, ingredients } = req.body;
//        const servings = parseInt(req.body.servings, 10);
//        const cookTime = parseInt(req.body.cookTime, 10);
//        const prepTime = parseInt(req.body.prepTime, 10);

        const safeIngredients = JSON.parse(req.body.ingredients || '[]');
        const steps = JSON.parse(req.body.steps || '[]');
        const allergens = JSON.parse(req.body.allergens || '[]');

        const userTags = Array.isArray(req.body.seoTags) ? req.body.seoTags : [];

        const autoTags = generateSEOTagsFromContent(title, description, safeIngredients);
        const finalTags = mergeSeoTags(userTags, autoTags);

        // Build image path if a file was uploaded
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const recipeData = {
            ...req.body,
            ingredients: safeIngredients,
            steps,
            allergens,
            seoTags: finalTags,
            createdBy: req.user._id,
            image: imagePath  // save image path in MongoDB
        };

        const newRecipe = new Recipe(recipeData);
        await newRecipe.save();

        res.status(201).json(newRecipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.updateRecipe = async (req, res) => {
    try {
        // If a new image file is provided, update the image field
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        // Convert numeric fields if provided
        if (req.body.servings) req.body.servings = parseInt(req.body.servings, 10);
        if (req.body.cookTime) req.body.cookTime = parseInt(req.body.cookTime, 10);
        if (req.body.prepTime) req.body.prepTime = parseInt(req.body.prepTime, 10);

        // Parse JSON strings into objects/arrays for these fields
        if (req.body.ingredients) {
            req.body.ingredients = JSON.parse(req.body.ingredients);
        }
        if (req.body.steps) {
            req.body.steps = JSON.parse(req.body.steps);
        }
        if (req.body.allergens) {
            req.body.allergens = JSON.parse(req.body.allergens);
        }
        if (req.body.seoTags) {
            req.body.seoTags = JSON.parse(req.body.seoTags);
        }

        // Optionally, if you want to auto-generate SEO tags upon update
        // (if title, description, and ingredients are provided)
        if (req.body.title && req.body.description && req.body.ingredients) {
            const autoTags = generateSEOTagsFromContent(req.body.title, req.body.description, req.body.ingredients);
            const userTags = Array.isArray(req.body.seoTags) ? req.body.seoTags : [];
            const finalTags = mergeSeoTags(userTags, autoTags);
            req.body.seoTags = finalTags;
        }

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

// POST /api/recipes/:id/comments (Add a new comment to the recipe)
exports.addComment = async (req, res) => {
    const { comment, rating } = req.body;
    const userId = req.user._id;

    // At least a comment or rating is required
    if ((!comment || comment.trim() === '') && (!rating || rating < 1)) {
        return res.status(400).json({ msg: 'Comment or rating is required' });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        if (!recipe.commentsEnabled) {
            return res.status(403).json({ msg: 'Comments are disabled for this recipe' });
        }

        const newComment = {
            username: userId
        };

        if (comment && comment.trim() !== '') {
            newComment.comment = comment.trim();
        }

        if (rating && rating >= 1 && rating <= 5) {
            newComment.rating = rating;
        }

        recipe.comments.push(newComment);

        await recipe.save();
        // Populate comment usernames again
        await recipe.populate('comments.username', 'username');
        res.status(201).json({
            msg: 'Comment added successfully',
            comments: recipe.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// DELETE /api/recipes/:recipeId/comments/:commentId
exports.deleteComment = async (req, res) => {
    const { recipeId, commentId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.admin === true;

    try {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        const comment = recipe.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Allow admins to delete any comment, regular users can only delete their own
        if (!isAdmin && comment.username.toString() !== userId.toString()) {
            return res.status(403).json({ msg: 'Not authorized to delete this comment' });
        }

        // Safely remove the comment
        recipe.comments.pull(commentId);
        await recipe.save();

        res.json({ msg: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/recipes/:id (Get a single recipe by ID)
exports.getRecipeById = async (req, res) => {
    console.log('Fetching recipe with ID:', req.params.id);
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('comments.username', 'username');
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Auto generate SEO tags from title, description, and ingredients of recipe
function generateSEOTagsFromContent(title, description, ingredients) {
    const combinedText = [
        title,
        description,
        ...ingredients.map(i => i.name)
    ].join(' ');

    const autoTags = keywordExtractor.extract(combinedText, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
    });

    const extra = ['recipe', 'cooking', 'food'];
    return [...new Set([...autoTags, ...extra])];
}

function mergeSeoTags(userInputTags = [], autoTags = []) {
    const userTagsSet = new Set(userInputTags.map(tag => tag.toLowerCase().trim()));
    const merged = [...userTagsSet];

    autoTags.forEach(tag => {
        const lower = tag.toLowerCase().trim();
        if (!userTagsSet.has(lower)) {
            merged.push(lower);
        }
    });

    return merged;
}

// GET /api/recipes/user (Get all recipes for the authenticated user)
exports.getUserRecipes = async (req, res) => {
    try {
        // req.user is populated by your authentication middleware with the logged-in user's info
        const recipes = await Recipe.find({ createdBy: req.user._id }).populate('createdBy', 'username');
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Saved recipes of the user
// POST /api/users/save/:recipeId (save or unsave a recipe)
exports.toggleSaveRecipe = async (req, res) => {
    const userId = req.user._id;
    const recipeId = req.params.recipeId;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const alreadySaved = user.savedRecipes.includes(recipeId);
        if (alreadySaved) {
            user.savedRecipes.pull(recipeId);
        } else {
            user.savedRecipes.push(recipeId);
        }

        await user.save();
        res.json({ msg: alreadySaved ? 'Recipe unsaved' : 'Recipe saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/users/saved (Get all saved recipes for the authenticated user)
exports.getSavedRecipes = async (req, res) => {
    try {
        console.log('Getting saved recipes for user ID:', req.user._id);

        const user = await User.findById(req.user._id).populate({
            path: 'savedRecipes',
            populate: { path: 'createdBy', select: 'username' }
        });

        if (!user) {
            console.log('User not found!');
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('Saved recipes found:', user.savedRecipes.length);

        res.json(user.savedRecipes);
    } catch (err) {
        console.error('Error in getSavedRecipes:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/recipes/titles - Return all recipe titles (used for search suggestions)
exports.getRecipeTitles = async (req, res) => {
    try {
        const recipes = await Recipe.find({}, 'title');
        const titles = recipes.map(r => r.title);
        res.json(titles);
    } catch (err) {
        console.error('Error fetching recipe titles:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.isRecipeSaved = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const recipeId = req.params.id;

        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isSaved = user.savedRecipes.map(id => id.toString()).includes(recipeId);
        res.json({ isSaved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};
