import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

/** Lightweight navigation bar used within the portfolio form pages. */
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MyPortfolio
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <a href="#about-me" className="navbar-link">
              About Me
            </a>
          </li>
          <li className="navbar-item">
            <a href="#contact-me" className="navbar-link">
              Contact Me
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
