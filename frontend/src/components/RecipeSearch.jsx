//frontend/src/components/RecipeSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './RecipeSearch.css';

const allergenOptions = ['peanut', 'gluten', 'shellfish', 'dairy', 'soy', 'egg'];

function RecipeSearch() {
    const [searchedItem, setSearchedItem] = useState(''); //Changed from ingredients to searchedItem
    const [isVegan, setIsVegan] = useState(false);
    const [excludeAllergens, setExcludeAllergens] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 10; //max 10 recipes per page

    const handleAllergenChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setExcludeAllergens([...excludeAllergens, value]);
        } else {
            setExcludeAllergens(excludeAllergens.filter((a) => a !== value));
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/recipes/search', {
                params: {
                    searchedItem,
                    isVegan,
                    excludeAllergens: excludeAllergens.join(','),
                },
            });
            setRecipes(res.data);
            setCurrentPage(1); // reset to page 1 after new search
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchedItem('');
        setIsVegan(false);
        setExcludeAllergens([]);
        setRecipes([]);
        setCurrentPage(1);
    };
    //pagination
    const indexOfLast = currentPage * recipesPerPage;
    const indexOfFirst = indexOfLast - recipesPerPage;
    const currentRecipes = recipes.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(recipes.length / recipesPerPage);

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    return (
        <div className="search-container">
            <h2>Search Recipes</h2>

            <input
                type="text"
                placeholder="Search by keyword"
                value={searchedItem}
                onChange={(e) => setSearchedItem(e.target.value)}
                className="search-input"
            />

            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                />
                Vegan Only
            </label>

            <div className="allergen-filter">
                <strong>Exclude Allergens:</strong>
                <div className="checkbox-group">
                    {allergenOptions.map((allergen) => (
                        <label key={allergen}>
                            <input
                                type="checkbox"
                                value={allergen}
                                checked={excludeAllergens.includes(allergen)}
                                onChange={handleAllergenChange}
                            />
                            {allergen}
                        </label>
                    ))}
                </div>
            </div>

            <div className="button-group">
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleReset}>Reset</button>
            </div>

            <div className="results-container">
                {loading ? (
                    <p>Loading recipes...</p>
                ) : currentRecipes.length === 0 ? (
                    <p>No recipes found.</p>
                ) : (
                    currentRecipes.map((recipe) => (
                        <div key={recipe._id} className="recipe-card">
                            <h3>
                                <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                                    {recipe.title}
                                </Link>{' '}
                                {recipe.isVegan && <span className="vegan-label">🌱 Vegan</span>}
                            </h3>
                            <p><strong>Allergens:</strong> {recipe.allergens?.join(', ') || 'None'}</p>
                            <p>
                                <strong>Prep Time:</strong> {recipe.prepTime} mins |{' '}
                                <strong>Cook Time:</strong> {recipe.cookTime} mins |{' '}
                                <strong>Servings:</strong> {recipe.servings}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={currentPage === pageNum ? 'active' : ''}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RecipeSearch;
