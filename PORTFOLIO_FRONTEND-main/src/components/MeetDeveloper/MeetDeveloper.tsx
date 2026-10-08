import React, { useState, useRef, useCallback } from 'react';
import {
  FaLinkedin,
  FaGithub,
  FaSyncAlt,
  FaCheckCircle,
  FaRocket,
  FaBrain,
  FaServer,
  FaCode,
  FaExternalLinkAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import './MeetDeveloper.css';

export const MeetDeveloper: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const pointerX = `${(x / rect.width) * 100}%`;
    const pointerY = `${(y / rect.height) * 100}%`;

    card.style.setProperty('--rot-x', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--rot-y', `${rotateY.toFixed(2)}deg`);
    card.style.setProperty('--pointer-x', pointerX);
    card.style.setProperty('--pointer-y', pointerY);
    card.style.setProperty('--glare-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty('--rot-x', '0deg');
    card.style.setProperty('--rot-y', '0deg');
    card.style.setProperty('--glare-opacity', '0');
  }, []);

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  return (
    <section id="meet-developer" className="meet-developer-stage">
      {/* Background Ambient Lighting */}
      <div className="holo-stage-bg">
        <div className="holo-ambient-orb orb-1"></div>
        <div className="holo-ambient-orb orb-2"></div>
        <div className="holo-ambient-grid"></div>
      </div>

      <div className="holo-header">
        <div className="holo-badge-pill">
          <span className="holo-pill-pulse"></span>
          <span>CREATOR SHOWCASE</span>
        </div>
        <h2 className="holo-title">Meet the Developer</h2>
        <p className="holo-subtitle">
          Interactive holographic developer dossier. Hover to tilt the 3D card or flip to inspect the engineering radar.
        </p>
      </div>

      {/* 3D Tilt & Flip Card Container */}
      <div className="holo-card-perspective-viewport">
        <div
          ref={cardRef}
          className={`holo-card-3d ${isFlipped ? 'is-flipped' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Card Inner Flips 180deg */}
          <div className="holo-card-inner">
            {/* ================= FRONT FACE: HOLOGRAPHIC VIP PASS ================= */}
            <div className="holo-face holo-face-front">
              {/* Holographic Sheen & Foil Overlays */}
              <div className="holo-foil-layer"></div>
              <div className="holo-glare-layer"></div>
              <div className="holo-scanlines"></div>

              {/* Lanyard Clip / Header */}
              <div className="holo-pass-header">
                <div className="holo-clip-slot">
                  <div className="holo-clip-metal"></div>
                </div>
                <div className="holo-pass-meta">
                  <span className="holo-edition-tag">SPECIAL CREATOR EDITION</span>
                  <span className="holo-pass-id">ID: SK-2026-DEV</span>
                </div>
              </div>

              {/* Avatar & Verified Seal */}
              <div className="holo-identity-row">
                <div className="holo-avatar-frame">
                  <div className="holo-avatar-ring">
                    <div className="holo-avatar-monogram">SK</div>
                  </div>
                  <div className="holo-verified-seal" title="Verified Full-Stack Architect">
                    <FaCheckCircle />
                  </div>
                </div>

                <div className="holo-identity-text">
                  <div className="holo-verified-badge">
                    <FaShieldAlt className="seal-icon" />
                    <span>VERIFIED CREATOR</span>
                  </div>
                  <h3 className="holo-dev-name">Subham Kumar</h3>
                  <div className="holo-dev-title">Full-Stack Architect & AI Engineer</div>
                  <div className="holo-status-pill">
                    <span className="status-indicator"></span>
                    <span>Building in public • Open to opportunities</span>
                  </div>
                </div>
              </div>

              {/* Core Accomplishments / Chips */}
              <div className="holo-front-highlights">
                <div className="highlight-stat-box">
                  <span className="stat-value">10+</span>
                  <span className="stat-label">Templates</span>
                </div>
                <div className="highlight-stat-box">
                  <span className="stat-value">AI</span>
                  <span className="stat-label">Resume Parser</span>
                </div>
                <div className="highlight-stat-box">
                  <span className="stat-value">v2.0</span>
                  <span className="stat-label">Microservices</span>
                </div>
              </div>

              {/* Short Bio Hook */}
              <p className="holo-front-summary">
                Designed & built <strong>PortfolioBuilder 2.0</strong> from ground up — integrating NestJS, Python ML
                embeddings, and responsive TypeScript web architectures for modern engineers.
              </p>

              {/* Interactive Action Bar */}
              <div className="holo-actions-row">
                <a
                  href="https://www.linkedin.com/in/subham-kumar-273370251/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="holo-btn-primary linkedin"
                  title="Connect with Subham on LinkedIn"
                >
                  <FaLinkedin /> Connect on LinkedIn <FaExternalLinkAlt className="ext-icon" />
                </a>

                <button
                  type="button"
                  className="holo-btn-flip"
                  onClick={toggleFlip}
                  title="Flip to view technical radar & skills"
                >
                  <FaSyncAlt /> Flip Radar ↻
                </button>
              </div>
            </div>

            {/* ================= BACK FACE: TECHNICAL DOSSIER & RADAR ================= */}
            <div className="holo-face holo-face-back">
              {/* Foil overlay for back */}
              <div className="holo-foil-layer"></div>
              <div className="holo-glare-layer"></div>

              <div className="holo-back-header">
                <div className="holo-back-title-wrap">
                  <span className="holo-back-badge">SYSTEM ARCHITECTURE</span>
                  <h4>Engineering Radar & Dossier</h4>
                </div>
                <button
                  type="button"
                  className="holo-btn-flip-back"
                  onClick={toggleFlip}
                  title="Return to front badge"
                >
                  <FaSyncAlt /> Return
                </button>
              </div>

              {/* Engineering Competency Gauges */}
              <div className="holo-radar-list">
                <div className="radar-item">
                  <div className="radar-label-row">
                    <span className="radar-name">
                      <FaServer className="radar-icon" /> Backend & Microservices
                    </span>
                    <span className="radar-pct">98%</span>
                  </div>
                  <div className="radar-track">
                    <div className="radar-fill bar-backend" style={{ width: '98%' }}></div>
                  </div>
                  <span className="radar-sub">NestJS, Node.js, REST & Microservices, MongoDB, Redis</span>
                </div>

                <div className="radar-item">
                  <div className="radar-label-row">
                    <span className="radar-name">
                      <FaCode className="radar-icon" /> Modern Web Engineering
                    </span>
                    <span className="radar-pct">96%</span>
                  </div>
                  <div className="radar-track">
                    <div className="radar-fill bar-frontend" style={{ width: '96%' }}></div>
                  </div>
                  <span className="radar-sub">React, TypeScript, CSS Systems, Responsive UX, Performance</span>
                </div>

                <div className="radar-item">
                  <div className="radar-label-row">
                    <span className="radar-name">
                      <FaBrain className="radar-icon" /> AI & Intelligent Pipelines
                    </span>
                    <span className="radar-pct">93%</span>
                  </div>
                  <div className="radar-track">
                    <div className="radar-fill bar-ai" style={{ width: '93%' }}></div>
                  </div>
                  <span className="radar-sub">Python FastAPI, NLP Parsing, Embeddings, LLM Orchestration</span>
                </div>

                <div className="radar-item">
                  <div className="radar-label-row">
                    <span className="radar-name">
                      <FaRocket className="radar-icon" /> Systems & Cloud Scalability
                    </span>
                    <span className="radar-pct">95%</span>
                  </div>
                  <div className="radar-track">
                    <div className="radar-fill bar-devops" style={{ width: '95%' }}></div>
                  </div>
                  <span className="radar-sub">Docker, Vercel, Render Deployment, Rate Limiting, Enterprise Security</span>
                </div>
              </div>

              {/* Creator Quote */}
              <blockquote className="holo-creator-quote">
                &ldquo;Engineering high-performance, design-first digital products that turn complex architectures into
                seamless creator tools.&rdquo;
              </blockquote>

              {/* Back Action Row */}
              <div className="holo-actions-row">
                <a
                  href="https://www.linkedin.com/in/subham-kumar-273370251/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="holo-btn-primary linkedin"
                >
                  <FaLinkedin /> Open LinkedIn Profile
                </a>
                <a
                  href="https://github.com/subham2020btecs00002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="holo-btn-secondary github"
                >
                  <FaGithub /> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetDeveloper;
