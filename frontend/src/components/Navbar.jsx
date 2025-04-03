import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Dishcovery</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/search" className="nav-item">Search Recipes</Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/recipe/new" className="nav-item">Add Recipe</Link>
                        <Link to="/recipe/list" className="nav-item">My Recipes</Link>
                        <Link to="/saved" className="nav-item">Saved Recipes</Link>
                        <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="nav-item">Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar; 