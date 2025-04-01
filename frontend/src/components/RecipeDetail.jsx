import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const fetchRecipe = () => {
    fetch(`http://localhost:5000/api/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching recipe:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const res = await fetch(`http://localhost:5000/api/recipes/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment })
      });

      const data = await res.json();

      if (res.ok) {
        setNewComment('');
        setError('');
        fetchRecipe(); // Refresh recipe data with new comment
      } else {
        setError(data.msg || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Something went wrong');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{recipe.title}</h2>
      <p><strong>Description:</strong> {recipe.description}</p>
      <p><strong>Created By:</strong> {recipe.createdBy?.username || 'Unknown'}</p>
      <p><strong>Prep Time:</strong> {recipe.prepTime} mins</p>
      <p><strong>Cook Time:</strong> {recipe.cookTime} mins</p>
      <p><strong>Servings:</strong> {recipe.servings}</p>

      <h3>Ingredients:</h3>
      <ul>
        {recipe.ingredients.map((item, index) => (
          <li key={index}>{item.quantity} {item.name}</li>
        ))}
      </ul>

      <h3>Steps:</h3>
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
        <button onClick={handleAddComment}>Submit Comment</button>
      </div>
    </div>
  );
=======
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
