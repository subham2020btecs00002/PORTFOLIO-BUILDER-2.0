import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { LoginFormData } from '../../types';
import '../Auth/AuthForm.css';

/**
 * Login page component.
 * Redirects to the home page automatically if the user is already authenticated.
 */
const Login: React.FC = () => {
  const { login, isAuthenticated, loginLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await login({ email, password });
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
        <p className="intro-text">
          Log in to access your personalized portfolio and explore your creative side.
        </p>
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
        <div className="forgot-password-container">
          <a href="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>
        <button type="submit" className="submit-btn" disabled={loginLoading}>
          {loginLoading ? <span className="loading-spinner" /> : 'Login'}
        </button>
        <p className="redirect-message">
          Don&apos;t have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
