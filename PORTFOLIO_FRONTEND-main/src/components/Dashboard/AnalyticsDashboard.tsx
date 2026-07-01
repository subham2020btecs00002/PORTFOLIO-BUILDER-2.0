import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaEye, FaEnvelope, FaClock, FaCopy, FaQrcode, FaEdit, FaExternalLinkAlt, FaTools, FaSpinner } from 'react-icons/fa';
import { TailSpin } from 'react-loader-spinner';
import QRCode from 'qrcode';
import { toast, ToastContainer } from 'react-toastify';
import './AnalyticsDashboard.css';

interface AnalyticsRes {
  views: number;
  contactCount: number;
  lastVisited: string | null;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsRes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const publicUrl = user?.username 
    ? `${window.location.origin}/p/${user.username}` 
    : '';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get<AnalyticsRes>('/api/portfolio/analytics');
        setAnalytics(data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        // If portfolio doesn't exist, we should redirect to creation page
        if (err.response?.status === 404) {
          toast.info('Please create your portfolio first!');
          navigate('/portfolio');
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchAnalytics();
  }, [navigate]);

  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, { width: 160, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [publicUrl]);

  const handleCopyLink = () => {
    if (!publicUrl) {
      toast.warning('Set your username in settings first to get a custom link!');
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <TailSpin height="80" width="80" color="#3b82f6" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper portfolio-page-wrapper animated fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Your Dashboard</h1>
          <p className="dashboard-sub">Monitor your portfolio visitor activities and settings.</p>
        </div>
        <div className="dashboard-action-buttons">
          <button className="btn-secondary" onClick={() => navigate('/portfolio/edit')}>
            <FaEdit /> Edit Portfolio
          </button>
          {user?.username && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
              <FaExternalLinkAlt /> View Live
            </a>
          )}
        </div>
      </div>

      {!user?.username && (
        <div className="alert-setup card-glass">
          <FaTools className="alert-icon" />
          <div>
            <h4>Custom URL Slug Required</h4>
            <p>You haven't set a custom username yet. Go to settings to claim your unique link like <code>/p/yourname</code>.</p>
            <button className="btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/settings')}>
              Claim Slug
            </button>
          </div>
        </div>
      )}

      {/* Analytics stats */}
      <div className="analytics-stats-grid">
        <div className="stat-card card-glass">
          <div className="stat-icon icon-blue"><FaEye /></div>
          <div className="stat-content">
            <span className="stat-label">Total Profile Views</span>
            <h3 className="stat-value">{analytics?.views ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card card-glass">
          <div className="stat-icon icon-green"><FaEnvelope /></div>
          <div className="stat-content">
            <span className="stat-label">Contact Messages</span>
            <h3 className="stat-value">{analytics?.contactCount ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card card-glass">
          <div className="stat-icon icon-purple"><FaClock /></div>
          <div className="stat-content">
            <span className="stat-label">Last Visited Time</span>
            <h3 className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {analytics?.lastVisited 
                ? new Date(analytics.lastVisited).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No visits yet'}
            </h3>
          </div>
        </div>
      </div>

      {/* Share Section */}
      {user?.username && (
        <div className="dashboard-share-section grid-2col">
          <div className="share-link-card card-glass">
            <h3>Share Link</h3>
            <p>Your unique public portfolio URL link is ready to be shared with employers.</p>
            <div className="dashboard-link-input-group">
              <input type="text" value={publicUrl} readOnly />
              <button onClick={handleCopyLink}>
                <FaCopy /> Copy
              </button>
            </div>
            <p className="share-helper">Paste this URL on your LinkedIn, resume CV, or email signatures.</p>
          </div>

          <div className="share-qr-card card-glass">
            <h3>QR Code Profile</h3>
            <p>Let people scan this QR Code to access your portfolio directly.</p>
            <div className="qr-preview-wrapper">
              {qrCodeUrl ? (
                <>
                  <img src={qrCodeUrl} alt="QR Code Profile" />
                  <a href={qrCodeUrl} download={`${user.username}-portfolio-qr.png`} className="btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }}>
                    <FaQrcode /> Download QR Code
                  </a>
                </>
              ) : (
                <FaSpinner className="spinner-icon" />
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AnalyticsDashboard;
