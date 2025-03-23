import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function RecipeForm() {
    const { id } = useParams(); // Get recipe ID from URL
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [allergens, setAllergens] = useState('');
    const [seoTags, setSeoTags] = useState('');
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [servings, setServings] = useState(null);
    const [cookTime, setCookTime] = useState(null);
    const [prepTime, setPrepTime] = useState(null);

    useEffect(() => {
        if (id) {
            // Fetch recipe details for editing
            const fetchRecipe = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:5000/api/recipes/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log('Recipe:', response.data);
                    const recipe = response.data;
                    setTitle(recipe.title);
                    setIngredients(recipe.ingredients.map(ing => `${ing.name}: ${ing.quantity}`).join(', '));
                    setInstructions(recipe.steps.join('\n'));
                    setIsVegan(recipe.isVegan);
                    setAllergens(recipe.allergens.join(', '));
                    setCommentsEnabled(recipe.commentsEnabled);
                    setServings(recipe.servings);
                    setCookTime(recipe.cookTime);
                    setPrepTime(recipe.prepTime);
                    setSeoTags(recipe.seoTags.join(', '));
                } catch (err) {
                    console.error('Error fetching recipe:', err);
                }
            };

            fetchRecipe();
        }
    }, [id]);

    const parseIngredients = (input) => {
        return input.split(',').map(item => {
            const [name, quantity] = item.split(':').map(str => str.trim());
            return { name, quantity };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeData = {
            title,
            ingredients: parseIngredients(ingredients),
            steps: instructions.split('\n').map(step => step.trim()),
            isVegan,
            allergens: allergens.split(',').map(item => item.trim()),
            seoTags: seoTags.split(',').map(tag => tag.trim()),
            commentsEnabled,
            servings,
            cookTime,
            prepTime
        };

        try {
            const token = localStorage.getItem('token');
            if (id) {
                // Update existing recipe
                await axios.put(`http://localhost:5000/api/recipes/${id}`, recipeData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Create new recipe
                await axios.post('http://localhost:5000/api/recipes', recipeData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            navigate('/recipe/list'); // Redirect to recipe list after saving
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>{id ? 'Edit' : 'Upload'} Recipe</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required /><br />
                <input type="number" placeholder="Servings" value={servings} onChange={(e) => setServings(e.target.value)} required /><br />
                <input type="number" placeholder="Cook Time (in minutes)" value={cookTime} onChange={(e) => setCookTime(e.target.value)} required /><br />
                <input type="number" placeholder="Prep Time (in minutes)" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} required /><br />
                <input type="text" placeholder="Ingredients (Ingredient: Quantity, Ingredient: Quantity, ...)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required /><br />
                <textarea placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)}></textarea><br />
                <label><input type="checkbox" checked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} /> Vegan</label><br />
                <input type="text" placeholder="Allergens (comma separated)" value={allergens} onChange={(e) => setAllergens(e.target.value)} /><br />
                <input type="text" placeholder="SEO Tags (comma separated)" value={seoTags} onChange={(e) => setSeoTags(e.target.value)} /><br />
                <label><input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} /> Enable Comments</label><br />
                <button type="submit">{id ? 'Update' : 'Upload'}</button>
            </form>
        </div>
    );
}

export default RecipeForm;

/*import React, { useState } from 'react';
import axios from 'axios';

function RecipeForm({ recipe, onSuccess }) {
    const [title, setTitle] = useState(recipe ? recipe.title : '');
    const [ingredients, setIngredients] = useState(
        recipe ? recipe.ingredients.map(ing => `${ing.name}: ${ing.quantity}`).join(', ') : ''
    );
    const [instructions, setInstructions] = useState(recipe ? recipe.steps.join('\n') : '');
    const [isVegan, setIsVegan] = useState(recipe ? recipe.isVegan : false);
    const [allergens, setAllergens] = useState(recipe ? recipe.allergens.join(', ') : '');
    const [seoTags, setSeoTags] = useState(recipe ? recipe.seoTags.join(', ') : '');
    const [commentsEnabled, setCommentsEnabled] = useState(recipe ? recipe.commentsEnabled : true);

    const [servings, setServings] = useState(recipe ? recipe.servings : '');
    const [cookTime, setCookTime] = useState(recipe ? recipe.cookTime : '');
    const [prepTime, setPrepTime] = useState(recipe ? recipe.prepTime : '');

    const parseIngredients = (input) => {
        return input.split(',').map(item => {
            const [name, quantity] = item.split(':').map(str => str.trim());
            return { name, quantity };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeData = {
            title,
            ingredients: parseIngredients(ingredients),
            steps: instructions.split('\n').map(step => step.trim()), 
            isVegan,
            allergens: allergens.split(',').map(item => item.trim()),
            seoTags: seoTags.split(',').map(tag => tag.trim()),
            commentsEnabled,
            servings,   
            cookTime,   
            prepTime 
        };

        
        try {
            const token = localStorage.getItem('token');
            if (recipe && recipe._id) {
                await axios.put(`http://localhost:5000/api/recipes/${recipe._id}`, recipeData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post('http://localhost:5000/api/recipes', recipeData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
                    required
                />
                <br />
                <input
                    type="number"
                    placeholder="Servings"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    required // Ensure this field is required
                />
                <br />
                <input
                    type="number"
                    placeholder="Cook Time (in minutes)"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    required // Ensure this field is required
                />
                <br />
                <input
                    type="number"
                    placeholder="Prep Time (in minutes)"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    required // Ensure this field is required
                />                <br />
                <input
                    type="text"
                    placeholder="Ingredients (Ingredient: Quantity, Ingredient: Quantity, ...)"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
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
*/