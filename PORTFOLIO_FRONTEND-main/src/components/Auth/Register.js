// Register.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../Auth/AuthForm.css';

const Register = () => {
  const { register,registerLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate('/login'); // Redirect to login page after registration
    } catch (err) {
      console.error(err.response.data); // Log any errors for debugging
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Join Us!</h2>
        <p className="intro-text">Create your account and unlock the power of personalized portfolio building.</p>
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          required
        />
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
        <button type="submit"className="submit-btn" disabled={registerLoading}> {/* Disable button while loading */}
          {registerLoading ? (
            <span className="loading-spinner"></span> // Add loading spinner here
          ) : (
            'Register'
          )}
        </button>
        <p className="redirect-message">Already have an account? <a href="/login">Login here</a></p>
      </form>
    </div>
  );
};

export default Register;
