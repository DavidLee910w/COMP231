import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css'; // Add custom styles here
import { useNavigate } from 'react-router-dom';


function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
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

            const token = localStorage.getItem('token'); // Retrieve the token
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users. Please ensure you are logged in as an admin.');

        }
    };

    const fetchRecipes = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const res = await axios.get('http://localhost:5000/api/recipes/search', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch recipes.');
        }
    };

    const handleDeleteRecipe = async (id) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            await axios.delete(`http://localhost:5000/api/recipes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });
            fetchRecipes(); // Refresh the recipe list
        } catch (err) {
            console.error(err);
            setError('Failed to delete recipe.');
            await axios.delete('http://localhost:5000/api/admin/recipes/${id}', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchRecipes();
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            {error && <p className="error">{error}</p>}

            <h3>Users</h3>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.admin ? 'Admin' : 'User'}</td>
                            <td>{user.isDisabled ? 'Disabled' : 'Active'}</td>
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteUser(user._id)}
                                >
                                    Delete
                                </button>
                                <button
                                    className="toggle-btn"
                                    onClick={() => handleToggleDisableUser(user._id)}
                                >
                                    {user.isDisabled ? 'Enable' : 'Disable'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Moderate Recipes</h3>
            <ul className="recipe-list">
                {recipes.map((recipe) => (
                    <li key={recipe._id}>
                        <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                            {recipe.title}
                        </Link>
                        <button
                            className="delete-btn"
                            onClick={() => handleDeleteRecipe(recipe._id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;