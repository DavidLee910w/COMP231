import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MainPage.css';

function MainPage() {
    return (
        <div className="main-page">
            <section className="hero">
                <h1>Welcome to Dishcovery</h1>
                <p>Discover, share, and save your favorite recipes. Join our community of food enthusiasts today!</p>
                <div className="hero-buttons">
                    <Link to="/search" className="button">Search Recipes</Link>
                    <Link to="/register" className="button">Get Started</Link>
                </div>
            </section>
            <section className="features">
                <h2>Why Choose Dishcovery?</h2>
                <div className="feature-list">
                    <div className="feature-item">
                        <h3>Search Recipes</h3>
                        <p>Find recipes tailored to your preferences, including vegan options and allergen filters.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Save Your Favorites</h3>
                        <p>Save recipes to your personal collection and access them anytime.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Share Your Creations</h3>
                        <p>Upload your own recipes and share them with the community.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MainPage;
