import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import './RecipeDetail.css';
import { useNavigate } from 'react-router-dom';

function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setCommentSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
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

    const navigate = useNavigate();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!recipe) return <p>Recipe not found.</p>;

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
                            "ratingValue": "5",
                            "ratingCount": "1"
                        }
                    })}
                </script>
            </Helmet>
            <div className="recipe-detail-container">
                <h2 className="recipe-title">{recipe.title}</h2>
                
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
                    <h3>Comments</h3>
                    {recipe.comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        <ul className="comments-list">
                            {recipe.comments.map((c) => (
                                <li key={c._id} className="comment">
                                    <strong>{c.username?.username || 'User'}</strong>
                                    <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                                    <p>{c.comment}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="comment-form">
                        <h4>Add Comment</h4>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment here..."
                            rows="3"
                        />
                        <button 
                            onClick={handleCommentSubmit}
                            disabled={commentSubmitting}
                        >
                            {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RecipeDetail;
