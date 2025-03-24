// frontend/src/components/RecipeDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './RecipeDetail.css';

function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/recipes/${id}`);
                setRecipe(res.data);
            } catch (err) {
                setError('Failed to fetch recipe.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setCommentSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/recipes/${id}/comments`,
                { comment: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // Refetch full recipe data to include populated username
            const updatedRecipe = await axios.get(`http://localhost:5000/api/recipes/${id}`);
            setRecipe(updatedRecipe.data);
            setNewComment('');
        } catch (err) {
            console.error('Failed to submit comment:', err);
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!recipe) return <p>Recipe not found.</p>;

    return (
        <div className="recipe-detail-container">
            <h2>{recipe.title}</h2>
            <p>Description: {recipe.description || 'N/A'}</p>
            <p>Prep Time: {recipe.prepTime} mins</p>
            <p>Cook Time: {recipe.cookTime} mins</p>
            <p>Servings: {recipe.servings}</p>
            <p>Vegan: {recipe.isVegan ? 'Yes' : 'No'}</p>
            <p>Allergens: {recipe.allergens && recipe.allergens.length > 0 ? recipe.allergens.join(', ') : 'None'}</p>

            <h3>Ingredients</h3>
            <ul>
                {recipe.ingredients.map((ing, index) => (
                    <li key={index}>{ing.name}: {ing.quantity}</li>
                ))}
            </ul>

            <h3>Steps</h3>
            <ol>
                {recipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>

            <h3>Comments</h3>
            <ul>
                {recipe.comments && recipe.comments.length > 0 ? (
                    recipe.comments.map((comment) => (
                        <li key={comment._id}>
                            {comment.comment} (by {comment.username?.username || comment.username || 'Unknown user'})
                        </li>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </ul>

            <div className="comment-form">
                <textarea
                    rows="3"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <br />
                <button onClick={handleCommentSubmit} disabled={commentSubmitting}>
                    {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
                </button>
            </div>
        </div>
    );
}

export default RecipeDetail;
