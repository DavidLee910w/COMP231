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

import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import './App.css';
import SavedRecipes from './components/SavedRecipes';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Dishcovery - Recipe Sharing Platform</title>
          <meta name="description" content="Discover and share your favorite recipes on Dishcovery" />
        </Helmet>
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<RecipeSearch />} />
            <Route path="/recipe/new" element={<RecipeForm />} />
            <Route path="/recipe/edit/:id" element={<RecipeForm />} />
             <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
            <Route path="/recipe/list" element={<RecipeList />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/" element={<RecipeSearch />} />
            <Route path="/saved" element={<SavedRecipes />} />
          </Routes>
        </div>
        </div>
    </Router>
  );
}

export default App;
