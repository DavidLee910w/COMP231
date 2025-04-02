// export default App
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecipeSearch from './components/RecipeSearch';
import RecipeForm from './components/RecipeForm';
import AdminDashboard from './components/AdminDashboard';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import SavedRecipes from './components/SavedRecipes';


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<RecipeSearch />} />
          <Route path="/recipe/new" element={<RecipeForm />} />
          <Route path="/recipe/edit/:id" element={<RecipeForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/recipe/list" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/saved" element={<SavedRecipes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
