import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './context/AuthContext';
import debounce from 'lodash/debounce';
import { FaSpinner } from 'react-icons/fa';
import './Home.css';
import backgroundImage from './images/joanna-kosinska-1_CMoFsPfso-unsplash.jpg';

/**
 * Landing / Home page.
 * Checks whether the authenticated user already has a portfolio and shows
 * context-appropriate action buttons (Create, Edit, View, or Register).
 */
const Home: React.FC = () => {
  const { loadUser, isAuthenticated, user } = useAuth();
  const [portfolioExists, setPortfolioExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const checkPortfolioExists = useCallback(
    debounce(async (): Promise<void> => {
      try {
        const { data } = await api.get<{ exists: boolean }>('/api/portfolio/exists');
        setPortfolioExists(data.exists);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 500),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (isAuthenticated) {
      void checkPortfolioExists();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, checkPortfolioExists]);

  // Progressive background image loading
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage as string;
    img.onload = () => {
      const container = document.querySelector<HTMLDivElement>('.home-container');
      if (container) {
        container.style.backgroundImage = `url(${img.src})`;
      }
    };
  }, []);

  const navigateToCreatePortfolio = (): void => {
    navigate('/portfolio');
  };

  const navigateToEditPortfolio = (): void => {
    navigate('/portfolio/edit');
  };

  const navigateToRegister = (): void => {
    navigate('/register');
  };

  const navigateToViewPortfolio = (): void => {
    if (user) {
      navigate(`/portfolio/public/${user._id}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to the Portfolio Builder</h1>
      <p>Create and manage your professional portfolio with ease.</p>
      {isAuthenticated ? (
        <div className="cta-container">
          {loading ? (
            <div className="spinner-container">
              <FaSpinner className="spinner-icon" />
            </div>
          ) : (
            <>
              {portfolioExists ? (
                <>
                  <button className="cta-button" onClick={navigateToEditPortfolio}>
                    Edit your Portfolio
                  </button>
                  <button
                    className="view-portfolio-button"
                    onClick={navigateToViewPortfolio}
                  >
                    View Your Portfolio
                  </button>
                </>
              ) : (
                <button className="cta-button" onClick={navigateToCreatePortfolio}>
                  Create your Portfolio
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="cta-container">
          <p className="register-message">Register to get started</p>
          <button className="cta-button" onClick={navigateToRegister}>
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
