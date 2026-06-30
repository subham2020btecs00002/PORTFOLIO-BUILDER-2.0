import React, { useContext, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/context/AuthContext';
import debounce from 'lodash/debounce';
import { FaSpinner } from 'react-icons/fa'; // Import the spinner icon
import './Home.css'; // Import the CSS file
import { baseUrl } from './url';
import backgroundImage from './images/joanna-kosinska-1_CMoFsPfso-unsplash.jpg';

const Home = () => {
  const { loadUser, isAuthenticated, user } = useContext(AuthContext);
  const [portfolioExists, setPortfolioExists] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state added
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const checkPortfolioExists = useCallback(
    debounce(async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/portfolio/exists`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setPortfolioExists(data.exists);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false); // Set loading to false after checking
      }
    }, 500), // Adjust the debounce delay as needed
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      checkPortfolioExists();
    } else {
      setLoading(false); // Set loading to false if not authenticated
    }
  }, [isAuthenticated, checkPortfolioExists]);

  const navigateToCreatePortfolio = () => {
    navigate('/portfolio');
  };

  const navigateToEditPortfolio = () => {
    navigate('/portfolio/edit');
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const navigateToViewPortfolio = () => {
    if (user) {
      navigate(`/portfolio/public/${user._id}`);
    }
  };

  // Progressive background image loading
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      document.querySelector('.home-container').style.backgroundImage = `url(${img.src})`;
    };
  }, []);

  return (
    <div className="home-container">
      <h1>Welcome to the Portfolio Builder</h1>
      <p>Create and manage your professional portfolio with ease.</p>
      {isAuthenticated ? (
        <div className="cta-container">
          {loading ? (
            <div className="spinner-container">
              <FaSpinner className="spinner-icon" />
            </div> // Display a loading spinner while checking
          ) : (
            <>
              {portfolioExists ? (
                <>
                  <button className="cta-button" onClick={navigateToEditPortfolio}>
                    Edit your Portfolio
                  </button>
                  <button className="view-portfolio-button" onClick={navigateToViewPortfolio}>
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
