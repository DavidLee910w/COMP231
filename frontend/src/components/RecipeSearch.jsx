//frontend/src/components/RecipeSearch.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/RecipeSearch.css';
import { useRef } from 'react';

const allergenOptions = ['peanut', 'gluten', 'shellfish', 'dairy', 'soy', 'egg'];
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

function RecipeSearch() {
    const [searchedItem, setSearchedItem] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [excludeAllergens, setExcludeAllergens] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);
    const [allTitles, setAllTitles] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const recipesPerPage = 10; //max 10 recipes per page
    const inputRef = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch all recipe titles on initial load for autocomplete
    useEffect(() => {
        const fetchTitles = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/recipes/titles`);
                console.log('Titles fetched:', res.data);
                setAllTitles(res.data);
            } catch (err) {
                console.error('Failed to fetch titles:', err);
            }
        };
        fetchTitles();
    }, []);

    const handleAllergenChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setExcludeAllergens([...excludeAllergens, value]);
        } else {
            setExcludeAllergens(excludeAllergens.filter((a) => a !== value));
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchedItem(value);
        if (value.length >= 2) {
            const filtered = allTitles.filter(title =>
                title.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true); // Mark that a search was performed
        setSuggestions([]); // Clear suggestions after searching
        try {
            const res = await axios.get(`${API_URL}/api/recipes/search`, {
                params: {
                    searchedItem,
                    isVegan,
                    excludeAllergens: excludeAllergens.join(','),
                },
            });
            
            const randomizedResults = shuffleArray([...res.data]);
            setRecipes(randomizedResults);
            setCurrentPage(1); // reset to page 1 after new search
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        }
        return array;
    };

    const handleReset = () => {
        setSearchedItem('');
        setIsVegan(false);
        setExcludeAllergens([]);
        setRecipes([]);
        setCurrentPage(1);
        setHasSearched(false); // Reset search state
        setSuggestions([]);
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
            <Helmet>
                <title>Search Recipes | Dishcovery</title>
                <meta name="description" content="Search through our collection of recipes. Filter by ingredients, dietary preferences, and allergens to find the perfect recipe for you." />
                <meta name="keywords" content="recipe search, food search, cooking, allergen-free recipes, vegan recipes" />
                <meta property="og:title" content="Search Recipes | Dishcovery" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://your-domain.com/search" />
            </Helmet>

            <h2>Search Recipes</h2>

            {/* Search input + suggestions box */}
            <div ref={inputRef} className="search-wrapper">
                <input
                    type="text"
                    placeholder="Search by keyword"
                    value={searchedItem}
                    onChange={handleInputChange}
                    className="search-input"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestion-list">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => {
                                    setSearchedItem(s);
                                    setSuggestions([]);
                                }}
                                className="suggestion-item"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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
                ) : hasSearched && currentRecipes.length === 0 ? (
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
