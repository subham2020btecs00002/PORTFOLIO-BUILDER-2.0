import React from 'react';
import { FaGithub, FaCode, FaAward, FaLinkedin, FaDownload, FaEnvelope, FaSun, FaMoon, FaSpinner } from 'react-icons/fa';
import { baseUrl } from '../../../url';
import { getSortedHistory, getSortedEducation, formatEducationDateRange } from '../../../../utils/portfolioUtils';
import { useScrollReveal } from '../../../../hooks/useScrollReveal';
import type { TemplateProps } from './types';
import { getThemeOverrideClasses } from './themeUtils';
import { useTemplateModals } from './useTemplateModals';
import { TemplateModals } from './TemplateModals';

export interface SectionalThemeTemplateProps extends TemplateProps {
  themeClass: string;
  backgroundDecoration?: React.ReactNode;
  variant?: 'standard' | 'cyberpunk';
}

export const SectionalThemeTemplate: React.FC<SectionalThemeTemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  handleScrollTo,
  isPreview = false,
  theme,
  toggleTheme,
  isSendingEmail = false,
  themeClass,
  backgroundDecoration,
  variant = 'standard',
}) => {
  useScrollReveal();
  const modals = useTemplateModals();

  const isCyberpunk = variant === 'cyberpunk';
  const currentJob = portfolio.professionalHistory?.find((job) => job.isCurrentEmployee);
  const themeOverrideClasses = getThemeOverrideClasses(portfolio);
  const sectionOrder = portfolio.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'];

  const tagColor = isCyberpunk ? 'var(--primary-color, #fcee0a)' : 'var(--primary-color, #10b981)';

  const renderSection = (sectionId: string) => {
    const idPrefix = isPreview ? 'preview-' : '';
    switch (sectionId) {
      case 'about':
        return (
          <section id={`${idPrefix}about`} key="about" className="theme-section reveal-on-scroll">
            <h2>{isCyberpunk ? '> ABOUT_ME' : 'About Me'}</h2>
            <div className="grid-2col">
              <div className="theme-card">
                <p className="theme-bio">{portfolio.description || 'No bio description provided.'}</p>
              </div>

              <div className="theme-education-col">
                <h3>{isCyberpunk ? '> ACADEMICS' : 'Education'}</h3>
                <div style={{ marginTop: '16px' }}>
                  {getSortedEducation(portfolio.education || []).map((edu, idx) => (
                    <div key={idx} className="theme-card">
                      <h4 className="theme-card-subtitle">{edu.collegeName}</h4>
                      <p className="theme-card-meta">
                        {isCyberpunk ? `${edu.degree} // ${edu.branch}` : `${edu.degree} in ${edu.branch}`}
                      </p>
                      <p className="theme-card-meta" style={{ fontWeight: 600 }}>
                        {isCyberpunk ? `SCORE: ${edu.cgpaOrPercentage}` : `CGPA/Percentage: ${edu.cgpaOrPercentage}`}
                      </p>
                      <p className="theme-card-meta" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                        {formatEducationDateRange(edu)}
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
          <section id={`${idPrefix}skills`} key="skills" className="theme-section reveal-on-scroll">
            <h2>{isCyberpunk ? '> TECH_STACK' : 'Skills'}</h2>
            <div className="theme-card">
              <div
                className="skills-badge-list"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px',
                }}
              >
                {portfolio.skills?.map((skill, idx) => (
                  <div key={idx} className="skill-item-container">
                    <div className="skill-badge" style={{ margin: 0, justifyContent: 'space-between' }}>
                      <span>{skill.name}</span>
                      <span className="skill-level-indicator" style={{ opacity: 0.8 }}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="skill-progress-track">
                      <div
                        className="skill-progress-bar"
                        style={{
                          width: skill.level === 'Expert' ? '100%' : skill.level === 'Intermediate' ? '70%' : '35%',
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
            <h2>{isCyberpunk ? '> CHRONOLOGY' : 'Work Experience'}</h2>
            <div className="timeline-wrapper">
              {getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
                <div key={idx} className="timeline-node">
                  <div className="theme-card">
                    <div className="theme-card-header">
                      <div>
                        <h3 className="theme-card-title">{job.companyName}</h3>
                        <h4 className="theme-card-subtitle" style={{ margin: '4px 0 0', opacity: 0.8 }}>
                          {job.position}
                        </h4>
                      </div>
                      <span className="theme-card-meta" style={{ whiteSpace: 'nowrap' }}>
                        {job.yearOfJoining
                          ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                          : ''}{' '}
                        -{' '}
                        {job.isCurrentEmployee
                          ? 'Present'
                          : job.yearOfLeaving
                          ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    <div>
                      {job.responsibility.split('\n').map((line, lidx) => (
                        <p key={lidx} className="theme-list-item">
                          {line}
                        </p>
                      ))}
                    </div>
                    {job.technologies && job.technologies.length > 0 && (
                      <div
                        className="experience-tags-row"
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}
                      >
                        {job.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="experience-tag"
                            style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(128, 128, 128, 0.12)',
                              color: tagColor,
                              fontWeight: 600,
                              border: '1px solid rgba(128, 128, 128, 0.2)',
                            }}
                          >
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
            <h2>{isCyberpunk ? '> PROJECTS' : 'Projects'}</h2>
            <div className="grid-2col">
              {portfolio.projects?.map((proj, idx) => (
                <div key={idx} className="theme-card" onClick={() => modals.setSpotlightProject(proj)}>
                  <h3 className="theme-card-title">{proj.title}</h3>
                  <p style={{ margin: '12px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div
                      className="project-tags-row"
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 12px 0' }}
                    >
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="project-tag"
                          style={{
                            fontSize: '0.7rem',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(128, 128, 128, 0.12)',
                            color: tagColor,
                            fontWeight: 600,
                            border: '1px solid rgba(128, 128, 128, 0.2)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.link && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontWeight: 600,
                        color: isCyberpunk ? '#00ff66' : 'var(--primary-color, #10b981)',
                        cursor: 'pointer',
                      }}
                    >
                      {isCyberpunk ? '[SPOTLIGHT_TRACE] →' : 'Spotlight Details & Code →'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'contact':
        return (
          <section id={`${idPrefix}contact`} key="contact" className="theme-section reveal-on-scroll">
            <h2>{isCyberpunk ? '> COMMUNICATE' : 'Get In Touch'}</h2>
            <div className="theme-contact-form-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="floating-form-group">
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    placeholder=" "
                    required
                  />
                  <label>{isCyberpunk ? 'NAME' : 'Name'}</label>
                </div>
                <div className="floating-form-group">
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    placeholder=" "
                    required
                  />
                  <label>{isCyberpunk ? 'EMAIL' : 'Email Address'}</label>
                </div>
                <div className="floating-form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleInputChange}
                    placeholder=" "
                    required
                  />
                  <label>{isCyberpunk ? 'TELEPHONE' : 'Phone Number'}</label>
                </div>
                <div className="floating-form-group">
                  <textarea
                    name="reason"
                    value={contactForm.reason}
                    onChange={handleInputChange}
                    placeholder=" "
                    rows={4}
                    required
                  />
                  <label>{isCyberpunk ? 'REASON' : 'Reason of Contact'}</label>
                </div>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    cursor: isSendingEmail ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: isSendingEmail ? 0.7 : 1,
                  }}
                >
                  {isSendingEmail ? (
                    <>
                      <FaSpinner className="spinner-icon" /> {isCyberpunk ? 'SENDING...' : 'Sending Message...'}
                    </>
                  ) : (
                    <>
                      <FaEnvelope /> {isCyberpunk ? 'INITIALIZE_MESSAGE' : 'Send Message'}
                    </>
                  )}
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
    <div className={`theme-container ${themeClass} ${themeOverrideClasses}`}>
      {/* Background decoration (if any) */}
      {backgroundDecoration}

      <div className="theme-content-wrapper">
        {/* Navigation */}
        {!isPreview && (
          <nav className="theme-nav">
            <ul className="theme-nav-links">
              {sectionOrder.map((sectionId) => {
                const label = isCyberpunk
                  ? `./${sectionId.toUpperCase()}`
                  : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                return (
                  <li key={sectionId} onClick={() => handleScrollTo(sectionId)}>
                    {label}
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
                alt={portfolio.fullName || portfolio.user?.name || 'Developer'}
                className="theme-avatar"
                onClick={() => modals.setZoomAvatar(true)}
              />
            </div>
          )}
          <h1>{portfolio.fullName || portfolio.user?.name}</h1>
          <p className="theme-hero-subtitle">
            {isCyberpunk
              ? currentJob
                ? `[ ${currentJob.position} @ ${currentJob.companyName} ]`
                : `[ ${portfolio.title} ]`
              : currentJob
              ? `${currentJob.position} @ ${currentJob.companyName}`
              : portfolio.title}
          </p>
          <div className="social-links-row">
            {portfolio.portfolioLinks?.github && (
              <a
                href={portfolio.portfolioLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-icon-btn"
              >
                <FaGithub />
              </a>
            )}
            {portfolio.portfolioLinks?.leetcode && (
              <a
                href={portfolio.portfolioLinks.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-icon-btn"
              >
                <FaCode />
              </a>
            )}
            {portfolio.portfolioLinks?.gfg && (
              <a
                href={portfolio.portfolioLinks.gfg}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-icon-btn"
              >
                <FaAward />
              </a>
            )}
            {portfolio.portfolioLinks?.linkedin && (
              <a
                href={portfolio.portfolioLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-icon-btn"
              >
                <FaLinkedin />
              </a>
            )}
          </div>
        </header>

        {/* Render sections dynamically */}
        {sectionOrder.map((sectionId) => renderSection(sectionId))}

        {/* CV Exporter Link */}
        {!isPreview && (
          <section
            className="theme-section reveal-on-scroll"
            style={{
              textAlign: 'center',
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {portfolio.pdf ? (
              <>
                <a
                  href={`${baseUrl}/api/portfolio/download/${portfolio._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    background: 'var(--accent-gradient)',
                    textDecoration: 'none',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaDownload /> {isCyberpunk ? 'DOWNLOAD_CV' : 'Download CV'}
                </a>
                <button
                  onClick={() => modals.setViewPdf(true)}
                  className="btn-secondary"
                  style={{
                    display: 'inline-flex',
                    border: '1px solid var(--border-color)',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isCyberpunk ? 'VIEW_RESUME' : 'View Resume'}
                </button>
              </>
            ) : (
              <button
                onClick={() => window.open(window.location.pathname + '/resume', '_blank')}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  background: 'var(--accent-gradient)',
                  border: 'none',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FaDownload /> {isCyberpunk ? 'GENERATE_RESUME_PDF' : 'Generate Resume PDF'}
              </button>
            )}
          </section>
        )}
      </div>

      {/* Shared Presentation Modals */}
      <TemplateModals portfolio={portfolio} {...modals} />
    </div>
  );
};
