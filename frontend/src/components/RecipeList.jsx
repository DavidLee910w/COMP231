import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './RecipeList.css'; // Import the CSS file for styling

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // For navigation

    const fetchUserRecipes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/recipes/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecipes(response.data);
        } catch (error) {
            console.error('Error fetching user recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRecipes();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recipe?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecipes(recipes.filter(recipe => recipe._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="recipe-list-page">
            <div className="recipe-list-container">
                <h1>Your Recipes</h1>
                <button onClick={() => navigate('/recipe/new')} className="add-recipe-button">Add New Recipe</button>

                {loading ? (
                    <p>Loading...</p>
                ) : recipes.length === 0 ? (
                    <p>No recipes found. Try adding one!</p>
                ) : (
                    recipes.map((recipe) => (
                        <div key={recipe._id} className="recipe-item">
                            <span>{recipe.title}</span>
                            <div className="recipe-actions">
                                <button onClick={() => navigate(`/recipe/edit/${recipe._id}`)} className="edit-button">Edit</button>
                                <button onClick={() => handleDelete(recipe._id)} className="delete-button">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default RecipeList;