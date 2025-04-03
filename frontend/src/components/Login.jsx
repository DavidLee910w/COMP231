// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });

            /* Save token and user to local storage */
            const { token, user } = res.data;
            // Store the token in localStorage
            localStorage.setItem('token', token);
            //save the user after login
            localStorage.setItem('user', JSON.stringify(user));
            setMsg(res.data.msg);
            // Redirect to the admin page if the user is an admin, otherwise redirect to the search page
            if (user.admin) {
                navigate('/admin');
            } else {
                navigate('/search');
            }

        } catch (err) {
            setMsg(err.response.data.msg || 'Login failed');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Welcome to Dishcovery</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
