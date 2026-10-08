import React from 'react';
import { FaLinkedin, FaGithub, FaCode, FaRocket, FaUserTie } from 'react-icons/fa';
import './MeetDeveloper.css';

export const MeetDeveloper: React.FC = () => {
  return (
    <section id="meet-developer" className="meet-developer-section">
      <div className="meet-developer-header">
        <div className="badge-promo" style={{ display: 'inline-block', marginBottom: '12px' }}>
          👨‍💻 Creator & Engineering
        </div>
        <h2>Meet the Developer</h2>
        <p>The engineer behind the architecture, features, and design of PortfolioBuilder 2.0.</p>
      </div>

      <div className="developer-card-wrapper">
        <div className="developer-card">
          <div className="developer-avatar-container">
            <div className="developer-avatar-glow">
              <div className="developer-avatar-inner">
                <FaUserTie />
              </div>
            </div>
            <div className="developer-status-badge">
              <span className="status-dot"></span>
              <span>Available for Opportunities</span>
            </div>
          </div>

          <div className="developer-details">
            <h3>Subham Kumar</h3>
            <span className="developer-role-tag">
              Full-Stack Architect & AI Systems Engineer
            </span>
            <p className="developer-bio">
              Architect and developer of <strong>PortfolioBuilder 2.0</strong> — an enterprise-grade platform 
              built with NestJS microservices, Python ML intelligence, and responsive React web experiences. 
              Passionate about creating elegant developer tooling, scalable distributed systems, and modern digital applications.
            </p>

            <div className="developer-skills-chips">
              <span className="skill-chip"><FaCode style={{ marginRight: '4px' }} /> Full-Stack Architecture</span>
              <span className="skill-chip">NestJS & Node.js</span>
              <span className="skill-chip">React & TypeScript</span>
              <span className="skill-chip">Python AI / ML</span>
              <span className="skill-chip">Microservices & Cloud</span>
              <span className="skill-chip"><FaRocket style={{ marginRight: '4px' }} /> Distributed Systems</span>
            </div>

            <div className="developer-social-links">
              <a
                href="https://www.linkedin.com/in/subham-kumar-273370251/"
                target="_blank"
                rel="noopener noreferrer"
                className="dev-social-btn linkedin"
                title="Connect with Subham on LinkedIn"
              >
                <FaLinkedin /> Connect on LinkedIn
              </a>

              <a
                href="https://github.com/subham2020btecs00002"
                target="_blank"
                rel="noopener noreferrer"
                className="dev-social-btn github"
                title="Explore Subham's GitHub repositories"
              >
                <FaGithub /> View GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetDeveloper;
