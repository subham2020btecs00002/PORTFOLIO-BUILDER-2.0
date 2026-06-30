import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Navbar.css';

/**
 * Application-level navigation bar.
 * Shows authenticated links (Portfolio, logout) or guest links (Register, Login)
 * based on the current auth state.
 */
const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const onLogout: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    void logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>
          <Link to="/" className="navbar-logo">
            Portfolio Builder
          </Link>
        </h1>
        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/portfolio" className="navbar-link">
                  Portfolio
                </Link>
              </li>
              <li className="navbar-user">Hello, {user?.name ?? 'User'}</li>
              <li>
                <button onClick={onLogout} className="navbar-logout-btn">
                  {/* FontAwesome logout icon */}
                  <i className="fas fa-sign-out-alt" />
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
