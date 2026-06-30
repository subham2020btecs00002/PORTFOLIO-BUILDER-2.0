import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../Auth/AuthForm.css';

const Login = () => {
  const { login, isAuthenticated, loading, loadUser ,loginLoading} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-container">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Welcome Back!</h2>
        <p className="intro-text">Log in to access your personalized portfolio and explore your creative side.</p>
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Password"
          required
        />
        <button type="submit"className="submit-btn" disabled={loginLoading}> {/* Disable button while loading */}
          {loginLoading ? (
            <span className="loading-spinner"></span> // Add loading spinner here
          ) : (
            'Login'
          )}
        </button>
        <p className="redirect-message">Don't have an account? <a href="/register">Register here</a></p>
      </form>
    </div>
  );
};

export default Login;
