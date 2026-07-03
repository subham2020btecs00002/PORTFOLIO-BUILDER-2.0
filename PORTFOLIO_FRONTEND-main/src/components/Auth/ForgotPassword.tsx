import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import '../Auth/AuthForm.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Request submitted successfully', { containerId: 'global' });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message, { containerId: 'global' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-form">
        <h2>Forgot Password?</h2>
        {!submitted ? (
          <form onSubmit={onSubmit}>
            <p className="intro-text">
              Enter your email address and we will send you a secure link to reset your password.
            </p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div>
            <p className="intro-text" style={{ fontSize: '1.05rem', margin: '20px 0' }}>
              If an account with that email exists, we have sent a password reset link to your email inbox. Please check your spam folder if you do not receive it shortly.
            </p>
          </div>
        )}
        <p className="redirect-message">
          Back to <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
