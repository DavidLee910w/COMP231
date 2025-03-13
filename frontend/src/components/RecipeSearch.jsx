// frontend/src/components/RecipeSearch.js
import React, { useState } from 'react';
import axios from 'axios';

function RecipeSearch() {
    const [ingredients, setIngredients] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [excludeAllergens, setExcludeAllergens] = useState('');
    const [recipes, setRecipes] = useState([]);

    const handleSearch = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/recipes/search', {
                params: { ingredients, isVegan, excludeAllergens }
            });
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Search Recipes</h2>
            <input
                type="text"
                placeholder="Ingredients (comma separated)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
            />
            <br />
            <label>
                <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                />
                Vegan Only
            </label>
            <br />
            <input
                type="text"
                placeholder="Exclude Allergens (comma separated)"
                value={excludeAllergens}
                onChange={(e) => setExcludeAllergens(e.target.value)}
            />
            <br />
            <button onClick={handleSearch}>Search</button>
            <div>
                <h3>Results:</h3>
                {recipes.map(recipe => (
                    <div key={recipe._id}>
                        <h4>{recipe.title}</h4>
                        <p>{recipe.instructions}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecipeSearch;
