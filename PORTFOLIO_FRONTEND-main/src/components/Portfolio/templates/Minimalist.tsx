import React from 'react';
import { FaGithub, FaCode, FaAward, FaLinkedin, FaDownload, FaEnvelope, FaGraduationCap, FaExternalLinkAlt, FaSun, FaMoon } from 'react-icons/fa';
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

export const Minimalist: React.FC<TemplateProps> = ({
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
            <h2 className="section-title-minimal">Profile Summary</h2>
            <div className="minimalist-about-grid">
              <div className="about-bio-card">
                <p className="theme-bio">{portfolio.description || 'No bio description provided.'}</p>
              </div>
              
              <div className="about-education-card">
                <h3 className="sub-title-minimal"><FaGraduationCap /> Education</h3>
                <div className="education-list-minimal">
                  {portfolio.education?.map((edu, idx) => (
                    <div key={idx} className="education-item-minimal">
                      <div className="edu-header-minimal">
                        <span className="edu-college">{edu.collegeName}</span>
                        <span className="edu-dates">
                          {edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : ''} - {edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : ''}
                        </span>
                      </div>
                      <p className="edu-degree">{edu.degree} in {edu.branch}</p>
                      <p className="edu-grade">Grade/CGPA: <strong>{edu.cgpaOrPercentage}</strong></p>
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
            <h2 className="section-title-minimal">Core Competencies</h2>
            <div className="skills-card-minimal">
              <div className="skills-badge-list-minimal">
                {portfolio.skills?.map((skill, idx) => (
                  <div key={idx} className="skill-badge-minimal">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level-minimal">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'experience':
        return (
          <section id={`${idPrefix}experience`} key="experience" className="theme-section">
            <h2 className="section-title-minimal">Professional Experience</h2>
            <div className="timeline-wrapper-minimal">
              {getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
                <div key={idx} className="timeline-node-minimal">
                  <div className="job-card-minimal">
                    <div className="job-header-minimal">
                      <div>
                        <h3 className="job-company">{job.companyName}</h3>
                        <h4 className="job-position">{job.position}</h4>
                      </div>
                      <span className="job-dates">
                        {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''} -{' '}
                        {job.isCurrentEmployee
                          ? 'Present'
                          : job.yearOfLeaving
                          ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    <ul className="job-responsibilities">
                      {job.responsibility.split('\n').map((line, lidx) => (
                        <li key={lidx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'projects':
        return (
          <section id={`${idPrefix}projects`} key="projects" className="theme-section">
            <h2 className="section-title-minimal">Selected Projects</h2>
            <div className="projects-grid-minimal">
              {portfolio.projects?.map((proj, idx) => (
                <div key={idx} className="project-card-minimal">
                  <div className="project-header-minimal">
                    <h3 className="project-title">{proj.title}</h3>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link-minimal">
                        Code/Live <FaExternalLinkAlt style={{ fontSize: '0.8rem', marginLeft: '4px' }} />
                      </a>
                    )}
                  </div>
                  <p className="project-desc">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'contact':
        return (
          <section id={`${idPrefix}contact`} key="contact" className="theme-section">
            <h2 className="section-title-minimal">Inquiries & Contact</h2>
            <div className="contact-card-minimal">
              <form onSubmit={handleSubmit} className="contact-form-minimal">
                <div className="form-row-minimal">
                  <div className="form-group-minimal">
                    <label>Full Name</label>
                    <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group-minimal">
                    <label>Email Address</label>
                    <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group-minimal">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group-minimal">
                  <label>Message Reason / Details</label>
                  <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} rows={4} required />
                </div>
                <button type="submit" className="btn-minimal-submit">
                  <FaEnvelope /> Send Message
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
    <div className={`theme-container minimalist-theme ${fontClass} ${radiusClass} ${colorClass}`}>
      <div className="theme-content-wrapper">
        
        {/* Navigation */}
        {!isPreview && (
          <nav className="theme-nav">
            <ul className="theme-nav-links">
              {sectionOrder.map((sectionId) => {
                const label = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                return (
                  <li key={sectionId} onClick={() => handleScrollTo(sectionId)}>
                    {label === 'Experience' ? 'Experience' : label === 'About' ? 'About' : label}
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
          <h1 className="hero-name-minimal">{portfolio.user.name}</h1>
          <p className="theme-hero-subtitle">
            {currentJob ? `${currentJob.position} @ ${currentJob.companyName}` : portfolio.title}
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
                <FaDownload /> Download Resume CV
              </a>
            ) : (
              <button 
                onClick={() => window.open(window.location.pathname + '/resume', '_blank')} 
                className="btn-primary" 
                style={{ display: 'inline-flex', background: 'var(--accent-gradient)', border: 'none', padding: '12px 24px', cursor: 'pointer', fontWeight: 600, alignItems: 'center', gap: '8px' }}
              >
                <FaDownload /> Generate Resume PDF
              </button>
            )}
          </section>
        )}
        
      </div>
    </div>
  );
};

