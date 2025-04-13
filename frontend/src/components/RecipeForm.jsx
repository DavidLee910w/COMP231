import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import '../styles/RecipeForm.css';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

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

    // New states for image upload and preview
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // SimpleMDE options

    const editorOptions = useMemo(() => ({
        autofocus: false,
        spellChecker: false,
        placeholder: "Write your recipe instructions here...(each line is a step)",
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "preview", "guide"],
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
                    const response = await axios.get(`${API_URL}/api/recipes/${id}`, {
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

                    // If there is an image URL stored in the recipe, set it for preview.
                    if (recipe.image) {
                        setImagePreview(`${API_URL}${recipe.image}`);
                    }
                    console.log('Image URL:', recipe.image);
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

        // Use FormData so we can send the image file along with other fields
        const formData = new FormData();
        formData.append('title', title);
        formData.append('ingredients', JSON.stringify(parseIngredients(ingredients)));
        formData.append('steps', JSON.stringify(instructions.split('\n').map(step => step.trim())));
        formData.append('isVegan', isVegan);
        formData.append('allergens', JSON.stringify(
            allergens.split(',').map(item => item.trim()).filter(item => item !== '')
        ));
        formData.append('seoTags', JSON.stringify(
            seoTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        ));
        formData.append('commentsEnabled', commentsEnabled);
        formData.append('servings', servings);
        formData.append('cookTime', cookTime);
        formData.append('prepTime', prepTime);

        // Append the image if one is selected
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (id) {
                // Update existing recipe
                await axios.put(`${API_URL}/api/recipes/${id}`, formData, config);
            } else {
                // Create new recipe
                await axios.post(`${API_URL}/api/recipes`, formData, config);
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
                            onChange={handleInstructionsChange}
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
                    {/* New File Input for Image Upload */}
                    <div className="form-group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </div>
                    {imagePreview && (
                        <div className="form-group">
                            <img src={imagePreview} alt="Preview" style={{ width: '200px', marginTop: '10px' }} />
                        </div>
                    )}
                    <button type="submit" className="submit-button">
                        {id ? 'Update' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RecipeForm;
