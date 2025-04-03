// export default App
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Login from './components/Login';
import RecipeSearch from './components/RecipeSearch';
import RecipeForm from './components/RecipeForm';
import AdminDashboard from './components/AdminDashboard';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import Navbar from './components/Navbar';
import './App.css';
import SavedRecipes from './components/SavedRecipes';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Helmet>
          <html lang="en" />
          <meta charSet="utf-8" />
          <title>Dishcovery - Find and Share Your Favorite Recipes</title>
          <meta name="description" content="Discover and share delicious recipes from around the world. Find recipes by ingredients, cuisine type, or dietary preferences. Join our community of food lovers!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="keywords" content="recipes, cooking, food, dishes, cuisine, meal planning, cooking instructions, food sharing, recipe community" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://dishcovery.com/" />
          <meta property="og:title" content="Dishcovery - Find and Share Your Favorite Recipes" />
          <meta property="og:description" content="Discover and share delicious recipes from around the world. Find recipes by ingredients, cuisine type, or dietary preferences." />
          <meta property="og:image" content="/dishcovery-banner.jpg" />
          <meta property="og:site_name" content="Dishcovery" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Dishcovery - Find and Share Your Favorite Recipes" />
          <meta name="twitter:description" content="Discover and share delicious recipes from around the world. Find recipes by ingredients, cuisine type, or dietary preferences." />
          <meta name="twitter:image" content="/dishcovery-banner.jpg" />

          {/* Additional SEO */}
          <meta name="robots" content="index, follow" />
          <meta name="theme-color" content="#6c63ff" />
          <link rel="canonical" href="https://dishcovery.com" />

          {/* PWA */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
        </Helmet>
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<RecipeSearch />} />
            <Route path="/recipe/new" element={<RecipeForm />} />
            <Route path="/recipe/edit/:id" element={<RecipeForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/recipe/list" element={<RecipeList />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/" element={<RecipeSearch />} />
          <Route path="/saved" element={<SavedRecipes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
