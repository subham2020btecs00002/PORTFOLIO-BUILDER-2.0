import React from 'react';
import { FaGithub, FaCode, FaAward, FaLinkedin, FaDownload, FaEnvelope, FaSun, FaMoon } from 'react-icons/fa';
import type { Portfolio, ContactFormData } from '../../../types';
import { baseUrl } from '../../url';
import { getSortedHistory } from '../../../utils/portfolioUtils';

interface TemplateProps {
  portfolio: Portfolio;
  contactForm: ContactFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleScrollTo: (sectionId: string) => void;
  isPreview?: boolean;
  theme?: string;
  toggleTheme?: () => void;
}

export const Cyberpunk: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  handleScrollTo,
  isPreview = false,
  theme,
  toggleTheme,
}) => {
  const currentJob = portfolio.professionalHistory?.find((job) => job.isCurrentEmployee);
  
  const fontClass = portfolio.fontFamily && portfolio.fontFamily !== 'default' ? `font-family-${portfolio.fontFamily}` : '';
  const radiusClass = portfolio.borderRadius && portfolio.borderRadius !== 'default' ? `radius-override-${portfolio.borderRadius}` : '';
  const colorClass = portfolio.themeColor && portfolio.themeColor !== 'default' ? `color-override-${portfolio.themeColor}` : '';

  const sectionOrder = portfolio.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'];

  const renderSection = (sectionId: string) => {
    const idPrefix = isPreview ? 'preview-' : '';
    switch (sectionId) {
      case 'about':
        return (
          <section id={`${idPrefix}about`} key="about" className="theme-section">
            <h2>&gt; ABOUT_ME</h2>
            <div className="grid-2col">
              <div className="theme-card">
                <p className="theme-bio">{portfolio.description || 'No bio description provided.'}</p>
              </div>
              
              <div className="theme-education-col">
                <h3>&gt; ACADEMICS</h3>
                <div style={{ marginTop: '16px' }}>
                  {portfolio.education?.map((edu, idx) => (
                    <div key={idx} className="theme-card">
                      <h4 className="theme-card-subtitle">{edu.collegeName}</h4>
                      <p className="theme-card-meta">{edu.degree} {"//"} {edu.branch}</p>
                      <p className="theme-card-meta" style={{ fontWeight: 600 }}>SCORE: {edu.cgpaOrPercentage}</p>
                      <p className="theme-card-meta" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                        {edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : ''} - {edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      case 'skills':
        return (
          <section id={`${idPrefix}skills`} key="skills" className="theme-section">
            <h2>&gt; TECH_STACK</h2>
            <div className="theme-card">
              <div className="skills-badge-list">
                {portfolio.skills?.map((skill, idx) => (
                  <div key={idx} className="skill-badge">
                    <span>{skill.name}</span>
                    <span className="skill-level-indicator">({skill.level})</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'experience':
        return (
          <section id={`${idPrefix}experience`} key="experience" className="theme-section">
            <h2>&gt; CHRONOLOGY</h2>
            <div className="timeline-wrapper">
              {getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
                <div key={idx} className="timeline-node">
                  <div className="theme-card">
                    <div className="theme-card-header">
                      <div>
                        <h3 className="theme-card-title">{job.companyName}</h3>
                        <h4 className="theme-card-subtitle" style={{ margin: '4px 0 0', opacity: 0.8 }}>{job.position}</h4>
                      </div>
                      <span className="theme-card-meta" style={{ whiteSpace: 'nowrap' }}>
                        {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''} -{' '}
                        {job.isCurrentEmployee
                          ? 'Present'
                          : job.yearOfLeaving
                          ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    <div>
                      {job.responsibility.split('\n').map((line, lidx) => (
                        <p key={lidx} className="theme-list-item">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'projects':
        return (
          <section id={`${idPrefix}projects`} key="projects" className="theme-section">
            <h2>&gt; PROJECTS</h2>
            <div className="grid-2col">
              {portfolio.projects?.map((proj, idx) => (
                <div key={idx} className="theme-card">
                  <h3 className="theme-card-title">{proj.title}</h3>
                  <p style={{ margin: '12px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{proj.description}</p>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontWeight: 600 }}>
                      [VIEW_DEPLOYMENT] →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      case 'contact':
        return (
          <section id={`${idPrefix}contact`} key="contact" className="theme-section">
            <h2>&gt; COMMUNICATE</h2>
            <div className="theme-contact-form-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>NAME</label>
                  <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>EMAIL</label>
                  <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>TELEPHONE</label>
                  <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>REASON</label>
                  <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} rows={4} required />
                </div>
                <button type="submit">
                  <FaEnvelope /> INITIALIZE_MESSAGE
                </button>
              </form>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`theme-container cyberpunk-theme ${fontClass} ${radiusClass} ${colorClass}`}>
      <div className="theme-content-wrapper">
        
        {/* Navigation */}
        {!isPreview && (
          <nav className="theme-nav">
            <ul className="theme-nav-links">
              {sectionOrder.map((sectionId) => {
                const label = sectionId.toUpperCase();
                return (
                  <li key={sectionId} onClick={() => handleScrollTo(sectionId)}>
                    ./{label}
                  </li>
                );
              })}
            </ul>
            {toggleTheme && (
              <button className="navbar-theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
              </button>
            )}
          </nav>
        )}

        {/* Hero */}
        <header className="theme-hero">
          <h1>{portfolio.user.name}</h1>
          <p className="theme-hero-subtitle">
            {currentJob ? `[ ${currentJob.position} @ ${currentJob.companyName} ]` : `[ ${portfolio.title} ]`}
          </p>
          <div className="social-links-row">
            {portfolio.portfolioLinks?.github && (
              <a href={portfolio.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaGithub />
              </a>
            )}
            {portfolio.portfolioLinks?.leetcode && (
              <a href={portfolio.portfolioLinks.leetcode} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaCode />
              </a>
            )}
            {portfolio.portfolioLinks?.gfg && (
              <a href={portfolio.portfolioLinks.gfg} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaAward />
              </a>
            )}
            {portfolio.portfolioLinks?.linkedin && (
              <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaLinkedin />
              </a>
            )}
          </div>
        </header>

        {/* Render sections dynamically */}
        {sectionOrder.map((sectionId) => renderSection(sectionId))}

        {/* CV Exporter Link */}
        {!isPreview && (
          <section className="theme-section" style={{ textAlign: 'center', marginTop: '40px' }}>
            {portfolio.pdf ? (
              <a href={`${baseUrl}/api/portfolio/download/${portfolio._id}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', background: 'var(--accent-gradient)', textDecoration: 'none', alignItems: 'center', gap: '8px' }}>
                <FaDownload /> DOWNLOAD_CV
              </a>
            ) : (
              <button 
                onClick={() => window.open(window.location.pathname + '/resume', '_blank')} 
                className="btn-primary" 
                style={{ display: 'inline-flex', background: 'var(--accent-gradient)', border: 'none', padding: '12px 24px', cursor: 'pointer', fontWeight: 600, alignItems: 'center', gap: '8px' }}
              >
                <FaDownload /> GENERATE_RESUME_PDF
              </button>
            )}
          </section>
        )}
        
      </div>
    </div>
  );
};
