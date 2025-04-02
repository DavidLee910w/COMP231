// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    if (user === null) return <p>Loading...</p>;

    useEffect(() => {
        if (!user?.admin) {
            navigate('/');//redirect to main page "/" if user is not admin
        } else {
            fetchUsers();
            fetchRecipes();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchRecipes = async () => {
        try {
            // Fetch all recipes (using the search endpoint without filters)
            const res = await axios.get('http://localhost:5000/api/recipes/search');
            setRecipes(res.data);
        } catch (err) {
            console.error('Failed to fetch recipes:', err);
        }
    };

    const handleDeleteRecipe = async (id) => {
        try {
            await axios.delete('http://localhost:5000/api/admin/recipes/${id}', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchRecipes();
        } catch (err) {
            console.error('Failed to delete recipe:', err);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <h3>Users</h3>
            <ul>
                {users.map(u => (
                    <li key={u._id}>
                        {u.username || '(no username)'} - {u.admin ? 'admin' : 'user'}
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
