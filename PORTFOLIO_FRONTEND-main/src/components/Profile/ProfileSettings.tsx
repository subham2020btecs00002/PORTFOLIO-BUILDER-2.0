import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserTag, FaCheck, FaSpinner, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
  const { user, updateUsername } = useAuth();
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState<string>(user?.username || '');
  const [updating, setUpdating] = useState<boolean>(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      toast.warning('Username slug cannot be empty!');
      return;
    }
    
    setUpdating(true);
    try {
      await updateUsername(usernameInput);
      // Wait a moment, then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const shareableUrl = usernameInput 
    ? `${window.location.origin}/p/${usernameInput.toLowerCase().trim()}`
    : `${window.location.origin}/p/your-custom-slug`;

  return (
    <div className="settings-wrapper portfolio-page-wrapper animated fade-in">
      <div className="settings-header">
        <h1>Profile Settings</h1>
        <p className="settings-sub">Manage your public credentials and personal details.</p>
      </div>

      <div className="settings-grid">
        {/* Claim Slug Card */}
        <div className="settings-card card-glass">
          <div className="card-title-row">
            <FaUserTag className="card-title-icon" />
            <h3>Custom Portfolio URL Slug</h3>
          </div>
          <p className="settings-card-desc">
            Claim your clean, shareable URL. This replaces complex ID strings with a personalized name link.
          </p>

          <form onSubmit={handleUsernameSubmit} className="username-form">
            <div className="form-group">
              <label htmlFor="username">Public Username</label>
              <div className="slug-input-prefix-wrapper">
                <span className="slug-prefix">portfolio.com/p/</span>
                <input
                  type="text"
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="john-doe"
                  disabled={updating}
                  required
                />
              </div>
              <p className="field-hint">Alphanumeric, hyphens, and underscores only.</p>
            </div>

            <div className="url-preview-box">
              <span>Preview Link:</span>
              <a href={shareableUrl} target="_blank" rel="noopener noreferrer">
                {shareableUrl}
              </a>
            </div>

            <button type="submit" className="btn-primary" disabled={updating || usernameInput === user?.username}>
              {updating ? (
                <>
                  <FaSpinner className="spinner-icon" /> Saving...
                </>
              ) : (
                <>
                  <FaCheck /> Claim Username Slug
                </>
              )}
            </button>
          </form>
        </div>

        {/* Profile Info Card (Read only or visual check) */}
        <div className="settings-card card-glass">
          <div className="card-title-row">
            <FaUser className="card-title-icon" />
            <h3>Account Profile</h3>
          </div>
          <p className="settings-card-desc">Your basic account registration details.</p>
          
          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Account ID</span>
              <span className="detail-value" style={{ fontSize: '0.8rem', opacity: 0.6 }}>{user?._id}</span>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ProfileSettings;
