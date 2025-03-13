// frontend/src/components/RecipeForm.js
import React, { useState } from 'react';
import axios from 'axios';

function RecipeForm({ recipe, onSuccess }) {
    const [title, setTitle] = useState(recipe ? recipe.title : '');
    const [ingredients, setIngredients] = useState(recipe ? recipe.ingredients.join(',') : '');
    const [instructions, setInstructions] = useState(recipe ? recipe.instructions : '');
    const [isVegan, setIsVegan] = useState(recipe ? recipe.isVegan : false);
    const [allergens, setAllergens] = useState(recipe ? recipe.allergens.join(',') : '');
    const [seoTags, setSeoTags] = useState(recipe ? recipe.seoTags.join(',') : '');
    const [commentsEnabled, setCommentsEnabled] = useState(recipe ? recipe.commentsEnabled : true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeData = {
            title,
            ingredients: ingredients.split(',').map(item => item.trim()),
            instructions,
            isVegan,
            allergens: allergens.split(',').map(item => item.trim()),
            seoTags: seoTags.split(',').map(tag => tag.trim()),
            commentsEnabled
        };

        try {
            if (recipe && recipe._id) {
                await axios.put(`http://localhost:5000/api/recipes/${recipe._id}`, recipeData);
            } else {
                await axios.post('http://localhost:5000/api/recipes', recipeData);
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>{recipe ? 'Edit' : 'Upload'} Recipe</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <br />
                <input
                    type="text"
                    placeholder="Ingredients (comma separated)"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                />
                <br />
                <textarea
                    placeholder="Instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                ></textarea>
                <br />
                <label>
                    <input
                        type="checkbox"
                        checked={isVegan}
                        onChange={(e) => setIsVegan(e.target.checked)}
                    />
                    Vegan
                </label>
                <br />
                <input
                    type="text"
                    placeholder="Allergens (comma separated)"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                />
                <br />
                <input
                    type="text"
                    placeholder="SEO Tags (comma separated)"
                    value={seoTags}
                    onChange={(e) => setSeoTags(e.target.value)}
                />
                <br />
                <label>
                    <input
                        type="checkbox"
                        checked={commentsEnabled}
                        onChange={(e) => setCommentsEnabled(e.target.checked)}
                    />
                    Enable Comments
                </label>
                <br />
                <button type="submit">{recipe ? 'Update' : 'Upload'}</button>
            </form>
        </div>
    );
}

export default RecipeForm;
