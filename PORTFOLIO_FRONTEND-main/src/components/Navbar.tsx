import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { FaLaptopCode, FaSignOutAlt, FaUser, FaChartBar, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Overlay: clicking outside closes the menu */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}

      <nav className="global-navbar card-glass">
        <div className="nav-brand" onClick={() => navTo('/')}>
          <FaLaptopCode className="brand-icon" />
          <span>PortfolioBuilder</span>
        </div>

        {/* Theme and Menu controls container */}
        <div className="nav-controls-group">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
          </button>

          {/* Hamburger button — only visible on mobile */}
          <button
            className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <button
                  className={`nav-link-btn ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => navTo('/admin')}
                >
                  <FaChartBar /> Admin Panel
                </button>
              )}
              <button
                className={`nav-link-btn ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navTo('/dashboard')}
              >
                <FaChartBar /> Dashboard
              </button>
              <button
                className={`nav-link-btn ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => navTo('/settings')}
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
                onClick={() => navTo('/login')}
              >
                Login
              </button>
              <button className="nav-register-btn" onClick={() => navTo('/register')}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
