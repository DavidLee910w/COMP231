import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import './RecipeDetail.css';
import { useNavigate } from 'react-router-dom';

// Star rating component
const StarRating = ({ rating, onRatingChange }) => {
    const [hover, setHover] = useState(null);
    
    return (
        <div className="star-rating">
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input 
                            type="radio" 
                            name="rating" 
                            value={ratingValue} 
                            onClick={() => onRatingChange(ratingValue)}
                        />
                        <span 
                            className={`star ${ratingValue <= (hover || rating) ? 'filled' : ''}`}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(null)}
                        >
                            ★
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [rating, setRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 5;
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && user.admin) {
            setIsAdmin(true);
        }

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
        const checkIfSaved = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/recipes/${id}/isSaved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsSaved(res.data.isSaved);
            } catch (err) {
                console.error('Could not check if saved:', err);
            }
        };
        fetchRecipe();
        checkIfSaved();
    }, [id]);

    const handleToggleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/recipes/save/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaved(prev => !prev);
        } catch (err) {
            console.error('Failed to toggle save:', err);
        }
    };

    const handleRatingChange = (value) => {
        setRating(value);
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim() && rating === 0) return;
        setCommentSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/recipes/${id}/comments`,
                { comment: newComment, rating: rating },
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
            setRating(0);
            setCurrentPage(1); // Reset to first page to show the newly added comment
        } catch (err) {
            console.error('Failed to submit comment:', err);
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleBackToSearch = () => {
        navigate('/search');
    };

    // Function to handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteComment = async (recipeId, commentId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/recipes/${recipeId}/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Refresh recipe data after delete
            const updatedRecipe = await axios.get(`http://localhost:5000/api/recipes/${id}`);
            setRecipe(updatedRecipe.data);

            // If the current page is now empty (except for the last page), go to the previous page
            const newSortedComments = [...updatedRecipe.data.comments].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            const newTotalPages = Math.ceil(newSortedComments.length / commentsPerPage);
            
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }
        } catch (err) {
            console.error('Failed to delete comment:', err);
            alert('Failed to delete review. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!recipe) return <p>Recipe not found.</p>;

    // Sort comments, newest first
    const sortedComments = [...recipe.comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination logic
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);
    const totalPages = Math.ceil(sortedComments.length / commentsPerPage);

    // Calculate average rating
    const hasRatings = recipe.comments && recipe.comments.some(c => c.rating > 0);
    const avgRating = hasRatings 
        ? (recipe.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / 
          recipe.comments.filter(c => c.rating > 0).length).toFixed(1)
        : 0;

    const metaDescription = `${recipe.title} - ${recipe.isVegan ? 'Vegan Recipe' : 'Recipe'} with prep time ${recipe.prepTime} mins and cook time ${recipe.cookTime} mins. Serves ${recipe.servings}. ${recipe.ingredients.map(ing => ing.name).join(', ')}.`;
    const keywords = [...(recipe.seoTags || []), recipe.title, 'recipe', 'cooking', recipe.isVegan ? 'vegan' : ''].filter(Boolean).join(', ');
    const currentUrl = window.location.href;

    return (
        <>
            <Helmet>
                <title>{`${recipe.title} Recipe - Dishcovery`}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={keywords} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={`${recipe.title} Recipe - Dishcovery`} />
                <meta property="og:description" content={metaDescription} />
                {recipe.image && <meta property="og:image" content={recipe.image} />}
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${recipe.title} Recipe - Dishcovery`} />
                <meta name="twitter:description" content={metaDescription} />
                {recipe.image && <meta name="twitter:image" content={recipe.image} />}
                
                {/* Recipe specific meta tags */}
                <meta name="recipe-type" content={recipe.isVegan ? 'Vegan' : 'Standard'} />
                <meta name="cooking-time" content={`${recipe.cookTime} minutes`} />
                <meta name="prep-time" content={`${recipe.prepTime} minutes`} />
                <meta name="recipe-yield" content={`${recipe.servings} servings`} />
                
                {/* Canonical URL */}
                <link rel="canonical" href={currentUrl} />

                {/* Schema.org Recipe Markup */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Recipe",
                        "name": recipe.title,
                        "image": recipe.image,
                        "description": metaDescription,
                        "keywords": keywords,
                        "author": {
                            "@type": "Organization",
                            "name": "Dishcovery"
                        },
                        "datePublished": recipe.createdAt,
                        "prepTime": `PT${recipe.prepTime}M`,
                        "cookTime": `PT${recipe.cookTime}M`,
                        "totalTime": `PT${parseInt(recipe.prepTime) + parseInt(recipe.cookTime)}M`,
                        "recipeYield": `${recipe.servings} servings`,
                        "recipeCategory": recipe.seoTags?.join(', '),
                        "recipeCuisine": recipe.seoTags?.join(', '),
                        "recipeIngredient": recipe.ingredients.map(ing => `${ing.name}: ${ing.quantity}`),
                        "recipeInstructions": recipe.steps.map(step => ({
                            "@type": "HowToStep",
                            "text": step
                        })),
                        "suitableForDiet": recipe.isVegan ? "VeganDiet" : undefined,
                        "nutrition": {
                            "@type": "NutritionInformation",
                            "suitableForDiet": recipe.isVegan ? "VeganDiet" : undefined
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": hasRatings ? avgRating : "5",
                            "ratingCount": hasRatings ? recipe.comments.filter(c => c.rating > 0).length : "1"
                        }
                    })}
                </script>
            </Helmet>
            <div className="recipe-detail-container">
                <div className="recipe-actions">
                    <button className="back-button" onClick={handleBackToSearch}>
                        ← Back to Search
                    </button>
                    <button 
                        className={`save-button ${isSaved ? 'saved' : ''}`} 
                        onClick={handleToggleSave}
                    >
                        {isSaved ? 'Unsave' : 'Save Recipe'}
                    </button>
                </div>
                
                <h2 className="recipe-title">{recipe.title}</h2>
                
                {hasRatings && (
                    <div className="recipe-rating">
                        <div className="star-display">
                            {[...Array(5)].map((_, index) => (
                                <span key={index} className={`star ${index < Math.round(avgRating) ? 'filled' : ''}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="rating-value">{avgRating}/5</span>
                        <span className="rating-count">({recipe.comments.filter(c => c.rating > 0).length} {recipe.comments.filter(c => c.rating > 0).length === 1 ? 'rating' : 'ratings'})</span>
                    </div>
                )}
                
                <div className="recipe-meta">
                    <p><strong>Prep Time:</strong> {recipe.prepTime} mins</p>
                    <p><strong>Cook Time:</strong> {recipe.cookTime} mins</p>
                    <p><strong>Servings:</strong> {recipe.servings}</p>
                    <p><strong>Vegan:</strong> {recipe.isVegan ? 'Yes' : 'No'}</p>
                    <p><strong>Allergens:</strong> {recipe.allergens && recipe.allergens.length > 0 ? recipe.allergens.join(', ') : 'None'}</p>
                </div>

                <div className="recipe-section">
                    <h3>Ingredients</h3>
                    <ul className="ingredients-list">
                        {recipe.ingredients.map((ing, index) => (
                            <li key={index}>{ing.name}: {ing.quantity}</li>
                        ))}
                    </ul>
                </div>

                <div className="recipe-section">
                    <h3>Instructions</h3>
                    <div className="markdown-content">
                        <ReactMarkdown>{recipe.steps.join('\n\n')}</ReactMarkdown>
                    </div>
                </div>

                {recipe.image && (
                    <div className="recipe-section">
                        <h3>Image</h3>
                        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                    </div>
                )}

                <div className="recipe-section">
                    <h3>Keywords</h3>
                    <div className="tags">
                        {recipe.seoTags?.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="comments-section">
                    <h3>Ratings & Comments</h3>
                    {recipe.comments.length === 0 ? (
                        <p>No ratings or comments yet. Be the first to rate this recipe!</p>
                    ) : (
                        <>
                            <ul className="comments-list">
                                {currentComments.map((c) => (
                                    <li key={c._id} className="comment">
                                        <div className="comment-header">
                                            <div className="user-rating">
                                                <strong>{c.username?.username || 'User'}</strong>
                                                {c.rating > 0 && (
                                                    <div className="comment-rating">
                                                        {[...Array(5)].map((_, index) => (
                                                            <span key={index} className={`star ${index < c.rating ? 'filled' : ''}`}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="comment-actions">
                                                <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                                                {isAdmin && (
                                                    <button 
                                                        className="delete-comment-btn"
                                                        onClick={() => handleDeleteComment(id, c._id)}
                                                        title="Delete this review"
                                                    >
                                                        <span className="delete-icon">×</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {c.comment && <p>{c.comment}</p>}
                                    </li>
                                ))}
                            </ul>

                            {totalPages > 1 && (
                                <div className="comments-pagination">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="page-button"
                                    >
                                        &laquo; Prev
                                    </button>
                                    <span className="page-info">
                                        {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="page-button"
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="comment-form">
                        <h4>Rate & Review This Recipe</h4>
                        <div className="rating-input">
                            <label>Your Rating:</label>
                            <StarRating rating={rating} onRatingChange={handleRatingChange} />
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your review here (optional if rating)"
                            rows="3"
                        />
                        <button 
                            onClick={handleCommentSubmit}
                            disabled={commentSubmitting || (newComment.trim() === '' && rating === 0)}
                        >
                            {commentSubmitting ? 'Submitting...' : 'Submit Rating & Review'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RecipeDetail;
