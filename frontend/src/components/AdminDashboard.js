// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchRecipes();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRecipes = async () => {
        try {
            // Fetch all recipes (using the search endpoint without filters)
            const res = await axios.get('http://localhost:5000/api/recipes/search');
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRecipe = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/recipes/${id}`);
            fetchRecipes();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <h3>Users</h3>
            <ul>
                {users.map(u => (
                    <li key={u._id}>
                        {u.username} - {u.role}
                    </li>
                ))}
            </ul>
            <h3>Moderate Recipes</h3>
            <ul>
                {recipes.map(recipe => (
                    <li key={recipe._id}>
                        {recipe.title}{' '}
                        <button onClick={() => handleDeleteRecipe(recipe._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;
