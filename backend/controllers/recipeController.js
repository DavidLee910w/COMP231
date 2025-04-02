// backend/controllers/recipeController.js
const Recipe = require('../models/recipe');
const keywordExtractor = require('keyword-extractor');

// GET /api/recipes/search?ingredients=...&isVegan=true&excludeAllergens=...
exports.searchRecipes = async (req, res) => {
    const { searchedItem, isVegan, excludeAllergens } = req.query;
    let query = {};
    //filtering in ingredient/title/description; case insensitive
    if (searchedItem) {
        const keywordList = searchedItem.split(',').map(i => i.trim());

        query.$or = [
            { 'ingredients.name': { $in: keywordList } },
            { title: { $regex: searchedItem, $options: 'i' } },
            { description: { $regex: searchedItem, $options: 'i' } }
        ];
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

        // makesure ingredients is array
        const safeIngredients = Array.isArray(ingredients) ? ingredients : [];

        const userTags = Array.isArray(req.body.seoTags) ? req.body.seoTags : [];

        const autoTags = generateSEOTagsFromContent(title, description, safeIngredients);
        const finalTags = mergeSeoTags(userTags, autoTags);

        const recipeData = {
            ...req.body,
            ingredients: safeIngredients,
            seoTags: finalTags,
            createdBy: req.user._id
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

// POST /api/recipes/:id/comments  (Add a new comment to the recipe)
exports.addComment = async (req, res) => {
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ msg: 'Comment is required' });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        if (!recipe.commentsEnabled) {
            return res.status(403).json({ msg: 'Comments are disabled for this recipe' });
        }

        recipe.comments.push({
            username: userId,
            comment: comment.trim()
        });

        await recipe.save();
        // populate comment usernames again
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

    try {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        const comment = recipe.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Make sure the user owns the comment
        if (comment.username.toString() !== userId.toString()) {
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


//auto generate seo tags from title, description and ingredients of recipe
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


