import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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
        <div>
            <h1>Your Recipes</h1>
            <button onClick={() => navigate('/recipe/new')}>Add New Recipe</button>

            {loading ? (
                <p>Loading...</p>
            ) : recipes.length === 0 ? (
                <p>No recipes found. Try adding one!</p>
            ) : (
                recipes.map((recipe) => (
                    <div key={recipe._id}>
                        {recipe.title}
                        <button onClick={() => navigate(`/recipe/edit/${recipe._id}`)}>Edit</button>
                        <button onClick={() => handleDelete(recipe._id)}>Delete</button>
                    </div>
                ))
            )}
        </div>
    );
}

export default RecipeList;