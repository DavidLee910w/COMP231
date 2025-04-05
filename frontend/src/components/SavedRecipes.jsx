//frontend/src/components/SavedRecipes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/SavedRecipes.css';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

function SavedRecipes() {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedRecipes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/recipes/saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSavedRecipes(res.data);
            } catch (err) {
                console.error('Failed to fetch saved recipes:', err);
                setError('Could not load saved recipes');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedRecipes();
    }, []);

    const handleUnsave = async (recipeId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/recipes/save/${recipeId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI instantly by removing recipe from list
            setSavedRecipes(prev => prev.filter(r => r._id !== recipeId));
        } catch (err) {
            console.error('Failed to unsave recipe:', err);
        }
    };

    if (loading) return <p>Loading your saved recipes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="saved-recipes-page">
            <div className="saved-recipes-container">
                <h2>Saved Recipes</h2>
                {savedRecipes.length === 0 ? (
                    <p>You haven't saved any recipes yet. Go explore!</p>
                ) : (
                    savedRecipes.map(recipe => (
                        <div key={recipe._id} className="saved-recipe-card">
                            <h3>
                                <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                                    {recipe.title}
                                </Link>
                                {recipe.isVegan && <span className="vegan-badge">🌱</span>}
                                <button onClick={() => handleUnsave(recipe._id)} className="unsave-button">
                                    Unsave
                                </button>
                            </h3>
                            <p>{recipe.description}</p>
                            <p><strong>Author:</strong> {recipe.createdBy?.username || 'Unknown'}</p>
                            <p><strong>Prep:</strong> {recipe.prepTime} mins | <strong>Cook:</strong> {recipe.cookTime} mins</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SavedRecipes;
