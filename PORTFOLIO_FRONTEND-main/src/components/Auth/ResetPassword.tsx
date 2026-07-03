import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import '../Auth/AuthForm.css';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing from the link.', { containerId: 'global' });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', { containerId: 'global' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successful! Please login.', { containerId: 'global' });
      navigate('/login');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(message, { containerId: 'global' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Reset Password</h2>
        <p className="intro-text">
          Enter your new password below. Ensure it is at least 6 characters long.
        </p>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <span className="loading-spinner" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
