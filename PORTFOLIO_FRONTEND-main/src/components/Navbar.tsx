import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FaLaptopCode, FaSignOutAlt, FaUser, FaChartBar } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="global-navbar card-glass">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <FaLaptopCode className="brand-icon" />
        <span>PortfolioBuilder</span>
      </div>

      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <button
              className={`nav-link-btn ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <FaChartBar /> Dashboard
            </button>
            <button
              className={`nav-link-btn ${isActive('/settings') ? 'active' : ''}`}
              onClick={() => navigate('/settings')}
            >
              <FaUser /> Profile
            </button>
            <button className="nav-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-link-btn ${isActive('/login') ? 'active' : ''}`}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button className="nav-register-btn" onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
