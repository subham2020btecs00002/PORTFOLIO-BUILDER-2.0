import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaEye, FaArrowRight, FaSpinner, FaRocket, FaUser, FaPalette, FaShareAlt } from 'react-icons/fa';
import api from './api';
import { useAuth } from '../components/context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [portfolioExists, setPortfolioExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPortfolioExists = async () => {
      if (isAuthenticated) {
        try {
          const { data } = await api.get<{ exists: boolean }>('/api/portfolio/exists');
          setPortfolioExists(data.exists);
        } catch (err: any) {
          console.error(err.response?.data || err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    void checkPortfolioExists();
  }, [isAuthenticated]);

  return (
    <div className="home-hero-container">
      <div className="home-hero-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
      </div>

      <div className="home-hero-content animated fade-in">
        <div className="badge-promo">⚡ Premium Portfolio Builder 2.0</div>
        <h1>Create a stunning developer portfolio in minutes</h1>
        <p className="hero-lead">
          Build a high-converting, responsive developer portfolio complete with multiple premium templates, view count analytics, and a professional layout.
        </p>

        {isAuthenticated ? (
          <div className="cta-container">
            {loading ? (
              <div className="spinner-container">
                <FaSpinner className="spinner-icon" />
              </div>
            ) : (
              <div className="cta-buttons-group">
                {portfolioExists ? (
                  <>
                    <button className="btn-primary" onClick={() => navigate('/portfolio/edit')}>
                      <FaEdit /> Edit Portfolio
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(user?.username ? `/p/${user.username}` : `/portfolio/public/${user?._id || user?.id}`)}>
                      <FaEye /> View Public Link
                    </button>
                    <button className="btn-outline" onClick={() => navigate('/dashboard')}>
                      📊 View Analytics
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={() => navigate('/portfolio')}>
                    Create your Portfolio <FaArrowRight />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="cta-container">
            <p className="register-message">Join thousands of developers presenting their work professionally.</p>
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
              Get Started for Free <FaArrowRight />
            </button>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="home-features-section portfolio-page-wrapper">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card card-glass">
            <div className="feature-icon"><FaUser /></div>
            <h3>1. Fill Details</h3>
            <p>Use our step-by-step wizard to quickly input your work history, projects, and education credentials.</p>
          </div>

          <div className="feature-card card-glass">
            <div className="feature-icon"><FaPalette /></div>
            <h3>2. Pick Theme</h3>
            <p>Choose from multiple elegant templates including Dark Pro, Creative Gradient, or Classic Green.</p>
          </div>

          <div className="feature-card card-glass">
            <div className="feature-icon"><FaShareAlt /></div>
            <h3>3. Share Link</h3>
            <p>Get a custom slug URL like <code>/p/yourname</code>, download your CV PDF, and share with recruiters.</p>
          </div>

          <div className="feature-card card-glass">
            <div className="feature-icon"><FaRocket /></div>
            <h3>4. Analytics</h3>
            <p>Monitor your visitor views and track contact form requests directly in your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
