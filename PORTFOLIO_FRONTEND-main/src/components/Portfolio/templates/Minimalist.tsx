import React, { useState } from 'react';
import { FaGithub, FaCode, FaAward, FaLinkedin, FaDownload, FaEnvelope, FaGraduationCap, FaSun, FaMoon } from 'react-icons/fa';
import type { Portfolio, ContactFormData, Project } from '../../../types';
import { baseUrl } from '../../url';
import { getSortedHistory } from '../../../utils/portfolioUtils';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { ProjectSpotlightModal } from '../ProjectSpotlightModal';
import { PdfViewerModal } from '../PdfViewerModal';
import { AvatarZoomModal } from '../AvatarZoomModal';

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
  useScrollReveal();

  const [spotlightProject, setSpotlightProject] = useState<Project | null>(null);
  const [viewPdf, setViewPdf] = useState<boolean>(false);
  const [zoomAvatar, setZoomAvatar] = useState<boolean>(false);

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
          <section id={`${idPrefix}about`} key="about" className="theme-section reveal-on-scroll">
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
          <section id={`${idPrefix}skills`} key="skills" className="theme-section reveal-on-scroll">
            <h2 className="section-title-minimal">Core Competencies</h2>
            <div className="skills-card-minimal">
              <div className="skills-badge-list-minimal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {portfolio.skills?.map((skill, idx) => (
                  <div key={idx} className="skill-item-container">
                    <div className="skills-badge-minimal" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', border: 'none', background: 'none', padding: 0 }}>
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level-minimal" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{skill.level}</span>
                    </div>
                    <div className="skill-progress-track">
                      <div 
                        className="skill-progress-bar" 
                        style={{ 
                          width: skill.level === 'Expert' ? '100%' : skill.level === 'Intermediate' ? '70%' : '35%' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'experience':
        return (
          <section id={`${idPrefix}experience`} key="experience" className="theme-section reveal-on-scroll">
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
                    {job.technologies && job.technologies.length > 0 && (
                      <div className="experience-tags-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {job.technologies.map((tech) => (
                          <span key={tech} className="experience-tag" style={{
                            fontSize: '0.7rem',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(128, 128, 128, 0.12)',
                            color: 'var(--primary-color, #1a1a1a)',
                            fontWeight: 600,
                            border: '1px solid rgba(128, 128, 128, 0.2)'
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'projects':
        return (
          <section id={`${idPrefix}projects`} key="projects" className="theme-section reveal-on-scroll">
            <h2 className="section-title-minimal">Selected Projects</h2>
            <div className="projects-grid-minimal">
              {portfolio.projects?.map((proj, idx) => (
                <div key={idx} className="project-card-minimal" onClick={() => setSpotlightProject(proj)}>
                  <div className="project-header-minimal">
                    <h3 className="project-title">{proj.title}</h3>
                    {proj.link && (
                      <span className="project-link-minimal" style={{ cursor: 'pointer', color: 'var(--primary-color, #1a1a1a)' }}>
                        Spotlight details →
                      </span>
                    )}
                  </div>
                  <p className="project-desc">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="project-tags-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {proj.technologies.map((tech) => (
                        <span key={tech} className="project-tag" style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(128, 128, 128, 0.12)',
                          color: 'var(--primary-color, #1a1a1a)',
                          fontWeight: 600,
                          border: '1px solid rgba(128, 128, 128, 0.2)'
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      case 'contact':
        return (
          <section id={`${idPrefix}contact`} key="contact" className="theme-section reveal-on-scroll">
            <h2 className="section-title-minimal">Inquiries & Contact</h2>
            <div className="contact-card-minimal">
              <form onSubmit={handleSubmit} className="contact-form-minimal" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="floating-form-group">
                  <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} placeholder=" " required />
                  <label>Name</label>
                </div>
                <div className="floating-form-group">
                  <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} placeholder=" " required />
                  <label>Email Address</label>
                </div>
                <div className="floating-form-group">
                  <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} placeholder=" " required />
                  <label>Phone Number</label>
                </div>
                <div className="floating-form-group">
                  <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} placeholder=" " rows={4} required />
                  <label>Reason of Contact</label>
                </div>
                <button type="submit" className="btn-minimal-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', cursor: 'pointer', fontWeight: 600 }}>
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
          {(portfolio.avatarUrl || (portfolio.avatar && portfolio.avatar.contentType)) && (
            <div className="theme-avatar-container">
              <img
                src={portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`}
                alt={portfolio.user.name}
                className="theme-avatar"
                onClick={() => setZoomAvatar(true)}
              />
            </div>
          )}
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
          <section className="theme-section reveal-on-scroll" style={{ textAlign: 'center', marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {portfolio.pdf ? (
              <>
                <a href={`${baseUrl}/api/portfolio/download/${portfolio._id}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', background: 'var(--accent-gradient)', textDecoration: 'none', alignItems: 'center', gap: '8px' }}>
                  <FaDownload /> Download CV
                </a>
                <button 
                  onClick={() => setViewPdf(true)} 
                  className="btn-secondary" 
                  style={{ display: 'inline-flex', border: '1px solid var(--border-color)', padding: '12px 24px', cursor: 'pointer', fontWeight: 600, alignItems: 'center', gap: '8px' }}
                >
                  View Resume
                </button>
              </>
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

      {/* Presentation Modals */}
      {spotlightProject && (
        <ProjectSpotlightModal 
          project={spotlightProject} 
          onClose={() => setSpotlightProject(null)} 
        />
      )}
      {viewPdf && portfolio.pdf && (
        <PdfViewerModal 
          pdfUrl={`${baseUrl}/api/portfolio/download/${portfolio._id}`} 
          onClose={() => setViewPdf(false)} 
        />
      )}
      {zoomAvatar && (portfolio.avatarUrl || (portfolio.avatar && portfolio.avatar.contentType)) && (
        <AvatarZoomModal 
          avatarUrl={portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`} 
          userName={portfolio.user.name} 
          onClose={() => setZoomAvatar(false)} 
        />
      )}
    </div>
  );
};

