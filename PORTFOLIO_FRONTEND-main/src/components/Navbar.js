import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, loadUser } = useContext(AuthContext);

  useEffect(() => {
    if (localStorage.token && !user) {
      loadUser();
    }
  }, [loadUser, user]);

  const onLogout = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>
          <Link to="/" className="navbar-logo">Portfolio Builder</Link>
        </h1>
        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/portfolio" className="navbar-link">Portfolio</Link>
              </li>
              <li className="navbar-user">
                Hello, {user && user.name ? user.name : 'User'}
              </li>
              <li>
                <button onClick={onLogout} className="navbar-logout-btn">
                  <i className="fas fa-sign-out-alt"></i> {/* FontAwesome logout icon */}
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register" className="navbar-link">Register</Link>
              </li>
              <li>
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
