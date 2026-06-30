import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterFormData } from '../../types';
import '../Auth/AuthForm.css';

/**
 * Registration page component.
 * Navigates to /login automatically after successful registration.
 */
const Register: React.FC = () => {
  const { register, registerLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await register({ name, email, password });
    navigate('/login');
  };

  return (
    <div className="register-container">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Join Us!</h2>
        <p className="intro-text">
          Create your account and unlock the power of personalized portfolio building.
        </p>
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
        <button type="submit" className="submit-btn" disabled={registerLoading}>
          {registerLoading ? <span className="loading-spinner" /> : 'Register'}
        </button>
        <p className="redirect-message">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
