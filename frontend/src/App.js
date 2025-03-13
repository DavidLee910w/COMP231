// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecipeSearch from './components/RecipeSearch';
import RecipeForm from './components/RecipeForm';
import AdminDashboard from './components/AdminDashboard';

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/search" element={<RecipeSearch />} />
                    <Route path="/recipe/new" element={<RecipeForm />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
