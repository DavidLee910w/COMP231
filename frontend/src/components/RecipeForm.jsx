import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import './RecipeForm.css';

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

    // SimpleMDE options
    const editorOptions = React.useMemo(() => ({
        autofocus: false,
        spellChecker: false,
        placeholder: "Write your recipe instructions here...(each line is a step)",
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "preview", "guide"],
        initialValue: instructions,
    }), []);

    const handleInstructionsChange = useCallback((value) => {
        setInstructions(value);
    }, []);

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
            allergens: allergens.split(',').map(item => item.trim()).filter(item => item !== ''),
            seoTags: seoTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
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
        <div className="page-wrapper">
            <div className="recipe-form-container">
                <h2>{id ? 'Edit' : 'Upload'} Recipe</h2>
                <form onSubmit={handleSubmit} className="recipe-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="number"
                            placeholder="Servings"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="number"
                            placeholder="Cook Time (in minutes)"
                            value={cookTime}
                            onChange={(e) => setCookTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="number"
                            placeholder="Prep Time (in minutes)"
                            value={prepTime}
                            onChange={(e) => setPrepTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Ingredients (Ingredient: Quantity, Ingredient: Quantity, ...)"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group editor-container">
                        <SimpleMDE
                            value={instructions}
                            onChange={setInstructions}
                            options={editorOptions}
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isVegan}
                                onChange={(e) => setIsVegan(e.target.checked)}
                            />
                            Vegan
                        </label>
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Allergens (comma separated)"
                            value={allergens}
                            onChange={(e) => setAllergens(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="SEO Tags (e.g. italian, pasta, main course, dinner, quick meal)"
                            value={seoTags}
                            onChange={(e) => setSeoTags(e.target.value)}
                        />
                        <small className="form-text text-muted">
                            add tags that are relevant to the recipe
                        </small>
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={commentsEnabled}
                                onChange={(e) => setCommentsEnabled(e.target.checked)}
                            />
                            Enable Comments
                        </label>
                    </div>
                    <button type="submit" className="submit-button">
                        {id ? 'Update' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RecipeForm;