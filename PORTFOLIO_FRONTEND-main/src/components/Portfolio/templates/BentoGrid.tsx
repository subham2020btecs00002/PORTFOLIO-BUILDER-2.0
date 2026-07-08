import React, { useState } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaGraduationCap, FaBriefcase, FaCode, FaExternalLinkAlt, FaSun, FaMoon, FaDownload } from 'react-icons/fa';
import type { Portfolio, ContactFormData, Project } from '../../../types';
import { baseUrl } from '../../url';
import { getSortedHistory } from '../../../utils/portfolioUtils';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { use3DTilt } from '../../../hooks/use3DTilt';
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

interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
}

// Sub-component to wrap each bento card and safely run the 3D tilt hook.
const BentoCard: React.FC<BentoCardProps> = ({ className = '', children }) => {
  const cardRef = use3DTilt<HTMLDivElement>({ maxRotation: 6, scale: 1.015, speed: 250 });
  return (
    <div ref={cardRef} className={`bento-card ${className}`}>
      {children}
    </div>
  );
};

export const BentoGrid: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
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

  return (
    <div className={`theme-container bento-theme ${fontClass} ${radiusClass} ${colorClass}`}>
      {isPreview && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '80px',
          background: 'rgba(59, 130, 246, 0.9)',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          Preview Mode
        </div>
      )}
      <div className="bento-layout-wrapper">
        
        {/* Navigation Bar */}
        <header className="bento-header reveal-on-scroll">
          <div className="bento-header-left">
            <h1 className="bento-logo">{portfolio.user?.name}</h1>
            <p className="bento-tagline">{currentJob ? `${currentJob.position} @ ${currentJob.companyName}` : portfolio.title}</p>
          </div>
          {toggleTheme && (
            <button className="bento-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          )}
        </header>

        {/* Bento Grid Panel */}
        <div className="bento-grid-container">
          
          {/* 1. Profile / Bio Card (Large Span) */}
          <BentoCard className="bento-bio-card span-2 reveal-on-scroll">
            <div className="bio-card-content">
              {(portfolio.avatarUrl || (portfolio.avatar && portfolio.avatar.contentType)) && (
                <div className="bento-avatar-wrapper">
                  <img
                    src={portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`}
                    alt={portfolio.user?.name}
                    className="bento-avatar"
                    onClick={() => setZoomAvatar(true)}
                  />
                </div>
              )}
              <div className="bio-card-text">
                <span className="badge-category">Profile Summary</span>
                <h2>About Me</h2>
                <p className="bento-bio-desc">{portfolio.description || 'No bio description provided.'}</p>
                {portfolio.pdf && (
                  <button onClick={() => setViewPdf(true)} className="bento-btn-primary" style={{ marginTop: '15px' }}>
                    <FaDownload style={{ marginRight: '6px' }} /> View Resume PDF
                  </button>
                )}
              </div>
            </div>
          </BentoCard>

          {/* 2. Quick Links & Socials Card (Small Span) */}
          <BentoCard className="bento-social-card reveal-on-scroll delay-1">
            <h3 className="bento-card-title">Connect</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>Feel free to reach out or check out my profiles online.</p>
            <div className="bento-social-links">
              {portfolio.user?.email && (
                <a href={`mailto:${portfolio.user.email}`} className="bento-social-item">
                  <FaEnvelope /> <span>Email Me</span>
                </a>
              )}
              {portfolio.portfolioLinks?.github && (
                <a href={portfolio.portfolioLinks.github} target="_blank" rel="noreferrer" className="bento-social-item">
                  <FaGithub /> <span>GitHub</span>
                </a>
              )}
              {portfolio.portfolioLinks?.linkedin && (
                <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noreferrer" className="bento-social-item">
                  <FaLinkedin /> <span>LinkedIn</span>
                </a>
              )}
            </div>
          </BentoCard>

          {/* 3. Skills Bento Card */}
          <BentoCard className="bento-skills-card span-2 reveal-on-scroll delay-2">
            <h3 className="bento-card-title"><FaCode style={{ marginRight: '8px' }} /> Core Skills</h3>
            <div className="bento-skills-list">
              {portfolio.skills?.map((skill, idx) => (
                <div key={idx} className="bento-skill-pill">
                  <span className="bento-skill-name">{skill.name}</span>
                  <span className={`bento-skill-level ${skill.level.toLowerCase()}`}>{skill.level}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 4. Education Card */}
          <BentoCard className="bento-education-card reveal-on-scroll delay-3">
            <h3 className="bento-card-title"><FaGraduationCap style={{ marginRight: '8px' }} /> Education</h3>
            <div className="bento-education-list">
              {portfolio.education?.map((edu, idx) => (
                <div key={idx} className="bento-edu-item">
                  <h4>{edu.collegeName}</h4>
                  <p className="bento-edu-degree">{edu.degree} in {edu.branch}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
                    <span>CGPA/Percentage: {edu.cgpaOrPercentage}</span>
                    <span>{edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 5. Experience Timeline Card (Span 2) */}
          <BentoCard className="bento-experience-card span-2 reveal-on-scroll delay-4">
            <h3 className="bento-card-title"><FaBriefcase style={{ marginRight: '8px' }} /> Work Experience</h3>
            <div className="bento-timeline">
              {getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
                <div key={idx} className="bento-timeline-item">
                  <div className="bento-timeline-marker"></div>
                  <div className="bento-timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <h4>{job.companyName}</h4>
                      <span className="bento-timeline-date">
                        {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''} -{' '}
                        {job.isCurrentEmployee ? 'Present' : job.yearOfLeaving ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="bento-job-position">{job.position}</p>
                    <ul className="bento-job-bullets">
                      {job.responsibility.split('\n').map((line, lidx) => (
                        <li key={lidx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 6. Projects Bento Grid (Large full span) */}
          <div className="bento-projects-container span-3 reveal-on-scroll delay-5">
            <h3 className="bento-card-title-main">Featured Projects</h3>
            <div className="bento-projects-grid">
              {portfolio.projects?.map((proj, idx) => (
                <BentoCard key={idx} className="bento-project-card">
                  <div className="bento-project-header">
                    <h4>{proj.title}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="bento-proj-link">
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                  <p className="bento-project-desc">{proj.description}</p>
                  
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="bento-project-tech">
                      {proj.technologies.map((tech) => (
                        <span key={tech} className="bento-tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setSpotlightProject(proj)} className="bento-btn-text" style={{ marginTop: '12px' }}>
                    View Project Details
                  </button>
                </BentoCard>
              ))}
            </div>
          </div>

          {/* 7. Contact Card (Span 3) */}
          <BentoCard className="bento-contact-card span-3 reveal-on-scroll">
            <div className="bento-contact-grid">
              <div className="bento-contact-left">
                <span className="badge-category">Get In Touch</span>
                <h2>Let's work together!</h2>
                <p>Have a project in mind, an job opportunity, or just want to say hi? Send me a message using the form.</p>
                {portfolio.user?.email && (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Direct Email</p>
                    <a href={`mailto:${portfolio.user.email}`} style={{ color: 'var(--primary-color, #3b82f6)', fontWeight: 600 }}>
                      {portfolio.user.email}
                    </a>
                  </div>
                )}
              </div>
              <div className="bento-contact-right">
                <form onSubmit={handleSubmit} className="bento-contact-form">
                  <div className="bento-form-row">
                    <div className="bento-form-group">
                      <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} placeholder="Your Name" required />
                    </div>
                    <div className="bento-form-group">
                      <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} placeholder="Your Email" required />
                    </div>
                  </div>
                  <div className="bento-form-group">
                    <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} placeholder="Phone Number" required />
                  </div>
                  <div className="bento-form-group">
                    <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} placeholder="Describe your inquiry..." rows={4} required />
                  </div>
                  <button type="submit" className="bento-btn-primary" style={{ width: '100%' }}>
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Footer */}
        <footer className="bento-footer">
          <p>© {new Date().getFullYear()} {portfolio.user?.name}. Powered by PortfolioBuilder.</p>
        </footer>

      </div>

      {/* Modals */}
      {spotlightProject && (
        <ProjectSpotlightModal project={spotlightProject} onClose={() => setSpotlightProject(null)} />
      )}
      
      {viewPdf && portfolio.pdf && (
        <PdfViewerModal
          pdfUrl={`${baseUrl}/api/portfolio/pdf/${portfolio._id}`}
          onClose={() => setViewPdf(false)}
        />
      )}

      {zoomAvatar && (
        <AvatarZoomModal
          avatarUrl={portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`}
          userName={portfolio.user?.name || 'User'}
          onClose={() => setZoomAvatar(false)}
        />
      )}
    </div>
  );
};
