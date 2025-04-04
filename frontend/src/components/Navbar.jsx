import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoIcon from '../assets/logo-icon.png'; // Import the icon

function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('token'); // Check if the user is logged in

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token from localStorage
        navigate('/login'); // Redirect to the login page
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={logoIcon} alt="Logo" className="navbar-icon" /> {/* Add the icon */}
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
                    <>
                        <Link to="/login" className="nav-item">Login</Link>
                        <Link to="/register" className="nav-item">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;