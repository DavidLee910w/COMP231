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

            {recipe.image && (
                <>
                <h3>Image:</h3>
                <img src={recipe.image} alt={recipe.title} width="300" />
                </>
            )}

            <h3>SEO Tags:</h3>
            <div>
                {recipe.seoTags?.map(tag => (
                <span key={tag} style={{ marginRight: 8, background: '#eee', padding: '4px 8px' }}>{tag}</span>
                ))}
            </div>

            <h3>Comments:</h3>
            {recipe.comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                <ul>
                {recipe.comments.map((c) => (
                    <li key={c._id}>
                    <strong>{c.username?.username || 'User'}</strong>: {c.comment} ({new Date(c.createdAt).toLocaleString()})
                    </li>
                ))}
                </ul>
            )}

            <div style={{ marginTop: '2rem' }}>
                <h4>Add Comment:</h4>
                <textarea
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button onClick={handleCommentSubmit}>Submit Comment</button>
            </div>
        </div>
    );
}

export default RecipeDetail;
