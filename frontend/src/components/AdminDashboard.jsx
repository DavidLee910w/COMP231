// Updated AdminDashboard.jsx with reported comment management
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [reportedComments, setReportedComments] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    if (user === null) return <p>Loading...</p>;

    useEffect(() => {
        if (!user?.admin) {
            navigate('/');
        } else {
            fetchUsers();
            fetchRecipes();
            fetchReportedComments();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users. Please ensure you are logged in as an admin.');
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/recipes/search', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch recipes.');
        }
    };

    const fetchReportedComments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/reported-comments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReportedComments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRecipe = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchRecipes();
        } catch (err) {
            console.error(err);
            setError('Failed to delete recipe.');
        }
    };

    const handleDeleteComment = async (recipeId, commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/recipes/${recipeId}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Comment deleted.');
            fetchReportedComments();
        } catch (err) {
            console.error(err);
            alert('Failed to delete comment.');
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
                                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                                    Delete
                                </button>
                                <button className="toggle-btn" onClick={() => handleToggleDisableUser(user._id)}>
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
                        <button className="delete-btn" onClick={() => handleDeleteRecipe(recipe._id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <h3>Reported Comments</h3>
            {reportedComments.length === 0 ? (
                <p>No reported comments.</p>
            ) : (
                <table className="comment-table">
                    <thead>
                        <tr>
                            <th>Recipe</th>
                            <th>User</th>
                            <th>Comment</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportedComments.map((rc) => (
                            <tr key={rc.commentId}>
                                <td>
                                    <Link to={`/recipe/${rc.recipeId}`} className="recipe-link">
                                        {rc.recipeTitle}
                                    </Link>
                                </td>
                                <td>{rc.username}</td>
                                <td>{rc.comment}</td>
                                <td>{new Date(rc.createdAt).toLocaleString()}</td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteComment(rc.recipeId, rc.commentId)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminDashboard;
